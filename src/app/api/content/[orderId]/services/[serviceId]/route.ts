import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const serviceUpdateSchema = z.object({
  name: z.string().min(1, "Service name is required").optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  duration: z.number().min(0).optional(),
  category: z.enum([
    'CUTS', 'COLOR', 'TREATMENTS', 'STYLING', 'PERMS',
    'EXTENSIONS', 'NAILS', 'EYEBROWS', 'FACIAL', 'MASSAGE', 'OTHER'
  ]).optional(),
  priceFrom: z.number().min(0).optional(),
  priceTo: z.number().min(0).optional(),
  priceType: z.enum(['FIXED', 'FROM', 'RANGE', 'CONSULTATION']).optional(),
  requirements: z.string().optional(),
  aftercare: z.string().optional(),
  suitableFor: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
})

// Get a specific service
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string; serviceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { orderId, serviceId } = params

    // Verify user has access to this order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
        businessContent: {
          include: {
            services: {
              where: { id: serviceId }
            }
          }
        }
      }
    })

    if (!order?.businessContent?.services[0]) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      service: order.businessContent.services[0]
    })

  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    )
  }
}

// Update a specific service
export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string; serviceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { orderId, serviceId } = params
    const body = await request.json()

    // Validate the request body
    const validatedData = serviceUpdateSchema.parse(body)

    // Verify user has access to this order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
        businessContent: {
          include: {
            services: {
              where: { id: serviceId }
            }
          }
        }
      }
    })

    if (!order?.businessContent?.services[0]) {
      return NextResponse.json(
        { error: 'Service not found or access denied' },
        { status: 404 }
      )
    }

    const service = await prisma.service.update({
      where: { id: serviceId },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.price !== undefined && { price: validatedData.price }),
        ...(validatedData.duration !== undefined && { duration: validatedData.duration }),
        ...(validatedData.category !== undefined && { category: validatedData.category }),
        ...(validatedData.priceFrom !== undefined && { priceFrom: validatedData.priceFrom }),
        ...(validatedData.priceTo !== undefined && { priceTo: validatedData.priceTo }),
        ...(validatedData.priceType !== undefined && { priceType: validatedData.priceType }),
        ...(validatedData.requirements !== undefined && { requirements: validatedData.requirements }),
        ...(validatedData.aftercare !== undefined && { aftercare: validatedData.aftercare }),
        ...(validatedData.suitableFor !== undefined && { suitableFor: validatedData.suitableFor }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
        ...(validatedData.sortOrder !== undefined && { sortOrder: validatedData.sortOrder }),
      }
    })

    return NextResponse.json({
      success: true,
      service
    })

  } catch (error) {
    console.error('Error updating service:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    )
  }
}

// Delete a specific service
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string; serviceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { orderId, serviceId } = params

    // Verify user has access to this order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
        businessContent: {
          include: {
            services: {
              where: { id: serviceId }
            }
          }
        }
      }
    })

    if (!order?.businessContent?.services[0]) {
      return NextResponse.json(
        { error: 'Service not found or access denied' },
        { status: 404 }
      )
    }

    await prisma.service.delete({
      where: { id: serviceId }
    })

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    )
  }
}