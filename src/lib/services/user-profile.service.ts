import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';

/**
 * User Profile Service
 * Handles user profile operations and data consistency
 */

export interface UserProfileWithStats {
  id: string;
  name: string | null;
  email: string;
  role: string;
  salonName: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  website: string | null;
  businessType: string;
  isActive: boolean;
  hasCompletedOnboarding: boolean;
  createdAt: Date;
  updatedAt: Date;
  statistics: {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    totalSpent: number;
    lastOrderDate: Date | null;
  };
}

/**
 * Get complete user profile with statistics
 */
export async function getUserProfileWithStats(userId: string): Promise<UserProfileWithStats | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          select: {
            id: true,
            status: true,
            total: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    // Calculate statistics
    const completedOrders = user.orders.filter(o => o.status === 'COMPLETED');
    const pendingOrders = user.orders.filter(o => o.status === 'PENDING');
    const totalSpent = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const lastOrder = user.orders[0];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      salonName: user.salonName,
      phone: user.phone,
      city: user.city,
      address: user.address,
      website: user.website,
      businessType: user.businessType,
      isActive: user.isActive,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      statistics: {
        totalOrders: user.orders.length,
        completedOrders: completedOrders.length,
        pendingOrders: pendingOrders.length,
        totalSpent,
        lastOrderDate: lastOrder?.createdAt || null,
      },
    };
  } catch (error) {
    console.error('Error fetching user profile with stats:', error);
    return null;
  }
}

/**
 * Sync user data across related entities
 * Updates user information in orders when user profile is updated
 */
export async function syncUserDataAcrossEntities(userId: string, updatedData: Partial<User>): Promise<void> {
  try {
    // If salonName or ownerName changed, update related orders
    if (updatedData.salonName || updatedData.name) {
      const updateOrderData: any = {};

      if (updatedData.salonName) {
        updateOrderData.salonName = updatedData.salonName;
      }

      if (updatedData.name) {
        updateOrderData.ownerName = updatedData.name;
      }

      // Update orders that belong to this user
      await prisma.order.updateMany({
        where: { userId },
        data: updateOrderData,
      });
    }

    // If email changed, update orders
    if (updatedData.email) {
      await prisma.order.updateMany({
        where: { userId },
        data: { email: updatedData.email },
      });
    }

    // If phone changed, update orders
    if (updatedData.phone) {
      await prisma.order.updateMany({
        where: { userId },
        data: { phone: updatedData.phone },
      });
    }

    // If address changed, update orders
    if (updatedData.address) {
      await prisma.order.updateMany({
        where: { userId },
        data: { address: updatedData.address },
      });
    }
  } catch (error) {
    console.error('Error syncing user data across entities:', error);
    throw error;
  }
}

/**
 * Ensure user-order relationships are consistent
 * Links orphaned orders to users based on email
 */
export async function ensureOrderUserRelationships(): Promise<number> {
  try {
    // Find orders without userId but with email
    const orphanedOrders = await prisma.order.findMany({
      where: {
        userId: null,
      },
      select: {
        id: true,
        email: true,
      },
    });

    let updatedCount = 0;

    for (const order of orphanedOrders) {
      // Skip orders without valid email
      if (!order.email || order.email.trim() === '') {
        continue;
      }

      // Find user with matching email
      const user = await prisma.user.findUnique({
        where: { email: order.email },
        select: { id: true },
      });

      if (user) {
        // Link order to user
        await prisma.order.update({
          where: { id: order.id },
          data: { userId: user.id },
        });
        updatedCount++;
      }
    }

    console.log(`Linked ${updatedCount} orphaned orders to users`);
    return updatedCount;
  } catch (error) {
    console.error('Error ensuring order-user relationships:', error);
    throw error;
  }
}

/**
 * Validate user profile completeness
 * Returns fields that are missing or incomplete
 */
export function validateProfileCompleteness(user: Partial<User>): {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
} {
  const requiredFields = [
    'name',
    'email',
    'salonName',
    'phone',
    'city',
    'address',
    'businessType',
  ];

  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (!user[field as keyof User]) {
      missingFields.push(field);
    }
  }

  const completionPercentage = Math.round(
    ((requiredFields.length - missingFields.length) / requiredFields.length) * 100
  );

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage,
  };
}

/**
 * Get user by various identifiers (id, email)
 */
export async function getUserByIdentifier(identifier: string): Promise<User | null> {
  try {
    // Try to find by ID first
    let user = await prisma.user.findUnique({
      where: { id: identifier },
    });

    // If not found by ID, try email
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: identifier },
      });
    }

    return user;
  } catch (error) {
    console.error('Error finding user by identifier:', error);
    return null;
  }
}

/**
 * Update user last activity timestamp
 */
export async function updateUserLastActivity(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });
  } catch (error) {
    console.error('Error updating user last activity:', error);
  }
}