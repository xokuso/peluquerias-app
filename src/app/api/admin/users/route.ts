import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";

/**
 * GET /api/admin/users
 * List all users with pagination, filtering, and search
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (currentUser.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") as UserRole | null;
    const status = searchParams.get("status"); // active, inactive, all

    // Build where clause
    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { salonName: { contains: search, mode: "insensitive" } },
      ];
    }

    // Role filter
    if (role && Object.values(UserRole).includes(role)) {
      where.role = role;
    }

    // Status filter
    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    }

    // Get total count
    const totalCount = await prisma.user.count({ where });

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        salonName: true,
        phone: true,
        city: true,
        address: true,
        businessType: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        // Include order statistics for clients
        _count: {
          select: {
            orders: true,
          },
        },
        orders: {
          where: {
            status: "COMPLETED",
          },
          select: {
            total: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate total spent for each user
    const usersWithStats = users.map((user) => {
      const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0);
      const { orders: _, ...userData } = user;

      return {
        ...userData,
        ordersCount: user._count.orders,
        totalSpent,
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users
 * Create a new user (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (currentUser.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      password,
      role = UserRole.CLIENT,
      salonName,
      phone,
      city,
      address,
      businessType,
      isActive = true,
    } = body;

    // Validate required fields
    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Hash password if provided
    let hashedPassword = undefined;
    if (password) {
      const bcrypt = await import("bcryptjs");
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword ?? null,
        role,
        salonName,
        phone,
        city,
        address,
        businessType,
        isActive,
        hasCompletedOnboarding: role === UserRole.ADMIN ? true : false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        salonName: true,
        phone: true,
        city: true,
        address: true,
        businessType: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}