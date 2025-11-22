'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { Session } from 'next-auth'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  MessageSquare,
  FileText,
  Download,
  ExternalLink,
  DollarSign,
  Eye,
  Bell,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Activity,
  CreditCard,
  Globe,
  Settings,
  CircleDot
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type {
  DashboardStats,
  Project,
  SupportTicket,
  Payment,
  ClientNotification
} from '@/types'

// Animation variants for smooth interactions
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

// Loading skeleton component
const LoadingSkeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-neutral-200 to-neutral-300 rounded-lg ${className}`} />
)

// Welcome section component with enhanced design
interface WelcomeSectionProps {
  session: Session | null;
  stats: DashboardStats;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ session, stats }) => (
  <motion.div
    variants={fadeInUp}
    className="relative overflow-hidden rounded-2xl p-8 lg:p-12"
    style={{
      background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-primary-dark) 100%)',
      boxShadow: 'var(--shadow-2xl)'
    }}
  >
    {/* Animated background elements */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white transform translate-x-32 -translate-y-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white transform -translate-x-16 translate-y-16" />
    </div>

    <div className="relative flex items-center justify-between">
      <div className="flex-1">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 mb-4"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              ¡Hola, {session?.user?.name || 'Cliente'}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Bienvenido al panel de {session?.user?.salonName || 'tu negocio'}
            </p>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="text-blue-100 text-lg mb-6 max-w-2xl"
        >
          Aquí puedes seguir el progreso de tu web, gestionar tus proyectos y estar al día con todas las novedades.
        </motion.p>

        {/* Quick stats in welcome section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-6"
        >
          <div className="flex items-center gap-2 text-white">
            <Activity className="w-5 h-5" />
            <span className="font-semibold">{stats.activeProjects}</span>
            <span className="text-blue-100">Proyectos activos</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">{stats.completedProjects}</span>
            <span className="text-blue-100">Completados</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <MessageSquare className="w-5 h-5" />
            <span className="font-semibold">{stats.unreadMessages}</span>
            <span className="text-blue-100">Mensajes nuevos</span>
          </div>
        </motion.div>
      </div>

      {/* Decorative chart icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="hidden lg:block"
      >
        <div
          className="w-24 h-24 rounded-2xl flex items-center justify-center backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
        >
          <BarChart3 className="w-12 h-12 text-white" />
        </div>
      </motion.div>
    </div>
  </motion.div>
)

// Enhanced stats card component
const StatsCard: React.FC<{
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: { value: number; direction: 'up' | 'down' }
  color: string
  delay?: number
}> = ({ title, value, icon, trend, color, delay = 0 }) => (
  <motion.div
    variants={fadeInUp}
    transition={{ delay }}
    className="bg-white rounded-xl p-6 border border-neutral-200 hover:shadow-lg transition-all duration-300"
    style={{ boxShadow: 'var(--shadow-sm)' }}
  >
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-sm font-medium text-neutral-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-neutral-900">{value}</p>
      </div>
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        {React.cloneElement(icon as React.ReactElement, {
          className: 'w-6 h-6',
          style: { color }
        })}
      </div>
    </div>

    {trend && (
      <div className="flex items-center gap-2 text-sm">
        <TrendingUp
          className={`w-4 h-4 ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'} ${trend.direction === 'down' ? 'rotate-180' : ''}`}
        />
        <span className={trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}>
          {trend.value}%
        </span>
        <span className="text-neutral-500">vs mes anterior</span>
      </div>
    )}
  </motion.div>
)

