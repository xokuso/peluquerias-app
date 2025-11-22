import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';
import { ApiResponse, UserStats } from '@/types/api';

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

    // Calculate date for recent signups (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Fetch all user statistics in parallel
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      clientCount,
      adminCount,
      recentSignups,
      completedOnboarding,
      businessTypeStats
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Active users
      prisma.user.count({
        where: { isActive: true }
      }),

      // Inactive users
      prisma.user.count({
        where: { isActive: false }
      }),

      // Users by role - CLIENT
      prisma.user.count({
        where: { role: 'CLIENT' }
      }),

      // Users by role - ADMIN
      prisma.user.count({
        where: { role: 'ADMIN' }
      }),

      // Recent signups (last 30 days)
      prisma.user.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),

      // Users who completed onboarding
      prisma.user.count({
        where: { hasCompletedOnboarding: true }
      }),

      // Group by business type
      prisma.user.groupBy({
        by: ['businessType'],
        _count: {
          businessType: true
        }
      })
    ]);

    // Format business type statistics
    const byBusinessType: { [key: string]: number } = {};
    businessTypeStats.forEach(stat => {
      byBusinessType[stat.businessType] = stat._count.businessType;
    });

    // Prepare user statistics
    const userStats: UserStats = {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      byRole: {
        CLIENT: clientCount,
        ADMIN: adminCount
      },
      byBusinessType,
      recentSignups,
      completedOnboarding
    };

    const response: ApiResponse<UserStats> = {
      success: true,
      data: userStats
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching user statistics:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}