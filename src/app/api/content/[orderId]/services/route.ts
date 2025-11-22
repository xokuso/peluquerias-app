import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  duration: z.number().min(0).optional(),
  category: z.enum([
    'CUTS', 'COLOR', 'TREATMENTS', 'STYLING', 'PERMS',
    'EXTENSIONS', 'NAILS', 'EYEBROWS', 'FACIAL', 'MASSAGE', 'OTHER'
  ]),
  priceFrom: z.number().min(0).optional(),
  priceTo: z.number().min(0).optional(),
  priceType: z.enum(['FIXED', 'FROM', 'RANGE', 'CONSULTATION']).default('FIXED'),
  requirements: z.string().optional(),
  aftercare: z.string().optional(),
  suitableFor: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
})

const reorderSchema = z.object({
  serviceIds: z.array(z.string())
})

// Get all services for an order
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
            services: {
              orderBy: { sortOrder: 'asc' }
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

    return NextResponse.json({
      success: true,
      services: order.businessContent?.services || []
    })

  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

// Create a new service
export async function POST(
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
    const validatedData = serviceSchema.parse(body)

    // Verify user has access to this order and get business content
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
    }

    // Get the highest sort order for new service
    const lastService = await prisma.service.findFirst({
      where: { businessContentId },
      orderBy: { sortOrder: 'desc' }
    })

    const service = await prisma.service.create({
      data: {
        businessContentId,
        name: validatedData.name,
        description: validatedData.description ?? null,
        price: validatedData.price ?? null,
        duration: validatedData.duration ?? null,
        category: validatedData.category,
        priceFrom: validatedData.priceFrom ?? null,
        priceTo: validatedData.priceTo ?? null,
        priceType: validatedData.priceType,
        requirements: validatedData.requirements ?? null,
        aftercare: validatedData.aftercare ?? null,
        suitableFor: validatedData.suitableFor || [],
        isActive: validatedData.isActive,
        sortOrder: validatedData.sortOrder || (lastService?.sortOrder || 0) + 1,
      }
    })

    return NextResponse.json({
      success: true,
      service
    })

  } catch (error) {
    console.error('Error creating service:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}

// Reorder services
export async function PATCH(
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
    const validatedData = reorderSchema.parse(body)

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

    if (!order?.businessContent) {
      return NextResponse.json(
        { error: 'Order or business content not found' },
        { status: 404 }
      )
    }

    // Update sort orders based on the new order
    const updatePromises = validatedData.serviceIds.map((serviceId, index) =>
      prisma.service.update({
        where: {
          id: serviceId,
          businessContentId: order.businessContent!.id
        },
        data: {
          sortOrder: index
        }
      })
    )

    await Promise.all(updatePromises)

    // Fetch updated services
    const services = await prisma.service.findMany({
      where: { businessContentId: order.businessContent.id },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json({
      success: true,
      services
    })

  } catch (error) {
    console.error('Error reordering services:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to reorder services' },
      { status: 500 }
    )
  }
}