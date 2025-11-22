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

    // Get user's recent orders with template information
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        template: {
          select: {
            name: true,
            category: true,
            price: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Get last 10 orders
    })

    // Transform orders to match the expected format
    const recentOrders = orders.map(order => ({
      id: order.id,
      orderId: order.id,
      name: order.salonName,
      status: mapOrderStatus(order.status, order.setupStep),
      progress: calculateProgress(order.status, order.setupStep),
      domain: order.domain + (order.domainExtension || '.es'),
      template: order.template?.name || 'Plantilla personalizada',
      startDate: order.createdAt,
      estimatedCompletion: calculateEstimatedCompletion(order.createdAt),
      actualCompletion: order.completedAt,
      lastUpdate: order.updatedAt,
      // Empty arrays for now - these would be populated if we had the relations
      milestones: [],
      files: [],
      timeline: []
    }))

    return NextResponse.json(recentOrders)
  } catch (error) {
    console.error('Error fetching recent orders:', error)
    return NextResponse.json(
      { error: 'Error fetching recent orders' },
      { status: 500 }
    )
  }
}

function mapOrderStatus(orderStatus: string, setupStep: string): string {
  if (orderStatus === 'CANCELLED') return 'cancelled'
  if (orderStatus === 'COMPLETED' && setupStep === 'COMPLETED') return 'live'
  if (orderStatus === 'COMPLETED') return 'completed'
  if (orderStatus === 'PROCESSING') {
    switch (setupStep) {
      case 'DOMAIN_SELECTION':
      case 'BUSINESS_INFO':
        return 'planning'
      case 'DESIGN_PREFERENCES':
        return 'design'
      case 'CONTENT_EDITOR':
      case 'PHOTOS_UPLOAD':
        return 'development'
      case 'REVIEW_LAUNCH':
        return 'testing'
      default:
        return 'development'
    }
  }
  return 'planning'
}

function calculateProgress(orderStatus: string, setupStep: string): number {
  if (orderStatus === 'CANCELLED') return 0
  if (orderStatus === 'COMPLETED' && setupStep === 'COMPLETED') return 100
  if (orderStatus === 'COMPLETED') return 90

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

function calculateEstimatedCompletion(startDate: Date): Date {
  // Estimate 30 days from start date
  const estimatedDate = new Date(startDate)
  estimatedDate.setDate(estimatedDate.getDate() + 30)
  return estimatedDate
}