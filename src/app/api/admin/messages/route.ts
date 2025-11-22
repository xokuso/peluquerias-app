import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ContactStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Check admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') as ContactStatus | null;
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.contactMessage.count({ where });

    // Get messages with pagination
    const messages = await prisma.contactMessage.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder
      }
    });

    // Get statistics
    const stats = await prisma.contactMessage.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    // Format statistics
    const formattedStats = {
      total: totalCount,
      unread: stats.find((s: any) => s.status === 'UNREAD')?._count.status || 0,
      read: stats.find((s: any) => s.status === 'READ')?._count.status || 0,
      replied: stats.find((s: any) => s.status === 'REPLIED')?._count.status || 0,
      archived: stats.find((s: any) => s.status === 'ARCHIVED')?._count.status || 0
    };

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      },
      stats: formattedStats
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Error al obtener mensajes' },
      { status: 500 }
    );
  }
}

// Mark multiple messages as read
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Check admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { messageIds, status } = body;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: 'IDs de mensajes requeridos' },
        { status: 400 }
      );
    }

    if (!status || !Object.values(ContactStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      );
    }

    // Update multiple messages
    const updated = await prisma.contactMessage.updateMany({
      where: {
        id: { in: messageIds }
      },
      data: {
        status,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      updated: updated.count
    });

  } catch (error) {
    console.error('Error updating messages:', error);
    return NextResponse.json(
      { error: 'Error al actualizar mensajes' },
      { status: 500 }
    );
  }
}

// Delete multiple messages
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Check admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { messageIds } = body;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: 'IDs de mensajes requeridos' },
        { status: 400 }
      );
    }

    // Delete multiple messages
    const deleted = await prisma.contactMessage.deleteMany({
      where: {
        id: { in: messageIds }
      }
    });

    return NextResponse.json({
      success: true,
      deleted: deleted.count
    });

  } catch (error) {
    console.error('Error deleting messages:', error);
    return NextResponse.json(
      { error: 'Error al eliminar mensajes' },
      { status: 500 }
    );
  }
}