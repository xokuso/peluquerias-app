'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  Search,
  Filter,
  FileText,
  Image as ImageIcon,
  Video,
  FileCode,
  FileArchive,
  Eye,
  HardDrive,
  CheckSquare,
  Square,
  X,
  ArrowDown,
  Clock,
  TrendingUp,
  FolderOpen,
  Grid3x3,
  List,
  Package,
  Sparkles,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import type { ProjectFile } from '@/types'

// Extended file interface for downloads
interface DownloadFile extends ProjectFile {
  downloadCount: number
  lastDownloaded?: Date
  isNew?: boolean
  thumbnailUrl?: string
  metadata?: {
    dimensions?: string
    duration?: string
    version?: string
    createdBy?: string
    tags?: string[]
  }
}

// Download history interface
interface DownloadHistory {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  downloadedAt: Date
  ipAddress?: string
}

// Download stats interface
interface DownloadStats {
  totalFiles: number
  totalDownloads: number
  totalSize: number
  mostDownloaded: string
  recentDownloads: number
  storageUsed: number
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
}

// File type configurations
const fileTypeConfig = {
  image: {
    icon: ImageIcon,
    color: '#10B981',
    bgColor: '#D1FAE5',
    extensions: ['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif']
  },
  video: {
    icon: Video,
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    extensions: ['mp4', 'avi', 'mov', 'webm', 'mkv']
  },
  document: {
    icon: FileText,
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf']
  },
  code: {
    icon: FileCode,
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    extensions: ['html', 'css', 'js', 'ts', 'json', 'xml']
  },
  other: {
    icon: FileArchive,
    color: '#6B7280',
    bgColor: '#F3F4F6',
    extensions: ['zip', 'rar', 'tar', 'gz']
  }
}

// Helper functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || ''
}

const getFileTypeConfig = (filename: string) => {
  const ext = getFileExtension(filename)
  for (const [type, config] of Object.entries(fileTypeConfig)) {
    if (config.extensions.includes(ext)) {
      return { type, ...config }
    }
  }
  return { type: 'other', ...fileTypeConfig.other }
}

