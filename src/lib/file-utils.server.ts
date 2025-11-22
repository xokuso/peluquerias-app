/**
 * Server-side file management utilities for photo uploads
 * This file contains Node.js specific utilities that use fs and path modules
 */

import { promises as fs } from 'fs'
import path from 'path'

export const UPLOAD_PATHS = {
  photos: '/uploads/photos',
  thumbnails: '/uploads/thumbnails',
}

/**
 * Ensure upload directories exist (server-side only)
 */
export async function ensureUploadDirectories(): Promise<void> {
  if (typeof window !== 'undefined') {
    throw new Error('This function should only be called server-side')
  }

  const photosDir = path.join(process.cwd(), 'public', 'uploads', 'photos')
  const thumbnailsDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails')

  try {
    await fs.mkdir(photosDir, { recursive: true })
    await fs.mkdir(thumbnailsDir, { recursive: true })
  } catch (error) {
    console.error('Error creating upload directories:', error)
    throw error
  }
}

/**
 * Save file to disk (server-side only)
 */
export async function saveFileToDisk(
  file: Buffer,
  filename: string,
  type: 'photos' | 'thumbnails'
): Promise<string> {
  if (typeof window !== 'undefined') {
    throw new Error('This function should only be called server-side')
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', type)
  const filePath = path.join(uploadDir, filename)

  try {
    await fs.writeFile(filePath, file)
    return `${UPLOAD_PATHS[type]}/${filename}`
  } catch (error) {
    console.error('Error saving file to disk:', error)
    throw error
  }
}

/**
 * Delete file from disk (server-side only)
 */
export async function deleteFileFromDisk(filePath: string): Promise<void> {
  if (typeof window !== 'undefined') {
    throw new Error('This function should only be called server-side')
  }

  try {
    const fullPath = path.join(process.cwd(), 'public', filePath)
    await fs.unlink(fullPath)
  } catch (error) {
    // Ignore error if file doesn't exist
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('Error deleting file:', error)
      throw error
    }
  }
}