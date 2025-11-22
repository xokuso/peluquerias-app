import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

// Validation schema for profile updates
const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  salonName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  website: z.string().url().optional().or(z.literal('')),
  businessType: z.enum(['SALON', 'BARBERSHOP', 'PERSONAL']).optional(),
});

/**
 * GET /api/user/profile
 * Get current user's complete profile with related data
 */
export async function GET(_request: NextRequest) {
  try {
    // Get current user from session
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch complete user profile with all related data
    const userProfile = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        salonName: true,
        phone: true,
        city: true,
        address: true,
        website: true,
        businessType: true,
        hasCompletedOnboarding: true,
        subscriptionStatus: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        // Include order statistics
        _count: {
          select: {
            orders: true,
            photos: true,
            notifications: true,
            supportTickets: true,
          },
        },
        // Include recent orders with proper template data
        orders: {
          select: {
            id: true,
            salonName: true,
            domain: true,
            total: true,
            status: true,
            createdAt: true,
            completedAt: true,
            template: {
              select: {
                id: true,
                name: true,
                category: true,
                price: true,
              },
            },
            setupStep: true,
            setupCompleted: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // Last 5 orders
        },
        // Include active notifications count
        notifications: {
          where: {
            read: false,
          },
          select: {
            id: true,
          },
        },
        // Include business content if exists
        businessContent: {
          select: {
            id: true,
            isComplete: true,
            salonDescription: true,
            welcomeMessage: true,
            metaTitle: true,
            facebookUrl: true,
            instagramUrl: true,
            twitterUrl: true,
            youtubeUrl: true,
            tiktokUrl: true,
            linkedinUrl: true,
          },
        },
      },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Calculate additional statistics
    const completedOrders = userProfile.orders.filter(
      order => order.status === 'COMPLETED'
    );
    const totalSpent = completedOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );

    // Extract orders separately to avoid sending redundant data
    const { orders: _, ...userProfileWithoutOrders } = userProfile;

    // Prepare response with complete profile data
    const profileData = {
      ...userProfileWithoutOrders,
      recentOrders: userProfile.orders,
      statistics: {
        totalOrders: userProfile._count.orders,
        completedOrders: completedOrders.length,
        totalSpent,
        totalPhotos: userProfile._count.photos,
        unreadNotifications: userProfile.notifications.length,
        activeTickets: userProfile._count.supportTickets,
      },
    };

    return NextResponse.json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user profile',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/profile
 * Update current user's profile
 */
export async function PUT(request: NextRequest) {
  try {
    // Get current user from session
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Prepare update data with proper types
    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.salonName !== undefined) updateData.salonName = validatedData.salonName;
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone;
    if (validatedData.city !== undefined) updateData.city = validatedData.city;
    if (validatedData.address !== undefined) updateData.address = validatedData.address;
    if (validatedData.website !== undefined) {
      updateData.website = validatedData.website === '' ? null : validatedData.website;
    }
    if (validatedData.businessType !== undefined) updateData.businessType = validatedData.businessType;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        salonName: true,
        phone: true,
        city: true,
        address: true,
        website: true,
        businessType: true,
        hasCompletedOnboarding: true,
        subscriptionStatus: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // Check if this is the first profile update (onboarding completion)
    if (!currentUser.hasCompletedOnboarding && validatedData.salonName) {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: { hasCompletedOnboarding: true },
      });
      updatedUser.hasCompletedOnboarding = true;
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Error updating user profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update profile',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/profile
 * Partial update of user profile (specific fields only)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Get current user from session
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { field, value } = body;

    // Define allowed fields for partial updates
    const allowedFields = [
      'name',
      'salonName',
      'phone',
      'city',
      'address',
      'website',
      'businessType',
      'image',
    ];

    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        { error: 'Invalid field for update' },
        { status: 400 }
      );
    }

    // Validate specific field values
    const validatedValue = value;
    if (field === 'businessType' && !['SALON', 'BARBERSHOP', 'PERSONAL'].includes(value)) {
      return NextResponse.json(
        { error: 'Invalid business type' },
        { status: 400 }
      );
    }
    if (field === 'website' && value && !z.string().url().safeParse(value).success) {
      return NextResponse.json(
        { error: 'Invalid website URL' },
        { status: 400 }
      );
    }

    // Update specific field
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        [field]: validatedValue === '' ? null : validatedValue,
      },
      select: {
        id: true,
        [field]: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${field} updated successfully`,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user profile field:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update profile field',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/profile
 * Delete current user's account (soft delete by deactivating)
 */
export async function DELETE(_request: NextRequest) {
  try {
    // Get current user from session
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Soft delete by deactivating the account
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        isActive: false,
        // Clear sensitive data but keep the record for audit
        phone: null,
        address: null,
        website: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Account deactivated successfully',
    });
  } catch (error) {
    console.error('Error deactivating user account:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to deactivate account',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}