// Loading skeleton component
const LoadingSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-gradient-to-r from-neutral-200 to-neutral-300 rounded-lg ${className}`} />
)

// File preview modal component
const FilePreviewModal: React.FC<{
  file: DownloadFile | null
  onClose: () => void
}> = ({ file, onClose }) => {
  if (!file) return null

  const fileConfig = getFileTypeConfig(file.name)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: fileConfig.bgColor }}
              >
                <fileConfig.icon className="w-5 h-5" style={{ color: fileConfig.color }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{file.name}</h3>
                <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-6">
            {fileConfig.type === 'image' && file.url && (
              <div className="text-center">
                <div className="relative mx-auto max-w-full max-h-96 rounded-lg shadow-lg overflow-hidden">
                  <Image
                    src={file.url}
                    alt={file.name}
                    width={800}
                    height={600}
                    className="object-contain"
                    style={{ maxHeight: '24rem' }}
                  />
                </div>
              </div>
            )}

            {fileConfig.type !== 'image' && (
              <div className="text-center py-12">
                <fileConfig.icon className="w-24 h-24 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Previsualización no disponible</h3>
                <p className="text-gray-600 mb-6">
                  Este tipo de archivo no se puede previsualizar en el navegador
                </p>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Descargar archivo
                </Button>
              </div>
            )}

            {file.description && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                <p className="text-gray-700 text-sm">{file.description}</p>
              </div>
            )}

            {file.metadata && (
              <div className="mt-6 grid grid-cols-2 gap-4">
                {file.metadata.dimensions && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Dimensiones:</span>
                    <span className="text-sm text-gray-900 ml-2">{file.metadata.dimensions}</span>
                  </div>
                )}
                {file.metadata.createdBy && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Creado por:</span>
                    <span className="text-sm text-gray-900 ml-2">{file.metadata.createdBy}</span>
                  </div>
                )}
                {file.metadata.version && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Versión:</span>
                    <span className="text-sm text-gray-900 ml-2">{file.metadata.version}</span>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-600">Subido:</span>
                  <span className="text-sm text-gray-900 ml-2">
                    {new Date(file.uploadedAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-6 bg-gray-50 border-t">
            <div className="text-sm text-gray-600">
              Descargado {file.downloadCount} veces
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir en nueva pestaña
              </Button>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// File card component
const FileCard: React.FC<{
  file: DownloadFile
  isSelected: boolean
  onSelect: (selected: boolean) => void
  onPreview: () => void
  delay?: number
  viewMode: 'grid' | 'list'
}> = ({ file, isSelected, onSelect, onPreview, delay = 0, viewMode }) => {
  const fileConfig = getFileTypeConfig(file.name)

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Simulate download
    console.log('Downloading:', file.name)
  }

  if (viewMode === 'list') {
    return (
      <motion.div
        variants={fadeInUp}
        transition={{ delay }}
        className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer"
        onClick={onPreview}
      >
        <Button
          variant="ghost"
          size="sm"
          className="p-1"
          onClick={(e) => {
            e.stopPropagation()
            onSelect(!isSelected)
          }}
        >
          {isSelected ? (
            <CheckSquare className="w-4 h-4 text-blue-600" />
          ) : (
            <Square className="w-4 h-4 text-gray-400" />
          )}
        </Button>

        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: fileConfig.bgColor }}
        >
          <fileConfig.icon className="w-5 h-5" style={{ color: fileConfig.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate">{file.name}</h3>
            {file.isNew && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                Nuevo
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{file.category}</p>
        </div>

        <div className="text-sm text-gray-600 hidden sm:block">
          {formatFileSize(file.size)}
        </div>

        <div className="text-sm text-gray-600 hidden md:block">
          {new Date(file.uploadedAt).toLocaleDateString('es-ES')}
        </div>

        <div className="text-sm text-gray-600 hidden lg:block">
          {file.downloadCount} descargas
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onPreview()
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={fadeInUp}
      transition={{ delay }}
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group relative"
      onClick={onPreview}
    >
      {file.isNew && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            Nuevo
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          className="p-1 -mt-1 -ml-1"
          onClick={(e) => {
            e.stopPropagation()
            onSelect(!isSelected)
          }}
        >
          {isSelected ? (
            <CheckSquare className="w-5 h-5 text-blue-600" />
          ) : (
            <Square className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          )}
        </Button>
      </div>

      <div className="text-center mb-4">
        {file.thumbnailUrl ? (
          <div className="w-16 h-16 mx-auto rounded-lg overflow-hidden">
            <Image
              src={file.thumbnailUrl}
              alt={file.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center"
            style={{ backgroundColor: fileConfig.bgColor }}
          >
            <fileConfig.icon className="w-8 h-8" style={{ color: fileConfig.color }} />
          </div>
        )}
      </div>

      <div className="text-center mb-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate" title={file.name}>
          {file.name}
        </h3>
        <p className="text-xs text-gray-600 mb-1">{file.category}</p>
        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <span>{new Date(file.uploadedAt).toLocaleDateString('es-ES')}</span>
        <span>{file.downloadCount} descargas</span>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={(e) => {
            e.stopPropagation()
            onPreview()
          }}
        >
          <Eye className="w-4 h-4 mr-1" />
          Ver
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4 mr-1" />
          Descargar
        </Button>
      </div>
    </motion.div>
  )
}

// Stats card component
const StatsCard: React.FC<{
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  trend?: { value: number; direction: 'up' | 'down' }
  delay?: number
}> = ({ title, value, icon, color, trend, delay = 0 }) => (
  <motion.div
    variants={fadeInUp}
    transition={{ delay }}
    className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        {React.cloneElement(icon as React.ReactElement, {
          className: 'w-6 h-6',
          style: { color }
        })}
      </div>
    </div>

    {trend && (
      <div className="flex items-center gap-2 text-sm">
        <TrendingUp
          className={`w-4 h-4 ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'} ${trend.direction === 'down' ? 'rotate-180' : ''}`}
        />
        <span className={trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}>
          {trend.value}%
        </span>
        <span className="text-gray-500">vs mes anterior</span>
      </div>
    )}
  </motion.div>
)

