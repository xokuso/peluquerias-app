import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';
import { ApiResponse, RecentOrderData } from '@/types/api';

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
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;

    // Build where clause
    const whereClause: Record<string, unknown> = {};
    if (status) {
      whereClause.status = status;
    }

    // Fetch recent orders
    const orders = await prisma.order.findMany({
      where: whereClause,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        template: {
          select: {
            name: true,
            category: true,
            price: true
          }
        },
        user: {
          select: {
            name: true,
            email: true,
            salonName: true
          }
        }
      }
    });

    // Format the orders
    const formattedOrders: RecentOrderData[] = orders.map(order => ({
      id: order.id,
      salonName: order.salonName,
      ownerName: order.ownerName,
      email: order.email,
      template: {
        name: order.template.name,
        category: order.template.category
      },
      amount: order.total,
      status: order.status,
      date: order.createdAt.toISOString(),
      domain: order.domain
    }));

    const response: ApiResponse<RecentOrderData[]> = {
      success: true,
      data: formattedOrders
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching recent orders:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch recent orders',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}