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

    // Get user with their orders
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        orders: {
          select: {
            id: true,
            status: true,
            total: true,
            createdAt: true,
            setupCompleted: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate statistics from real data
    const totalProjects = user.orders.length
    const activeProjects = user.orders.filter(o =>
      o.status === 'PROCESSING' || (o.status === 'COMPLETED' && !o.setupCompleted)
    ).length
    const completedProjects = user.orders.filter(o =>
      o.status === 'COMPLETED' && o.setupCompleted
    ).length

    // Calculate total spent
    const totalSpent = user.orders
      .filter(o => o.status !== 'CANCELLED')
      .reduce((sum, order) => sum + (order.total || 0), 0)

    // For now, we'll return 0 for tickets and messages until those features are implemented
    const openTickets = 0
    const unreadMessages = 0

    // Get upcoming milestones count (placeholder for now)
    const upcomingMilestones = activeProjects * 2 // Estimate 2 milestones per active project

    // Get recent activity (last 5 order status changes or updates)
    const recentActivity = user.orders
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map(order => ({
        id: order.id,
        title: getActivityTitle(order.status),
        description: getActivityDescription(order),
        type: 'update' as const,
        date: order.createdAt,
        author: 'Sistema'
      }))

    const stats = {
      totalProjects,
      activeProjects,
      completedProjects,
      totalSpent,
      openTickets,
      unreadMessages,
      upcomingMilestones,
      recentActivity
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching client stats:', error)
    return NextResponse.json(
      { error: 'Error fetching statistics' },
      { status: 500 }
    )
  }
}

function getActivityTitle(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Pedido creado'
    case 'PROCESSING':
      return 'Pedido en proceso'
    case 'COMPLETED':
      return 'Pedido completado'
    case 'CANCELLED':
      return 'Pedido cancelado'
    default:
      return 'Actualización de pedido'
  }
}

function getActivityDescription(order: any): string {
  const salonName = order.salonName || 'tu salón'
  switch (order.status) {
    case 'PENDING':
      return `Se ha creado un nuevo pedido para ${salonName}`
    case 'PROCESSING':
      return `El desarrollo de la web de ${salonName} está en progreso`
    case 'COMPLETED':
      return `La web de ${salonName} ha sido completada`
    case 'CANCELLED':
      return `El pedido para ${salonName} ha sido cancelado`
    default:
      return `El pedido de ${salonName} ha sido actualizado`
  }
}