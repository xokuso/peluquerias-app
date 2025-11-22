'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Plus,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Send,
  Paperclip,
  Download,
  User,
  Headphones,
  Zap,
  Star,
  ArrowUp,
  AlertTriangle,
  MessageCircle,
  FileText,
  X,
  Calendar,
  Tag,
  Eye,
  Hash,
  Sparkles,
  Activity,
  Timer
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type {
  SupportTicket,
  TicketMessage
} from '@/types'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const slideInFromRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
}

// Loading skeleton component
const LoadingSkeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-neutral-200 to-neutral-300 rounded-lg ${className}`} />
)

// Support metrics component
interface SupportMetricsProps {
  stats: {
    averageResponseTime: number
    totalTickets: number
    resolvedToday: number
    satisfaction: number
  }
}

const SupportMetrics: React.FC<SupportMetricsProps> = ({ stats }) => (
  <motion.div
    variants={fadeInUp}
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
  >
    <div className="bg-white rounded-xl p-6 border border-neutral-200 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-neutral-600 mb-1">Tiempo de Respuesta</p>
          <p className="text-2xl font-bold text-neutral-900">{stats.averageResponseTime}h</p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
          <Timer className="w-6 h-6 text-blue-600" />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <ArrowUp className="w-4 h-4 text-green-600" />
        <span className="text-green-600">15% más rápido</span>
        <span className="text-neutral-500">que el mes pasado</span>
      </div>
    </div>

    <div className="bg-white rounded-xl p-6 border border-neutral-200 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-neutral-600 mb-1">Tickets Totales</p>
          <p className="text-2xl font-bold text-neutral-900">{stats.totalTickets}</p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-purple-600" />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-neutral-500">3 activos</span>
      </div>
    </div>

    <div className="bg-white rounded-xl p-6 border border-neutral-200 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-neutral-600 mb-1">Resueltos Hoy</p>
          <p className="text-2xl font-bold text-neutral-900">{stats.resolvedToday}</p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-green-600">Excelente</span>
        <span className="text-neutral-500">respuesta</span>
      </div>
    </div>

    <div className="bg-white rounded-xl p-6 border border-neutral-200 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-neutral-600 mb-1">Satisfacción</p>
          <p className="text-2xl font-bold text-neutral-900">{stats.satisfaction}%</p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
          <Star className="w-6 h-6 text-yellow-600" />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${i < 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
          ))}
        </span>
      </div>
    </div>
  </motion.div>
)

// Ticket status component
const TicketStatusBadge: React.FC<{ status: SupportTicket['status'] }> = ({ status }) => {
  const getStatusConfig = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return {
        bg: '#FEF3C7',
        text: '#92400E',
        border: '#F59E0B',
        icon: <AlertCircle className="w-3 h-3" />,
        label: 'Abierto'
      }
      case 'in_progress': return {
        bg: '#DBEAFE',
        text: '#1E40AF',
        border: '#3B82F6',
        icon: <Clock className="w-3 h-3" />,
        label: 'En Progreso'
      }
      case 'resolved': return {
        bg: '#D1FAE5',
        text: '#065F46',
        border: '#10B981',
        icon: <CheckCircle className="w-3 h-3" />,
        label: 'Resuelto'
      }
      case 'closed': return {
        bg: '#F3F4F6',
        text: '#374151',
        border: '#9CA3AF',
        icon: <XCircle className="w-3 h-3" />,
        label: 'Cerrado'
      }
      default: return {
        bg: '#F3F4F6',
        text: '#374151',
        border: '#9CA3AF',
        icon: <AlertCircle className="w-3 h-3" />,
        label: 'Desconocido'
      }
    }
  }

  const config = getStatusConfig(status)

  return (
    <div
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border"
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border + '40'
      }}
    >
      {config.icon}
      {config.label}
    </div>
  )
}

// Priority badge component
const PriorityBadge: React.FC<{ priority: SupportTicket['priority'] }> = ({ priority }) => {
  const getPriorityConfig = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'urgent': return {
        bg: '#FEE2E2',
        text: '#DC2626',
        border: '#EF4444',
        icon: <AlertTriangle className="w-3 h-3" />,
        label: 'Urgente'
      }
      case 'high': return {
        bg: '#FEF3C7',
        text: '#D97706',
        border: '#F59E0B',
        icon: <ArrowUp className="w-3 h-3" />,
        label: 'Alta'
      }
      case 'medium': return {
        bg: '#DBEAFE',
        text: '#2563EB',
        border: '#3B82F6',
        icon: <Hash className="w-3 h-3" />,
        label: 'Media'
      }
      case 'low': return {
        bg: '#D1FAE5',
        text: '#059669',
        border: '#10B981',
        icon: <Hash className="w-3 h-3" />,
        label: 'Baja'
      }
      default: return {
        bg: '#F3F4F6',
        text: '#374151',
        border: '#9CA3AF',
        icon: <Hash className="w-3 h-3" />,
        label: 'Media'
      }
    }
  }

  const config = getPriorityConfig(priority)

  return (
    <div
      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border"
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border + '40'
      }}
    >
      {config.icon}
      {config.label}
    </div>
  )
}

// Category badge component
const CategoryBadge: React.FC<{ category: SupportTicket['category'] }> = ({ category }) => {
  const getCategoryConfig = (category: SupportTicket['category']) => {
    switch (category) {
      case 'technical': return { icon: <Zap className="w-3 h-3" />, label: 'Técnico', color: '#6366F1' }
      case 'design': return { icon: <Sparkles className="w-3 h-3" />, label: 'Diseño', color: '#EC4899' }
      case 'content': return { icon: <FileText className="w-3 h-3" />, label: 'Contenido', color: '#10B981' }
      case 'billing': return { icon: <Activity className="w-3 h-3" />, label: 'Facturación', color: '#F59E0B' }
      case 'general': return { icon: <MessageCircle className="w-3 h-3" />, label: 'General', color: '#6B7280' }
      default: return { icon: <Tag className="w-3 h-3" />, label: 'General', color: '#6B7280' }
    }
  }

  const config = getCategoryConfig(category)

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
      {React.cloneElement(config.icon, { style: { color: config.color } })}
      {config.label}
    </div>
  )
}

// Ticket card component
const TicketCard: React.FC<{
  ticket: SupportTicket
  delay?: number
  onClick: (ticket: SupportTicket) => void
}> = ({ ticket, delay = 0, onClick }) => (
  <motion.div
    variants={fadeInUp}
    transition={{ delay }}
    className="bg-white rounded-xl p-6 border border-neutral-200 hover:shadow-lg hover:border-neutral-300 transition-all duration-300 cursor-pointer group"
    onClick={() => onClick(ticket)}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors truncate">
            {ticket.title}
          </h3>
          <span className="text-sm text-neutral-500 flex-shrink-0">#{ticket.id}</span>
        </div>
        <p className="text-sm text-neutral-600 line-clamp-2 mb-3">{ticket.description}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <TicketStatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          <CategoryBadge category={ticket.category} />
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        {ticket.messages.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <MessageSquare className="w-3 h-3" />
            <span>{ticket.messages.length}</span>
          </div>
        )}
        {ticket.attachments.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <Paperclip className="w-3 h-3" />
            <span>{ticket.attachments.length}</span>
          </div>
        )}
      </div>
    </div>

    <div className="flex items-center justify-between text-sm text-neutral-500">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{new Date(ticket.createdAt).toLocaleDateString('es-ES')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{new Date(ticket.updatedAt).toLocaleDateString('es-ES')}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Eye className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">Ver detalles</span>
      </div>
    </div>
  </motion.div>
)

// Live chat/messaging component
const LiveChat: React.FC<{
  ticket: SupportTicket
  onClose: () => void
  onSendMessage: (message: string, attachments?: File[]) => void
}> = ({ ticket, onClose, onSendMessage }) => {
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSend = () => {
    if (message.trim() || files.length > 0) {
      onSendMessage(message, files)
      setMessage('')
      setFiles([])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ticket.messages])

  return (
    <motion.div
      variants={slideInFromRight}
      className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-neutral-200 shadow-xl z-50 flex flex-col"
    >
      {/* Chat header */}
      <div className="p-4 border-b border-neutral-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-neutral-900">{ticket.title}</h3>
            <p className="text-sm text-neutral-600">Ticket #{ticket.id}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <TicketStatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {ticket.messages.map((msg, index) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex gap-3 ${msg.authorType === 'client' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.authorType === 'client' ? 'bg-blue-100' : 'bg-green-100'
            }`}>
              {msg.authorType === 'client' ? (
                <User className={`w-4 h-4 text-blue-600`} />
              ) : (
                <Headphones className={`w-4 h-4 text-green-600`} />
              )}
            </div>
            <div className={`flex-1 max-w-xs ${msg.authorType === 'client' ? 'text-right' : ''}`}>
              <div className="text-xs text-neutral-500 mb-1">
                {msg.authorName} • {new Date(msg.createdAt).toLocaleString('es-ES')}
              </div>
              <div className={`rounded-lg p-3 ${
                msg.authorType === 'client'
                  ? 'bg-blue-600 text-white ml-auto'
                  : 'bg-neutral-100 text-neutral-900'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {msg.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center gap-2 text-xs">
                        <Paperclip className="w-3 h-3" />
                        <span className="truncate">{attachment.fileName}</span>
                        <Download className="w-3 h-3 cursor-pointer hover:text-blue-200" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat input */}
      <div className="p-4 border-t border-neutral-200 bg-white">
        {files.length > 0 && (
          <div className="mb-3 space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-neutral-50 rounded-lg">
                <FileText className="w-4 h-4 text-neutral-500" />
                <span className="text-sm text-neutral-700 flex-1 truncate">{file.name}</span>
                <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="w-full p-3 border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSend}
              disabled={!message.trim() && files.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
      </div>
    </motion.div>
  )
}

// New ticket form component
const NewTicketForm: React.FC<{
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    title: string
    description: string
    priority: SupportTicket['priority']
    category: SupportTicket['category']
    attachments: File[]
  }) => void
}> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as SupportTicket['priority'],
    category: 'general' as SupportTicket['category']
  })
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ ...formData, attachments: files })
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      category: 'general'
    })
    setFiles([])
    onClose()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-900">Crear Nuevo Ticket</h2>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Título del Ticket
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe brevemente tu consulta"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                    placeholder="Explica con detalle tu consulta o problema"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Prioridad
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as SupportTicket['priority'] })}
                      className="w-full p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Categoría
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as SupportTicket['category'] })}
                      className="w-full p-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="general">General</option>
                      <option value="technical">Técnico</option>
                      <option value="design">Diseño</option>
                      <option value="content">Contenido</option>
                      <option value="billing">Facturación</option>
                    </select>
                  </div>
                </div>

                {/* File attachments */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Archivos Adjuntos
                  </label>
                  <div
                    className="w-full p-4 border-2 border-dashed border-neutral-200 rounded-lg text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
                    <p className="text-sm text-neutral-600">
                      Haz clic para subir archivos o arrástralos aquí
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Máximo 10MB por archivo. Formatos: JPG, PNG, PDF, DOC, TXT
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />

                  {files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-neutral-50 rounded-lg">
                          <FileText className="w-4 h-4 text-neutral-500" />
                          <span className="text-sm text-neutral-700 flex-1 truncate">{file.name}</span>
                          <span className="text-xs text-neutral-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Crear Ticket
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Main support page component
export default function SupportPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [showNewTicketForm, setShowNewTicketForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const supportStats = {
    averageResponseTime: 4,
    totalTickets: 12,
    resolvedToday: 3,
    satisfaction: 98
  }

  useEffect(() => {
    const loadSupportData = async () => {
      // Simulate API loading
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Mock data for support tickets
      const mockTickets: SupportTicket[] = [
        {
          id: 'TICK-001',
          title: 'Cambio en el color del logo principal',
          description: 'Me gustaría cambiar el color principal del logo a un tono más dorado que refleje mejor la elegancia del salón. También necesito que sea más visible en el header.',
          status: 'in_progress',
          priority: 'medium',
          category: 'design',
          userId: session?.user?.id || '',
          assignedTo: 'sandra.garcia',
          createdAt: new Date('2024-11-12'),
          updatedAt: new Date('2024-11-14'),
          messages: [
            {
              id: 'MSG-001',
              ticketId: 'TICK-001',
              message: 'Hola! Me gustaría cambiar el color principal del logo a un tono más dorado que refleje mejor la elegancia del salón.',
              isInternal: false,
              authorId: session?.user?.id || '',
              authorName: session?.user?.name || 'Cliente',
              authorType: 'client',
              createdAt: new Date('2024-11-12T10:30:00'),
              attachments: []
            },
            {
              id: 'MSG-002',
              ticketId: 'TICK-001',
              message: '¡Perfecto! Entiendo que quieres un tono dorado más elegante. Te he preparado algunas opciones de color. ¿Podrías decirme si tienes algún color dorado específico en mente o prefieres que te sugiera algunas opciones?',
              isInternal: false,
              authorId: 'sandra.garcia',
              authorName: 'Sandra García',
              authorType: 'staff',
              createdAt: new Date('2024-11-12T14:20:00'),
              attachments: []
            },
            {
              id: 'MSG-003',
              ticketId: 'TICK-001',
              message: 'Me gustaría ver las opciones que me sugieras. Prefiero algo elegante pero que no sea demasiado llamativo.',
              isInternal: false,
              authorId: session?.user?.id || '',
              authorName: session?.user?.name || 'Cliente',
              authorType: 'client',
              createdAt: new Date('2024-11-13T09:15:00'),
              attachments: []
            },
            {
              id: 'MSG-004',
              ticketId: 'TICK-001',
              message: 'Perfecto, he creado tres variaciones con diferentes tonos dorados. Te las envío en un mockup para que puedas ver cómo quedaría en tu página. ¿Cuál te gusta más?',
              isInternal: false,
              authorId: 'sandra.garcia',
              authorName: 'Sandra García',
              authorType: 'staff',
              createdAt: new Date('2024-11-14T11:30:00'),
              attachments: [
                {
                  id: 'ATT-001',
                  fileName: 'logo-opciones-dorado.pdf',
                  fileSize: 2048000,
                  fileType: 'application/pdf',
                  url: '/attachments/logo-opciones-dorado.pdf',
                  uploadedAt: new Date('2024-11-14T11:30:00'),
                  uploadedBy: 'sandra.garcia'
                }
              ]
            }
          ],
          attachments: [
            {
              id: 'ATT-001',
              fileName: 'logo-opciones-dorado.pdf',
              fileSize: 2048000,
              fileType: 'application/pdf',
              url: '/attachments/logo-opciones-dorado.pdf',
              uploadedAt: new Date('2024-11-14T11:30:00'),
              uploadedBy: 'sandra.garcia'
            }
          ]
        },
        {
          id: 'TICK-002',
          title: 'Problema con el formulario de contacto',
          description: 'El formulario de contacto no está enviando los mensajes correctamente. Los clientes se quejan de que no reciben confirmación.',
          status: 'open',
          priority: 'high',
          category: 'technical',
          userId: session?.user?.id || '',
          createdAt: new Date('2024-11-14'),
          updatedAt: new Date('2024-11-14'),
          messages: [
            {
              id: 'MSG-005',
              ticketId: 'TICK-002',
              message: 'Hola, tengo un problema con el formulario de contacto. Los clientes me dicen que no reciben confirmación cuando envían un mensaje.',
              isInternal: false,
              authorId: session?.user?.id || '',
              authorName: session?.user?.name || 'Cliente',
              authorType: 'client',
              createdAt: new Date('2024-11-14T16:45:00'),
              attachments: []
            }
          ],
          attachments: []
        },
        {
          id: 'TICK-003',
          title: 'Solicitud de nueva sección de servicios',
          description: 'Me gustaría añadir una nueva sección que muestre todos nuestros servicios con precios y descripciones detalladas.',
          status: 'resolved',
          priority: 'low',
          category: 'content',
          userId: session?.user?.id || '',
          assignedTo: 'carlos.dev',
          createdAt: new Date('2024-11-10'),
          updatedAt: new Date('2024-11-13'),
          resolvedAt: new Date('2024-11-13'),
          messages: [
            {
              id: 'MSG-006',
              ticketId: 'TICK-003',
              message: 'Quiero añadir una sección de servicios más detallada con precios.',
              isInternal: false,
              authorId: session?.user?.id || '',
              authorName: session?.user?.name || 'Cliente',
              authorType: 'client',
              createdAt: new Date('2024-11-10T10:00:00'),
              attachments: []
            },
            {
              id: 'MSG-007',
              ticketId: 'TICK-003',
              message: 'Perfecto, he añadido la nueva sección de servicios con un diseño elegante que incluye precios, descripciones y un botón de reserva. ¡Ya está publicado!',
              isInternal: false,
              authorId: 'carlos.dev',
              authorName: 'Carlos Desarrollador',
              authorType: 'staff',
              createdAt: new Date('2024-11-13T14:30:00'),
              attachments: []
            }
          ],
          attachments: []
        },
        {
          id: 'TICK-004',
          title: 'Actualización de horarios de apertura',
          description: 'Necesito cambiar los horarios que aparecen en la web porque hemos ampliado el horario de los sábados.',
          status: 'closed',
          priority: 'medium',
          category: 'content',
          userId: session?.user?.id || '',
          assignedTo: 'ana.content',
          createdAt: new Date('2024-11-08'),
          updatedAt: new Date('2024-11-09'),
          resolvedAt: new Date('2024-11-09'),
          messages: [
            {
              id: 'MSG-008',
              ticketId: 'TICK-004',
              message: 'Hola, necesito actualizar los horarios porque ahora abrimos los sábados hasta las 20:00 en lugar de hasta las 18:00.',
              isInternal: false,
              authorId: session?.user?.id || '',
              authorName: session?.user?.name || 'Cliente',
              authorType: 'client',
              createdAt: new Date('2024-11-08T09:30:00'),
              attachments: []
            },
            {
              id: 'MSG-009',
              ticketId: 'TICK-004',
              message: 'Perfecto, ya he actualizado los horarios en toda la web incluyendo footer, página de contacto y header. Los nuevos horarios ya están visibles.',
              isInternal: false,
              authorId: 'ana.content',
              authorName: 'Ana Contenido',
              authorType: 'staff',
              createdAt: new Date('2024-11-09T11:00:00'),
              attachments: []
            }
          ],
          attachments: []
        }
      ]

      setTickets(mockTickets)
      setFilteredTickets(mockTickets)
      setLoading(false)
    }

    if (session) {
      loadSupportData()
    }
  }, [session])

  // Filter tickets based on search and filters
  useEffect(() => {
    let filtered = tickets

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === filterStatus)
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === filterPriority)
    }

    setFilteredTickets(filtered)
  }, [tickets, searchTerm, filterStatus, filterPriority])

  const handleCreateTicket = (data: {
    title: string
    description: string
    priority: SupportTicket['priority']
    category: SupportTicket['category']
    attachments: File[]
  }) => {
    const newTicket: SupportTicket = {
      id: `TICK-${String(tickets.length + 1).padStart(3, '0')}`,
      title: data.title,
      description: data.description,
      status: 'open',
      priority: data.priority,
      category: data.category,
      userId: session?.user?.id || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [
        {
          id: `MSG-${Date.now()}`,
          ticketId: `TICK-${String(tickets.length + 1).padStart(3, '0')}`,
          message: data.description,
          isInternal: false,
          authorId: session?.user?.id || '',
          authorName: session?.user?.name || 'Cliente',
          authorType: 'client',
          createdAt: new Date(),
          attachments: data.attachments.map((file, index) => ({
            id: `ATT-${Date.now()}-${index}`,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            url: URL.createObjectURL(file),
            uploadedAt: new Date(),
            uploadedBy: session?.user?.id || ''
          }))
        }
      ],
      attachments: data.attachments.map((file, index) => ({
        id: `ATT-${Date.now()}-${index}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        url: URL.createObjectURL(file),
        uploadedAt: new Date(),
        uploadedBy: session?.user?.id || ''
      }))
    }

    setTickets([newTicket, ...tickets])
  }

  const handleSendMessage = (message: string, attachments: File[] = []) => {
    if (!selectedTicket) return

    const newMessage: TicketMessage = {
      id: `MSG-${Date.now()}`,
      ticketId: selectedTicket.id,
      message,
      isInternal: false,
      authorId: session?.user?.id || '',
      authorName: session?.user?.name || 'Cliente',
      authorType: 'client',
      createdAt: new Date(),
      attachments: attachments.map((file, index) => ({
        id: `ATT-${Date.now()}-${index}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        url: URL.createObjectURL(file),
        uploadedAt: new Date(),
        uploadedBy: session?.user?.id || ''
      }))
    }

    const updatedTicket = {
      ...selectedTicket,
      messages: [...selectedTicket.messages, newMessage],
      updatedAt: new Date(),
      status: 'open' as const // Reopen ticket when client sends new message
    }

    setSelectedTicket(updatedTicket)
    setTickets(tickets.map(ticket =>
      ticket.id === selectedTicket.id ? updatedTicket : ticket
    ))

    // Simulate support team response after a delay
    setTimeout(() => {
      const responses = [
        "Gracias por tu mensaje. Nuestro equipo está revisando tu consulta y te responderemos lo antes posible.",
        "Hemos recibido tu mensaje. Un especialista de nuestro equipo te contactará en las próximas horas.",
        "Perfecto, entendemos tu solicitud. Estamos trabajando en ello y te mantendremos informado del progreso."
      ]

      const supportResponse: TicketMessage = {
        id: `MSG-${Date.now() + 1}`,
        ticketId: selectedTicket.id,
        message: responses[Math.floor(Math.random() * responses.length)] || "Gracias por tu mensaje. Te responderemos pronto.",
        isInternal: false,
        authorId: 'support-team',
        authorName: 'Equipo de Soporte',
        authorType: 'staff',
        createdAt: new Date(Date.now() + 1000),
        attachments: []
      }

      const responseTicket = {
        ...updatedTicket,
        messages: [...updatedTicket.messages, supportResponse],
        status: 'in_progress' as const,
        updatedAt: new Date(Date.now() + 1000)
      }

      setSelectedTicket(responseTicket)
      setTickets(tickets => tickets.map(ticket =>
        ticket.id === selectedTicket.id ? responseTicket : ticket
      ))
    }, 2000)
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <LoadingSkeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <LoadingSkeleton key={i} className="h-32 w-full" />
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
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Centro de Soporte
          </h1>
          <p className="text-neutral-600">
            Gestiona tus consultas y obtén ayuda de nuestro equipo especializado
          </p>
        </div>
        <Button
          onClick={() => setShowNewTicketForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Ticket
        </Button>
      </motion.div>

      {/* Support metrics */}
      <SupportMetrics stats={supportStats} />

      {/* Search and filters */}
      <motion.div
        variants={fadeInUp}
        className="bg-white rounded-xl p-6 border border-neutral-200"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar tickets por título, descripción o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="open">Abierto</option>
              <option value="in_progress">En Progreso</option>
              <option value="resolved">Resuelto</option>
              <option value="closed">Cerrado</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las prioridades</option>
              <option value="urgent">Urgente</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </div>
        </div>

        {/* Results summary */}
        <div className="mt-4 text-sm text-neutral-600">
          Mostrando {filteredTickets.length} de {tickets.length} tickets
        </div>
      </motion.div>

      {/* Tickets list */}
      <motion.div
        variants={staggerChildren}
        className="space-y-4"
      >
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket, index) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              delay={index * 0.1}
              onClick={setSelectedTicket}
            />
          ))
        ) : (
          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-xl p-12 border border-neutral-200 text-center"
          >
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                ? 'No se encontraron tickets'
                : 'No tienes tickets de soporte'
              }
            </h3>
            <p className="text-neutral-600 mb-6">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                ? 'Intenta cambiar los filtros o el término de búsqueda'
                : 'Crea tu primer ticket para obtener ayuda de nuestro equipo'
              }
            </p>
            {(!searchTerm && filterStatus === 'all' && filterPriority === 'all') && (
              <Button
                onClick={() => setShowNewTicketForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear tu primer ticket
              </Button>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Live chat sidebar */}
      <AnimatePresence>
        {selectedTicket && (
          <LiveChat
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
            onSendMessage={handleSendMessage}
          />
        )}
      </AnimatePresence>

      {/* New ticket form modal */}
      <NewTicketForm
        isOpen={showNewTicketForm}
        onClose={() => setShowNewTicketForm(false)}
        onSubmit={handleCreateTicket}
      />

      {/* Click outside overlay for chat */}
      {selectedTicket && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setSelectedTicket(null)}
        />
      )}
    </motion.div>
  )
}