export default function DownloadsPage() {
  useSession() // Authentication check handled by layout
  const [loading, setLoading] = useState(true)
  const [files, setFiles] = useState<DownloadFile[]>([])
  const [stats, setStats] = useState<DownloadStats | null>(null)
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistory[]>([])
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'downloads'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [previewFile, setPreviewFile] = useState<DownloadFile | null>(null)

  useEffect(() => {
    const loadData = async () => {
      // Simulate API loading
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Mock data
      const mockFiles: DownloadFile[] = [
        {
          id: '1',
          name: 'logo-salon-principal.png',
          type: 'image' as const,
          size: 245760,
          url: '/api/files/logo-salon-principal.png',
          uploadedAt: new Date('2024-11-10'),
          category: 'Branding',
          description: 'Logo principal del salón en alta resolución',
          downloadCount: 24,
          lastDownloaded: new Date('2024-11-14'),
          isNew: true,
          thumbnailUrl: '/api/thumbnails/logo-salon.png',
          metadata: {
            dimensions: '1200x800',
            createdBy: 'Equipo de Diseño',
            version: 'v2.1',
            tags: ['logo', 'branding', 'principal']
          }
        },
        {
          id: '2',
          name: 'guia-de-marca.pdf',
          type: 'document' as const,
          size: 2097152,
          url: '/api/files/guia-de-marca.pdf',
          uploadedAt: new Date('2024-11-08'),
          category: 'Documentación',
          description: 'Guía completa de uso de la marca y elementos visuales',
          downloadCount: 12,
          lastDownloaded: new Date('2024-11-13'),
          metadata: {
            createdBy: 'Equipo de Diseño',
            version: 'v1.0'
          }
        },
        {
          id: '3',
          name: 'video-presentacion.mp4',
          type: 'video' as const,
          size: 52428800,
          url: '/api/files/video-presentacion.mp4',
          uploadedAt: new Date('2024-11-05'),
          category: 'Marketing',
          description: 'Video de presentación del salón para redes sociales',
          downloadCount: 8,
          lastDownloaded: new Date('2024-11-12'),
          metadata: {
            duration: '2:34',
            dimensions: '1920x1080',
            createdBy: 'Equipo de Marketing'
          }
        },
        {
          id: '4',
          name: 'iconos-servicios.zip',
          type: 'other' as const,
          size: 1048576,
          url: '/api/files/iconos-servicios.zip',
          uploadedAt: new Date('2024-11-03'),
          category: 'Recursos',
          description: 'Conjunto de iconos para todos los servicios del salón',
          downloadCount: 15,
          lastDownloaded: new Date('2024-11-11'),
          metadata: {
            createdBy: 'Equipo de Diseño',
            version: 'v1.2'
          }
        },
        {
          id: '5',
          name: 'paleta-colores.png',
          type: 'image' as const,
          size: 327680,
          url: '/api/files/paleta-colores.png',
          uploadedAt: new Date('2024-11-02'),
          category: 'Branding',
          description: 'Paleta de colores oficial del salón',
          downloadCount: 18,
          lastDownloaded: new Date('2024-11-10'),
          thumbnailUrl: '/api/thumbnails/paleta-colores.png',
          metadata: {
            dimensions: '800x600',
            createdBy: 'Equipo de Diseño'
          }
        },
        {
          id: '6',
          name: 'manual-usuario.pdf',
          type: 'document' as const,
          size: 3145728,
          url: '/api/files/manual-usuario.pdf',
          uploadedAt: new Date('2024-10-28'),
          category: 'Documentación',
          description: 'Manual de usuario para la gestión de la web',
          downloadCount: 7,
          lastDownloaded: new Date('2024-11-09'),
          metadata: {
            createdBy: 'Equipo Técnico',
            version: 'v1.1'
          }
        }
      ]

      const mockStats: DownloadStats = {
        totalFiles: mockFiles.length,
        totalDownloads: mockFiles.reduce((sum, file) => sum + file.downloadCount, 0),
        totalSize: mockFiles.reduce((sum, file) => sum + file.size, 0),
        mostDownloaded: 'logo-salon-principal.png',
        recentDownloads: 12,
        storageUsed: 75
      }

      const mockHistory: DownloadHistory[] = [
        {
          id: '1',
          fileName: 'logo-salon-principal.png',
          fileType: 'image',
          fileSize: 245760,
          downloadedAt: new Date('2024-11-14T10:30:00')
        },
        {
          id: '2',
          fileName: 'guia-de-marca.pdf',
          fileType: 'document',
          fileSize: 2097152,
          downloadedAt: new Date('2024-11-13T15:45:00')
        },
        {
          id: '3',
          fileName: 'video-presentacion.mp4',
          fileType: 'video',
          fileSize: 52428800,
          downloadedAt: new Date('2024-11-12T09:15:00')
        }
      ]

      setFiles(mockFiles)
      setStats(mockStats)
      setDownloadHistory(mockHistory)
      setLoading(false)
    }

    loadData()
  }, [])

  // Filter and sort files
  const filteredAndSortedFiles = useMemo(() => {
    const filtered = files.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           file.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || file.category === categoryFilter
      const matchesType = typeFilter === 'all' || getFileTypeConfig(file.name).type === typeFilter

      return matchesSearch && matchesCategory && matchesType
    })

    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'date':
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
          break
        case 'size':
          comparison = a.size - b.size
          break
        case 'downloads':
          comparison = a.downloadCount - b.downloadCount
          break
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })

    return filtered
  }, [files, searchTerm, categoryFilter, typeFilter, sortBy, sortOrder])

  // Get unique categories for filters
  const categories = useMemo(() => {
    const cats = new Set(files.map(file => file.category))
    return Array.from(cats)
  }, [files])

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedFiles.size === filteredAndSortedFiles.length) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(filteredAndSortedFiles.map(file => file.id)))
    }
  }

  const handleSelectFile = (fileId: string, selected: boolean) => {
    const newSelected = new Set(selectedFiles)
    if (selected) {
      newSelected.add(fileId)
    } else {
      newSelected.delete(fileId)
    }
    setSelectedFiles(newSelected)
  }

  const handleBulkDownload = () => {
    const selectedFilesList = files.filter(file => selectedFiles.has(file.id))
    console.log('Bulk downloading:', selectedFilesList.map(f => f.name))
    // Simulate bulk download
    setSelectedFiles(new Set())
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <LoadingSkeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <LoadingSkeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <LoadingSkeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerChildren}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        className="relative overflow-hidden rounded-2xl p-8"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white transform translate-x-32 -translate-y-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white transform -translate-x-16 translate-y-16" />
        </div>

        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Centro de Descargas</h1>
                <p className="text-purple-100 text-lg">
                  Accede a todos los recursos y archivos de tu proyecto
                </p>
              </div>
            </div>

            {stats && (
              <div className="flex flex-wrap gap-6 text-white">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  <span className="font-semibold">{stats.totalFiles}</span>
                  <span className="text-purple-100">archivos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  <span className="font-semibold">{stats.totalDownloads}</span>
                  <span className="text-purple-100">descargas</span>
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  <span className="font-semibold">{formatFileSize(stats.totalSize)}</span>
                  <span className="text-purple-100">total</span>
                </div>
              </div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="w-24 h-24 rounded-2xl bg-white bg-opacity-15 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      {stats && (
        <motion.div
          variants={staggerChildren}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatsCard
            title="Archivos Totales"
            value={stats.totalFiles}
            icon={<FolderOpen />}
            color="#8B5CF6"
            trend={{ value: 15, direction: 'up' }}
            delay={0}
          />
          <StatsCard
            title="Descargas Recientes"
            value={stats.recentDownloads}
            icon={<ArrowDown />}
            color="#10B981"
            trend={{ value: 8, direction: 'up' }}
            delay={0.1}
          />
          <StatsCard
            title="Más Descargado"
            value={stats.mostDownloaded}
            icon={<TrendingUp />}
            color="#F59E0B"
            delay={0.2}
          />
          <StatsCard
            title="Almacenamiento"
            value={`${stats.storageUsed}%`}
            icon={<HardDrive />}
            color="#EF4444"
            delay={0.3}
          />
        </motion.div>
      )}

      {/* Filters and Controls */}
      <motion.div
        variants={fadeInUp}
        className="bg-white rounded-xl p-6 border border-gray-200 space-y-4"
      >
        {/* Search and View Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar archivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Bulk Actions */}
            {selectedFiles.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedFiles.size} seleccionados
                </span>
                <Button
                  size="sm"
                  onClick={handleBulkDownload}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar seleccionados
                </Button>
              </div>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                className={`${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">Todos los tipos</option>
            <option value="image">Imágenes</option>
            <option value="document">Documentos</option>
            <option value="video">Videos</option>
            <option value="code">Código</option>
            <option value="other">Otros</option>
          </select>

          {/* Sort Options */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field as 'name' | 'date' | 'size' | 'downloads')
              setSortOrder(order as 'asc' | 'desc')
            }}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="date-desc">Más recientes</option>
            <option value="date-asc">Más antiguos</option>
            <option value="name-asc">Nombre A-Z</option>
            <option value="name-desc">Nombre Z-A</option>
            <option value="size-desc">Mayor tamaño</option>
            <option value="size-asc">Menor tamaño</option>
            <option value="downloads-desc">Más descargados</option>
            <option value="downloads-asc">Menos descargados</option>
          </select>

          {/* Select All */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="text-purple-600 hover:text-purple-700"
          >
            {selectedFiles.size === filteredAndSortedFiles.length ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Deseleccionar todo
              </>
            ) : (
              <>
                <CheckSquare className="w-4 h-4 mr-2" />
                Seleccionar todo
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Files Grid/List */}
      <motion.div
        variants={staggerChildren}
        className={viewMode === 'grid'
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-3"
        }
      >
        {filteredAndSortedFiles.map((file, index) => (
          <FileCard
            key={file.id}
            file={file}
            isSelected={selectedFiles.has(file.id)}
            onSelect={(selected) => handleSelectFile(file.id, selected)}
            onPreview={() => setPreviewFile(file)}
            delay={index * 0.05}
            viewMode={viewMode}
          />
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredAndSortedFiles.length === 0 && (
        <motion.div
          variants={fadeInUp}
          className="text-center py-12"
        >
          <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron archivos
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Los archivos de tu proyecto aparecerán aquí cuando estén disponibles'
            }
          </p>
          {(searchTerm || categoryFilter !== 'all' || typeFilter !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setCategoryFilter('all')
                setTypeFilter('all')
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </motion.div>
      )}

      {/* Download History */}
      {downloadHistory.length > 0 && (
        <motion.div
          variants={fadeInUp}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Historial de Descargas</h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {downloadHistory.slice(0, 5).map((download, index) => {
              const fileConfig = getFileTypeConfig(download.fileName)

              return (
                <motion.div
                  key={download.id}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: fileConfig.bgColor }}
                  >
                    <fileConfig.icon className="w-4 h-4" style={{ color: fileConfig.color }} />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{download.fileName}</h4>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(download.fileSize)} • {new Date(download.downloadedAt).toLocaleString('es-ES')}
                    </p>
                  </div>

                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </motion.div>
              )
            })}
          </div>

          {downloadHistory.length > 5 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button variant="outline" size="sm" className="w-full">
                Ver historial completo
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </motion.div>
  )
}