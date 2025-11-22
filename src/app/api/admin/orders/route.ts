import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types/api';

interface OrderWithRelations {
  id: string;
  salonName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string | null;
  domain: string;
  total: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  template: {
    id: string;
    name: string;
    category: string;
    price: number;
  };
  user?: {
    name: string | null;
    email: string;
    salonName: string | null;
  } | null;
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // Build where clause
    const whereClause: Record<string, unknown> = {};

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { salonName: { contains: search, mode: 'insensitive' } },
        { ownerName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch orders with pagination
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder
        },
        include: {
          template: {
            select: {
              id: true,
              name: true,
              category: true,
              price: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              salonName: true,
              phone: true,
              businessType: true
            }
          }
        }
      }),
      prisma.order.count({ where: whereClause })
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);

    const response: ApiResponse<{
      orders: OrderWithRelations[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }> = {
      success: true,
      data: {
        orders: orders as OrderWithRelations[],
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching orders:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch orders',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}