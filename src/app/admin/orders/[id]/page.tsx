'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Globe,
  CreditCard,
  Calendar,
  Package,
  FileText,
  Edit,
  Save,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  MessageSquare,
  Palette,
  Settings,
  ShoppingBag,
  DollarSign,
  Building
} from 'lucide-react';

// Types
interface OrderTemplate {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  preview?: string;
}

interface OrderUser {
  id: string;
  name: string | null;
  email: string;
  salonName: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  businessType: string | null;
  createdAt: string;
}

interface OrderDetail {
  id: string;
  salonName: string;
  ownerName: string;
  email: string;
  phone: string | null;
  address: string | null;
  domain: string;
  domainExtension: string | null;
  domainPrice?: number | null;
  domainUserPrice?: number | null;
  total: number;
  status: string;
  setupStep: string;
  setupCompleted: boolean;
  stripeSessionId?: string | null;
  paymentIntentId?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  template: OrderTemplate;
  user?: OrderUser | null;
  notes?: string;
}

const STATUS_CONFIG = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  PROCESSING: { label: 'En desarrollo', color: 'bg-blue-100 text-blue-800', icon: Package },
  COMPLETED: { label: 'Completado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: X },
  REFUNDED: { label: 'Reembolsado', color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
};

const SETUP_STEPS = {
  DOMAIN_SELECTION: 'Selección de dominio',
  BUSINESS_INFO: 'Información del negocio',
  DESIGN_PREFERENCES: 'Preferencias de diseño',
  CONTENT_EDITOR: 'Editor de contenido',
  PHOTOS_UPLOAD: 'Subida de fotos',
  REVIEW_LAUNCH: 'Revisión y lanzamiento',
  COMPLETED: 'Completado'
};

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
const getPhoneNumber = (order: OrderDetail | null): string => {
  if (!order) return 'Sin teléfono';
  return order.phone || order.user?.phone || 'Sin teléfono';
};

// Helper function to get display name
const getDisplayName = (order: OrderDetail | null): string => {
  if (!order) return 'Sin nombre';
  return order.ownerName || order.user?.name || 'Sin nombre';
};

// Helper function to calculate total breakdown
const getTotalBreakdown = (order: OrderDetail | null): {
  templatePrice: number;
  domainPrice: number;
  domainDiscount: number;
  total: number;
} => {
  if (!order) {
    return {
      templatePrice: 0,
      domainPrice: 0,
      domainDiscount: 0,
      total: 0
    };
  }

  const templatePrice = order.template?.price || 0;
  const domainPrice = order.domainPrice || 0;
  const domainUserPrice = order.domainUserPrice || domainPrice;
  const domainDiscount = domainPrice - domainUserPrice;

  return {
    templatePrice,
    domainPrice,
    domainDiscount,
    total: order.total || 0
  };
};

export default function OrderDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [setupStep, setSetupStep] = useState('');

  const fetchOrderDetail = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`);
      if (response.ok) {
        const result = await response.json();
        // Handle API response structure mismatch
        const orderData = result?.success ? result.data : result;

        if (orderData) {
          setOrder(orderData);
          setOrderStatus(orderData.status || 'PENDING');
          setSetupStep(orderData.setupStep || 'DOMAIN_SELECTION');
          setNotes(orderData.notes || '');
        } else {
          console.error('No order data received');
        }
      } else {
        console.error('Failed to fetch order:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/admin');
      return;
    }

    fetchOrderDetail();
  }, [session, status, params.id, router, fetchOrderDetail]);

  const handleStatusUpdate = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${params.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: orderStatus, setupStep }),
      });

      if (response.ok) {
        await fetchOrderDetail();
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleNotesUpdate = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (response.ok) {
        await fetchOrderDetail();
        setEditingNotes(false);
      }
    } catch (error) {
      console.error('Error updating notes:', error);
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
          <p className="mt-4 text-gray-600">Cargando detalles del pedido...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Pedido no encontrado</h2>
          <button
            onClick={() => router.push('/admin/orders')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
          >
            Volver a pedidos
          </button>
        </div>
      </div>
    );
  }

  const StatusIcon = STATUS_CONFIG[order?.status as keyof typeof STATUS_CONFIG]?.icon || AlertCircle;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/orders')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Pedido #{order?.id ? formatOrderId(order.id) : 'N/A'}
                </h1>
                <p className="text-gray-600">{order?.salonName || 'Sin nombre'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                STATUS_CONFIG[order?.status as keyof typeof STATUS_CONFIG]?.color || 'bg-gray-100 text-gray-800'
              }`}>
                <StatusIcon className="w-4 h-4 inline mr-1" />
                {STATUS_CONFIG[order?.status as keyof typeof STATUS_CONFIG]?.label || order?.status || 'Desconocido'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del Cliente */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Información del Cliente
                  </h2>
                  {order.user?.id && (
                    <button
                      onClick={() => router.push(`/admin/users/${order.user?.id}`)}
                      className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver ficha completa
                    </button>
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Datos Personales</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium">{getDisplayName(order)}</p>
                          <p className="text-sm text-gray-600">Propietario</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium">{order?.email || order?.user?.email || 'Sin email'}</p>
                          <p className="text-sm text-gray-600">Email principal</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium">{getPhoneNumber(order)}</p>
                          <p className="text-sm text-gray-600">Teléfono</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Datos del Negocio</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium">{order.salonName}</p>
                          <p className="text-sm text-gray-600">Nombre del salón</p>
                        </div>
                      </div>
                      {order?.user?.businessType ? (
                        <div className="flex items-center">
                          <ShoppingBag className="w-4 h-4 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium">{order.user?.businessType}</p>
                            <p className="text-sm text-gray-600">Tipo de negocio</p>
                          </div>
                        </div>
                      ) : null}
                      {(order?.address || order?.user?.address) && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium">{order?.address || order?.user?.address}</p>
                            <p className="text-sm text-gray-600">Dirección</p>
                          </div>
                        </div>
                      )}
                      {order?.user?.city && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium">{order?.user?.city}</p>
                            <p className="text-sm text-gray-600">Ciudad</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles del Proyecto */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Detalles del Proyecto
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Dominio y Web</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium">{order?.domain || 'No especificado'}{order?.domainExtension || ''}</p>
                          <p className="text-sm text-gray-600">Dominio seleccionado</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Palette className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium">{order?.template?.name || 'Sin plantilla'}</p>
                          <p className="text-sm text-gray-600">{order?.template?.category || 'Sin categoría'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Settings className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium">{SETUP_STEPS[order?.setupStep as keyof typeof SETUP_STEPS] || 'No especificado'}</p>
                          <p className="text-sm text-gray-600">Paso actual</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Financiero</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium">{formatCurrency(order?.total || 0)}</p>
                          <p className="text-sm text-gray-600">Precio total</p>
                        </div>
                      </div>
                      {(() => {
                        const breakdown = getTotalBreakdown(order);
                        return (
                          <>
                            <div className="flex items-center">
                              <CreditCard className="w-4 h-4 text-gray-400 mr-3" />
                              <div>
                                <p className="font-medium">{formatCurrency(breakdown.templatePrice)}</p>
                                <p className="text-sm text-gray-600">Precio plantilla</p>
                              </div>
                            </div>
                            {breakdown.domainPrice > 0 && (
                              <div className="flex items-center">
                                <Globe className="w-4 h-4 text-gray-400 mr-3" />
                                <div>
                                  <p className="font-medium">{formatCurrency(breakdown.domainPrice)}</p>
                                  <p className="text-sm text-gray-600">Precio dominio</p>
                                </div>
                              </div>
                            )}
                            {breakdown.domainDiscount > 0 && (
                              <div className="flex items-center">
                                <DollarSign className="w-4 h-4 text-green-500 mr-3" />
                                <div>
                                  <p className="font-medium text-green-600">-{formatCurrency(breakdown.domainDiscount)}</p>
                                  <p className="text-sm text-gray-600">Descuento aplicado</p>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium">{order?.createdAt ? formatDate(order.createdAt) : 'No disponible'}</p>
                          <p className="text-sm text-gray-600">Fecha de pedido</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Progreso del Proyecto
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {Object.entries(SETUP_STEPS).map(([key, label], index) => {
                    const currentStepIndex = Object.keys(SETUP_STEPS).indexOf(order?.setupStep || 'DOMAIN_SELECTION');
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                      <div key={key} className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-4 ${
                          isCompleted ? 'bg-green-500' :
                          isCurrent ? 'bg-blue-500' : 'bg-gray-300'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${
                            isCompleted ? 'text-green-600' :
                            isCurrent ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            {label}
                          </p>
                        </div>
                        {isCurrent && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            En progreso
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Acciones</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button
                    onClick={() => setEditing(!editing)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Actualizar Estado
                  </button>

                  <button
                    onClick={() => window.open(`mailto:${order.email}`)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Email
                  </button>

                  {getPhoneNumber(order) !== 'Sin teléfono' && (
                    <button
                      onClick={() => {
                        const phone = getPhoneNumber(order).replace(/[^\d]/g, '');
                        window.open(`https://wa.me/${phone}`);
                      }}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      WhatsApp
                    </button>
                  )}

                  {order.user?.id && (
                    <button
                      onClick={() => router.push(`/admin/users/${order.user?.id}`)}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Ver Cliente
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Status Update */}
            {editing && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Actualizar Estado</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estado del Pedido</label>
                      <select
                        value={orderStatus}
                        onChange={(e) => setOrderStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="PENDING">Pendiente</option>
                        <option value="PROCESSING">En desarrollo</option>
                        <option value="COMPLETED">Completado</option>
                        <option value="CANCELLED">Cancelado</option>
                        <option value="REFUNDED">Reembolsado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Paso del Setup</label>
                      <select
                        value={setupStep}
                        onChange={(e) => setSetupStep(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        {Object.entries(SETUP_STEPS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={handleStatusUpdate}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Notas del Proyecto
                  </h2>
                  <button
                    onClick={() => setEditingNotes(!editingNotes)}
                    className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                  >
                    {editingNotes ? 'Cancelar' : 'Editar'}
                  </button>
                </div>
              </div>
              <div className="p-6">
                {editingNotes ? (
                  <div className="space-y-4">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Agregar notas del proyecto, requirements especiales, comunicaciones con el cliente..."
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <div className="flex space-x-3">
                      <button
                        onClick={handleNotesUpdate}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingNotes(false)}
                        className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {order.notes ? (
                      <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
                    ) : (
                      <p className="text-gray-500 italic">
                        No hay notas del proyecto. Haz clic en &quot;Editar&quot; para agregar.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Resumen del Pedido</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID del pedido:</span>
                    <span className="font-medium">#{formatOrderId(order.id)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha de creación:</span>
                    <span className="font-medium">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Última actualización:</span>
                    <span className="font-medium">{formatDate(order.updatedAt)}</span>
                  </div>
                  {order.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha de finalización:</span>
                      <span className="font-medium">{formatDate(order.completedAt)}</span>
                    </div>
                  )}
                  <hr className="my-4" />
                  {(() => {
                    const breakdown = getTotalBreakdown(order);
                    if (breakdown.domainPrice > 0 || breakdown.domainDiscount > 0) {
                      return (
                        <>
                          <div className="space-y-2 text-sm mb-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Plantilla:</span>
                              <span>{formatCurrency(breakdown.templatePrice)}</span>
                            </div>
                            {breakdown.domainPrice > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Dominio:</span>
                                <span>{formatCurrency(breakdown.domainPrice)}</span>
                              </div>
                            )}
                            {breakdown.domainDiscount > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Descuento:</span>
                                <span className="text-green-600">-{formatCurrency(breakdown.domainDiscount)}</span>
                              </div>
                            )}
                          </div>
                          <hr className="my-2" />
                        </>
                      );
                    }
                    return null;
                  })()}
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(order.total || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}