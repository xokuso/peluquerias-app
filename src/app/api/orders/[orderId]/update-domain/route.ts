import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema
const updateDomainSchema = z.object({
  domain: z.string().min(3),
  domainExtension: z.string(),
  domainPrice: z.number(),
  domainUserPrice: z.number()
})

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateDomainSchema.parse(body)

    // Check if order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: params.orderId,
        userId: session.user.id
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    // Update order with domain information
    const updatedOrder = await prisma.order.update({
      where: { id: params.orderId },
      data: {
        domain: validatedData.domain,
        domainExtension: validatedData.domainExtension,
        domainPrice: validatedData.domainPrice,
        domainUserPrice: validatedData.domainUserPrice,
        setupStep: 'BUSINESS_INFO', // Move to next step
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      order: updatedOrder
    })

  } catch (error) {
    console.error('Error updating domain:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}