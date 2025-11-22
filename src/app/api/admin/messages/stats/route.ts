import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';
import { ApiResponse, MessageStats } from '@/types/api';

export async function GET(_req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Calculate date for recent messages (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Fetch all message statistics in parallel
    const [
      totalMessages,
      unreadCount,
      readCount,
      repliedCount,
      archivedCount,
      recentMessagesCount
    ] = await Promise.all([
      // Total messages
      prisma.contactMessage.count(),

      // Unread messages
      prisma.contactMessage.count({
        where: { status: 'UNREAD' }
      }),

      // Read messages
      prisma.contactMessage.count({
        where: { status: 'READ' }
      }),

      // Replied messages
      prisma.contactMessage.count({
        where: { status: 'REPLIED' }
      }),

      // Archived messages
      prisma.contactMessage.count({
        where: { status: 'ARCHIVED' }
      }),

      // Recent messages (last 7 days)
      prisma.contactMessage.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      })
    ]);

    // Prepare message statistics
    const messageStats: MessageStats = {
      total: totalMessages,
      unread: unreadCount,
      read: readCount,
      replied: repliedCount,
      archived: archivedCount,
      recentMessages: recentMessagesCount
    };

    const response: ApiResponse<MessageStats> = {
      success: true,
      data: messageStats
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching message statistics:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch message statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}