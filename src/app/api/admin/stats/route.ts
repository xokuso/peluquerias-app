import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';
import { AdminDashboardStats, ApiResponse, RecentOrderData } from '@/types/api';

export async function GET(_req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Calculate date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Fetch all statistics in parallel for better performance
    const [
      totalUsers,
      activeUsers,
      totalOrders,
      monthlyOrders,
      pendingOrders,
      completedOrders,
      unreadMessages,
      activeTemplates,
      recentOrdersData,
      lastMonthUsers,
      lastMonthOrders,
      lastMonthRevenue
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),

      // Active users (logged in within last 30 days)
      prisma.user.count({
        where: {
          isActive: true,
          lastLogin: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Total orders
      prisma.order.count(),

      // Orders this month
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        select: {
          total: true,
          status: true
        }
      }),

      // Pending orders
      prisma.order.count({
        where: {
          status: 'PENDING'
        }
      }),

      // Completed orders this month
      prisma.order.count({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      }),

      // Unread messages
      prisma.contactMessage.count({
        where: {
          status: 'UNREAD'
        }
      }),

      // Active templates
      prisma.template.count({
        where: {
          active: true
        }
      }),

      // Recent orders with template details
      prisma.order.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          template: {
            select: {
              name: true,
              category: true
            }
          }
        }
      }),

      // Last month's users for growth calculation
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      }),

      // Last month's orders
      prisma.order.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      }),

      // Last month's revenue
      prisma.order.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        },
        _sum: {
          total: true
        }
      })
    ]);

    // Calculate monthly revenue
    const monthlyRevenue = monthlyOrders
      .filter(order => order.status === 'COMPLETED')
      .reduce((sum, order) => sum + order.total, 0);

    // Calculate current month's new users
    const currentMonthUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const usersGrowth = calculateGrowth(currentMonthUsers, lastMonthUsers);
    const ordersGrowth = calculateGrowth(monthlyOrders.length, lastMonthOrders);
    const revenueGrowth = calculateGrowth(
      monthlyRevenue,
      lastMonthRevenue._sum.total || 0
    );

    // Format recent orders
    const recentOrders: RecentOrderData[] = recentOrdersData.map(order => ({
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

    // Prepare response
    const stats: AdminDashboardStats = {
      totalUsers,
      activeUsers,
      totalOrders,
      monthlyRevenue,
      pendingOrders,
      completedOrders,
      newMessages: unreadMessages,
      activeTemplates,
      recentOrders,
      monthlyGrowth: {
        users: usersGrowth,
        orders: ordersGrowth,
        revenue: revenueGrowth
      }
    };

    const response: ApiResponse<AdminDashboardStats> = {
      success: true,
      data: stats
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching admin stats:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}