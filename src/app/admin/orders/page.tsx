'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Search,
  Calendar,
  Download,
  Eye,
  Edit,
  Filter,
  ChevronLeft,
  ChevronRight,
  Euro,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  X,
  Mail,
  Phone,
  Globe,
  User,
  CreditCard,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

// Types
interface OrderTemplate {
  id: string;
  name: string;
  category: string;
  price: number;
}

interface OrderUser {
  id?: string;
  name: string | null;
  email: string;
  salonName: string | null;
  phone?: string | null;
  businessType?: string | null;
}

interface Order {
  id: string;
  userId: string | null;
  salonName: string;
  ownerName: string;
  email: string;
  phone: string | null;
  address: string | null;
  domain: string;
  domainExtension?: string | null;
  domainPrice?: number | null;
  domainUserPrice?: number | null;
  total: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  setupStep?: string;
  setupCompleted?: boolean;
  stripeSessionId?: string | null;
  paymentIntentId?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  template: OrderTemplate;
  user?: OrderUser | null;
}

interface OrdersResponse {
  success: boolean;
  data?: {
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}


interface OrderStats {
  totalRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  processingOrders: number;
}

// Helper function to format order IDs
const formatOrderId = (id: string): string => {
  if (!id) return 'N/A';

  // Handle various ID formats
  if (id.startsWith('cs_')) {
    // Stripe checkout session
    return id.slice(-6).toUpperCase();
  } else if (id.startsWith('pi_')) {
    // Stripe payment intent
    return id.slice(-6).toUpperCase();
  } else if (id.includes('_')) {
    // Generic underscore format (order_XXX, etc.)
    const parts = id.split('_');
    const lastPart = parts[parts.length - 1];
    return lastPart ? lastPart.slice(-6).toUpperCase() : id.slice(-6).toUpperCase();
  } else if (id.length > 8) {
    // Long IDs (CUID, UUID, etc.)
    return id.slice(-8).toUpperCase();
  }

  // Fallback to last 6 characters
  return id.slice(-6).toUpperCase();
};

// Helper function to safely get phone number
const getPhoneNumber = (order: Order): string => {
  return order.phone || order.user?.phone || 'Sin teléfono';
};

// Helper function to get display name
const getDisplayName = (order: Order): string => {
  return order.ownerName || order.user?.name || 'Sin nombre';
};

// Helper function to calculate total breakdown
const getTotalBreakdown = (order: Order): {
  templatePrice: number;
  domainPrice: number;
  domainDiscount: number;
  total: number;
} => {
  const templatePrice = order.template?.price || 0;
  const domainPrice = order.domainPrice || 0;
  const domainUserPrice = order.domainUserPrice || domainPrice;
  const domainDiscount = domainPrice - domainUserPrice;

  return {
    templatePrice,
    domainPrice,
    domainDiscount,
    total: order.total
  };
};

// Status configuration
const statusConfig = {
  PENDING: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
    bgGradient: 'from-yellow-50 to-yellow-100'
  },
  PROCESSING: {
    label: 'En Proceso',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: RefreshCw,
    bgGradient: 'from-blue-50 to-blue-100'
  },
  COMPLETED: {
    label: 'Completado',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    bgGradient: 'from-green-50 to-green-100'
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    bgGradient: 'from-red-50 to-red-100'
  },
  REFUNDED: {
    label: 'Reembolsado',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: AlertCircle,
    bgGradient: 'from-purple-50 to-purple-100'
  }
};

// Setup step labels
const setupStepLabels: Record<string, string> = {
  DOMAIN_SELECTION: 'Selección de Dominio',
  BUSINESS_INFO: 'Información del Negocio',
  DESIGN_PREFERENCES: 'Preferencias de Diseño',
  CONTENT_EDITOR: 'Editor de Contenido',
  PHOTOS_UPLOAD: 'Carga de Fotos',
  REVIEW_LAUNCH: 'Revisión y Lanzamiento',
  COMPLETED: 'Completado'
};

