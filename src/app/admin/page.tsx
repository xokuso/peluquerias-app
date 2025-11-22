'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Settings,
  BarChart3,
  Eye,
  Plus,
  RefreshCw,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAdminStats } from '@/hooks/useAdminStats';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { stats, loading: statsLoading, error: statsError, refetch } = useAdminStats();

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
  }, [session, status, router]);

  if (isLoading || status === 'loading' || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  // Show error state if stats failed to load
  if (statsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm border">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar estadísticas</h2>
          <p className="text-gray-600 mb-4">{statsError}</p>
          <button
            onClick={refetch}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center mx-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-gray-600">Bienvenido, {session?.user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/client"
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver como cliente
              </Link>
              <Link
                href="/settings"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={refetch}
            className="text-gray-600 hover:text-gray-900 flex items-center text-sm"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Actualizar datos
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuarios Totales</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                {stats?.monthlyGrowth?.users !== undefined && (
                  <p className={`text-xs mt-1 flex items-center ${
                    stats.monthlyGrowth.users >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.monthlyGrowth.users >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(stats.monthlyGrowth.users)}% este mes
                  </p>
                )}
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pedidos Totales</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
                {stats?.monthlyGrowth?.orders !== undefined && (
                  <p className={`text-xs mt-1 flex items-center ${
                    stats.monthlyGrowth.orders >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.monthlyGrowth.orders >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(stats.monthlyGrowth.orders)}% este mes
                  </p>
                )}
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <ShoppingBag className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ingresos Mensuales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.monthlyRevenue || 0)}
                </p>
                {stats?.monthlyGrowth?.revenue !== undefined && (
                  <p className={`text-xs mt-1 flex items-center ${
                    stats.monthlyGrowth.revenue >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.monthlyGrowth.revenue >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(stats.monthlyGrowth.revenue)}% este mes
                  </p>
                )}
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pedidos Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.pendingOrders || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.completedOrders || 0} completados
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Pedidos Recientes</h2>
                <Link
                  href="/admin/orders"
                  className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                >
                  Ver todos
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{order.salonName}</p>
                        <p className="text-sm text-gray-600">
                          {order.template.name} ({order.template.category}) - {formatCurrency(order.amount)}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-gray-500">{formatDate(order.date)}</p>
                          <p className="text-xs text-gray-400">{order.domain}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'COMPLETED' ? 'Completado' :
                         order.status === 'PENDING' ? 'Pendiente' :
                         order.status === 'PROCESSING' ? 'Procesando' :
                         order.status === 'CANCELLED' ? 'Cancelado' :
                         order.status === 'REFUNDED' ? 'Reembolsado' :
                         order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No hay pedidos recientes</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/admin/users"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
                >
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Gestionar Usuarios</p>
                </Link>

                <Link
                  href="/admin/orders"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
                >
                  <ShoppingBag className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Gestión Pedidos</p>
                </Link>

                <Link
                  href="/admin/templates"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
                >
                  <Plus className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Plantillas</p>
                </Link>

                <Link
                  href="/admin/analytics"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
                >
                  <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Analíticas</p>
                </Link>

                <Link
                  href="/admin/messages"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center relative"
                >
                  <MessageSquare className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Mensajes</p>
                  {stats?.newMessages && stats.newMessages > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {stats.newMessages}
                    </span>
                  )}
                </Link>

                <Link
                  href="/admin/settings"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
                >
                  <Settings className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Configuración</p>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats?.activeTemplates || 0}</div>
              <div className="text-sm text-gray-600">Plantillas Activas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats?.newMessages || 0}</div>
              <div className="text-sm text-gray-600">Mensajes Nuevos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats?.activeUsers || 0}</div>
              <div className="text-sm text-gray-600">Usuarios Activos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats?.completedOrders || 0}</div>
              <div className="text-sm text-gray-600">Pedidos Completados</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}