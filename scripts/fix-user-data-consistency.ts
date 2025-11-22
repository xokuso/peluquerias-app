#!/usr/bin/env tsx
/**
 * Script to fix user data consistency issues
 * Run with: npx tsx scripts/fix-user-data-consistency.ts
 */

import { PrismaClient } from '@prisma/client';
import { ensureOrderUserRelationships } from '../src/lib/services/user-profile.service';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Starting user data consistency fix...\n');

  try {
    // 1. Link orphaned orders to users based on email
    console.log('📎 Linking orphaned orders to users...');
    const linkedOrders = await ensureOrderUserRelationships();
    console.log(`✅ Linked ${linkedOrders} orphaned orders\n`);

    // 2. Fix orders with missing user data
    console.log('🔄 Syncing user data to orders...');
    const ordersWithUser = await prisma.order.findMany({
      where: {
        userId: { not: null },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            salonName: true,
            phone: true,
            address: true,
          },
        },
      },
    });

    let syncedOrders = 0;
    for (const order of ordersWithUser) {
      if (order.user) {
        const updates: any = {};

        // Check if order data matches user data
        if (order.email !== order.user.email) {
          updates.email = order.user.email;
        }
        if (order.ownerName !== order.user.name && order.user.name) {
          updates.ownerName = order.user.name;
        }
        if (order.salonName !== order.user.salonName && order.user.salonName) {
          updates.salonName = order.user.salonName;
        }
        if (order.phone !== order.user.phone && order.user.phone) {
          updates.phone = order.user.phone;
        }
        if (order.address !== order.user.address && order.user.address) {
          updates.address = order.user.address;
        }

        if (Object.keys(updates).length > 0) {
          await prisma.order.update({
            where: { id: order.id },
            data: updates,
          });
          syncedOrders++;
        }
      }
    }
    console.log(`✅ Synced data for ${syncedOrders} orders\n`);

    // 3. Ensure all users have required fields
    console.log('👤 Checking user profiles for missing data...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        businessType: true,
        role: true,
      },
    });

    let usersFixed = 0;
    for (const user of users) {
      const updates: any = {};

      // Ensure businessType has a default value
      if (!user.businessType) {
        updates.businessType = 'SALON';
      }

      // Ensure name is not null (use email prefix if missing)
      if (!user.name) {
        updates.name = user.email.split('@')[0];
      }

      if (Object.keys(updates).length > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: updates,
        });
        usersFixed++;
      }
    }
    console.log(`✅ Fixed ${usersFixed} user profiles\n`);

    // 4. Clean up duplicate or conflicting data
    console.log('🧹 Cleaning up duplicate data...');

    // Find users with duplicate emails (shouldn't happen due to unique constraint, but check anyway)
    const emailGroups = await prisma.user.groupBy({
      by: ['email'],
      _count: {
        email: true,
      },
      having: {
        email: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    if (emailGroups.length > 0) {
      console.log(`⚠️  Found ${emailGroups.length} duplicate email addresses`);
      for (const group of emailGroups) {
        console.log(`   - ${group.email}: ${group._count.email} occurrences`);
      }
    } else {
      console.log('✅ No duplicate emails found\n');
    }

    // 5. Generate statistics report
    console.log('📊 Generating statistics report...\n');

    const stats = await prisma.$transaction([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.count({
        where: { userId: { not: null } },
      }),
      prisma.order.count({
        where: { userId: null },
      }),
      prisma.user.count({
        where: { hasCompletedOnboarding: true },
      }),
      prisma.user.count({
        where: { isActive: true },
      }),
    ]);

    console.log('📈 Database Statistics:');
    console.log(`   Total Users: ${stats[0]}`);
    console.log(`   Total Orders: ${stats[1]}`);
    console.log(`   Orders with User: ${stats[2]}`);
    console.log(`   Orphaned Orders: ${stats[3]}`);
    console.log(`   Users Onboarded: ${stats[4]}`);
    console.log(`   Active Users: ${stats[5]}`);
    console.log();

    // 6. Validate foreign key constraints
    console.log('🔍 Validating foreign key constraints...');

    // Check for orders referencing non-existent users
    const invalidOrderUserRefs = await prisma.$queryRaw<any[]>`
      SELECT o.id, o.userId
      FROM "Order" o
      LEFT JOIN "User" u ON o."userId" = u.id
      WHERE o."userId" IS NOT NULL AND u.id IS NULL
    `;

    if (invalidOrderUserRefs.length > 0) {
      console.log(`⚠️  Found ${invalidOrderUserRefs.length} orders with invalid user references`);
      // Fix by setting userId to null for invalid references
      for (const order of invalidOrderUserRefs) {
        await prisma.order.update({
          where: { id: order.id },
          data: { userId: null },
        });
      }
      console.log('✅ Fixed invalid user references');
    } else {
      console.log('✅ All foreign key constraints are valid');
    }

    console.log('\n✨ Data consistency fix completed successfully!');
  } catch (error) {
    console.error('❌ Error during data consistency fix:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});