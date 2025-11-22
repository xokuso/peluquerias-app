import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/prisma'
import { deleteFileFromDisk } from '@/lib/file-utils.server'

export async function GET(
  request: NextRequest,
  { params }: { params: { photoId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const photoId = params.photoId

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      )
    }

    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: {
        order: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    // Authorization check - users can only access their own photos or photos from their orders
    if (session?.user?.id !== photo.userId &&
        (!photo.order || session?.user?.id !== photo.order.userId)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json({ photo })

  } catch (error) {
    console.error('Error fetching photo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { photoId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const photoId = params.photoId

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { alt, sortOrder } = body

    // Validate inputs
    if (alt !== undefined && typeof alt !== 'string') {
      return NextResponse.json(
        { error: 'Alt text must be a string' },
        { status: 400 }
      )
    }

    if (sortOrder !== undefined && (typeof sortOrder !== 'number' || sortOrder < 0)) {
      return NextResponse.json(
        { error: 'Sort order must be a non-negative number' },
        { status: 400 }
      )
    }

    // Find photo and check authorization
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: {
        order: true
      }
    })

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    // Authorization check
    if (session?.user?.id !== photo.userId &&
        (!photo.order || session?.user?.id !== photo.order.userId)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update photo
    const updateData: { alt?: string; sortOrder?: number } = {}
    if (alt !== undefined) updateData.alt = alt
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder

    const updatedPhoto = await prisma.photo.update({
      where: { id: photoId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      photo: updatedPhoto
    })

  } catch (error) {
    console.error('Error updating photo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { photoId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const photoId = params.photoId

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      )
    }

    // Find photo and check authorization
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: {
        order: true
      }
    })

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    // Authorization check
    if (session?.user?.id !== photo.userId &&
        (!photo.order || session?.user?.id !== photo.order.userId)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete files from disk
    try {
      await deleteFileFromDisk(photo.originalUrl)
      if (photo.thumbnailUrl) {
        await deleteFileFromDisk(photo.thumbnailUrl)
      }
    } catch (error) {
      console.warn('Error deleting files from disk:', error)
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await prisma.photo.delete({
      where: { id: photoId }
    })

    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting photo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}