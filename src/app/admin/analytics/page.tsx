'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Globe,
  FileText,
  Calendar,
  Download,
  RefreshCw,
  Activity,
  ArrowUp,
  ArrowDown,
  ChevronDown,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { format } from 'date-fns';

// Color palette for charts
const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#eab308'];

interface AnalyticsData {
  revenue: {
    timeSeries?: { date: string; revenue: number; period?: string; templateRevenue?: number; domainRevenue?: number }[];
    summary?: {
      totalRevenue: number;
      growth: number;
      revenueGrowth: number;
      mrr: number;
      averageOrderValue: number;
    };
  } | null;
  orders: {
    statusDistribution?: Record<string, number>;
    timeSeries?: { date: string; orders: number; revenue: number }[];
    conversionFunnel?: Record<string, number>;
    summary?: {
      totalOrders: number;
      completionRate: number;
    };
  } | null;
  users: {
    lifecycleStages?: Record<string, number>;
    summary?: {
      totalUsers: number;
      growth: number;
      userGrowthRate: number;
      activeUsers: number;
    };
    retentionCohorts?: {
      retention1Day: number;
      retention7Day: number;
      retention30Day: number;
    };
  } | null;
  templates: {
    topPerformingTemplates?: { name: string; orders: number; revenue: number; conversionRate?: number }[];
    templateMetrics?: unknown[];
    summary?: { activeTemplates: number; totalTemplates: number; avgConversionRate: number };
  } | null;
  domains: {
    extensionStats?: { extension: string; count: number; revenue?: number }[];
    summary?: { totalDomains: number; growth: number };
  } | null;
}

