import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's orders to generate notifications
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5
    })

    // Generate notifications based on order activity
    const notifications = orders.map(order => ({
      id: `notif-${order.id}`,
      userId: session.user.id,
      title: getNotificationTitle(order.status, order.setupStep),
      message: getNotificationMessage(order),
      type: getNotificationType(order.status) as 'project_update' | 'payment' | 'support',
      read: false,
      actionUrl: getActionUrl(order),
      actionText: getActionText(order.status),
      createdAt: order.updatedAt
    }))

    // Add some system notifications if user is new
    if (orders.length === 0) {
      notifications.push({
        id: 'welcome-1',
        userId: session.user.id,
        title: 'Bienvenido a tu panel de cliente',
        message: 'Aquí podrás gestionar todos tus proyectos web y seguir su progreso en tiempo real',
        type: 'project_update',
        read: false,
        actionUrl: '/client/setup',
        actionText: 'Comenzar proyecto',
        createdAt: new Date()
      })
    }

    // Add payment reminder if there are active orders
    const activeOrders = orders.filter(o => o.status === 'PROCESSING')
    if (activeOrders.length > 0) {
      notifications.push({
        id: 'payment-reminder',
        userId: session.user.id,
        title: 'Próximo pago mensual',
        message: 'Tu próximo pago de hosting y mantenimiento se procesará el 1 del próximo mes',
        type: 'payment',
        read: false,
        actionUrl: '/client/payments',
        actionText: 'Ver detalles',
        createdAt: new Date()
      })
    }

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Error fetching notifications' },
      { status: 500 }
    )
  }
}

function getNotificationTitle(status: string, setupStep: string): string {
  if (status === 'COMPLETED' && setupStep === 'COMPLETED') {
    return 'Tu web está lista'
  }
  if (status === 'PROCESSING') {
    return 'Proyecto actualizado'
  }
  if (status === 'PENDING') {
    return 'Nuevo proyecto creado'
  }
  return 'Actualización de estado'
}

function getNotificationMessage(order: any): string {
  const progress = calculateProgress(order.status, order.setupStep)

  if (order.status === 'COMPLETED' && order.setupStep === 'COMPLETED') {
    return `¡Tu web ${order.salonName} está completamente lista y funcionando!`
  }
  if (order.status === 'PROCESSING') {
    return `Tu proyecto ${order.salonName} ha avanzado al ${progress}%. ${getStepMessage(order.setupStep)}`
  }
  if (order.status === 'PENDING') {
    return `Hemos recibido tu pedido para ${order.salonName}. Pronto comenzaremos a trabajar en él.`
  }
  return `El estado de tu proyecto ${order.salonName} ha sido actualizado`
}

function getNotificationType(status: string): string {
  if (status === 'PENDING') return 'payment'
  return 'project_update'
}

function getActionUrl(order: any): string {
  if (order.setupCompleted) {
    return `/client/projects/${order.id}`
  }
  return '/client/setup'
}

function getActionText(status: string): string {
  if (status === 'COMPLETED') return 'Ver web'
  if (status === 'PROCESSING') return 'Ver progreso'
  return 'Ver detalles'
}

function calculateProgress(orderStatus: string, setupStep: string): number {
  if (orderStatus === 'CANCELLED') return 0
  if (orderStatus === 'COMPLETED' && setupStep === 'COMPLETED') return 100

  const stepProgress: { [key: string]: number } = {
    'DOMAIN_SELECTION': 15,
    'BUSINESS_INFO': 30,
    'DESIGN_PREFERENCES': 45,
    'CONTENT_EDITOR': 60,
    'PHOTOS_UPLOAD': 75,
    'REVIEW_LAUNCH': 90,
    'COMPLETED': 100
  }

  return stepProgress[setupStep] || 0
}

function getStepMessage(setupStep: string): string {
  switch (setupStep) {
    case 'DOMAIN_SELECTION':
      return 'Estamos configurando tu dominio'
    case 'BUSINESS_INFO':
      return 'Procesando la información de tu negocio'
    case 'DESIGN_PREFERENCES':
      return 'Trabajando en el diseño personalizado'
    case 'CONTENT_EDITOR':
      return 'Añadiendo tu contenido a la web'
    case 'PHOTOS_UPLOAD':
      return 'Optimizando tus imágenes'
    case 'REVIEW_LAUNCH':
      return 'Realizando pruebas finales'
    case 'COMPLETED':
      return 'Tu web está lista'
    default:
      return 'Trabajando en tu proyecto'
  }
}