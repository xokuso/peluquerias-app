import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const businessHoursSchema = z.object({
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  isOpen: z.boolean().default(true),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  hasBreak: z.boolean().default(false),
  breakStartTime: z.string().optional(),
  breakEndTime: z.string().optional(),
  notes: z.string().optional(),
})

const updateHoursSchema = z.object({
  businessHours: z.array(businessHoursSchema)
})

// Get business hours for an order
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { orderId } = params

    // Verify user has access to this order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
        businessContent: {
          include: {
            businessHours: {
              orderBy: { dayOfWeek: 'asc' }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or access denied' },
        { status: 404 }
      )
    }

    // If no business content or hours exist, create default hours
    if (!order.businessContent) {
      const businessContent = await prisma.businessContent.create({
        data: {
          orderId: orderId,
          businessHours: {
            create: [
              { dayOfWeek: 'MONDAY', isOpen: true, openTime: '09:00', closeTime: '18:00' },
              { dayOfWeek: 'TUESDAY', isOpen: true, openTime: '09:00', closeTime: '18:00' },
              { dayOfWeek: 'WEDNESDAY', isOpen: true, openTime: '09:00', closeTime: '18:00' },
              { dayOfWeek: 'THURSDAY', isOpen: true, openTime: '09:00', closeTime: '18:00' },
              { dayOfWeek: 'FRIDAY', isOpen: true, openTime: '09:00', closeTime: '18:00' },
              { dayOfWeek: 'SATURDAY', isOpen: true, openTime: '09:00', closeTime: '16:00' },
              { dayOfWeek: 'SUNDAY', isOpen: false },
            ]
          }
        },
        include: {
          businessHours: {
            orderBy: { dayOfWeek: 'asc' }
          }
        }
      })

      return NextResponse.json({
        success: true,
        businessHours: businessContent.businessHours
      })
    }

    // If business content exists but no hours, create default
    if (order.businessContent.businessHours.length === 0) {
      await prisma.businessHours.createMany({
        data: [
          { businessContentId: order.businessContent.id, dayOfWeek: 'MONDAY', isOpen: true, openTime: '09:00', closeTime: '18:00' },
          { businessContentId: order.businessContent.id, dayOfWeek: 'TUESDAY', isOpen: true, openTime: '09:00', closeTime: '18:00' },
          { businessContentId: order.businessContent.id, dayOfWeek: 'WEDNESDAY', isOpen: true, openTime: '09:00', closeTime: '18:00' },
          { businessContentId: order.businessContent.id, dayOfWeek: 'THURSDAY', isOpen: true, openTime: '09:00', closeTime: '18:00' },
          { businessContentId: order.businessContent.id, dayOfWeek: 'FRIDAY', isOpen: true, openTime: '09:00', closeTime: '18:00' },
          { businessContentId: order.businessContent.id, dayOfWeek: 'SATURDAY', isOpen: true, openTime: '09:00', closeTime: '16:00' },
          { businessContentId: order.businessContent.id, dayOfWeek: 'SUNDAY', isOpen: false },
        ]
      })

      const businessHours = await prisma.businessHours.findMany({
        where: { businessContentId: order.businessContent.id },
        orderBy: { dayOfWeek: 'asc' }
      })

      return NextResponse.json({
        success: true,
        businessHours
      })
    }

    return NextResponse.json({
      success: true,
      businessHours: order.businessContent.businessHours
    })

  } catch (error) {
    console.error('Error fetching business hours:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business hours' },
      { status: 500 }
    )
  }
}

// Update business hours
export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { orderId } = params
    const body = await request.json()

    // Validate the request body
    const validatedData = updateHoursSchema.parse(body)

    // Verify user has access to this order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
        businessContent: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or access denied' },
        { status: 404 }
      )
    }

    // Ensure business content exists
    let businessContentId = order.businessContent?.id
    if (!businessContentId) {
      const businessContent = await prisma.businessContent.create({
        data: {
          orderId: orderId,
          lastEditedBy: session.user.id,
        }
      })
      businessContentId = businessContent.id
    } else {
      // Update last edited info
      await prisma.businessContent.update({
        where: { id: businessContentId },
        data: { lastEditedBy: session.user.id }
      })
    }

    // Remove existing business hours
    await prisma.businessHours.deleteMany({
      where: { businessContentId }
    })

    // Create new business hours
    if (validatedData.businessHours.length > 0) {
      await prisma.businessHours.createMany({
        data: validatedData.businessHours.map(hours => ({
          businessContentId,
          dayOfWeek: hours.dayOfWeek,
          isOpen: hours.isOpen,
          openTime: hours.openTime ?? null,
          closeTime: hours.closeTime ?? null,
          hasBreak: hours.hasBreak,
          breakStartTime: hours.breakStartTime ?? null,
          breakEndTime: hours.breakEndTime ?? null,
          notes: hours.notes ?? null,
        }))
      })
    }

    // Fetch the updated hours
    const businessHours = await prisma.businessHours.findMany({
      where: { businessContentId },
      orderBy: { dayOfWeek: 'asc' }
    })

    return NextResponse.json({
      success: true,
      businessHours
    })

  } catch (error) {
    console.error('Error updating business hours:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update business hours' },
      { status: 500 }
    )
  }
}