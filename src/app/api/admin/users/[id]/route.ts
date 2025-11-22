import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";

/**
 * GET /api/admin/users/[id]
 * Get a single user by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        salonName: true,
        phone: true,
        city: true,
        address: true,
        website: true,
        businessType: true,
        hasCompletedOnboarding: true,
        subscriptionStatus: true,
        isActive: true,
        lastLogin: true,
        loginAttempts: true,
        lockUntil: true,
        createdAt: true,
        updatedAt: true,
        // Include order statistics
        _count: {
          select: {
            orders: true,
            photos: true,
          },
        },
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
            templateId: true,
            domain: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10, // Last 10 orders
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Calculate total spent
    const totalSpent = user.orders
      .filter((order) => order.status === "COMPLETED")
      .reduce((sum, order) => sum + order.total, 0);

    return NextResponse.json({
      ...user,
      totalSpent,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users/[id]
 * Update a user
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      role,
      salonName,
      phone,
      city,
      address,
      website,
      businessType,
      isActive,
      hasCompletedOnboarding,
      subscriptionStatus,
    } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // If email is being changed, check if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (salonName !== undefined) updateData.salonName = salonName;
    if (phone !== undefined) updateData.phone = phone;
    if (city !== undefined) updateData.city = city;
    if (address !== undefined) updateData.address = address;
    if (website !== undefined) updateData.website = website;
    if (businessType !== undefined) updateData.businessType = businessType;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (hasCompletedOnboarding !== undefined) {
      updateData.hasCompletedOnboarding = hasCompletedOnboarding;
    }
    if (subscriptionStatus !== undefined) {
      updateData.subscriptionStatus = subscriptionStatus;
    }

    // Hash new password if provided
    if (password) {
      const bcrypt = await import("bcryptjs");
      updateData.password = await bcrypt.hash(password, 10);
      // Reset login attempts when password is changed
      updateData.loginAttempts = 0;
      updateData.lockUntil = null;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        salonName: true,
        phone: true,
        city: true,
        address: true,
        website: true,
        businessType: true,
        isActive: true,
        hasCompletedOnboarding: true,
        subscriptionStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete a user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Prevent self-deletion
    if (params.id === currentUser.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Optional: Check if user has orders and warn
    if (user._count.orders > 0) {
      // You might want to soft delete instead or handle this differently
      // For now, we'll proceed with deletion as orders have onDelete: SetNull
    }

    // Delete user (this will cascade delete related records based on schema)
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "User deleted successfully",
      deletedUser: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Toggle user status or perform partial updates
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { action, value } = body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    switch (action) {
      case "toggleStatus":
        updateData.isActive = !user.isActive;
        break;

      case "resetPassword":
        // Generate a temporary password or trigger password reset
        const bcrypt = await import("bcryptjs");
        const tempPassword = Math.random().toString(36).slice(-8);
        updateData.password = await bcrypt.hash(tempPassword, 10);
        updateData.loginAttempts = 0;
        updateData.lockUntil = null;

        // In production, you would send an email with the temp password
        // For now, we'll return it in the response (remove in production!)
        break;

      case "unlockAccount":
        updateData.loginAttempts = 0;
        updateData.lockUntil = null;
        break;

      case "updateRole":
        if (value && Object.values(UserRole).includes(value)) {
          updateData.role = value;
        } else {
          return NextResponse.json(
            { error: "Invalid role" },
            { status: 400 }
          );
        }
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        loginAttempts: true,
        lockUntil: true,
        updatedAt: true,
      },
    });

    const response: any = {
      message: `User ${action} completed successfully`,
      user: updatedUser,
    };

    // Only for development - remove in production!
    if (action === "resetPassword") {
      response.temporaryPassword = updateData.password;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error patching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}