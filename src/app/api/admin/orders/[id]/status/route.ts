import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED'])
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = updateStatusSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.flatten()
        },
        { status: 400 }
      );
    }

    const { status } = validationResult.data;
    const orderId = params.id;

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order status
    const updateData: any = {
      status
    };

    // If status is COMPLETED, set completedAt
    if (status === 'COMPLETED' && !existingOrder.completedAt) {
      updateData.completedAt = new Date();
      updateData.setupCompleted = true;
      updateData.setupStep = 'COMPLETED';
    }

    // If status is being reverted from COMPLETED, clear completedAt
    if (existingOrder.status === 'COMPLETED' && status !== 'COMPLETED') {
      updateData.completedAt = null;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            price: true
          }
        },
        user: {
          select: {
            name: true,
            email: true,
            salonName: true
          }
        }
      }
    });

    // Log the status change for audit purposes
    console.log(`Order ${orderId} status updated from ${existingOrder.status} to ${status} by admin ${session.user.email}`);

    // TODO: Send notification email to customer about status change
    // This would be implemented based on your email service

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: `Order status updated to ${status}`
    });

  } catch (error) {
    console.error('Error updating order status:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update order status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}