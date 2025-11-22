/**
 * Client-side file management utilities for photo uploads
 * This file contains browser-compatible utilities that don't use Node.js modules
 */

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

export const UPLOAD_PATHS = {
  photos: '/uploads/photos',
  thumbnails: '/uploads/thumbnails',
}

export interface FileValidationResult {
  isValid: boolean
  error?: string
}

export interface ImageDimensions {
  width: number
  height: number
}

/**
 * Get file extension from filename (client-side compatible)
 */
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.')
  return lastDotIndex === -1 ? '' : filename.substring(lastDotIndex).toLowerCase()
}

/**
 * Get base filename without extension (client-side compatible)
 */
export function getBaseName(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.')
  return lastDotIndex === -1 ? filename : filename.substring(0, lastDotIndex)
}

/**
 * Validate file type and size
 */
export function validateFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `El archivo es demasiado grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB permitido.`
    }
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Formato de archivo no permitido. Solo se permiten JPEG, PNG y WebP.'
    }
  }

  // Check file extension (using client-side function)
  const extension = getFileExtension(file.name)
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      isValid: false,
      error: 'Extensión de archivo no válida.'
    }
  }

  return { isValid: true }
}

/**
 * Generate unique filename to avoid conflicts (client-side compatible)
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = getFileExtension(originalFilename)
  const baseName = getBaseName(originalFilename)
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 20)

  return `${baseName}_${timestamp}_${randomString}${extension}`
}

/**
 * Get image dimensions from file
 */
export function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Error loading image to get dimensions'))
    }

    img.src = url
  })
}

/**
 * Compress image on client side
 */
export function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            reject(new Error('Canvas blob creation failed'))
          }
        },
        file.type,
        quality
      )
    }

    img.onerror = () => reject(new Error('Image load failed'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Create thumbnail from image file
 */
export function createThumbnail(
  file: File,
  size: number = 200,
  quality: number = 0.7
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate square thumbnail dimensions
      const { width, height } = img
      const cropSize = Math.min(width, height)
      const offsetX = (width - cropSize) / 2
      const offsetY = (height - cropSize) / 2

      canvas.width = size
      canvas.height = size

      // Draw cropped and resized image
      ctx?.drawImage(
        img,
        offsetX, offsetY, cropSize, cropSize,
        0, 0, size, size
      )

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const thumbnailName = `thumb_${file.name}`
            const thumbnailFile = new File([blob], thumbnailName, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(thumbnailFile)
          } else {
            reject(new Error('Thumbnail creation failed'))
          }
        },
        file.type,
        quality
      )
    }

    img.onerror = () => reject(new Error('Image load failed for thumbnail'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Convert file to base64 data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        resolve(result)
      } else {
        reject(new Error('Failed to convert file to data URL'))
      }
    }
    reader.onerror = () => reject(new Error('FileReader error'))
    reader.readAsDataURL(file)
  })
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}