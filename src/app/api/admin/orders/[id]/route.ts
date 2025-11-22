import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(
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

    const orderId = params.id;

    // Fetch order with all related data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            price: true,
            features: true,
            preview: true,
            active: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            salonName: true,
            phone: true,
            city: true,
            address: true,
            website: true,
            businessType: true,
            hasCompletedOnboarding: true,
            isActive: true,
            createdAt: true
          }
        },
        photos: {
          select: {
            id: true,
            filename: true,
            storedName: true,
            originalUrl: true,
            thumbnailUrl: true,
            size: true,
            mimeType: true,
            width: true,
            height: true,
            alt: true,
            sortOrder: true,
            uploadStatus: true,
            createdAt: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        },
        businessContent: {
          select: {
            id: true,
            salonDescription: true,
            aboutOwner: true,
            aboutBusiness: true,
            welcomeMessage: true,
            fullAddress: true,
            city: true,
            postalCode: true,
            phone: true,
            email: true,
            website: true,
            facebookUrl: true,
            instagramUrl: true,
            twitterUrl: true,
            youtubeUrl: true,
            tiktokUrl: true,
            linkedinUrl: true,
            specialties: true,
            certifications: true,
            languages: true,
            metaTitle: true,
            metaDescription: true,
            keywords: true,
            isComplete: true,
            services: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                duration: true,
                category: true,
                isActive: true,
                priceFrom: true,
                priceTo: true,
                priceType: true
              },
              where: {
                isActive: true
              },
              orderBy: {
                sortOrder: 'asc'
              }
            },
            businessHours: {
              select: {
                id: true,
                dayOfWeek: true,
                isOpen: true,
                openTime: true,
                closeTime: true,
                hasBreak: true,
                breakStartTime: true,
                breakEndTime: true,
                notes: true
              },
              orderBy: {
                dayOfWeek: 'asc'
              }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Calculate additional statistics
    const photoStats = {
      totalPhotos: order.photos.length,
      uploadedPhotos: order.photos.filter(p => p.uploadStatus === 'COMPLETED').length,
      failedPhotos: order.photos.filter(p => p.uploadStatus === 'FAILED').length,
      totalSize: order.photos.reduce((sum, p) => sum + p.size, 0)
    };

    const serviceStats = order.businessContent ? {
      totalServices: order.businessContent.services.length,
      activeServices: order.businessContent.services.filter(s => s.isActive).length
    } : null;

    // Add computed fields
    const enrichedOrder = {
      ...order,
      photoStats,
      serviceStats,
      setupProgress: calculateSetupProgress(order),
      daysSinceCreation: Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      estimatedCompletionTime: estimateCompletionTime(order)
    };

    return NextResponse.json({
      success: true,
      data: enrichedOrder
    });

  } catch (error) {
    console.error('Error fetching order details:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch order details',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate setup progress
function calculateSetupProgress(order: any): number {
  const steps = [
    'DOMAIN_SELECTION',
    'BUSINESS_INFO',
    'DESIGN_PREFERENCES',
    'CONTENT_EDITOR',
    'PHOTOS_UPLOAD',
    'REVIEW_LAUNCH',
    'COMPLETED'
  ];

  const currentStepIndex = steps.indexOf(order.setupStep || 'DOMAIN_SELECTION');
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return Math.round(progress);
}

// Helper function to estimate completion time
function estimateCompletionTime(order: any): string {
  if (order.status === 'COMPLETED') {
    return 'Completed';
  }

  if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
    return 'N/A';
  }

  const setupSteps = {
    'DOMAIN_SELECTION': 6,
    'BUSINESS_INFO': 5,
    'DESIGN_PREFERENCES': 4,
    'CONTENT_EDITOR': 3,
    'PHOTOS_UPLOAD': 2,
    'REVIEW_LAUNCH': 1,
    'COMPLETED': 0
  };

  const remainingSteps = setupSteps[order.setupStep as keyof typeof setupSteps] || 6;
  const estimatedDays = remainingSteps * 0.5; // Assume 0.5 days per step

  if (estimatedDays < 1) {
    return 'Less than 1 day';
  } else if (estimatedDays === 1) {
    return '1 day';
  } else {
    return `${estimatedDays} days`;
  }
}

// DELETE endpoint for cancelling orders
export async function DELETE(
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

    // Don't allow deletion of completed orders
    if (existingOrder.status === 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete completed orders' },
        { status: 400 }
      );
    }

    // Soft delete by setting status to CANCELLED
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    });

    console.log(`Order ${orderId} cancelled by admin ${session.user.email}`);

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: 'Order cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling order:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cancel order',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}