import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfMonth, subMonths, startOfYear, format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters for date range
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'monthly'; // monthly, yearly
    const months = parseInt(searchParams.get('months') || '12'); // default last 12 months

    const now = new Date();
    const startDate = period === 'yearly'
      ? startOfYear(subMonths(now, months))
      : startOfMonth(subMonths(now, months - 1));

    // Get orders with revenue data
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
        status: {
          in: ['COMPLETED', 'PROCESSING'], // Only count paid orders
        },
      },
      select: {
        id: true,
        total: true,
        domainPrice: true,
        domainUserPrice: true,
        createdAt: true,
        completedAt: true,
        status: true,
        template: {
          select: {
            price: true,
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate revenue by period
    const revenueByPeriod: { [key: string]: number } = {};
    const ordersByPeriod: { [key: string]: number } = {};
    const templateRevenue: { [key: string]: number } = {};
    const domainRevenue: { [key: string]: number } = {};

    let totalRevenue = 0;
    let totalOrders = 0;

    orders.forEach((order) => {
      const periodKey = period === 'yearly'
        ? format(order.createdAt, 'yyyy')
        : format(order.createdAt, 'yyyy-MM');

      const revenue = order.total;
      totalRevenue += revenue;
      totalOrders += 1;

      // Revenue by period
      revenueByPeriod[periodKey] = (revenueByPeriod[periodKey] || 0) + revenue;
      ordersByPeriod[periodKey] = (ordersByPeriod[periodKey] || 0) + 1;

      // Template revenue
      const templatePrice = order.template.price;
      templateRevenue[periodKey] = (templateRevenue[periodKey] || 0) + templatePrice;

      // Domain revenue
      const domainPrice = order.domainUserPrice || 0;
      domainRevenue[periodKey] = (domainRevenue[periodKey] || 0) + domainPrice;
    });

    // Calculate growth rates
    const periods = Object.keys(revenueByPeriod).sort();
    const growthRates: { [key: string]: number } = {};

    for (let i = 1; i < periods.length; i++) {
      const currentPeriod = periods[i];
      const previousPeriod = periods[i - 1];

      if (currentPeriod && previousPeriod) {
        const currentRevenue = revenueByPeriod[currentPeriod] || 0;
        const previousRevenue = revenueByPeriod[previousPeriod] || 0;

        if (previousRevenue > 0) {
          growthRates[currentPeriod] = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
        } else {
          growthRates[currentPeriod] = currentRevenue > 0 ? 100 : 0;
        }
      }
    }

    // Get current month/year statistics
    const currentPeriod = period === 'yearly'
      ? format(now, 'yyyy')
      : format(now, 'yyyy-MM');
    const previousPeriod = period === 'yearly'
      ? format(subMonths(now, 12), 'yyyy')
      : format(subMonths(now, 1), 'yyyy-MM');

    const currentRevenue = revenueByPeriod[currentPeriod] || 0;
    const previousRevenue = revenueByPeriod[previousPeriod] || 0;
    const revenueGrowth = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get recent transactions
    const recentTransactions = await prisma.order.findMany({
      where: {
        status: {
          in: ['COMPLETED', 'PROCESSING'],
        },
      },
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        salonName: true,
        total: true,
        createdAt: true,
        status: true,
        template: {
          select: {
            name: true,
          },
        },
      },
    });

    // Prepare time series data for charts
    const timeSeries = periods.map(period => ({
      period,
      revenue: revenueByPeriod[period] || 0,
      orders: ordersByPeriod[period] || 0,
      templateRevenue: templateRevenue[period] || 0,
      domainRevenue: domainRevenue[period] || 0,
      growthRate: growthRates[period] || 0,
      avgOrderValue: (ordersByPeriod[period] || 0) > 0
        ? (revenueByPeriod[period] || 0) / (ordersByPeriod[period] || 1)
        : 0,
    }));

    // Revenue breakdown by source
    const revenueBreakdown = {
      templates: Object.values(templateRevenue).reduce((a, b) => a + b, 0),
      domains: Object.values(domainRevenue).reduce((a, b) => a + b, 0),
    };

    // Monthly recurring revenue (MRR) estimation
    // For now, we'll calculate based on completed orders in the last 30 days
    const thirtyDaysAgo = subMonths(now, 1);
    // const _recentOrders = await prisma.order.count({
    //   where: {
    //     createdAt: {
    //       gte: thirtyDaysAgo,
    //     },
    //     status: 'COMPLETED',
    //   },
    // });

    const recentRevenue = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
        status: 'COMPLETED',
      },
      _sum: {
        total: true,
      },
    });

    const mrr = recentRevenue._sum.total || 0;

    // Year-to-date revenue
    const yearStart = startOfYear(now);
    const ytdRevenue = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: yearStart,
        },
        status: {
          in: ['COMPLETED', 'PROCESSING'],
        },
      },
      _sum: {
        total: true,
      },
    });

    return NextResponse.json({
      summary: {
        totalRevenue,
        currentPeriodRevenue: currentRevenue,
        previousPeriodRevenue: previousRevenue,
        revenueGrowth,
        averageOrderValue,
        totalOrders,
        mrr,
        ytd: ytdRevenue._sum.total || 0,
      },
      timeSeries,
      revenueBreakdown,
      recentTransactions,
      growthRates,
      period,
    });

  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue analytics' },
      { status: 500 }
    );
  }
}