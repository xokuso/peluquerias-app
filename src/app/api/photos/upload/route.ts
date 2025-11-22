import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/prisma'
import {
  generateUniqueFilename,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  getFileExtension
} from '@/lib/file-utils.client'
import {
  saveFileToDisk,
  ensureUploadDirectories
} from '@/lib/file-utils.server'
// Sharp is not compatible with Edge Runtime, using Node.js runtime instead

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // For now, allow uploads for authenticated users and during setup process
    // Later you might want to add more specific authorization checks

    const formData = await request.formData()
    const file = formData.get('file') as File
    const photoId = formData.get('photoId') as string
    const orderId = formData.get('orderId') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!photoId) {
      return NextResponse.json(
        { error: 'No photo ID provided' },
        { status: 400 }
      )
    }

    // Validate file on server side as well
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `El archivo es demasiado grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB permitido.` },
        { status: 400 }
      )
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato de archivo no permitido. Solo se permiten JPEG, PNG y WebP.' },
        { status: 400 }
      )
    }

    const extension = getFileExtension(file.name)
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { error: 'Extensión de archivo no válida.' },
        { status: 400 }
      )
    }

    // Ensure upload directories exist
    await ensureUploadDirectories()

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filenames
    const originalFilename = generateUniqueFilename(file.name)
    const thumbnailFilename = `thumb_${originalFilename}`

    // Get image metadata using sharp (dynamic import for Vercel compatibility)
    let metadata: { width?: number; height?: number } = {}
    let optimizedBuffer: Buffer = buffer
    let thumbnailBuffer: Buffer | null = null

    try {
      const sharp = (await import('sharp')).default

      // Get metadata
      const sharpInstance = sharp(buffer)
      const info = await sharpInstance.metadata()
      metadata = {
        width: info.width,
        height: info.height
      }

      // Create optimized main image
      optimizedBuffer = await sharp(buffer)
        .resize(1920, 1080, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer()

      // Create thumbnail
      thumbnailBuffer = await sharp(buffer)
        .resize(300, 300, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toBuffer()
    } catch (error) {
      console.warn('Could not process image with sharp:', error)
    }

    // Save files to disk
    const originalUrl = await saveFileToDisk(optimizedBuffer, originalFilename, 'photos')
    let thumbnailUrl: string | null = null

    if (thumbnailBuffer) {
      try {
        thumbnailUrl = await saveFileToDisk(thumbnailBuffer, thumbnailFilename, 'thumbnails')
      } catch (error) {
        console.warn('Could not save thumbnail:', error)
      }
    }

    // Save to database
    const photoData = {
      id: photoId,
      filename: file.name,
      storedName: originalFilename,
      originalUrl,
      thumbnailUrl,
      size: optimizedBuffer.length,
      mimeType: file.type,
      width: metadata.width || null,
      height: metadata.height || null,
      uploadStatus: 'COMPLETED' as const,
      ...(orderId && { orderId }),
      ...(session?.user?.id && { userId: session.user.id })
    }

    const savedPhoto = await prisma.photo.create({
      data: photoData
    })

    return NextResponse.json({
      success: true,
      photo: {
        id: savedPhoto.id,
        filename: savedPhoto.filename,
        originalUrl: savedPhoto.originalUrl,
        thumbnailUrl: savedPhoto.thumbnailUrl,
        size: savedPhoto.size,
        width: savedPhoto.width,
        height: savedPhoto.height
      }
    })

  } catch (error) {
    console.error('Error uploading photo:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      },
      { status: 500 }
    )
  }
}

// Handle file size limits for the route
export const runtime = 'nodejs'