export default function AnalyticsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    revenue: null,
    orders: null,
    users: null,
    templates: null,
    domains: null,
  });
  const [dateRange, setDateRange] = useState(30); // Days
  const [period] = useState('monthly');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setRefreshing(true);

      const [revenue, orders, users, templates, domains] = await Promise.all([
        fetch(`/api/admin/analytics/revenue?period=${period}&months=${dateRange}`).then(r => r.json()),
        fetch(`/api/admin/analytics/orders?days=${dateRange}`).then(r => r.json()),
        fetch(`/api/admin/analytics/users?days=${dateRange}`).then(r => r.json()),
        fetch(`/api/admin/analytics/templates?days=${dateRange}`).then(r => r.json()),
        fetch(`/api/admin/analytics/domains?days=${dateRange}`).then(r => r.json()),
      ]);

      setAnalyticsData({ revenue, orders, users, templates, domains });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dateRange, period]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    setIsLoading(false);
    fetchAnalytics();
  }, [session, status, router, fetchAnalytics]);

  // Export data as CSV
  const exportData = (data: unknown[], filename: string) => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: unknown[]) => {
    if (!Array.isArray(data) || data.length === 0) return '';
    const firstItem = data[0];
    if (!firstItem || typeof firstItem !== 'object') return '';
    const headers = Object.keys(firstItem as Record<string, unknown>).join(',');
    const rows = data.map(row => {
      if (!row || typeof row !== 'object') return '';
      return Object.values(row as Record<string, unknown>).map(val =>
        typeof val === 'object' ? JSON.stringify(val) : String(val)
      ).join(',');
    }).filter(row => row !== '');
    return [headers, ...rows].join('\n');
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando analíticas...</p>
        </div>
      </div>
    );
  }

  const { revenue, orders, users, templates, domains } = analyticsData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Analíticas</h1>
              <p className="mt-2 text-gray-600">
                Métricas y análisis completo del negocio
              </p>
            </div>
            <div className="flex gap-4">
              {/* Date Range Selector */}
              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(Number(e.target.value))}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
                >
                  <option value={7}>Últimos 7 días</option>
                  <option value={30}>Últimos 30 días</option>
                  <option value={90}>Últimos 90 días</option>
                  <option value={365}>Último año</option>
                </select>
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <ChevronDown className="absolute right-2 top-3 h-4 w-4 text-gray-400" />
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchAnalytics}
                disabled={refreshing}
                className="p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              {(revenue?.summary?.revenueGrowth ?? 0) > 0 ? (
                <span className="flex items-center text-green-600 text-sm font-medium">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  {formatPercentage(revenue?.summary?.revenueGrowth ?? 0)}
                </span>
              ) : (
                <span className="flex items-center text-red-600 text-sm font-medium">
                  <ArrowDown className="h-4 w-4 mr-1" />
                  {formatPercentage(Math.abs(revenue?.summary?.revenueGrowth || 0))}
                </span>
              )}
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Ingresos Totales</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(revenue?.summary?.totalRevenue || 0)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              MRR: {formatCurrency(revenue?.summary?.mrr || 0)}
            </p>
          </div>

          {/* Orders Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                {formatPercentage(orders?.summary?.completionRate || 0)} completados
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Pedidos Totales</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {orders?.summary?.totalOrders || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Valor medio: {formatCurrency(revenue?.summary?.averageOrderValue || 0)}
            </p>
          </div>

          {/* Users Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              {(users?.summary?.userGrowthRate ?? 0) > 0 ? (
                <span className="flex items-center text-green-600 text-sm font-medium">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  {formatPercentage(users?.summary?.userGrowthRate ?? 0)}
                </span>
              ) : (
                <span className="flex items-center text-red-600 text-sm font-medium">
                  <ArrowDown className="h-4 w-4 mr-1" />
                  {formatPercentage(Math.abs(users?.summary?.userGrowthRate || 0))}
                </span>
              )}
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Usuarios Totales</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {users?.summary?.totalUsers || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Activos: {users?.summary?.activeUsers || 0}
            </p>
          </div>

          {/* Templates Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                {templates?.summary?.activeTemplates || 0} activas
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Plantillas</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {templates?.summary?.totalTemplates || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Conv. media: {formatPercentage(templates?.summary?.avgConversionRate || 0)}
            </p>
          </div>
        </div>

        {/* Revenue Trends Chart */}
        {revenue?.timeSeries && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Tendencia de Ingresos</h2>
              <button
                onClick={() => exportData(revenue.timeSeries ?? [], 'revenue_trends')}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Download className="h-4 w-4" />
                Exportar
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenue.timeSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f97316"
                  fill="#fed7aa"
                  name="Ingresos"
                />
                <Area
                  type="monotone"
                  dataKey="templateRevenue"
                  stroke="#3b82f6"
                  fill="#bfdbfe"
                  name="Plantillas"
                />
                <Area
                  type="monotone"
                  dataKey="domainRevenue"
                  stroke="#10b981"
                  fill="#bbf7d0"
                  name="Dominios"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Order Status Distribution */}
          {orders?.statusDistribution && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Distribución de Estados de Pedidos
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={Object.entries(orders.statusDistribution).map(([key, value]) => ({
                      name: key,
                      value,
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(orders.statusDistribution).map((entry, _index) => (
                      <Cell key={`cell-${_index}`} fill={COLORS[_index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* User Retention Cohorts */}
          {users?.retentionCohorts && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Retención de Usuarios
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="10%"
                  outerRadius="80%"
                  data={[
                    {
                      name: '30 días',
                      value: users.retentionCohorts.retention30Day,
                      fill: '#10b981',
                    },
                    {
                      name: '7 días',
                      value: users.retentionCohorts.retention7Day,
                      fill: '#3b82f6',
                    },
                    {
                      name: '1 día',
                      value: users.retentionCohorts.retention1Day,
                      fill: '#f97316',
                    },
                  ]}
                >
                  <RadialBar
                    label={{ position: 'insideStart', fill: '#fff' }}
                    background
                    dataKey="value"
                  />
                  <Legend />
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Template Performance */}
        {templates?.topPerformingTemplates && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Rendimiento de Plantillas
              </h2>
              <button
                onClick={() => exportData(templates.templateMetrics ?? [], 'template_performance')}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Download className="h-4 w-4" />
                Exportar
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={templates.topPerformingTemplates}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#f97316" />
                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#f97316" name="Ingresos (€)" />
                <Bar yAxisId="right" dataKey="conversionRate" fill="#3b82f6" name="Conversión (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Domain Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Domain Extensions Popularity */}
          {domains?.extensionStats && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Extensiones de Dominio Populares
              </h2>
              <div className="space-y-4">
                {domains.extensionStats.slice(0, 5).map((ext: { extension: string; count: number; revenue?: number }) => (
                  <div key={ext.extension} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <span className="font-medium">{ext.extension}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">{ext.count} ventas</span>
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(ext.revenue ?? 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Lifecycle Stages */}
          {users?.lifecycleStages && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Ciclo de Vida de Usuarios
              </h2>
              <div className="space-y-4">
                {Object.entries(users.lifecycleStages).map(([stage, count]: [string, number]) => (
                  <div key={stage} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-gray-400" />
                      <span className="font-medium capitalize">{stage}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">{count} usuarios</span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{
                            width: `${(count / (users.summary?.totalUsers ?? 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Trends */}
        {orders?.timeSeries && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Tendencia de Pedidos</h2>
              <button
                onClick={() => exportData(orders.timeSeries ?? [], 'order_trends')}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Download className="h-4 w-4" />
                Exportar
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={orders.timeSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="orders"
                  stroke="#f97316"
                  strokeWidth={2}
                  name="Pedidos"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Ingresos (€)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Conversion Funnel */}
        {orders?.conversionFunnel && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Embudo de Conversión
            </h2>
            <div className="space-y-4">
              {Object.entries(orders.conversionFunnel ?? {}).map(([stage, count]: [string, number], _index) => {
                const stages = Object.entries(orders.conversionFunnel ?? {});
                const maxCount = Math.max(...stages.map(([, c]) => c as number));
                const percentage = (count / maxCount) * 100;

                return (
                  <div key={stage} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium capitalize">
                        {stage.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8">
                      <div
                        className="bg-gradient-to-r from-orange-400 to-orange-600 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}