export default function AdminOrdersPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  // State management
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [exportingData, setExportingData] = useState(false);

  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Statistics
  const [stats, setStats] = useState<OrderStats>({
    totalRevenue: 0,
    averageOrderValue: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    processingOrders: 0
  });

  // Check authentication
  useEffect(() => {
    if (sessionStatus === 'loading') return;

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/login');
    }
  }, [session, sessionStatus, router]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        sortOrder
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);

      const response = await fetch(`/api/admin/orders?${params}`);
      const data: OrdersResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch orders');
      }

      if (data.data) {
        setOrders(data.data.orders);
        setTotalPages(data.data.pagination.totalPages);
        setTotalOrders(data.data.pagination.total);

        // Calculate statistics
        calculateStats(data.data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Error loading orders');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, dateRange, sortBy, sortOrder]);

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchOrders();
    }
  }, [fetchOrders, session]);

  // Calculate statistics
  const calculateStats = (ordersList: Order[]) => {
    const completed = ordersList.filter(o => o.status === 'COMPLETED');
    const pending = ordersList.filter(o => o.status === 'PENDING');
    const processing = ordersList.filter(o => o.status === 'PROCESSING');

    const totalRevenue = completed.reduce((sum, order) => sum + order.total, 0);
    const avgValue = completed.length > 0 ? totalRevenue / completed.length : 0;

    setStats({
      totalRevenue,
      averageOrderValue: avgValue,
      totalOrders: ordersList.length,
      completedOrders: completed.length,
      pendingOrders: pending.length,
      processingOrders: processing.length
    });
  };


  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(true);

      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update status');
      }

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus as any } : order
        )
      );

      if (orderDetails?.id === orderId) {
        setOrderDetails({ ...orderDetails, status: newStatus });
      }

      alert('Estado actualizado correctamente');
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error al actualizar el estado');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Export orders to CSV
  const exportToCSV = async () => {
    try {
      setExportingData(true);

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);

      const response = await fetch(`/api/admin/orders/export?${params}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('Datos exportados correctamente');
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Error al exportar los datos');
    } finally {
      setExportingData(false);
    }
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };


  // Loading state
  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Not authorized
  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Pedidos
          </h1>
          <p className="text-gray-600">
            Administra todos los pedidos y transacciones de la plataforma
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
                <Euro className="h-6 w-6 text-purple-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              €{stats.totalRevenue.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600 mt-1">Ingresos Totales</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {stats.totalOrders}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              €{stats.averageOrderValue.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600 mt-1">Valor Medio Pedido</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-semibold text-green-600">
                {stats.completedOrders}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.completedOrders}
            </div>
            <p className="text-sm text-gray-600 mt-1">Pedidos Completados</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-sm font-semibold text-yellow-600">
                {stats.pendingOrders + stats.processingOrders}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.pendingOrders + stats.processingOrders}
            </div>
            <p className="text-sm text-gray-600 mt-1">En Proceso</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por salón, dominio, email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
              >
                <option value="">Todos los estados</option>
                <option value="PENDING">Pendiente</option>
                <option value="PROCESSING">En Proceso</option>
                <option value="COMPLETED">Completado</option>
                <option value="CANCELLED">Cancelado</option>
                <option value="REFUNDED">Reembolsado</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => {
                  setDateRange(prev => ({ ...prev, start: e.target.value }));
                  setCurrentPage(1);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <span className="text-gray-500">-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => {
                  setDateRange(prev => ({ ...prev, end: e.target.value }));
                  setCurrentPage(1);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              disabled={exportingData}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition disabled:opacity-50"
            >
              <Download className="h-5 w-5" />
              <span>{exportingData ? 'Exportando...' : 'Exportar CSV'}</span>
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          {error ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchOrders}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('id')}
                          className="flex items-center space-x-1 hover:text-gray-700"
                        >
                          <span>ID</span>
                          {sortBy === 'id' && (
                            sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('salonName')}
                          className="flex items-center space-x-1 hover:text-gray-700"
                        >
                          <span>Salón</span>
                          {sortBy === 'salonName' && (
                            sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dominio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plantilla
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('total')}
                          className="flex items-center space-x-1 hover:text-gray-700"
                        >
                          <span>Total</span>
                          {sortBy === 'total' && (
                            sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('createdAt')}
                          className="flex items-center space-x-1 hover:text-gray-700"
                        >
                          <span>Fecha</span>
                          {sortBy === 'createdAt' && (
                            sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => {
                      const statusInfo = statusConfig[order.status];
                      return (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{formatOrderId(order.id)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {order.salonName || order.user?.salonName || 'Sin nombre de salón'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {getDisplayName(order)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900">{order.email || order.user?.email || 'Sin email'}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {getPhoneNumber(order)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">
                                {order.domain ? `${order.domain}${order.domainExtension || ''}` : 'Sin escoger'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm text-gray-900">
                                {order.template.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {order.template.category}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              €{order.total?.toFixed(2) || '0.00'}
                            </div>
                            {(() => {
                              const breakdown = getTotalBreakdown(order);
                              return (
                                <>
                                  {breakdown.domainPrice > 0 && (
                                    <div className="text-xs text-gray-500">
                                      Dominio: €{breakdown.domainPrice.toFixed(2)}
                                    </div>
                                  )}
                                  {breakdown.templatePrice > 0 && breakdown.templatePrice !== order.total && (
                                    <div className="text-xs text-gray-500">
                                      Plantilla: €{breakdown.templatePrice.toFixed(2)}
                                    </div>
                                  )}
                                  {breakdown.domainDiscount > 0 && (
                                    <div className="text-xs text-green-600">
                                      Desc.: -€{breakdown.domainDiscount.toFixed(2)}
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {(() => {
                                const StatusIcon = statusInfo.icon;
                                return (
                                  <>
                                    <StatusIcon className="h-4 w-4 mr-2" />
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                                      {statusInfo.label}
                                    </span>
                                  </>
                                );
                              })()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: es })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Link
                                href={`/admin/orders/${order.id}`}
                                className="text-purple-600 hover:text-purple-900 flex items-center"
                                title="Ver detalles del pedido"
                              >
                                <Eye className="h-5 w-5" />
                              </Link>
                              {order.userId && (
                                <Link
                                  href={`/admin/users/${order.userId}`}
                                  className="text-blue-600 hover:text-blue-900 flex items-center"
                                  title="Ver perfil del cliente"
                                >
                                  <User className="h-5 w-5" />
                                </Link>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  // Inline status update for simplicity
                                  const newStatus = prompt('Nuevo estado: PENDING, PROCESSING, COMPLETED, CANCELLED, REFUNDED');
                                  if (newStatus) {
                                    updateOrderStatus(order.id, newStatus);
                                  }
                                }}
                                className="text-green-600 hover:text-green-900"
                                title="Actualizar estado"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, totalOrders)}
                      </span>{' '}
                      de <span className="font-medium">{totalOrders}</span> resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = currentPage <= 3 ? i + 1 : currentPage + i - 2;
                        if (pageNum > 0 && pageNum <= totalPages) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                pageNum === currentPage
                                  ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                        return null;
                      })}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowOrderDetails(false)}></div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Detalles del Pedido
                      </h3>
                      <p className="text-gray-500 mt-1">
                        #{selectedOrder.id.startsWith('order_') || selectedOrder.id.includes('_')
                          ? selectedOrder.id.split('_').pop()?.slice(-6).toUpperCase() || selectedOrder.id.slice(-6).toUpperCase()
                          : selectedOrder.id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowOrderDetails(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {false ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Cargando detalles...</p>
                    </div>
                  ) : orderDetails ? (
                    <div className="space-y-6">
                      {/* Status Section */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Estado del Pedido</h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {(() => {
                              const statusInfo = statusConfig[orderDetails.status as keyof typeof statusConfig];
                              const StatusIcon = statusInfo.icon;
                              return (
                                <>
                                  <StatusIcon className="h-5 w-5" />
                                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusInfo.color}`}>
                                    {statusInfo.label}
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                          <select
                            value={orderDetails.status}
                            onChange={(e) => updateOrderStatus(orderDetails.id, e.target.value)}
                            disabled={updatingStatus}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="PENDING">Pendiente</option>
                            <option value="PROCESSING">En Proceso</option>
                            <option value="COMPLETED">Completado</option>
                            <option value="CANCELLED">Cancelado</option>
                            <option value="REFUNDED">Reembolsado</option>
                          </select>
                        </div>
                        {orderDetails.setupStep && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Paso de configuración:</span>{' '}
                              {setupStepLabels[orderDetails.setupStep] || orderDetails.setupStep}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Configuración completada:</span>{' '}
                              {orderDetails.setupCompleted ? 'Sí' : 'No'}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Customer Information */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Información del Cliente</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              <span className="font-medium mr-2">Propietario:</span>
                              {orderDetails.ownerName}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center mt-2">
                              <Mail className="h-4 w-4 mr-2" />
                              <span className="font-medium mr-2">Email:</span>
                              {orderDetails.email}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center mt-2">
                              <Phone className="h-4 w-4 mr-2" />
                              <span className="font-medium mr-2">Teléfono:</span>
                              {orderDetails.phone}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Salón:</span> {orderDetails.salonName}
                            </p>
                            {orderDetails.address && (
                              <p className="text-sm text-gray-600 mt-2">
                                <span className="font-medium">Dirección:</span> {orderDetails.address}
                              </p>
                            )}
                            <p className="text-sm text-gray-600 flex items-center mt-2">
                              <Globe className="h-4 w-4 mr-2" />
                              <span className="font-medium mr-2">Dominio:</span>
                              {orderDetails.domain ? `${orderDetails.domain}${orderDetails.domainExtension || ''}` : 'Sin escoger'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Template Information */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Plantilla</h4>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-lg font-medium text-gray-900">
                              {orderDetails.template.name}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Categoría: <span className="font-medium">{orderDetails.template.category}</span>
                            </p>
                          </div>
                          <p className="text-lg font-semibold text-purple-600">
                            €{orderDetails.template.price.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Payment Information */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Información de Pago</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Plantilla:</span>
                            <span className="text-sm font-medium">€{orderDetails.template.price.toFixed(2)}</span>
                          </div>
                          {orderDetails.domainPrice && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Dominio ({orderDetails.domainExtension}):
                                </span>
                                <span className="text-sm font-medium">€{orderDetails.domainPrice.toFixed(2)}</span>
                              </div>
                              {orderDetails.domainUserPrice !== orderDetails.domainPrice && (
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Descuento dominio:</span>
                                  <span className="text-sm font-medium text-green-600">
                                    -€{(orderDetails.domainPrice - (orderDetails.domainUserPrice || 0)).toFixed(2)}
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                          <div className="pt-2 border-t border-gray-300">
                            <div className="flex justify-between">
                              <span className="text-base font-semibold text-gray-900">Total:</span>
                              <span className="text-base font-bold text-purple-600">
                                €{orderDetails.total.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {(orderDetails.stripeSessionId || orderDetails.paymentIntentId) && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center space-x-2">
                              <CreditCard className="h-4 w-4 text-gray-400" />
                              <p className="text-xs text-gray-500">
                                {orderDetails.stripeSessionId && (
                                  <span>Session: {orderDetails.stripeSessionId.slice(-12)}</span>
                                )}
                                {orderDetails.paymentIntentId && (
                                  <span className="ml-2">Payment: {orderDetails.paymentIntentId.slice(-12)}</span>
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Photos */}
                      {orderDetails.photos && orderDetails.photos.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            Fotos ({orderDetails.photos.length})
                          </h4>
                          <div className="grid grid-cols-4 gap-2">
                            {orderDetails.photos.slice(0, 8).map((photo: any) => (
                              <div key={photo.id} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                                <img
                                  src={photo.thumbnailUrl || photo.originalUrl}
                                  alt={photo.filename}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            {orderDetails.photos.length > 8 && (
                              <div className="aspect-square bg-gray-300 rounded-lg flex items-center justify-center">
                                <span className="text-gray-600 font-medium">
                                  +{orderDetails.photos.length - 8}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Fechas</h4>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Creado:</span>{' '}
                            {format(new Date(orderDetails.createdAt), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Actualizado:</span>{' '}
                            {format(new Date(orderDetails.updatedAt), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                          </p>
                          {orderDetails.completedAt && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Completado:</span>{' '}
                              {format(new Date(orderDetails.completedAt), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No se pudieron cargar los detalles del pedido</p>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}