// Project card with enhanced design
const ProjectCard: React.FC<{ project: Project; delay?: number }> = ({ project, delay = 0 }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return { bg: '#EBF5FF', text: '#1E40AF', border: '#3B82F6' }
      case 'design': return { bg: '#F3E8FF', text: '#7C3AED', border: '#8B5CF6' }
      case 'development': return { bg: '#FEF3C7', text: '#D97706', border: '#F59E0B' }
      case 'testing': return { bg: '#FDE68A', text: '#92400E', border: '#F59E0B' }
      case 'completed': return { bg: '#D1FAE5', text: '#065F46', border: '#10B981' }
      case 'live': return { bg: '#D1FAE5', text: '#065F46', border: '#10B981' }
      default: return { bg: '#F3F4F6', text: '#374151', border: '#9CA3AF' }
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning': return 'Planificación'
      case 'design': return 'Diseño'
      case 'development': return 'Desarrollo'
      case 'testing': return 'Pruebas'
      case 'completed': return 'Completado'
      case 'live': return 'En línea'
      default: return 'Desconocido'
    }
  }

  const statusColor = getStatusColor(project.status)

  return (
    <motion.div
      variants={fadeInUp}
      transition={{ delay }}
      className="bg-white rounded-xl p-6 border border-neutral-200 hover:shadow-lg transition-all duration-300 group"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-900 mb-1">{project.name}</h3>
          <p className="text-sm text-neutral-600 mb-2">{project.template}</p>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-neutral-400" />
            <span className="text-sm text-neutral-600">{project.domain}</span>
          </div>
        </div>
        <div
          className="px-3 py-1 rounded-full text-xs font-medium border"
          style={{
            backgroundColor: statusColor.bg,
            color: statusColor.text,
            borderColor: statusColor.border + '40'
          }}
        >
          {getStatusText(project.status)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-neutral-600 mb-2">
          <span>Progreso</span>
          <span>{project.progress}%</span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${project.progress}%` }}
            transition={{ duration: 1, delay: delay + 0.5 }}
          />
        </div>
      </div>

      {/* Meta information */}
      <div className="flex items-center justify-between text-sm text-neutral-500 mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>Actualizado: {new Date(project.lastUpdate).toLocaleDateString('es-ES')}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Link href={`/client/projects/${project.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full group-hover:border-blue-500 group-hover:text-blue-600">
            <Eye className="w-4 h-4 mr-2" />
            Ver detalles
          </Button>
        </Link>
        {project.status === 'live' && (
          <Button variant="default" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver web
          </Button>
        )}
      </div>
    </motion.div>
  )
}

// Notification component
const NotificationCard: React.FC<{ notification: ClientNotification; delay?: number }> = ({
  notification,
  delay = 0
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project_update': return <Activity className="w-5 h-5 text-blue-600" />
      case 'support': return <MessageSquare className="w-5 h-5 text-purple-600" />
      case 'payment': return <CreditCard className="w-5 h-5 text-green-600" />
      default: return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <motion.div
      variants={fadeInUp}
      transition={{ delay }}
      className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400 hover:bg-blue-100 transition-colors duration-200"
    >
      <div className="flex-shrink-0 mt-0.5">
        {getTypeIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-neutral-900 text-sm mb-1">{notification.title}</p>
        <p className="text-neutral-700 text-sm mb-2">{notification.message}</p>
        <div className="flex items-center justify-between">
          <span className="text-neutral-500 text-xs">
            {new Date(notification.createdAt).toLocaleDateString('es-ES')}
          </span>
          {notification.actionUrl && (
            <Link href={notification.actionUrl}>
              <Button variant="outline" size="sm" className="text-xs">
                {notification.actionText || 'Ver más'}
              </Button>
            </Link>
          )}
        </div>
      </div>
      {!notification.read && (
        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
      )}
    </motion.div>
  )
}

// Quick action card
const QuickActionCard: React.FC<{
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: string
  delay?: number
}> = ({ title, description, icon, href, color, delay = 0 }) => (
  <motion.div variants={fadeInUp} transition={{ delay }}>
    <Link href={href} className="group block">
      <div className="bg-white rounded-xl p-6 border border-neutral-200 hover:shadow-xl hover:border-neutral-300 transition-all duration-300 h-full">
        <div
          className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
          style={{ backgroundColor: `${color}20` }}
        >
          {React.cloneElement(icon as React.ReactElement, {
            className: 'w-6 h-6',
            style: { color }
          })}
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
          {title}
        </h3>
        <p className="text-neutral-600 text-sm leading-relaxed">
          {description}
        </p>
        <div className="flex items-center gap-2 mt-4 text-blue-600 text-sm font-medium">
          <span>Ir a {title}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </div>
    </Link>
  </motion.div>
)

export default function ClientDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<{
    stats: DashboardStats
    activeProjects: Project[]
    recentTickets: SupportTicket[]
    recentPayments: Payment[]
    notifications: ClientNotification[]
  } | null>(null)

  // Ensure only CLIENT role can access this page
  useEffect(() => {
    if (session && session.user?.role !== 'CLIENT') {
      // Redirect non-clients away from client dashboard
      if (session.user?.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/unauthorized')
      }
    }
  }, [session])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Fetch real data from API endpoints
        const [statsRes, projectsRes, notificationsRes] = await Promise.all([
          fetch('/api/client/stats'),
          fetch('/api/client/recent-orders'),
          fetch('/api/client/notifications')
        ])

        if (!statsRes.ok || !projectsRes.ok || !notificationsRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const stats = await statsRes.json()
        const activeProjects = await projectsRes.json()
        const notifications = await notificationsRes.json()

        // Transform API response to match component expectations
        const dashboardData = {
          stats: {
            ...stats,
            recentActivity: stats.recentActivity.map((activity: any) => ({
              ...activity,
              date: new Date(activity.date)
            }))
          },
          activeProjects: activeProjects
            .filter((p: any) => p.status !== 'completed' && p.status !== 'cancelled')
            .slice(0, 2)
            .map((project: any) => ({
              ...project,
              startDate: new Date(project.startDate),
              estimatedCompletion: new Date(project.estimatedCompletion),
              lastUpdate: new Date(project.lastUpdate),
              actualCompletion: project.actualCompletion ? new Date(project.actualCompletion) : null
            })),
          recentTickets: [], // Support tickets will be implemented later
          recentPayments: [], // Payment history is available in the payments page
          notifications: notifications.map((notif: any) => ({
            ...notif,
            createdAt: new Date(notif.createdAt)
          }))
        }

        setDashboardData(dashboardData)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        // Set empty data on error
        setDashboardData({
          stats: {
            totalProjects: 0,
            activeProjects: 0,
            completedProjects: 0,
            totalSpent: 0,
            openTickets: 0,
            unreadMessages: 0,
            upcomingMilestones: 0,
            recentActivity: []
          },
          activeProjects: [],
          recentTickets: [],
          recentPayments: [],
          notifications: []
        })
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      loadDashboardData()
    } else {
      setLoading(false)
    }
  }, [session])

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Loading skeleton */}
        <LoadingSkeleton className="h-48 w-full" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <LoadingSkeleton key={i} className="h-32 w-full" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <LoadingSkeleton className="h-96 w-full" />
          <LoadingSkeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!dashboardData) return null

  const { stats, activeProjects, notifications } = dashboardData
  const unreadNotifications = notifications.filter(n => !n.read)

  return (
    <motion.div
      variants={staggerChildren}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      {/* Enhanced Welcome Section */}
      <WelcomeSection session={session} stats={stats} />

      {/* Enhanced Stats Grid */}
      <motion.div
        variants={staggerChildren}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatsCard
          title="Proyectos Activos"
          value={stats.activeProjects}
          icon={<FileText />}
          trend={{ value: 12, direction: 'up' }}
          color="var(--accent-primary)"
          delay={0}
        />
        <StatsCard
          title="Tickets Abiertos"
          value={stats.openTickets}
          icon={<MessageSquare />}
          color="#F59E0B"
          delay={0.1}
        />
        <StatsCard
          title="Inversión Total"
          value={`€${stats.totalSpent.toLocaleString()}`}
          icon={<DollarSign />}
          trend={{ value: 8, direction: 'up' }}
          color="#10B981"
          delay={0.2}
        />
        <StatsCard
          title="Mensajes Nuevos"
          value={stats.unreadMessages}
          icon={<Bell />}
          color="#8B5CF6"
          delay={0.3}
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Projects Section - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-xl p-6 border border-neutral-200"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-1">Mis Proyectos</h2>
                <p className="text-sm text-neutral-600">Seguimiento en tiempo real del progreso</p>
              </div>
              <Link href="/client/projects">
                <Button variant="outline" size="sm" className="group">
                  Ver todos
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {activeProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} delay={index * 0.1} />
              ))}

              {activeProjects.length === 0 && (
                <motion.div
                  variants={fadeInUp}
                  className="text-center py-12"
                >
                  <FileText className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">
                    No tienes proyectos activos
                  </h3>
                  <p className="text-neutral-600 mb-6">
                    Comienza tu primer proyecto con nosotros
                  </p>
                  <Link href="/client/setup">
                    <Button variant="salon">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Crear nuevo proyecto
                    </Button>
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Notifications & Activity Sidebar */}
        <div className="space-y-6">
          {/* Notifications */}
          {unreadNotifications.length > 0 && (
            <motion.div
              variants={fadeInUp}
              className="bg-white rounded-xl p-6 border border-neutral-200"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-900">Notificaciones</h2>
                <div className="flex items-center gap-2">
                  <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
                    {unreadNotifications.length} nuevas
                  </span>
                  <Link href="/client/support">
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                {unreadNotifications.slice(0, 3).map((notification, index) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    delay={index * 0.1}
                  />
                ))}
              </div>

              {unreadNotifications.length > 3 && (
                <div className="mt-4 pt-4 border-t border-neutral-200">
                  <Link href="/client/support">
                    <Button variant="outline" size="sm" className="w-full">
                      Ver todas las notificaciones
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {/* Recent Activity */}
          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-xl p-6 border border-neutral-200"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Actividad Reciente</h2>

            <div className="space-y-4">
              {stats.recentActivity.slice(0, 5).map((activity, index) => (
                <motion.div
                  key={activity.id}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-3"
                >
                  <div className="flex-shrink-0 mt-1">
                    <CircleDot className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-900">{activity.title}</p>
                    <p className="text-xs text-neutral-600 mt-1">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                      <span>{new Date(activity.date).toLocaleDateString('es-ES')}</span>
                      {activity.author && (
                        <>
                          <span>•</span>
                          <span>{activity.author}</span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div
        variants={staggerChildren}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <QuickActionCard
          title="Crear Ticket"
          description="¿Tienes alguna duda o necesitas soporte? Crea un ticket y nuestro equipo te ayudará en menos de 24 horas."
          icon={<MessageSquare />}
          href="/client/support"
          color="#3B82F6"
          delay={0}
        />
        <QuickActionCard
          title="Ver Pagos"
          description="Consulta tu historial de pagos, facturas pendientes y gestiona tus métodos de pago de forma segura."
          icon={<CreditCard />}
          href="/client/payments"
          color="#10B981"
          delay={0.1}
        />
        <QuickActionCard
          title="Descargas"
          description="Accede a todos los archivos, logos, documentos y recursos de tu proyecto cuando los necesites."
          icon={<Download />}
          href="/client/downloads"
          color="#8B5CF6"
          delay={0.2}
        />
      </motion.div>
    </motion.div>
  )
}