const { PrismaClient } = require('@prisma/client');

async function testDatabaseQueries() {
  const prisma = new PrismaClient();

  try {
    console.log('Testing database connection and queries...\n');

    // Test basic connection
    console.log('1. Testing basic connection...');
    const userCount = await prisma.user.count();
    console.log(`   ✅ Users count: ${userCount}`);

    // Test the queries from admin stats API one by one
    console.log('\n2. Testing admin stats queries...');

    // Test active users query - this might fail if lastLogin field doesn't exist
    try {
      console.log('   Testing active users query...');
      const activeUsers = await prisma.user.count({
        where: {
          isActive: true,
          lastLogin: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      });
      console.log(`   ✅ Active users: ${activeUsers}`);
    } catch (error) {
      console.log(`   ❌ Active users query failed: ${error.message}`);
    }

    // Test total orders
    try {
      console.log('   Testing total orders query...');
      const totalOrders = await prisma.order.count();
      console.log(`   ✅ Total orders: ${totalOrders}`);
    } catch (error) {
      console.log(`   ❌ Total orders query failed: ${error.message}`);
    }

    // Test monthly orders with date filtering
    try {
      console.log('   Testing monthly orders query...');
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const monthlyOrders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        select: {
          total: true,
          status: true
        }
      });
      console.log(`   ✅ Monthly orders: ${monthlyOrders.length}`);
    } catch (error) {
      console.log(`   ❌ Monthly orders query failed: ${error.message}`);
    }

    // Test pending orders
    try {
      console.log('   Testing pending orders query...');
      const pendingOrders = await prisma.order.count({
        where: {
          status: 'PENDING'
        }
      });
      console.log(`   ✅ Pending orders: ${pendingOrders}`);
    } catch (error) {
      console.log(`   ❌ Pending orders query failed: ${error.message}`);
    }

    // Test completed orders with completedAt field
    try {
      console.log('   Testing completed orders query...');
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const completedOrders = await prisma.order.count({
        where: {
          status: 'COMPLETED',
          completedAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      });
      console.log(`   ✅ Completed orders: ${completedOrders}`);
    } catch (error) {
      console.log(`   ❌ Completed orders query failed: ${error.message}`);
    }

    // Test unread contact messages
    try {
      console.log('   Testing unread messages query...');
      const unreadMessages = await prisma.contactMessage.count({
        where: {
          status: 'UNREAD'
        }
      });
      console.log(`   ✅ Unread messages: ${unreadMessages}`);
    } catch (error) {
      console.log(`   ❌ Unread messages query failed: ${error.message}`);
    }

    // Test active templates
    try {
      console.log('   Testing active templates query...');
      const activeTemplates = await prisma.template.count({
        where: {
          active: true
        }
      });
      console.log(`   ✅ Active templates: ${activeTemplates}`);
    } catch (error) {
      console.log(`   ❌ Active templates query failed: ${error.message}`);
    }

    // Test recent orders with template relationship
    try {
      console.log('   Testing recent orders query...');
      const recentOrders = await prisma.order.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          template: {
            select: {
              name: true,
              category: true
            }
          }
        }
      });
      console.log(`   ✅ Recent orders: ${recentOrders.length}`);
    } catch (error) {
      console.log(`   ❌ Recent orders query failed: ${error.message}`);
    }

    // Test revenue aggregation query
    try {
      console.log('   Testing revenue aggregation query...');
      const now = new Date();
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const lastMonthRevenue = await prisma.order.aggregate({
        where: {
          status: 'COMPLETED',
          completedAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        },
        _sum: {
          total: true
        }
      });
      console.log(`   ✅ Revenue aggregation: ${lastMonthRevenue._sum.total || 0}`);
    } catch (error) {
      console.log(`   ❌ Revenue aggregation query failed: ${error.message}`);
    }

    console.log('\n✅ Database query test completed!');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseQueries();