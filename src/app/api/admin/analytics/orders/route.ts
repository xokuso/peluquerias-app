import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

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
    const endDate = endOfDay(new Date());

    // Get all orders with detailed information
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        template: {
          select: {
            name: true,
            category: true,
            price: true,
          },
        },
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate order statistics
    const totalOrders = orders.length;
    const statusDistribution = {
      PENDING: 0,
      PROCESSING: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      REFUNDED: 0,
    };

    const setupStepDistribution = {
      DOMAIN_SELECTION: 0,
      BUSINESS_INFO: 0,
      DESIGN_PREFERENCES: 0,
      CONTENT_EDITOR: 0,
      PHOTOS_UPLOAD: 0,
      REVIEW_LAUNCH: 0,
      COMPLETED: 0,
    };

    // Orders by day for trend analysis
    const ordersByDay: { [key: string]: number } = {};
    const revenueByDay: { [key: string]: number } = {};

    // Process each order
    orders.forEach((order) => {
      // Status distribution
      statusDistribution[order.status]++;

      // Setup step distribution
      setupStepDistribution[order.setupStep]++;

      // Daily trends
      const dayKey = format(order.createdAt, 'yyyy-MM-dd');
      ordersByDay[dayKey] = (ordersByDay[dayKey] || 0) + 1;

      if (order.status === 'COMPLETED' || order.status === 'PROCESSING') {
        revenueByDay[dayKey] = (revenueByDay[dayKey] || 0) + order.total;
      }
    });

    // Calculate completion rate
    const completedOrders = statusDistribution.COMPLETED;
    const cancelledOrders = statusDistribution.CANCELLED + statusDistribution.REFUNDED;
    const completionRate = totalOrders > 0
      ? (completedOrders / totalOrders) * 100
      : 0;
    const cancellationRate = totalOrders > 0
      ? (cancelledOrders / totalOrders) * 100
      : 0;

    // Average time to completion
    const completedOrdersData = orders.filter(o => o.status === 'COMPLETED' && o.completedAt);
    const avgCompletionTime = completedOrdersData.length > 0
      ? completedOrdersData.reduce((sum, order) => {
          const completionTime = order.completedAt!.getTime() - order.createdAt.getTime();
          return sum + completionTime;
        }, 0) / completedOrdersData.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    // Template popularity
    const templatePopularity: { [key: string]: { count: number; revenue: number } } = {};
    orders.forEach((order) => {
      const templateName = order.template.name;
      if (!templatePopularity[templateName]) {
        templatePopularity[templateName] = { count: 0, revenue: 0 };
      }
      templatePopularity[templateName].count++;
      if (order.status === 'COMPLETED' || order.status === 'PROCESSING') {
        templatePopularity[templateName].revenue += order.total;
      }
    });

    // Sort templates by popularity
    const topTemplates = Object.entries(templatePopularity)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Domain extension distribution
    const domainExtensions: { [key: string]: number } = {};
    orders.forEach((order) => {
      if (order.domainExtension) {
        domainExtensions[order.domainExtension] = (domainExtensions[order.domainExtension] || 0) + 1;
      }
    });

    // Prepare time series data
    const timeSeries = [];
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), i);
      const dayKey = format(date, 'yyyy-MM-dd');
      timeSeries.unshift({
        date: dayKey,
        orders: ordersByDay[dayKey] || 0,
        revenue: revenueByDay[dayKey] || 0,
      });
    }

    // Recent orders with full details
    const recentOrders = orders.slice(0, 10).map(order => ({
      id: order.id,
      salonName: order.salonName,
      ownerName: order.ownerName,
      email: order.email,
      domain: order.domain,
      template: order.template.name,
      total: order.total,
      status: order.status,
      setupStep: order.setupStep,
      createdAt: order.createdAt,
      completedAt: order.completedAt,
    }));

    // Orders in different stages of setup
    const setupFunnel = Object.entries(setupStepDistribution).map(([step, count]) => ({
      step,
      count,
      percentage: totalOrders > 0 ? (count / totalOrders) * 100 : 0,
    }));

    // Calculate conversion funnel
    const conversionFunnel = {
      started: totalOrders,
      domainSelected: totalOrders - setupStepDistribution.DOMAIN_SELECTION,
      businessInfoAdded: totalOrders - setupStepDistribution.DOMAIN_SELECTION - setupStepDistribution.BUSINESS_INFO,
      designCompleted: setupStepDistribution.PHOTOS_UPLOAD + setupStepDistribution.REVIEW_LAUNCH + setupStepDistribution.COMPLETED,
      completed: setupStepDistribution.COMPLETED,
    };

    // Peak ordering times (hour of day)
    const ordersByHour: { [key: number]: number } = {};
    orders.forEach((order) => {
      const hour = order.createdAt.getHours();
      ordersByHour[hour] = (ordersByHour[hour] || 0) + 1;
    });

    const peakHours = Object.entries(ordersByHour)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      summary: {
        totalOrders,
        completedOrders,
        pendingOrders: statusDistribution.PENDING + statusDistribution.PROCESSING,
        cancelledOrders,
        completionRate,
        cancellationRate,
        avgCompletionTime, // in hours
        totalRevenue: Object.values(revenueByDay).reduce((a, b) => a + b, 0),
      },
      statusDistribution,
      setupStepDistribution,
      setupFunnel,
      conversionFunnel,
      timeSeries,
      topTemplates,
      domainExtensions,
      recentOrders,
      peakHours,
    });

  } catch (error) {
    console.error('Error fetching order analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order analytics' },
      { status: 500 }
    );
  }
}