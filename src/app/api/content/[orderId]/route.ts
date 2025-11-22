import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Content validation schemas
const businessContentSchema = z.object({
  salonDescription: z.string().optional(),
  aboutOwner: z.string().optional(),
  aboutBusiness: z.string().optional(),
  welcomeMessage: z.string().optional(),
  fullAddress: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).optional(),
})

const serviceSchema = z.object({
  id: z.string().optional(),
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

const businessHoursSchema = z.object({
  id: z.string().optional(),
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  isOpen: z.boolean().default(true),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  hasBreak: z.boolean().default(false),
  breakStartTime: z.string().optional(),
  breakEndTime: z.string().optional(),
  notes: z.string().optional(),
})

const updateContentSchema = z.object({
  businessContent: businessContentSchema.optional(),
  services: z.array(serviceSchema).optional(),
  businessHours: z.array(businessHoursSchema).optional(),
})

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
            },
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

    // If no business content exists, create a default one
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
          services: {
            orderBy: { sortOrder: 'asc' }
          },
          businessHours: {
            orderBy: { dayOfWeek: 'asc' }
          }
        }
      })

      return NextResponse.json({
        success: true,
        content: businessContent
      })
    }

    return NextResponse.json({
      success: true,
      content: order.businessContent
    })

  } catch (error) {
    console.error('Error fetching business content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business content' },
      { status: 500 }
    )
  }
}

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
    const validatedData = updateContentSchema.parse(body)

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

    // Create or update business content
    let businessContent = order.businessContent

    if (!businessContent) {
      const businessContentData = validatedData.businessContent ? {
        salonDescription: validatedData.businessContent.salonDescription ?? null,
        aboutOwner: validatedData.businessContent.aboutOwner ?? null,
        aboutBusiness: validatedData.businessContent.aboutBusiness ?? null,
        welcomeMessage: validatedData.businessContent.welcomeMessage ?? null,
        fullAddress: validatedData.businessContent.fullAddress ?? null,
        city: validatedData.businessContent.city ?? null,
        postalCode: validatedData.businessContent.postalCode ?? null,
        phone: validatedData.businessContent.phone ?? null,
        email: validatedData.businessContent.email ?? null,
        website: validatedData.businessContent.website ?? null,
        facebookUrl: validatedData.businessContent.facebookUrl ?? null,
        instagramUrl: validatedData.businessContent.instagramUrl ?? null,
        twitterUrl: validatedData.businessContent.twitterUrl ?? null,
        youtubeUrl: validatedData.businessContent.youtubeUrl ?? null,
        tiktokUrl: validatedData.businessContent.tiktokUrl ?? null,
        linkedinUrl: validatedData.businessContent.linkedinUrl ?? null,
        specialties: validatedData.businessContent.specialties ?? [],
        certifications: validatedData.businessContent.certifications ?? [],
        languages: validatedData.businessContent.languages ?? [],
        metaTitle: validatedData.businessContent.metaTitle ?? null,
        metaDescription: validatedData.businessContent.metaDescription ?? null,
        keywords: validatedData.businessContent.keywords ?? [],
      } : {}

      businessContent = await prisma.businessContent.create({
        data: {
          orderId: orderId,
          lastEditedBy: session.user.id,
          ...businessContentData,
        }
      })
    } else {
      const businessContentData = validatedData.businessContent ? {
        salonDescription: validatedData.businessContent.salonDescription ?? null,
        aboutOwner: validatedData.businessContent.aboutOwner ?? null,
        aboutBusiness: validatedData.businessContent.aboutBusiness ?? null,
        welcomeMessage: validatedData.businessContent.welcomeMessage ?? null,
        fullAddress: validatedData.businessContent.fullAddress ?? null,
        city: validatedData.businessContent.city ?? null,
        postalCode: validatedData.businessContent.postalCode ?? null,
        phone: validatedData.businessContent.phone ?? null,
        email: validatedData.businessContent.email ?? null,
        website: validatedData.businessContent.website ?? null,
        facebookUrl: validatedData.businessContent.facebookUrl ?? null,
        instagramUrl: validatedData.businessContent.instagramUrl ?? null,
        twitterUrl: validatedData.businessContent.twitterUrl ?? null,
        youtubeUrl: validatedData.businessContent.youtubeUrl ?? null,
        tiktokUrl: validatedData.businessContent.tiktokUrl ?? null,
        linkedinUrl: validatedData.businessContent.linkedinUrl ?? null,
        specialties: validatedData.businessContent.specialties ?? [],
        certifications: validatedData.businessContent.certifications ?? [],
        languages: validatedData.businessContent.languages ?? [],
        metaTitle: validatedData.businessContent.metaTitle ?? null,
        metaDescription: validatedData.businessContent.metaDescription ?? null,
        keywords: validatedData.businessContent.keywords ?? [],
      } : {}

      businessContent = await prisma.businessContent.update({
        where: { id: businessContent.id },
        data: {
          lastEditedBy: session.user.id,
          ...businessContentData,
        }
      })
    }

    // Update services if provided
    if (validatedData.services) {
      // Remove existing services
      await prisma.service.deleteMany({
        where: { businessContentId: businessContent.id }
      })

      // Create new services
      if (validatedData.services.length > 0) {
        await prisma.service.createMany({
          data: validatedData.services.map((service, index) => ({
            businessContentId: businessContent.id,
            name: service.name,
            description: service.description ?? null,
            price: service.price ?? null,
            duration: service.duration ?? null,
            category: service.category,
            priceFrom: service.priceFrom ?? null,
            priceTo: service.priceTo ?? null,
            priceType: service.priceType,
            requirements: service.requirements ?? null,
            aftercare: service.aftercare ?? null,
            suitableFor: service.suitableFor ?? [],
            isActive: service.isActive,
            sortOrder: service.sortOrder ?? index,
          }))
        })
      }
    }

    // Update business hours if provided
    if (validatedData.businessHours) {
      // Remove existing business hours
      await prisma.businessHours.deleteMany({
        where: { businessContentId: businessContent.id }
      })

      // Create new business hours
      if (validatedData.businessHours.length > 0) {
        await prisma.businessHours.createMany({
          data: validatedData.businessHours.map(hours => ({
            businessContentId: businessContent.id,
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
    }

    // Fetch the updated content with all relations
    const updatedContent = await prisma.businessContent.findUnique({
      where: { id: businessContent.id },
      include: {
        services: {
          orderBy: { sortOrder: 'asc' }
        },
        businessHours: {
          orderBy: { dayOfWeek: 'asc' }
        }
      }
    })

    return NextResponse.json({
      success: true,
      content: updatedContent
    })

  } catch (error) {
    console.error('Error updating business content:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update business content' },
      { status: 500 }
    )
  }
}