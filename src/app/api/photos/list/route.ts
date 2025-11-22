import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)

    const orderId = searchParams.get('orderId')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    // Build where clause
    const where: { orderId?: string; userId?: string; uploadStatus?: string } = {}

    // Authorization and filtering
    if (orderId) {
      where.orderId = orderId

      // Verify user has access to this order
      if (session?.user?.id) {
        const order = await prisma.order.findUnique({
          where: { id: orderId }
        })

        if (!order || order.userId !== session.user.id) {
          return NextResponse.json(
            { error: 'Unauthorized access to order' },
            { status: 403 }
          )
        }
      }
    } else if (userId) {
      // Users can only list their own photos
      if (!session?.user?.id || session.user.id !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized access to user photos' },
          { status: 403 }
        )
      }
      where.userId = userId
    } else {
      // Default to current user's photos
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      where.userId = session.user.id
    }

    // Filter by status if provided
    if (status && ['UPLOADING', 'PROCESSING', 'COMPLETED', 'FAILED'].includes(status)) {
      (where as any).uploadStatus = status
    }

    // Fetch photos
    const photos = await prisma.photo.findMany({
      where: where as any,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'asc' }
      ],
      select: {
        id: true,
        filename: true,
        originalUrl: true,
        thumbnailUrl: true,
        size: true,
        mimeType: true,
        width: true,
        height: true,
        alt: true,
        sortOrder: true,
        uploadStatus: true,
        uploadError: true,
        createdAt: true,
        orderId: true,
        userId: true
      }
    })

    return NextResponse.json({
      success: true,
      photos,
      count: photos.length
    })

  } catch (error) {
    console.error('Error listing photos:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Bulk operations for photos
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, photoIds, data } = body

    if (!action || !Array.isArray(photoIds) || photoIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: action and photoIds are required' },
        { status: 400 }
      )
    }

    // Verify all photos belong to the user
    const photos = await prisma.photo.findMany({
      where: {
        id: { in: photoIds },
        OR: [
          { userId: session.user.id },
          {
            order: {
              userId: session.user.id
            }
          }
        ]
      }
    })

    if (photos.length !== photoIds.length) {
      return NextResponse.json(
        { error: 'Some photos not found or unauthorized' },
        { status: 403 }
      )
    }

    switch (action) {
      case 'reorder':
        // Reorder photos based on provided order
        if (!Array.isArray(data) || data.length !== photoIds.length) {
          return NextResponse.json(
            { error: 'Invalid reorder data' },
            { status: 400 }
          )
        }

        // Update each photo's sortOrder
        const updates = photoIds.map((photoId, index) =>
          prisma.photo.update({
            where: { id: photoId },
            data: { sortOrder: data[index] }
          })
        )

        await Promise.all(updates)
        break

      case 'delete':
        // Delete multiple photos
        const photosToDelete = await prisma.photo.findMany({
          where: { id: { in: photoIds } }
        })

        // Delete files from disk first
        for (const photo of photosToDelete) {
          try {
            const { deleteFileFromDisk } = await import('@/lib/file-utils.server')
            await deleteFileFromDisk(photo.originalUrl)
            if (photo.thumbnailUrl) {
              await deleteFileFromDisk(photo.thumbnailUrl)
            }
          } catch (error) {
            console.warn(`Error deleting file for photo ${photo.id}:`, error)
          }
        }

        // Delete from database
        await prisma.photo.deleteMany({
          where: { id: { in: photoIds } }
        })
        break

      case 'update_alt':
        // Update alt text for multiple photos
        if (!data || typeof data.alt !== 'string') {
          return NextResponse.json(
            { error: 'Alt text is required' },
            { status: 400 }
          )
        }

        await prisma.photo.updateMany({
          where: { id: { in: photoIds } },
          data: { alt: data.alt }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `${action} completed successfully`,
      affectedCount: photoIds.length
    })

  } catch (error) {
    console.error('Error in bulk photo operation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}