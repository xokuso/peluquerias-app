'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  ExternalLink,
  FileText,
  Eye,
  Search,
  Filter,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Project } from '@/types'

export default function ProjectsPage() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    // Mock data loading - replace with actual API calls
    const loadProjects = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockProjects: Project[] = [
        {
          id: '1',
          orderId: 'ORD-001',
          name: session?.user.salonName || 'Mi Salón Elegante',
          status: 'development',
          progress: 65,
          domain: `${(session?.user.salonName || 'salon').toLowerCase().replace(/\s+/g, '')}.peluquerias.pro`,
          template: 'Elegante Moderno',
          startDate: new Date('2024-01-01'),
          estimatedCompletion: new Date('2024-02-15'),
          lastUpdate: new Date('2024-01-15'),
          milestones: [
            {
              id: '1',
              title: 'Análisis y planificación',
              description: 'Análisis de requisitos y planificación del proyecto',
              status: 'completed',
              dueDate: new Date('2024-01-05'),
              completedAt: new Date('2024-01-04'),
              order: 1
            },
            {
              id: '2',
              title: 'Diseño inicial',
              description: 'Creación del diseño visual y wireframes',
              status: 'completed',
              dueDate: new Date('2024-01-12'),
              completedAt: new Date('2024-01-11'),
              order: 2
            },
            {
              id: '3',
              title: 'Desarrollo frontend',
              description: 'Implementación de la interfaz de usuario',
              status: 'in_progress',
              dueDate: new Date('2024-01-25'),
              order: 3
            },
            {
              id: '4',
              title: 'Configuración de contenido',
              description: 'Carga de contenido y configuración final',
              status: 'pending',
              dueDate: new Date('2024-02-05'),
              order: 4
            },
            {
              id: '5',
              title: 'Pruebas y lanzamiento',
              description: 'Pruebas finales y puesta en producción',
              status: 'pending',
              dueDate: new Date('2024-02-15'),
              order: 5
            }
          ],
          files: [
            {
              id: '1',
              name: 'diseño-inicial.pdf',
              type: 'design',
              size: 2048000,
              url: '/files/diseño-inicial.pdf',
              uploadedAt: new Date('2024-01-11'),
              category: 'Diseño',
              description: 'Propuesta de diseño inicial'
            },
            {
              id: '2',
              name: 'wireframes.pdf',
              type: 'design',
              size: 1536000,
              url: '/files/wireframes.pdf',
              uploadedAt: new Date('2024-01-10'),
              category: 'Diseño',
              description: 'Wireframes de la estructura'
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
              title: 'Diseño completado',
              description: 'El diseño inicial ha sido completado y está listo para revisión',
              type: 'milestone',
              date: new Date('2024-01-11'),
              author: 'Equipo de Diseño'
            },
            {
              id: '3',
              title: 'Desarrollo iniciado',
              description: 'El desarrollo frontend ha comenzado',
              type: 'update',
              date: new Date('2024-01-15'),
              author: 'Equipo de Desarrollo'
            }
          ]
        },
        {
          id: '2',
          orderId: 'ORD-002',
          name: 'Actualización Web Anterior',
          status: 'completed',
          progress: 100,
          domain: 'anterior.peluquerias.pro',
          template: 'Clásico Premium',
          startDate: new Date('2023-11-01'),
          estimatedCompletion: new Date('2023-12-15'),
          actualCompletion: new Date('2023-12-10'),
          lastUpdate: new Date('2023-12-10'),
          milestones: [],
          files: [],
          timeline: []
        }
      ]

      setProjects(mockProjects)
      setLoading(false)
    }

    loadProjects()
  }, [session])

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return <Clock className="w-4 h-4" />
      case 'design': return <FileText className="w-4 h-4" />
      case 'development': return <Settings className="w-4 h-4 animate-spin" />
      case 'testing': return <AlertTriangle className="w-4 h-4" />
      case 'completed':
      case 'live': return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.domain.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Proyectos</h1>
          <p className="mt-1 text-gray-600">
            Gestiona y revisa el progreso de todos tus proyectos web
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar reporte
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="planning">Planificación</option>
            <option value="design">Diseño</option>
            <option value="development">Desarrollo</option>
            <option value="testing">Pruebas</option>
            <option value="completed">Completado</option>
            <option value="live">En línea</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Project Header */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{project.template}</p>
                  <p className="text-sm text-gray-600 font-mono">{project.domain}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}>
                  {getStatusIcon(project.status)}
                  <span className="ml-2">{getStatusText(project.status)}</span>
                </span>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progreso del proyecto</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Timeline Info */}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                <div>
                  <span className="font-medium">Inicio:</span>
                  <br />
                  {project.startDate.toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">
                    {project.actualCompletion ? 'Completado:' : 'Estimado:'}
                  </span>
                  <br />
                  {(project.actualCompletion || project.estimatedCompletion).toLocaleDateString()}
                </div>
              </div>

              {/* Current Milestones */}
              {project.milestones && project.milestones.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Hitos actuales</h4>
                  <div className="space-y-2">
                    {project.milestones.slice(0, 2).map((milestone) => (
                      <div key={milestone.id} className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          milestone.status === 'completed' ? 'bg-green-500' :
                          milestone.status === 'in_progress' ? 'bg-orange-500' :
                          milestone.status === 'blocked' ? 'bg-red-500' : 'bg-gray-300'
                        }`} />
                        <span className="text-sm text-gray-700">{milestone.title}</span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {milestone.completedAt ? 'Completado' : milestone.dueDate.toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Actualizado: {project.lastUpdate.toLocaleDateString()}
              </div>
              <div className="flex space-x-2">
                <Link href={`/client/projects/${project.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver detalles
                  </Button>
                </Link>
                {project.status === 'live' && (
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Ver web
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron proyectos</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Aún no tienes proyectos. ¡Crea tu primera web!'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Link href="/templates">
              <Button>
                Crear nuevo proyecto
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}