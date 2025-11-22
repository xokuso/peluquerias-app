import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const orderId = params.orderId

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Find the order and verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check authorization - order must belong to authenticated user
    if (!session?.user?.id || order.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { aboutText, services, photoCount } = body

    // Validate input
    if (aboutText !== undefined && typeof aboutText !== 'string') {
      return NextResponse.json(
        { error: 'About text must be a string' },
        { status: 400 }
      )
    }

    if (services !== undefined && !Array.isArray(services)) {
      return NextResponse.json(
        { error: 'Services must be an array' },
        { status: 400 }
      )
    }

    if (photoCount !== undefined && (typeof photoCount !== 'number' || photoCount < 0)) {
      return NextResponse.json(
        { error: 'Photo count must be a non-negative number' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {}

    // Since we don't have content fields in the Order model yet,
    // we'll create a simple JSON field to store this data
    // In a production app, you might want to create a separate ContentSetup model

    const contentData = {
      aboutText: aboutText || '',
      services: services || [],
      photoCount: photoCount || 0,
      updatedAt: new Date().toISOString()
    }

    // For now, we'll just update the setup step to CONTENT_UPLOAD
    // and store a note that content was configured
    updateData.setupStep = 'CONTENT_UPLOAD'

    // You could add a JSON field to store content setup data
    // For now, we'll just track that this step was completed

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData
    })

    // Count photos associated with this order
    const photoCount_actual = await prisma.photo.count({
      where: { orderId: orderId }
    })

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      contentData,
      photoCount: photoCount_actual,
      message: 'Content step completed successfully'
    })

  } catch (error) {
    console.error('Error updating content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}