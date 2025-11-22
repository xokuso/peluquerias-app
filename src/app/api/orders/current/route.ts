import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!session?.user?.id && !userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const effectiveUserId = userId || session?.user?.id

    if (!effectiveUserId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      )
    }

    // Find the most recent incomplete order for the user
    const order = await prisma.order.findFirst({
      where: {
        userId: effectiveUserId,
        status: {
          in: ['PENDING', 'PROCESSING']
        },
        setupCompleted: false
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        template: true
      }
    })

    if (!order) {
      // Check if user has any completed orders
      const completedOrder = await prisma.order.findFirst({
        where: {
          userId: effectiveUserId,
          status: 'COMPLETED'
        }
      })

      if (completedOrder) {
        return NextResponse.json({
          message: 'No hay órdenes pendientes de configuración',
          hasCompletedOrders: true
        })
      }

      return NextResponse.json({
        message: 'No se encontraron órdenes',
        order: null
      })
    }

    // Return the current order with setup progress
    return NextResponse.json({
      order: {
        id: order.id,
        salonName: order.salonName,
        ownerName: order.ownerName,
        email: order.email,
        phone: order.phone,
        address: order.address,
        domain: order.domain,
        domainExtension: order.domainExtension,
        domainPrice: order.domainPrice,
        domainUserPrice: order.domainUserPrice,
        templateId: order.templateId,
        template: order.template,
        total: order.total,
        status: order.status,
        setupStep: order.setupStep,
        setupCompleted: order.setupCompleted,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    })

  } catch (error) {
    console.error('Error fetching current order:', error)

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}