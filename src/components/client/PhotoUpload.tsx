'use client'

import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  Check,
  Loader2,
  GripVertical,
  Eye,
  Trash2
} from 'lucide-react'
import {
  validateFile,
  compressImage,
  getImageDimensions,
  formatFileSize,
  MAX_FILE_SIZE
} from '@/lib/file-utils.client'

export interface UploadedPhoto {
  id: string
  file: File
  preview: string
  status: 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
  dimensions?: {
    width: number
    height: number
  }
}

interface PhotoUploadProps {
  maxFiles?: number
  onPhotosChange: (photos: UploadedPhoto[]) => void
  onUploadComplete?: (photoIds: string[]) => void
  orderId?: string
  className?: string
}

export default function PhotoUpload({
  maxFiles = 10,
  onPhotosChange,
  onUploadComplete,
  orderId,
  className = ''
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  // Update parent component when photos change
  React.useEffect(() => {
    onPhotosChange(photos)
  }, [photos, onPhotosChange])

  // Upload photo to server
  const uploadPhotoToServer = useCallback(async (photoId: string, file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('photoId', photoId)
      if (orderId) formData.append('orderId', orderId)

      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error uploading file')
      }

      await response.json() // Parse response to ensure it's successful

      // Update photo with success
      setPhotos(prev => prev.map(p =>
        p.id === photoId
          ? {
              ...p,
              status: 'completed',
              progress: 100
            }
          : p
      ))

      // Check if all photos are uploaded
      setPhotos(prev => {
        const updatedPhotos = prev.map(p =>
          p.id === photoId ? { ...p, status: 'completed' as const } : p
        )

        const allCompleted = updatedPhotos.every(p => p.status === 'completed')
        if (allCompleted && onUploadComplete) {
          const photoIds = updatedPhotos.map(p => p.id)
          onUploadComplete(photoIds)
        }

        return updatedPhotos
      })

    } catch (error) {
      console.error('Error uploading photo:', error)
      setPhotos(prev => prev.map(p =>
        p.id === photoId
          ? {
              ...p,
              status: 'error',
              error: error instanceof Error ? error.message : 'Error desconocido',
              progress: 0
            }
          : p
      ))
    }
  }, [orderId, onUploadComplete])

  // Process individual photo (compression, dimensions, upload)
  const processPhoto = useCallback(async (photo: UploadedPhoto) => {
    try {
      // Update status to processing
      setPhotos(prev => prev.map(p =>
        p.id === photo.id
          ? { ...p, status: 'processing', progress: 10 }
          : p
      ))

      // Get image dimensions
      const dimensions = await getImageDimensions(photo.file)

      // Compress image
      const compressedFile = await compressImage(photo.file, 1920, 1080, 0.85)

      // Update with compressed file and dimensions
      setPhotos(prev => prev.map(p =>
        p.id === photo.id
          ? {
              ...p,
              file: compressedFile,
              dimensions,
              progress: 30
            }
          : p
      ))

      // Upload to server
      await uploadPhotoToServer(photo.id, compressedFile)

    } catch (error) {
      console.error('Error processing photo:', error)
      setPhotos(prev => prev.map(p =>
        p.id === photo.id
          ? {
              ...p,
              status: 'error',
              error: 'Error al procesar la imagen',
              progress: 0
            }
          : p
      ))
    }
  }, [uploadPhotoToServer])

  // File selection handler
  const handleFileSelect = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const remainingSlots = maxFiles - photos.length

    if (fileArray.length > remainingSlots) {
      alert(`Solo puedes subir ${remainingSlots} fotos más. Máximo ${maxFiles} fotos permitidas.`)
      return
    }

    const newPhotos: UploadedPhoto[] = []

    for (const file of fileArray) {
      // Validate file
      const validation = validateFile(file)
      if (!validation.isValid) {
        alert(validation.error)
        continue
      }

      // Create preview
      const preview = URL.createObjectURL(file)

      // Create photo object
      const photo: UploadedPhoto = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        file,
        preview,
        status: 'uploading',
        progress: 0
      }

      newPhotos.push(photo)
    }

    if (newPhotos.length > 0) {
      setPhotos(prev => [...prev, ...newPhotos])

      // Process each photo
      for (const photo of newPhotos) {
        await processPhoto(photo)
      }
    }
  }, [photos.length, maxFiles, processPhoto])

  // Remove photo
  const removePhoto = useCallback((photoId: string) => {
    setPhotos(prev => {
      const photoToRemove = prev.find(p => p.id === photoId)
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.preview)
      }
      return prev.filter(p => p.id !== photoId)
    })
  }, [])

  // Reorder photos functionality - currently not used but available for future implementation
  // const reorderPhotos = useCallback((fromIndex: number, toIndex: number) => {
  //   setPhotos(prev => {
  //     const newPhotos = [...prev]
  //     const [movedPhoto] = newPhotos.splice(fromIndex, 1)
  //     newPhotos.splice(toIndex, 0, movedPhoto)
  //     return newPhotos
  //   })
  // }, [])

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragOver(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    dragCounter.current = 0

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }, [handleFileSelect])

  // File input click handler
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      handleFileSelect(files)
    }
    // Reset input value to allow same file selection
    e.target.value = ''
  }, [handleFileSelect])

  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <motion.div
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${isDragOver
            ? 'border-blue-500 bg-blue-50'
            : photos.length >= maxFiles
              ? 'border-gray-200 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={photos.length >= maxFiles}
        />

        {photos.length >= maxFiles ? (
          <div className="text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Máximo de fotos alcanzado</p>
            <p className="text-sm text-gray-600">
              Has subido {photos.length} de {maxFiles} fotos permitidas
            </p>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isDragOver ? 'Suelta las fotos aquí' : 'Subir fotos del salón'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Arrastra y suelta hasta {maxFiles} fotos o{' '}
              <button
                onClick={openFileSelector}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                haz clic para seleccionar
              </button>
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <span>JPEG, PNG, WebP</span>
              <span>•</span>
              <span>Máx. {formatFileSize(MAX_FILE_SIZE)}</span>
              <span>•</span>
              <span>{photos.length}/{maxFiles} fotos</span>
            </div>
          </>
        )}
      </motion.div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-900">
              Fotos subidas ({photos.length})
            </h4>
            <p className="text-sm text-gray-500">
              Arrastra para reordenar
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {photos.map((photo, index) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  index={index}
                  onRemove={() => removePhoto(photo.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Upload Progress Summary */}
      {photos.some(p => p.status === 'uploading' || p.status === 'processing') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-sm font-medium text-blue-900">
              Procesando fotos...
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-700">
            {photos
              .filter(p => p.status === 'uploading' || p.status === 'processing')
              .map(photo => (
                <div key={photo.id} className="flex items-center space-x-2">
                  <div className="flex-1 bg-blue-200 rounded-full h-1">
                    <div
                      className="bg-blue-600 rounded-full h-1 transition-all duration-300"
                      style={{ width: `${photo.progress}%` }}
                    />
                  </div>
                  <span>{photo.progress}%</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Error Summary */}
      {photos.some(p => p.status === 'error') && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-900">
              Algunas fotos tuvieron errores
            </span>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {photos
              .filter(p => p.status === 'error')
              .map(photo => (
                <li key={photo.id}>
                  • {photo.file.name}: {photo.error}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Individual Photo Card Component
interface PhotoCardProps {
  photo: UploadedPhoto
  index: number
  onRemove: () => void
}

function PhotoCard({ photo, index, onRemove }: PhotoCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const getStatusIcon = () => {
    switch (photo.status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
      case 'completed':
        return <Check className="w-4 h-4 text-green-600" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />
    }
  }

  const getStatusColor = () => {
    switch (photo.status) {
      case 'uploading':
      case 'processing':
        return 'border-blue-200 bg-blue-50'
      case 'completed':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`
        relative group rounded-lg border-2 overflow-hidden transition-all duration-200
        ${getStatusColor()}
        ${isDragging ? 'shadow-lg scale-105 z-10' : ''}
      `}
      draggable
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
    >
      {/* Image */}
      <div className="relative aspect-square">
        <Image
          src={photo.preview}
          alt={`Foto ${index + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
            <button
              onClick={() => setShowPreview(true)}
              className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200"
              title="Ver imagen completa"
            >
              <Eye className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={onRemove}
              className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200"
              title="Eliminar foto"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>

        {/* Drag Handle */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <GripVertical className="w-4 h-4 text-white drop-shadow-sm cursor-move" />
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <div className="p-1 bg-white bg-opacity-90 rounded-full">
            {getStatusIcon()}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-2">
        <p className="text-xs font-medium text-gray-900 truncate">
          {photo.file.name}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
          <span>{formatFileSize(photo.file.size)}</span>
          {photo.dimensions && (
            <span>{photo.dimensions.width} × {photo.dimensions.height}</span>
          )}
        </div>

        {/* Progress Bar */}
        {(photo.status === 'uploading' || photo.status === 'processing') && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>
                {photo.status === 'uploading' ? 'Subiendo...' : 'Procesando...'}
              </span>
              <span>{photo.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-blue-600 rounded-full h-1 transition-all duration-300"
                style={{ width: `${photo.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {photo.status === 'error' && photo.error && (
          <p className="text-xs text-red-600 mt-1 break-words">
            {photo.error}
          </p>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <div className="relative max-w-full max-h-full">
              <Image
                src={photo.preview}
                alt={`Vista previa de ${photo.file.name}`}
                width={800}
                height={600}
                className="object-contain"
              />
            </div>
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}