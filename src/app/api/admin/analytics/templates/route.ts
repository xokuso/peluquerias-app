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

    // Get all templates with order data
    const templates = await prisma.template.findMany({
      include: {
        orders: {
          where: {
            createdAt: {
              gte: startDate,
            },
          },
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
            setupStep: true,
            setupCompleted: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    // Calculate template performance metrics
    const templateMetrics = templates.map(template => {
      const orders = template.orders;
      const totalOrders = orders.length;
      const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;
      const processingOrders = orders.filter(o => o.status === 'PROCESSING').length;
      const cancelledOrders = orders.filter(o =>
        o.status === 'CANCELLED' || o.status === 'REFUNDED'
      ).length;

      // Revenue calculations
      const revenue = orders
        .filter(o => o.status === 'COMPLETED' || o.status === 'PROCESSING')
        .reduce((sum, o) => sum + o.total, 0);

      // Conversion rate (completed / total)
      const conversionRate = totalOrders > 0
        ? (completedOrders / totalOrders) * 100
        : 0;

      // Setup completion rate
      const setupCompletedOrders = orders.filter(o => o.setupCompleted).length;
      const setupCompletionRate = totalOrders > 0
        ? (setupCompletedOrders / totalOrders) * 100
        : 0;

      // Average order value for this template
      const avgOrderValue = (completedOrders + processingOrders) > 0
        ? revenue / (completedOrders + processingOrders)
        : 0;

      return {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        price: template.price,
        active: template.active,
        totalOrders,
        completedOrders,
        processingOrders,
        cancelledOrders,
        revenue,
        conversionRate,
        setupCompletionRate,
        avgOrderValue,
        allTimeOrders: template._count.orders,
      };
    });

    // Sort templates by revenue
    const topPerformingTemplates = [...templateMetrics]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Sort by popularity (order count)
    const mostPopularTemplates = [...templateMetrics]
      .sort((a, b) => b.totalOrders - a.totalOrders)
      .slice(0, 5);

    // Category performance
    const categoryPerformance = {
      BASIC: { orders: 0, revenue: 0, conversionRate: 0 },
      PREMIUM: { orders: 0, revenue: 0, conversionRate: 0 },
      ENTERPRISE: { orders: 0, revenue: 0, conversionRate: 0 },
    };

    templateMetrics.forEach(metric => {
      const category = metric.category as keyof typeof categoryPerformance;
      categoryPerformance[category].orders += metric.totalOrders;
      categoryPerformance[category].revenue += metric.revenue;
    });

    // Calculate conversion rates per category
    Object.keys(categoryPerformance).forEach(category => {
      const cat = category as keyof typeof categoryPerformance;
      const categoryTemplates = templateMetrics.filter(t => t.category === category);
      const totalOrders = categoryTemplates.reduce((sum, t) => sum + t.totalOrders, 0);
      const completedOrders = categoryTemplates.reduce((sum, t) => sum + t.completedOrders, 0);
      categoryPerformance[cat].conversionRate = totalOrders > 0
        ? (completedOrders / totalOrders) * 100
        : 0;
    });

    // Template trends over time
    const templateTrends: { [key: string]: { [date: string]: number } } = {};

    templates.forEach(template => {
      templateTrends[template.name] = {};
      template.orders.forEach(order => {
        const dateKey = format(order.createdAt, 'yyyy-MM-dd');
        const trendData = templateTrends[template.name];
        if (trendData) {
          trendData[dateKey] = (trendData[dateKey] || 0) + 1;
        }
      });
    });

    // Convert to time series format
    const timeSeries = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateKey = format(date, 'yyyy-MM-dd');

      const dayData: any = { date: dateKey };
      Object.keys(templateTrends).forEach(templateName => {
        const trendData = templateTrends[templateName];
        if (trendData) {
          dayData[templateName] = trendData[dateKey] || 0;
        }
      });

      timeSeries.push(dayData);
    }

    // Template feature analysis
    const featureAnalysis = templates.map(template => {
      const features = Array.isArray(template.features)
        ? template.features
        : JSON.parse(template.features as string);

      return {
        templateName: template.name,
        featureCount: features.length,
        features,
        pricePerFeature: features.length > 0 ? template.price / features.length : 0,
      };
    });

    // Price range analysis
    const priceRanges = {
      low: { min: 0, max: 50, count: 0, revenue: 0 },
      medium: { min: 50, max: 100, count: 0, revenue: 0 },
      high: { min: 100, max: 200, count: 0, revenue: 0 },
      premium: { min: 200, max: Infinity, count: 0, revenue: 0 },
    };

    templateMetrics.forEach(metric => {
      if (metric.price < 50) {
        priceRanges.low.count += metric.totalOrders;
        priceRanges.low.revenue += metric.revenue;
      } else if (metric.price < 100) {
        priceRanges.medium.count += metric.totalOrders;
        priceRanges.medium.revenue += metric.revenue;
      } else if (metric.price < 200) {
        priceRanges.high.count += metric.totalOrders;
        priceRanges.high.revenue += metric.revenue;
      } else {
        priceRanges.premium.count += metric.totalOrders;
        priceRanges.premium.revenue += metric.revenue;
      }
    });

    // Template conversion funnel
    const conversionFunnel = templateMetrics.map(template => {
      const orders = templates.find(t => t.id === template.id)?.orders || [];

      return {
        templateName: template.name,
        views: template.allTimeOrders * 3, // Estimated views (3x orders as approximation)
        started: template.totalOrders,
        setupCompleted: orders.filter(o => o.setupCompleted).length,
        paid: orders.filter(o =>
          o.status === 'PROCESSING' || o.status === 'COMPLETED'
        ).length,
        completed: template.completedOrders,
      };
    });

    // Summary statistics
    const summary = {
      totalTemplates: templates.length,
      activeTemplates: templates.filter(t => t.active).length,
      totalOrders: templateMetrics.reduce((sum, t) => sum + t.totalOrders, 0),
      totalRevenue: templateMetrics.reduce((sum, t) => sum + t.revenue, 0),
      avgConversionRate: templateMetrics.length > 0
        ? templateMetrics.reduce((sum, t) => sum + t.conversionRate, 0) / templateMetrics.length
        : 0,
      avgOrderValue: templateMetrics.length > 0
        ? templateMetrics.reduce((sum, t) => sum + t.avgOrderValue, 0) / templateMetrics.length
        : 0,
    };

    // Template recommendations (based on performance)
    const recommendations = [];

    // Find underperforming templates
    const underperforming = templateMetrics
      .filter(t => t.conversionRate < 20 && t.totalOrders > 0)
      .map(t => ({
        template: t.name,
        issue: 'Low conversion rate',
        conversionRate: t.conversionRate,
        suggestion: 'Consider reviewing pricing or improving template features',
      }));

    // Find high-performing templates to promote
    const highPerformers = templateMetrics
      .filter(t => t.conversionRate > 50 && t.revenue > 100)
      .map(t => ({
        template: t.name,
        strength: 'High conversion and revenue',
        conversionRate: t.conversionRate,
        suggestion: 'Feature prominently on homepage',
      }));

    recommendations.push(...underperforming, ...highPerformers);

    return NextResponse.json({
      summary,
      templateMetrics,
      topPerformingTemplates,
      mostPopularTemplates,
      categoryPerformance,
      timeSeries,
      featureAnalysis,
      priceRanges,
      conversionFunnel,
      recommendations,
    });

  } catch (error) {
    console.error('Error fetching template analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template analytics' },
      { status: 500 }
    );
  }
}