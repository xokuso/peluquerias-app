'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Calendar,
  DollarSign,
  Receipt,
  FileText,
  Wallet,
  Plus,
  MoreHorizontal,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  Shield,
  Zap,
  BarChart3,
  Star,
  Activity,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InvoiceDownloader } from '@/components/InvoiceDownloader'
import type {
  Payment
} from '@/types'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
}

// Loading skeleton component
const LoadingSkeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-neutral-200 to-neutral-300 rounded-lg ${className}`} />
)

// Payment status badge component
const PaymentStatusBadge: React.FC<{ status: Payment['status'] }> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed': return {
        bg: '#D1FAE5',
        text: '#065F46',
        border: '#10B981',
        icon: <CheckCircle className="w-3 h-3" />,
        label: 'Completado'
      }
      case 'pending': return {
        bg: '#FEF3C7',
        text: '#92400E',
        border: '#F59E0B',
        icon: <Clock className="w-3 h-3" />,
        label: 'Pendiente'
      }
      case 'processing': return {
        bg: '#EBF5FF',
        text: '#1E40AF',
        border: '#3B82F6',
        icon: <Activity className="w-3 h-3" />,
        label: 'Procesando'
      }
      case 'failed': return {
        bg: '#FEE2E2',
        text: '#991B1B',
        border: '#EF4444',
        icon: <AlertCircle className="w-3 h-3" />,
        label: 'Fallido'
      }
      case 'refunded': return {
        bg: '#F3F4F6',
        text: '#374151',
        border: '#9CA3AF',
        icon: <ArrowDownRight className="w-3 h-3" />,
        label: 'Reembolsado'
      }
      default: return {
        bg: '#F3F4F6',
        text: '#374151',
        border: '#9CA3AF',
        icon: <Clock className="w-3 h-3" />,
        label: 'Desconocido'
      }
    }
  }

  const config = getStatusConfig(status)

  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border"
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border + '40'
      }}
    >
      {config.icon}
      {config.label}
    </span>
  )
}

// Subscription status component
const SubscriptionStatus: React.FC<{ isActive: boolean; nextPayment: Date; plan: string }> = ({
  isActive,
  nextPayment,
  plan
}) => (
  <motion.div
    variants={fadeInUp}
    className="relative overflow-hidden rounded-2xl p-6"
    style={{
      background: isActive
        ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
        : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      boxShadow: 'var(--shadow-2xl)'
    }}
  >
    {/* Animated background elements */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white transform translate-x-8 -translate-y-8" />
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white transform -translate-x-6 translate-y-6" />
    </div>

    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
            {isActive ? <Shield className="w-5 h-5 text-white" /> : <AlertCircle className="w-5 h-5 text-white" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Plan {plan}</h3>
            <p className="text-white text-opacity-90 text-sm">
              {isActive ? 'Suscripción activa' : 'Suscripción pendiente'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white text-sm opacity-90">Próximo pago</p>
          <p className="text-white font-bold">
            {new Date(nextPayment).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short'
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-white text-sm">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4" />
          <span>Hosting incluido</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          <span>Soporte 24/7</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>SSL gratis</span>
        </div>
      </div>
    </div>
  </motion.div>
)

// Payment analytics card
const PaymentAnalyticsCard: React.FC<{
  title: string
  value: string | number
  icon: React.ReactNode
  change?: { value: number; period: string }
  color: string
  delay?: number
}> = ({ title, value, icon, change, color, delay = 0 }) => (
  <motion.div
    variants={fadeInUp}
    transition={{ delay }}
    className="bg-white rounded-xl p-6 border border-neutral-200 hover:shadow-lg transition-all duration-300"
    style={{ boxShadow: 'var(--shadow-sm)' }}
  >
    <div className="flex items-center justify-between mb-4">
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        {React.cloneElement(icon as React.ReactElement, {
          className: 'w-6 h-6',
          style: { color }
        })}
      </div>
      {change && (
        <div className={`flex items-center gap-1 text-xs font-medium ${
          change.value > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {change.value > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(change.value)}%
        </div>
      )}
    </div>

    <div>
      <h3 className="text-sm font-medium text-neutral-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-neutral-900 mb-2">{value}</p>
      {change && (
        <p className="text-xs text-neutral-500">vs {change.period}</p>
      )}
    </div>
  </motion.div>
)

