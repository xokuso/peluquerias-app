import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's orders with all related data
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        template: true,
        photos: {
          select: {
            id: true,
            filename: true,
            originalUrl: true,
            thumbnailUrl: true,
            size: true,
            uploadStatus: true,
            createdAt: true
          }
        },
        businessContent: {
          select: {
            salonDescription: true,
            aboutOwner: true,
            welcomeMessage: true,
            fullAddress: true,
            city: true,
            phone: true,
            email: true,
            isComplete: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform orders to project format
    const projects = orders.map(order => {
      const progress = calculateProgress(order.status, order.setupStep)
      const status = mapOrderStatus(order.status, order.setupStep)

      // Create milestones based on setup steps
      const milestones = createMilestones(order)

      // Create timeline events
      const timeline = createTimeline(order)

      // Transform photos to files
      const files = order.photos.map(photo => ({
        id: photo.id,
        name: photo.filename,
        type: 'image' as const,
        size: photo.size,
        url: photo.originalUrl,
        uploadedAt: photo.createdAt,
        category: 'Imágenes del negocio',
        description: `Imagen subida para ${order.salonName}`
      }))

      return {
        id: order.id,
        orderId: order.id,
        name: order.salonName,
        status,
        progress,
        domain: order.domain + (order.domainExtension || '.es'),
        template: order.template?.name || 'Plantilla personalizada',
        startDate: order.createdAt,
        estimatedCompletion: calculateEstimatedCompletion(order.createdAt),
        actualCompletion: order.completedAt,
        lastUpdate: order.updatedAt,
        milestones,
        files,
        timeline
      }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Error fetching projects' },
      { status: 500 }
    )
  }
}

function mapOrderStatus(orderStatus: string, setupStep: string): string {
  if (orderStatus === 'CANCELLED') return 'cancelled'
  if (orderStatus === 'COMPLETED' && setupStep === 'COMPLETED') return 'live'
  if (orderStatus === 'COMPLETED') return 'completed'
  if (orderStatus === 'PROCESSING') {
    switch (setupStep) {
      case 'DOMAIN_SELECTION':
      case 'BUSINESS_INFO':
        return 'planning'
      case 'DESIGN_PREFERENCES':
        return 'design'
      case 'CONTENT_EDITOR':
      case 'PHOTOS_UPLOAD':
        return 'development'
      case 'REVIEW_LAUNCH':
        return 'testing'
      default:
        return 'development'
    }
  }
  return 'planning'
}

function calculateProgress(orderStatus: string, setupStep: string): number {
  if (orderStatus === 'CANCELLED') return 0
  if (orderStatus === 'COMPLETED' && setupStep === 'COMPLETED') return 100

  const stepProgress: { [key: string]: number } = {
    'DOMAIN_SELECTION': 15,
    'BUSINESS_INFO': 30,
    'DESIGN_PREFERENCES': 45,
    'CONTENT_EDITOR': 60,
    'PHOTOS_UPLOAD': 75,
    'REVIEW_LAUNCH': 90,
    'COMPLETED': 100
  }

  return stepProgress[setupStep] || 0
}

function calculateEstimatedCompletion(startDate: Date): Date {
  const estimatedDate = new Date(startDate)
  estimatedDate.setDate(estimatedDate.getDate() + 30)
  return estimatedDate
}

function createMilestones(order: any) {
  const steps = [
    { step: 'DOMAIN_SELECTION', title: 'Selección de dominio', description: 'Configuración del dominio web' },
    { step: 'BUSINESS_INFO', title: 'Información del negocio', description: 'Recopilación de datos del salón' },
    { step: 'DESIGN_PREFERENCES', title: 'Preferencias de diseño', description: 'Personalización visual' },
    { step: 'CONTENT_EDITOR', title: 'Edición de contenido', description: 'Creación de textos y secciones' },
    { step: 'PHOTOS_UPLOAD', title: 'Carga de imágenes', description: 'Subida y optimización de fotos' },
    { step: 'REVIEW_LAUNCH', title: 'Revisión y lanzamiento', description: 'Pruebas finales y publicación' }
  ]

  const currentStepIndex = steps.findIndex(s => s.step === order.setupStep)

  return steps.map((step, index) => {
    let status = 'pending'
    let completedAt = null

    if (index < currentStepIndex) {
      status = 'completed'
      completedAt = new Date(order.createdAt)
      completedAt.setDate(completedAt.getDate() + (index * 5))
    } else if (index === currentStepIndex) {
      status = 'in_progress'
    }

    const dueDate = new Date(order.createdAt)
    dueDate.setDate(dueDate.getDate() + ((index + 1) * 5))

    return {
      id: `milestone-${order.id}-${index}`,
      title: step.title,
      description: step.description,
      status,
      dueDate,
      completedAt,
      order: index + 1
    }
  })
}

function createTimeline(order: any) {
  const events = []

  // Project created event
  events.push({
    id: `event-${order.id}-1`,
    title: 'Proyecto iniciado',
    description: `El proyecto para ${order.salonName} ha sido creado`,
    type: 'milestone' as const,
    date: order.createdAt,
    author: 'Sistema'
  })

  // Add events based on current progress
  const currentStep = order.setupStep
  if (currentStep !== 'DOMAIN_SELECTION') {
    events.push({
      id: `event-${order.id}-2`,
      title: 'Dominio configurado',
      description: `El dominio ${order.domain} ha sido reservado`,
      type: 'update' as const,
      date: new Date(order.createdAt.getTime() + 24 * 60 * 60 * 1000),
      author: 'Equipo técnico'
    })
  }

  if (['DESIGN_PREFERENCES', 'CONTENT_EDITOR', 'PHOTOS_UPLOAD', 'REVIEW_LAUNCH', 'COMPLETED'].includes(currentStep)) {
    events.push({
      id: `event-${order.id}-3`,
      title: 'Información recopilada',
      description: 'Toda la información del negocio ha sido procesada',
      type: 'update' as const,
      date: new Date(order.createdAt.getTime() + 2 * 24 * 60 * 60 * 1000),
      author: 'Equipo de contenido'
    })
  }

  // Last update event
  if (order.updatedAt.getTime() !== order.createdAt.getTime()) {
    events.push({
      id: `event-${order.id}-last`,
      title: 'Actualización reciente',
      description: 'El proyecto ha sido actualizado',
      type: 'update' as const,
      date: order.updatedAt,
      author: 'Sistema'
    })
  }

  return events.sort((a, b) => b.date.getTime() - a.date.getTime())
}