'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Video,
  Code,
  Users,
  Globe,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Project } from '@/types'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'files' | 'timeline'>('overview')

  useEffect(() => {
    const loadProject = async () => {
      // Mock data loading - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockProject: Project = {
        id: params.id as string,
        orderId: 'ORD-001',
        name: 'Mi Salón Elegante',
        status: 'development',
        progress: 65,
        domain: 'miSalonElegante.peluquerias.pro',
        template: 'Elegante Moderno',
        startDate: new Date('2024-01-01'),
        estimatedCompletion: new Date('2024-02-15'),
        lastUpdate: new Date('2024-01-15'),
        milestones: [
          {
            id: '1',
            title: 'Análisis y planificación',
            description: 'Análisis de requisitos, definición de objetivos y planificación detallada del proyecto',
            status: 'completed',
            dueDate: new Date('2024-01-05'),
            completedAt: new Date('2024-01-04'),
            order: 1
          },
          {
            id: '2',
            title: 'Diseño visual',
            description: 'Creación del diseño visual, paleta de colores, tipografías y wireframes',
            status: 'completed',
            dueDate: new Date('2024-01-12'),
            completedAt: new Date('2024-01-11'),
            order: 2
          },
          {
            id: '3',
            title: 'Desarrollo frontend',
            description: 'Implementación de la interfaz de usuario, componentes y funcionalidades',
            status: 'in_progress',
            dueDate: new Date('2024-01-25'),
            order: 3
          },
          {
            id: '4',
            title: 'Configuración de contenido',
            description: 'Carga de contenido, imágenes, textos y configuración de servicios',
            status: 'pending',
            dueDate: new Date('2024-02-05'),
            order: 4
          },
          {
            id: '5',
            title: 'Pruebas y optimización',
            description: 'Pruebas de funcionalidad, optimización de rendimiento y correcciones',
            status: 'pending',
            dueDate: new Date('2024-02-12'),
            order: 5
          },
          {
            id: '6',
            title: 'Lanzamiento',
            description: 'Configuración del dominio, SSL y puesta en producción',
            status: 'pending',
            dueDate: new Date('2024-02-15'),
            order: 6
          }
        ],
        files: [
          {
            id: '1',
            name: 'diseño-inicial-v1.pdf',
            type: 'design',
            size: 2048000,
            url: '/files/diseño-inicial-v1.pdf',
            uploadedAt: new Date('2024-01-11'),
            category: 'Diseño',
            description: 'Propuesta de diseño inicial con paleta de colores y tipografías'
          },
          {
            id: '2',
            name: 'wireframes-completos.pdf',
            type: 'design',
            size: 1536000,
            url: '/files/wireframes-completos.pdf',
            uploadedAt: new Date('2024-01-10'),
            category: 'Diseño',
            description: 'Wireframes detallados de todas las páginas'
          },
          {
            id: '3',
            name: 'logo-salon.png',
            type: 'image',
            size: 512000,
            url: '/files/logo-salon.png',
            uploadedAt: new Date('2024-01-08'),
            category: 'Branding',
            description: 'Logo principal del salón en alta resolución'
          },
          {
            id: '4',
            name: 'especificaciones-tecnicas.pdf',
            type: 'document',
            size: 256000,
            url: '/files/especificaciones-tecnicas.pdf',
            uploadedAt: new Date('2024-01-05'),
            category: 'Documentación',
            description: 'Especificaciones técnicas y requisitos del proyecto'
          }
        ],
        timeline: [
          {
            id: '1',
            title: 'Proyecto iniciado',
            description: 'El proyecto ha sido creado y asignado al equipo de desarrollo',
            type: 'milestone',
            date: new Date('2024-01-01'),
            author: 'Sistema'
          },
          {
            id: '2',
            title: 'Reunión inicial',
            description: 'Primera reunión con el cliente para definir objetivos y requisitos',
            type: 'meeting',
            date: new Date('2024-01-02'),
            author: 'Sandra García - Project Manager'
          },
          {
            id: '3',
            title: 'Análisis completado',
            description: 'Se ha finalizado el análisis de requisitos y la planificación del proyecto',
            type: 'milestone',
            date: new Date('2024-01-04'),
            author: 'Equipo de Análisis'
          },
          {
            id: '4',
            title: 'Logo subido',
            description: 'El cliente ha proporcionado el logo en alta resolución',
            type: 'file',
            date: new Date('2024-01-08'),
            author: 'Cliente'
          },
          {
            id: '5',
            title: 'Wireframes entregados',
            description: 'Se han entregado los wireframes para revisión del cliente',
            type: 'file',
            date: new Date('2024-01-10'),
            author: 'Equipo de UX'
          },
          {
            id: '6',
            title: 'Diseño completado',
            description: 'El diseño visual ha sido completado y aprobado por el cliente',
            type: 'milestone',
            date: new Date('2024-01-11'),
            author: 'Equipo de Diseño'
          },
          {
            id: '7',
            title: 'Desarrollo iniciado',
            description: 'El desarrollo frontend ha comenzado basándose en los diseños aprobados',
            type: 'update',
            date: new Date('2024-01-15'),
            author: 'Equipo de Desarrollo'
          }
        ]
      }

      setProject(mockProject)
      setLoading(false)
    }

    loadProject()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-400" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Proyecto no encontrado</h2>
        <p className="text-gray-600 mb-6">El proyecto que buscas no existe o no tienes permisos para verlo.</p>
        <Button onClick={() => router.push('/client/projects')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a proyectos
        </Button>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'text-blue-600 bg-blue-100 border-blue-200'
      case 'design': return 'text-purple-600 bg-purple-100 border-purple-200'
      case 'development': return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'testing': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'completed': return 'text-green-600 bg-green-100 border-green-200'
      case 'live': return 'text-green-600 bg-green-100 border-green-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning': return 'Planificación'
      case 'design': return 'Diseño'
      case 'development': return 'Desarrollo'
      case 'testing': return 'Pruebas'
      case 'completed': return 'Completado'
      case 'live': return 'En línea'
      default: return 'Desconocido'
    }
  }

  const getMilestoneStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'in_progress': return <Settings className="w-5 h-5 text-orange-600 animate-spin" />
      case 'blocked': return <AlertTriangle className="w-5 h-5 text-red-600" />
      default: return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-5 h-5 text-blue-600" />
      case 'video': return <Video className="w-5 h-5 text-purple-600" />
      case 'code': return <Code className="w-5 h-5 text-green-600" />
      case 'design': return <FileText className="w-5 h-5 text-pink-600" />
      default: return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'milestone': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'meeting': return <Users className="w-4 h-4 text-blue-600" />
      case 'file': return <FileText className="w-4 h-4 text-purple-600" />
      case 'message': return <MessageSquare className="w-4 h-4 text-orange-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const completedMilestones = project.milestones.filter(m => m.status === 'completed').length
  const totalMilestones = project.milestones.length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/client/projects')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600 mt-1">{project.template}</p>
              <p className="text-sm text-gray-500 font-mono">{project.domain}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}>
              {getStatusText(project.status)}
            </span>
            {project.status === 'live' && (
              <Button>
                <Globe className="h-4 w-4 mr-2" />
                Ver web
              </Button>
            )}
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progreso total</span>
              <span>{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-orange-500 to-pink-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Hitos completados</span>
              <span>{completedMilestones}/{totalMilestones}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${(completedMilestones / totalMilestones) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <div className="flex justify-between mb-1">
              <span>Última actualización:</span>
            </div>
            <span className="font-medium">{project.lastUpdate.toLocaleDateString()}</span>
          </div>
        </div>

        {/* Key Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <span className="text-gray-600">Fecha de inicio:</span>
              <span className="ml-2 font-medium">{project.startDate.toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-gray-400" />
            <div>
              <span className="text-gray-600">
                {project.actualCompletion ? 'Completado:' : 'Estimado:'}
              </span>
              <span className="ml-2 font-medium">
                {(project.actualCompletion || project.estimatedCompletion).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {[
              { key: 'overview', label: 'Resumen', icon: FileText },
              { key: 'milestones', label: 'Hitos', icon: CheckCircle },
              { key: 'files', label: 'Archivos', icon: Download },
              { key: 'timeline', label: 'Cronología', icon: Clock }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'overview' | 'milestones' | 'files' | 'timeline')}
                  className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado actual del proyecto</h3>
                <div className="prose max-w-none text-gray-700">
                  <p>
                    Tu proyecto se encuentra actualmente en la fase de <strong>{getStatusText(project.status).toLowerCase()}</strong>.
                    El equipo está trabajando en la implementación de la interfaz de usuario basándose en los diseños aprobados.
                  </p>
                  <p>
                    Hemos completado {completedMilestones} de {totalMilestones} hitos principales, lo que representa un {project.progress}% del progreso total.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Próximos pasos</h4>
                  <div className="space-y-2">
                    {project.milestones
                      .filter(m => m.status === 'in_progress' || m.status === 'pending')
                      .slice(0, 3)
                      .map((milestone) => (
                        <div key={milestone.id} className="flex items-center space-x-3 text-sm">
                          {getMilestoneStatusIcon(milestone.status)}
                          <span className={milestone.status === 'in_progress' ? 'font-medium' : ''}>
                            {milestone.title}
                          </span>
                          <span className="text-gray-500 text-xs ml-auto">
                            {milestone.dueDate.toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Archivos recientes</h4>
                  <div className="space-y-2">
                    {project.files.slice(0, 3).map((file) => (
                      <div key={file.id} className="flex items-center space-x-3 text-sm">
                        {getFileIcon(file.type)}
                        <span className="truncate flex-1">{file.name}</span>
                        <Button variant="ghost" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Milestones Tab */}
          {activeTab === 'milestones' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hitos del proyecto</h3>
              {project.milestones.map((milestone, index) => (
                <div key={milestone.id} className="relative">
                  {index < project.milestones.length - 1 && (
                    <div className="absolute left-6 top-12 w-px h-16 bg-gray-200" />
                  )}
                  <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {getMilestoneStatusIcon(milestone.status)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                      <p className="text-gray-600 text-sm mt-1">{milestone.description}</p>
                      <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                        <span>Fecha límite: {milestone.dueDate.toLocaleDateString()}</span>
                        {milestone.completedAt && (
                          <span>Completado: {milestone.completedAt.toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      milestone.status === 'completed' ? 'bg-green-100 text-green-600' :
                      milestone.status === 'in_progress' ? 'bg-orange-100 text-orange-600' :
                      milestone.status === 'blocked' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {milestone.status === 'completed' ? 'Completado' :
                       milestone.status === 'in_progress' ? 'En progreso' :
                       milestone.status === 'blocked' ? 'Bloqueado' : 'Pendiente'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Archivos del proyecto</h3>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar todos
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.files.map((file) => (
                  <div key={file.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                      <p className="text-sm text-gray-600">{file.category}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString()}
                      </p>
                      {file.description && (
                        <p className="text-xs text-gray-500 mt-1">{file.description}</p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {project.files.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay archivos disponibles aún</p>
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cronología del proyecto</h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  {project.timeline.map((event, index) => (
                    <li key={event.id}>
                      <div className="relative pb-8">
                        {index < project.timeline.length - 1 && (
                          <span className="absolute top-6 left-2 -ml-px h-full w-0.5 bg-gray-200" />
                        )}
                        <div className="relative flex items-start space-x-3">
                          <div className="relative">
                            <div className="h-4 w-4 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                              {getTimelineIcon(event.type)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{event.title}</h4>
                                <p className="text-gray-600 text-sm mt-1">{event.description}</p>
                                {event.author && (
                                  <p className="text-xs text-gray-500 mt-2">Por: {event.author}</p>
                                )}
                              </div>
                              <time className="text-xs text-gray-500 whitespace-nowrap ml-4">
                                {event.date.toLocaleDateString()}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {project.timeline.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay eventos en la cronología aún</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}