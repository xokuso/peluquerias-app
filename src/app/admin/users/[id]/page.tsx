'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  Building,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  MessageSquare,
  Package,
  TrendingUp,
  Star
} from 'lucide-react';

// Types
interface UserOrder {
  id: string;
  salonName: string;
  domain: string;
  domainExtension: string;
  total: number;
  status: string;
  setupStep: string;
  createdAt: string;
  completedAt: string | null;
  template: {
    name: string;
    category: string;
  };
}

interface UserDetail {
  id: string;
  name: string | null;
  email: string;
  salonName: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  businessType: string | null;
  role: string;
  isActive: boolean;
  hasCompletedOnboarding: boolean;
  createdAt: string;
  orders: UserOrder[];
}

const STATUS_CONFIG = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  PROCESSING: { label: 'En desarrollo', color: 'bg-blue-100 text-blue-800', icon: Package },
  COMPLETED: { label: 'Completado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: X },
  REFUNDED: { label: 'Reembolsado', color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
};

export default function UserDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/admin');
      return;
    }

    fetchUserDetail();
  }, [session, status, params.id, router]);

  const fetchUserDetail = async () => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP', { locale: es });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil del cliente...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Cliente no encontrado</h2>
          <button
            onClick={() => router.push('/admin/users')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
          >
            Volver a clientes
          </button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalSpent = user?.orders?.reduce((sum, order) => sum + order.total, 0) || 0;
  const activeOrders = user?.orders?.filter(order => order.status === 'PROCESSING').length || 0;
  const completedOrders = user?.orders?.filter(order => order.status === 'COMPLETED').length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/users')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user?.name || 'Cliente sin nombre'}
                </h1>
                <p className="text-gray-600">{user?.salonName || 'Sin nombre de salón'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {user?.isActive ? 'Activo' : 'Inactivo'}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                user?.hasCompletedOnboarding ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {user?.hasCompletedOnboarding ? 'Onboarding completo' : 'Onboarding pendiente'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Personal y del Negocio */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Información del Cliente
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Datos Personales</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium">{user?.name || 'No especificado'}</p>
                          <p className="text-sm text-gray-600">Nombre completo</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium">{user?.email || 'Sin email'}</p>
                          <p className="text-sm text-gray-600">Email principal</p>
                        </div>
                      </div>
                      {user?.phone ? (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium">{user?.phone}</p>
                            <p className="text-sm text-gray-600">Teléfono</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-gray-300 mr-3" />
                          <div>
                            <p className="text-gray-400">No especificado</p>
                            <p className="text-sm text-gray-400">Teléfono</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Datos del Negocio</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium">{user?.salonName || 'No especificado'}</p>
                          <p className="text-sm text-gray-600">Nombre del negocio</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <ShoppingBag className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium">{user?.businessType || 'No especificado'}</p>
                          <p className="text-sm text-gray-600">Tipo de negocio</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium">{user?.address || 'No especificada'}</p>
                          <p className="text-sm text-gray-600">Dirección</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium">{user?.city || 'No especificada'}</p>
                          <p className="text-sm text-gray-600">Ciudad</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Historial de Pedidos */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Historial de Pedidos ({user?.orders?.length || 0})
                  </h2>
                  {(user?.orders?.length || 0) > 0 && (
                    <div className="text-sm text-gray-600">
                      Total gastado: <span className="font-semibold">{formatCurrency(totalSpent)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {(user?.orders?.length || 0) > 0 ? (
                  user?.orders?.map((order) => {
                    const StatusIcon = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]?.icon || AlertCircle;
                    return (
                      <div key={order.id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium text-gray-900">{order.salonName}</h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]?.color || 'bg-gray-100 text-gray-800'
                              }`}>
                                <StatusIcon className="w-3 h-3 inline mr-1" />
                                {STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]?.label || order.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>🌐 {order.domain}{order.domainExtension}</span>
                              <span>🎨 {order.template.name}</span>
                              <span>📅 {formatDate(order.createdAt)}</span>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              Paso actual: {order.setupStep}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">{formatCurrency(order.total)}</div>
                            <button
                              onClick={() => router.push(`/admin/orders/${order.id}`)}
                              className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center mt-1"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver detalles
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pedidos</h3>
                    <p>Este cliente aún no ha realizado ningún pedido.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Estadísticas</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-sm text-gray-600">Total gastado</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(totalSpent)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Package className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-sm text-gray-600">Pedidos activos</span>
                    </div>
                    <span className="font-semibold">{activeOrders}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-sm text-gray-600">Pedidos completados</span>
                    </div>
                    <span className="font-semibold">{completedOrders}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">Cliente desde</span>
                    </div>
                    <span className="font-semibold text-sm">{user?.createdAt ? formatDate(user.createdAt) : 'No disponible'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Acciones</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button
                    onClick={() => window.open(`mailto:${user?.email || ''}`)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Email
                  </button>

                  {user?.phone && (
                    <button
                      onClick={() => window.open(`https://wa.me/${user?.phone?.replace(/[^\d]/g, '')}`)}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      WhatsApp
                    </button>
                  )}

                  <button
                    onClick={() => router.push('/admin/orders')}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Ver Pedidos
                  </button>

                  <button
                    onClick={() => router.push('/admin/users')}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Volver a Clientes
                  </button>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Información de Cuenta</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID del cliente:</span>
                    <span className="font-medium">#{user?.id ? user.id.slice(-8).toUpperCase() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rol:</span>
                    <span className="font-medium">{user?.role || 'Sin rol'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`font-medium ${user?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {user?.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Onboarding:</span>
                    <span className={`font-medium ${user?.hasCompletedOnboarding ? 'text-green-600' : 'text-yellow-600'}`}>
                      {user?.hasCompletedOnboarding ? 'Completado' : 'Pendiente'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha de registro:</span>
                    <span className="font-medium">{user?.createdAt ? formatDate(user.createdAt) : 'No disponible'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Value */}
            {totalSpent > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <Star className="w-5 h-5 text-yellow-500 mr-2" />
                    <h3 className="font-semibold text-gray-900">Valor del Cliente</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-600 mb-1">{formatCurrency(totalSpent)}</p>
                  <p className="text-sm text-gray-600">
                    {user?.orders?.length || 0} {(user?.orders?.length || 0) === 1 ? 'pedido' : 'pedidos'} realizados
                  </p>

                  {completedOrders > 0 && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <div className="flex items-center text-sm text-green-700">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Cliente establecido con {completedOrders} proyecto{completedOrders !== 1 ? 's' : ''} completado{completedOrders !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}