// Payment method card
const PaymentMethodCard: React.FC<{
  method: {
    id: string
    type: 'card' | 'paypal' | 'bank_transfer'
    last4?: string
    brand?: string
    isDefault: boolean
    expiryMonth?: number
    expiryYear?: number
  }
  delay?: number
}> = ({ method, delay = 0 }) => {
  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'card': return <CreditCard className="w-5 h-5" />
      case 'paypal': return <Wallet className="w-5 h-5" />
      case 'bank_transfer': return <Receipt className="w-5 h-5" />
      default: return <CreditCard className="w-5 h-5" />
    }
  }

  const getMethodLabel = (type: string) => {
    switch (type) {
      case 'card': return `${method.brand?.toUpperCase()} •••• ${method.last4}`
      case 'paypal': return 'PayPal'
      case 'bank_transfer': return 'Transferencia Bancaria'
      default: return 'Método de Pago'
    }
  }

  return (
    <motion.div
      variants={fadeInUp}
      transition={{ delay }}
      className="bg-white rounded-xl p-4 border border-neutral-200 hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            {getMethodIcon(method.type)}
          </div>
          <div>
            <p className="font-medium text-neutral-900">{getMethodLabel(method.type)}</p>
            {method.type === 'card' && method.expiryMonth && method.expiryYear && (
              <p className="text-sm text-neutral-500">
                Expira {String(method.expiryMonth).padStart(2, '0')}/{method.expiryYear}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {method.isDefault && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
              Principal
            </span>
          )}
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// Payment history row
const PaymentRow: React.FC<{ payment: Payment; delay?: number }> = ({ payment, delay = 0 }) => {
  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card': return <CreditCard className="w-4 h-4" />
      case 'paypal': return <Wallet className="w-4 h-4" />
      case 'bank_transfer': return <Receipt className="w-4 h-4" />
      default: return <CreditCard className="w-4 h-4" />
    }
  }

  return (
    <motion.div
      variants={slideInLeft}
      transition={{ delay }}
      className="bg-white rounded-lg p-4 border border-neutral-200 hover:shadow-md transition-all duration-300 group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            {getMethodIcon(payment.method)}
          </div>
          <div>
            <h4 className="font-medium text-neutral-900">{payment.description}</h4>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <span>#{payment.id}</span>
              <span>•</span>
              <span>{payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('es-ES') : 'Pendiente'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-bold text-neutral-900">
              {payment.amount.toLocaleString('es-ES', {
                style: 'currency',
                currency: payment.currency
              })}
            </p>
            <PaymentStatusBadge status={payment.status} />
          </div>

          <div className="flex items-center gap-1">
            {payment.invoice && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <InvoiceDownloader invoice={payment.invoice} size="sm" variant="ghost" />
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              title="Ver detalles del pago"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Main component
export default function PaymentsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentsData, setPaymentsData] = useState<{
    payments: Payment[]
    analytics: {
      totalSpent: number
      totalPayments: number
      averagePayment: number
      nextPayment: Date
      subscription: {
        isActive: boolean
        plan: string
        nextPayment: Date
      }
    }
    paymentMethods: Array<{
      id: string
      type: 'card' | 'paypal' | 'bank_transfer'
      last4?: string
      brand?: string
      isDefault: boolean
      expiryMonth?: number
      expiryYear?: number
    }>
  } | null>(null)

  useEffect(() => {
    const loadPaymentsData = async () => {
      // Simulate API loading
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Mock payment data
      const mockPayments: Payment[] = [
        {
          id: 'PAY-001',
          orderId: 'ORD-2024-001',
          userId: session?.user?.id || '',
          amount: 1890,
          currency: 'EUR',
          status: 'completed',
          method: 'card',
          stripePaymentId: 'pi_1234567890',
          description: 'Desarrollo web completo - Plan Premium',
          paidAt: new Date('2024-10-01'),
          invoice: {
            id: 'INV-001',
            number: 'FAC-2024-001',
            paymentId: 'PAY-001',
            amount: 1890,
            tax: 315,
            subtotal: 1575,
            currency: 'EUR',
            status: 'paid',
            issuedAt: new Date('2024-10-01'),
            dueAt: new Date('2024-10-15'),
            paidAt: new Date('2024-10-01'),
            items: [
              {
                id: '1',
                description: 'Desarrollo web personalizado',
                quantity: 1,
                unitPrice: 1575,
                total: 1575,
                category: 'development'
              }
            ],
            downloadUrl: '/invoices/INV-001.pdf'
          }
        },
        {
          id: 'PAY-002',
          orderId: 'ORD-2024-001',
          userId: session?.user?.id || '',
          amount: 49,
          currency: 'EUR',
          status: 'completed',
          method: 'card',
          stripePaymentId: 'pi_1234567891',
          description: 'Hosting y mantenimiento mensual',
          paidAt: new Date('2024-11-01'),
          invoice: {
            id: 'INV-002',
            number: 'FAC-2024-002',
            paymentId: 'PAY-002',
            amount: 49,
            tax: 8.17,
            subtotal: 40.83,
            currency: 'EUR',
            status: 'paid',
            issuedAt: new Date('2024-11-01'),
            dueAt: new Date('2024-11-05'),
            paidAt: new Date('2024-11-01'),
            items: [
              {
                id: '2',
                description: 'Hosting Premium + SSL',
                quantity: 1,
                unitPrice: 25,
                total: 25,
                category: 'hosting'
              },
              {
                id: '3',
                description: 'Mantenimiento técnico',
                quantity: 1,
                unitPrice: 15.83,
                total: 15.83,
                category: 'maintenance'
              }
            ],
            downloadUrl: '/invoices/INV-002.pdf'
          }
        },
        {
          id: 'PAY-003',
          orderId: 'ORD-2024-002',
          userId: session?.user?.id || '',
          amount: 299,
          currency: 'EUR',
          status: 'processing',
          method: 'card',
          stripePaymentId: 'pi_1234567892',
          description: 'Sistema de reservas - Módulo adicional',
          paidAt: new Date('2024-11-14')
        },
        {
          id: 'PAY-004',
          orderId: 'ORD-2024-001',
          userId: session?.user?.id || '',
          amount: 49,
          currency: 'EUR',
          status: 'pending',
          method: 'card',
          description: 'Hosting y mantenimiento mensual - Diciembre',
          invoice: {
            id: 'INV-004',
            number: 'FAC-2024-004',
            paymentId: 'PAY-004',
            amount: 49,
            tax: 8.17,
            subtotal: 40.83,
            currency: 'EUR',
            status: 'sent',
            issuedAt: new Date('2024-11-15'),
            dueAt: new Date('2024-12-01'),
            items: [
              {
                id: '4',
                description: 'Hosting Premium + SSL',
                quantity: 1,
                unitPrice: 25,
                total: 25,
                category: 'hosting'
              },
              {
                id: '5',
                description: 'Mantenimiento técnico',
                quantity: 1,
                unitPrice: 15.83,
                total: 15.83,
                category: 'maintenance'
              }
            ],
            downloadUrl: '/invoices/INV-004.pdf'
          }
        }
      ]

      const mockData = {
        payments: mockPayments,
        analytics: {
          totalSpent: mockPayments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + p.amount, 0),
          totalPayments: mockPayments.filter(p => p.status === 'completed').length,
          averagePayment: mockPayments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + p.amount, 0) / mockPayments.filter(p => p.status === 'completed').length,
          nextPayment: new Date('2024-12-01'),
          subscription: {
            isActive: true,
            plan: 'Premium',
            nextPayment: new Date('2024-12-01')
          }
        },
        paymentMethods: [
          {
            id: 'pm_1',
            type: 'card' as const,
            last4: '4242',
            brand: 'visa',
            isDefault: true,
            expiryMonth: 12,
            expiryYear: 2027
          },
          {
            id: 'pm_2',
            type: 'paypal' as const,
            isDefault: false
          }
        ]
      }

      setPaymentsData(mockData)
      setLoading(false)
    }

    if (session) {
      loadPaymentsData()
    }
  }, [session])

  const filteredPayments = paymentsData?.payments.filter(payment => {
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus
    const matchesSearch = payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  }) || []

  if (loading) {
    return (
      <div className="space-y-8">
        <LoadingSkeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <LoadingSkeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <LoadingSkeleton className="h-96 w-full" />
          <LoadingSkeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!paymentsData) return null

  const { analytics, paymentMethods } = paymentsData

  return (
    <motion.div
      variants={staggerChildren}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      {/* Page Header */}
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Pagos y Facturación</h1>
          <p className="text-neutral-600">Gestiona tus pagos, facturas y métodos de pago</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Añadir método de pago
        </Button>
      </motion.div>

      {/* Subscription Status */}
      <SubscriptionStatus
        isActive={analytics.subscription.isActive}
        nextPayment={analytics.subscription.nextPayment}
        plan={analytics.subscription.plan}
      />

      {/* Analytics Cards */}
      <motion.div
        variants={staggerChildren}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <PaymentAnalyticsCard
          title="Total Gastado"
          value={`€${analytics.totalSpent.toLocaleString()}`}
          icon={<DollarSign />}
          change={{ value: 12, period: 'mes anterior' }}
          color="var(--accent-primary)"
          delay={0}
        />
        <PaymentAnalyticsCard
          title="Pagos Realizados"
          value={analytics.totalPayments}
          icon={<Receipt />}
          color="#10B981"
          delay={0.1}
        />
        <PaymentAnalyticsCard
          title="Pago Promedio"
          value={`€${Math.round(analytics.averagePayment)}`}
          icon={<BarChart3 />}
          change={{ value: -5, period: 'mes anterior' }}
          color="#8B5CF6"
          delay={0.2}
        />
        <PaymentAnalyticsCard
          title="Próximo Pago"
          value={new Date(analytics.nextPayment).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short'
          })}
          icon={<Calendar />}
          color="#F59E0B"
          delay={0.3}
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment History - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-xl p-6 border border-neutral-200"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            {/* Header with filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-1">Historial de Pagos</h2>
                <p className="text-sm text-neutral-600">Todos tus pagos y facturas</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar pagos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos</option>
                  <option value="completed">Completados</option>
                  <option value="pending">Pendientes</option>
                  <option value="processing">Procesando</option>
                  <option value="failed">Fallidos</option>
                </select>
              </div>
            </div>

            {/* Payment List */}
            <div className="space-y-3">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment, index) => (
                  <PaymentRow key={payment.id} payment={payment} delay={index * 0.05} />
                ))
              ) : (
                <motion.div
                  variants={fadeInUp}
                  className="text-center py-12"
                >
                  <Receipt className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">
                    No se encontraron pagos
                  </h3>
                  <p className="text-neutral-600">
                    {searchTerm || filterStatus !== 'all'
                      ? 'Intenta cambiar los filtros de búsqueda'
                      : 'Aún no tienes pagos registrados'
                    }
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Payment Methods Sidebar */}
        <div className="space-y-6">
          {/* Payment Methods */}
          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-xl p-6 border border-neutral-200"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Métodos de Pago</h2>
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {paymentMethods.map((method, index) => (
                <PaymentMethodCard key={method.id} method={method} delay={index * 0.1} />
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-200">
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Añadir método
              </Button>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-xl p-6 border border-neutral-200"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Acciones Rápidas</h2>

            <div className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Descargar todas las facturas
              </Button>

              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Resumen fiscal anual
              </Button>

              <Button variant="outline" size="sm" className="w-full justify-start">
                <PiggyBank className="w-4 h-4 mr-2" />
                Configurar autopago
              </Button>

              <Button variant="outline" size="sm" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Configurar límites
              </Button>
            </div>
          </motion.div>

          {/* Payment Tips */}
          <motion.div
            variants={fadeInUp}
            className="relative overflow-hidden rounded-xl p-6"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white transform translate-x-6 -translate-y-6" />
            </div>

            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-white" />
              </div>

              <h3 className="text-lg font-bold text-white mb-2">Consejos de Pago</h3>
              <p className="text-white text-opacity-90 text-sm mb-4">
                Configura el autopago para no perderte nunca un pago mensual
              </p>

              <Button variant="outline" size="sm" className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30">
                Configurar ahora
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}