import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfDay, subDays, format } from 'date-fns';

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

    // Get all orders with domain information
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        id: true,
        domain: true,
        domainExtension: true,
        domainPrice: true,
        domainUserPrice: true,
        total: true,
        status: true,
        createdAt: true,
      },
    });

    // Get domain pricing configuration
    const domainPricing = await prisma.domainPricing.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
    });

    // Calculate domain statistics
    const domainStats: { [extension: string]: {
      count: number;
      revenue: number;
      avgPrice: number;
      avgDiscount: number;
      popularityRank?: number;
    }} = {};

    // Initialize stats for all configured extensions
    domainPricing.forEach(pricing => {
      domainStats[pricing.extension] = {
        count: 0,
        revenue: 0,
        avgPrice: 0,
        avgDiscount: 0,
      };
    });

    // Process orders
    orders.forEach(order => {
      if (order.domainExtension) {
        const ext = order.domainExtension;
        if (!domainStats[ext]) {
          domainStats[ext] = {
            count: 0,
            revenue: 0,
            avgPrice: 0,
            avgDiscount: 0,
          };
        }

        domainStats[ext].count++;

        if (order.status === 'COMPLETED' || order.status === 'PROCESSING') {
          const domainRevenue = order.domainUserPrice || 0;
          domainStats[ext].revenue += domainRevenue;

          // Calculate discount if prices are available
          if (order.domainPrice && order.domainUserPrice) {
            const discount = ((order.domainPrice - order.domainUserPrice) / order.domainPrice) * 100;
            domainStats[ext].avgDiscount += discount;
          }
        }
      }
    });

    // Calculate averages and rankings
    const extensionList = Object.entries(domainStats)
      .map(([extension, stats]) => {
        const avgPrice = stats.count > 0 ? stats.revenue / stats.count : 0;
        const avgDiscount = stats.count > 0 ? stats.avgDiscount / stats.count : 0;

        return {
          extension,
          ...stats,
          avgPrice,
          avgDiscount,
        };
      })
      .sort((a, b) => b.count - a.count);

    // Add popularity rankings
    extensionList.forEach((item, index) => {
      item.popularityRank = index + 1;
    });

    // Domain trends over time
    const domainTrends: { [date: string]: { [extension: string]: number } } = {};

    orders.forEach(order => {
      if (order.domainExtension) {
        const dateKey = format(order.createdAt, 'yyyy-MM-dd');
        if (!domainTrends[dateKey]) {
          domainTrends[dateKey] = {};
        }
        domainTrends[dateKey][order.domainExtension] =
          (domainTrends[dateKey][order.domainExtension] || 0) + 1;
      }
    });

    // Convert to time series
    const timeSeries = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayData = domainTrends[dateKey] || {};

      timeSeries.push({
        date: dateKey,
        ...dayData,
        total: Object.values(dayData).reduce((sum: number, count: any) => sum + count, 0),
      });
    }

    // Domain name patterns analysis
    const domainPatterns = {
      lengthDistribution: {
        short: 0,      // < 10 chars
        medium: 0,     // 10-15 chars
        long: 0,       // > 15 chars
      },
      containsKeywords: {
        peluqueria: 0,
        salon: 0,
        barberia: 0,
        hair: 0,
        beauty: 0,
        style: 0,
      },
      uniqueDomains: new Set(orders.map(o => o.domain)).size,
    };

    // Analyze domain names
    orders.forEach(order => {
      const domain = order.domain;
      if (!domain) return;
      const domainName = domain.split('.')[0]?.toLowerCase() ?? '';

      // Length analysis
      if (domainName.length < 10) {
        domainPatterns.lengthDistribution.short++;
      } else if (domainName.length <= 15) {
        domainPatterns.lengthDistribution.medium++;
      } else {
        domainPatterns.lengthDistribution.long++;
      }

      // Keyword analysis
      Object.keys(domainPatterns.containsKeywords).forEach(keyword => {
        if (domainName.includes(keyword)) {
          const key = keyword as keyof typeof domainPatterns.containsKeywords;
          (domainPatterns.containsKeywords[key] as number)++;
        }
      });
    });

    // Revenue comparison: domains vs templates
    const revenueComparison = {
      domainRevenue: 0,
      templateRevenue: 0,
      domainPercentage: 0,
      templatePercentage: 0,
    };

    const completedOrders = orders.filter(o =>
      o.status === 'COMPLETED' || o.status === 'PROCESSING'
    );

    completedOrders.forEach(order => {
      const domainRevenue = order.domainUserPrice || 0;
      const templateRevenue = order.total - domainRevenue;
      revenueComparison.domainRevenue += domainRevenue;
      revenueComparison.templateRevenue += templateRevenue;
    });

    const totalRevenue = revenueComparison.domainRevenue + revenueComparison.templateRevenue;
    if (totalRevenue > 0) {
      revenueComparison.domainPercentage = (revenueComparison.domainRevenue / totalRevenue) * 100;
      revenueComparison.templatePercentage = (revenueComparison.templateRevenue / totalRevenue) * 100;
    }

    // Pricing optimization suggestions
    const pricingOptimizations = [];

    // Compare actual sales with pricing configuration
    for (const pricing of domainPricing) {
      const stats = domainStats[pricing.extension];
      if (stats) {
        const conversionRate = stats.count / (days || 1); // Orders per day

        if (conversionRate < 0.1 && pricing.discount < 50) {
          pricingOptimizations.push({
            extension: pricing.extension,
            currentPrice: pricing.basePrice,
            currentDiscount: pricing.discount,
            suggestion: 'Consider increasing discount to boost sales',
            reason: 'Low conversion rate',
          });
        }

        if (conversionRate > 1 && pricing.discount > 20) {
          pricingOptimizations.push({
            extension: pricing.extension,
            currentPrice: pricing.basePrice,
            currentDiscount: pricing.discount,
            suggestion: 'Can reduce discount while maintaining sales',
            reason: 'High demand',
          });
        }
      }
    }

    // Top domains by revenue
    const topDomainsByRevenue = orders
      .filter(o => o.status === 'COMPLETED' || o.status === 'PROCESSING')
      .sort((a, b) => (b.domainUserPrice || 0) - (a.domainUserPrice || 0))
      .slice(0, 10)
      .map(order => ({
        domain: order.domain,
        extension: order.domainExtension,
        price: order.domainUserPrice,
        originalPrice: order.domainPrice,
        discount: order.domainPrice && order.domainUserPrice
          ? ((order.domainPrice - order.domainUserPrice) / order.domainPrice) * 100
          : 0,
        createdAt: order.createdAt,
      }));

    // Summary statistics
    const summary = {
      totalDomainsSold: orders.filter(o => o.domainExtension).length,
      uniqueExtensions: Object.keys(domainStats).length,
      totalDomainRevenue: revenueComparison.domainRevenue,
      avgDomainPrice: extensionList.reduce((sum, ext) => sum + ext.avgPrice, 0) / extensionList.length || 0,
      avgDiscount: extensionList.reduce((sum, ext) => sum + ext.avgDiscount, 0) / extensionList.length || 0,
      mostPopularExtension: extensionList[0]?.extension || 'N/A',
      highestRevenueExtension: [...extensionList].sort((a, b) => b.revenue - a.revenue)[0]?.extension || 'N/A',
    };

    // Extension availability and configuration
    const extensionConfig = domainPricing.map(pricing => ({
      extension: pricing.extension,
      basePrice: pricing.basePrice,
      discount: pricing.discount,
      finalPrice: pricing.basePrice * (1 - pricing.discount / 100),
      isPopular: pricing.isPopular,
      isAvailable: pricing.isAvailable,
      sold: domainStats[pricing.extension]?.count || 0,
      revenue: domainStats[pricing.extension]?.revenue || 0,
    }));

    return NextResponse.json({
      summary,
      extensionStats: extensionList,
      timeSeries,
      domainPatterns,
      revenueComparison,
      pricingOptimizations,
      topDomainsByRevenue,
      extensionConfig,
    });

  } catch (error) {
    console.error('Error fetching domain analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch domain analytics' },
      { status: 500 }
    );
  }
}