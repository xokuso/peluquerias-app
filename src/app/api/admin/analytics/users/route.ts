import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfDay, subDays, format, differenceInDays } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = startOfDay(subDays(new Date(), days - 1));

    // Get all users
    const users = await prisma.user.findMany({
      include: {
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            orders: true,
            photos: true,
            sessions: true,
          },
        },
      },
    });

    // Calculate user statistics
    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.role === 'ADMIN').length;
    const clientUsers = users.filter(u => u.role === 'CLIENT').length;
    const activeUsers = users.filter(u => u.isActive).length;
    const completedOnboarding = users.filter(u => u.hasCompletedOnboarding).length;

    // New users in period
    const newUsers = users.filter(u => u.createdAt >= startDate).length;
    const previousPeriodStart = subDays(startDate, days);
    const previousPeriodUsers = users.filter(
      u => u.createdAt >= previousPeriodStart && u.createdAt < startDate
    ).length;
    const userGrowthRate = previousPeriodUsers > 0
      ? ((newUsers - previousPeriodUsers) / previousPeriodUsers) * 100
      : 0;

    // User registration trends
    const usersByDay: { [key: string]: number } = {};
    users.forEach((user) => {
      const dayKey = format(user.createdAt, 'yyyy-MM-dd');
      usersByDay[dayKey] = (usersByDay[dayKey] || 0) + 1;
    });

    // Prepare time series data
    const timeSeries = [];
    let cumulativeUsers = 0;
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayKey = format(date, 'yyyy-MM-dd');
      const dailyRegistrations = usersByDay[dayKey] || 0;
      cumulativeUsers += dailyRegistrations;

      timeSeries.push({
        date: dayKey,
        newUsers: dailyRegistrations,
        cumulativeUsers,
      });
    }

    // User activity analysis
    const now = new Date();
    const activeLastDay = users.filter(u => u.lastLogin && differenceInDays(now, u.lastLogin) <= 1).length;
    const activeLastWeek = users.filter(u => u.lastLogin && differenceInDays(now, u.lastLogin) <= 7).length;
    const activeLastMonth = users.filter(u => u.lastLogin && differenceInDays(now, u.lastLogin) <= 30).length;

    // User retention cohorts
    const retentionCohorts = {
      day1: activeLastDay,
      day7: activeLastWeek,
      day30: activeLastMonth,
      retention1Day: totalUsers > 0 ? (activeLastDay / totalUsers) * 100 : 0,
      retention7Day: totalUsers > 0 ? (activeLastWeek / totalUsers) * 100 : 0,
      retention30Day: totalUsers > 0 ? (activeLastMonth / totalUsers) * 100 : 0,
    };

    // Business type distribution
    const businessTypeDistribution = {
      SALON: 0,
      BARBERSHOP: 0,
      PERSONAL: 0,
    };
    users.forEach((user) => {
      if (user.businessType) {
        businessTypeDistribution[user.businessType]++;
      }
    });

    // Geographic distribution (by city)
    const cityDistribution: { [key: string]: number } = {};
    users.forEach((user) => {
      if (user.city) {
        cityDistribution[user.city] = (cityDistribution[user.city] || 0) + 1;
      }
    });

    // Top cities
    const topCities = Object.entries(cityDistribution)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // User engagement metrics
    const userEngagement = users.map(user => {
      const orderCount = user._count.orders;
      const photoCount = user._count.photos;
      const sessionCount = user._count.sessions;
      const totalRevenue = user.orders.reduce((sum, order) => {
        return order.status === 'COMPLETED' ? sum + order.total : sum;
      }, 0);

      return {
        userId: user.id,
        email: user.email,
        name: user.name || 'N/A',
        salonName: user.salonName || 'N/A',
        orderCount,
        photoCount,
        sessionCount,
        totalRevenue,
        avgOrderValue: orderCount > 0 ? totalRevenue / orderCount : 0,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        isActive: user.isActive,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
      };
    });

    // Sort by revenue to get top customers
    const topCustomers = userEngagement
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    // Most active users (by session count)
    const mostActiveUsers = userEngagement
      .sort((a, b) => b.sessionCount - a.sessionCount)
      .slice(0, 10);

    // User lifecycle stages
    const lifecycleStages = {
      new: users.filter(u => differenceInDays(now, u.createdAt) <= 7).length,
      active: users.filter(u => u.orders.length > 0).length,
      engaged: users.filter(u => u.orders.length > 1).length,
      champions: users.filter(u => u.orders.length > 3).length,
      dormant: users.filter(u =>
        u.lastLogin && differenceInDays(now, u.lastLogin) > 30
      ).length,
      churned: users.filter(u =>
        u.lastLogin && differenceInDays(now, u.lastLogin) > 90
      ).length,
    };

    // Average user metrics
    const totalOrdersFromUsers = users.reduce((sum, u) => sum + u._count.orders, 0);
    const totalRevenueFromUsers = users.reduce((sum, user) => {
      return sum + user.orders.reduce((orderSum, order) => {
        return order.status === 'COMPLETED' ? orderSum + order.total : orderSum;
      }, 0);
    }, 0);

    const averageMetrics = {
      avgOrdersPerUser: totalUsers > 0 ? totalOrdersFromUsers / totalUsers : 0,
      avgRevenuePerUser: totalUsers > 0 ? totalRevenueFromUsers / totalUsers : 0,
      avgPhotosPerUser: totalUsers > 0
        ? users.reduce((sum, u) => sum + u._count.photos, 0) / totalUsers
        : 0,
      avgSessionsPerUser: totalUsers > 0
        ? users.reduce((sum, u) => sum + u._count.sessions, 0) / totalUsers
        : 0,
    };

    // Recent user registrations
    const recentRegistrations = users
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10)
      .map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        salonName: user.salonName,
        city: user.city,
        businessType: user.businessType,
        createdAt: user.createdAt,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        orderCount: user._count.orders,
      }));

    return NextResponse.json({
      summary: {
        totalUsers,
        adminUsers,
        clientUsers,
        activeUsers,
        completedOnboarding,
        newUsers,
        userGrowthRate,
        ...averageMetrics,
      },
      retentionCohorts,
      businessTypeDistribution,
      topCities,
      lifecycleStages,
      timeSeries,
      topCustomers,
      mostActiveUsers,
      recentRegistrations,
      userActivity: {
        activeLastDay,
        activeLastWeek,
        activeLastMonth,
      },
    });

  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user analytics' },
      { status: 500 }
    );
  }
}