'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  FileText,
  Briefcase,
  Clock,
  Phone,
  Eye,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import RichTextEditor from './RichTextEditor'
import ServicesManager, { Service } from './ServicesManager'
import BusinessHoursEditor, { BusinessHours } from './BusinessHoursEditor'
import ContactInfoEditor, { ContactInfo } from './ContactInfoEditor'
import ContentPreview from './ContentPreview'

interface ContentEditorProps {
  orderId: string
  onSave?: () => void
  onCancel?: () => void
  isLoading?: boolean
}

interface BusinessContent {
  id?: string
  salonDescription?: string
  aboutOwner?: string
  aboutBusiness?: string
  welcomeMessage?: string
  fullAddress?: string
  city?: string
  postalCode?: string
  phone?: string
  email?: string
  website?: string
  facebookUrl?: string
  instagramUrl?: string
  twitterUrl?: string
  youtubeUrl?: string
  tiktokUrl?: string
  linkedinUrl?: string
  specialties?: string[]
  certifications?: string[]
  languages?: string[]
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
  services?: Service[]
  businessHours?: BusinessHours[]
}

interface ContentSection {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  component: React.ReactNode
}

export default function ContentEditor({
  orderId,
  onSave,
  onCancel
}: ContentEditorProps) {
  const [activeSection, setActiveSection] = useState(0)
  const [content, setContent] = useState<BusinessContent>({})
  const [isLoadingContent, setIsLoadingContent] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [autoSaveEnabled] = useState(true)
  const [showPreview, setShowPreview] = useState(false)

  // Define handleSave function first
  const handleSave = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsSaving(true)

      const response = await fetch(`/api/content/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessContent: {
            salonDescription: content.salonDescription,
            aboutOwner: content.aboutOwner,
            aboutBusiness: content.aboutBusiness,
            welcomeMessage: content.welcomeMessage,
            fullAddress: content.fullAddress,
            city: content.city,
            postalCode: content.postalCode,
            phone: content.phone,
            email: content.email,
            website: content.website,
            facebookUrl: content.facebookUrl,
            instagramUrl: content.instagramUrl,
            twitterUrl: content.twitterUrl,
            youtubeUrl: content.youtubeUrl,
            tiktokUrl: content.tiktokUrl,
            linkedinUrl: content.linkedinUrl,
            specialties: content.specialties,
            certifications: content.certifications,
            languages: content.languages,
            metaTitle: content.metaTitle,
            metaDescription: content.metaDescription,
            keywords: content.keywords,
          },
          services: content.services,
          businessHours: content.businessHours,
        })
      })

      if (response.ok) {
        setHasChanges(false)
        setLastSaved(new Date())

        if (!silent && onSave) {
          onSave()
        }
      } else {
        throw new Error('Failed to save content')
      }
    } catch (error) {
      console.error('Error saving content:', error)
      // TODO: Show error notification
    } finally {
      if (!silent) setIsSaving(false)
    }
  }, [content, orderId, onSave])

  // Load content from API
  useEffect(() => {
    const loadContentData = async () => {
      try {
        setIsLoadingContent(true)
        const response = await fetch(`/api/content/${orderId}`)

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.content) {
            setContent(data.content)
          }
        }
      } catch (error) {
        console.error('Error loading content:', error)
      } finally {
        setIsLoadingContent(false)
      }
    }

    loadContentData()
  }, [orderId])

  // Auto-save every 30 seconds if there are changes
  useEffect(() => {
    if (!autoSaveEnabled || !hasChanges || isSaving) return

    const autoSaveTimer = setTimeout(async () => {
      await handleSave(true) // Silent auto-save
    }, 30000)

    return () => clearTimeout(autoSaveTimer)
  }, [hasChanges, autoSaveEnabled, isSaving, handleSave])

  const updateContent = (updates: Partial<BusinessContent>) => {
    setContent(prev => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  const updateServices = (services: Service[]) => {
    updateContent({ services })
  }

  const updateBusinessHours = (businessHours: BusinessHours[]) => {
    updateContent({ businessHours })
  }

  const updateContactInfo = (contactInfo: ContactInfo) => {
    updateContent(contactInfo)
  }

  const sections: ContentSection[] = [
    {
      id: 'content',
      title: 'Contenido y Descripción',
      description: 'Información sobre tu salón y servicios',
      icon: FileText,
      component: (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-medium text-neutral-900 mb-4">
              Descripción del salón
            </h4>
            <RichTextEditor
              value={content.salonDescription || ''}
              onChange={(value) => updateContent({ salonDescription: value })}
              placeholder="Describe tu salón, la experiencia que ofreces, tu estilo..."
              maxLength={2000}
              minHeight="200px"
            />
          </div>

          <div>
            <h4 className="text-lg font-medium text-neutral-900 mb-4">
              Acerca del propietario/equipo
            </h4>
            <RichTextEditor
              value={content.aboutOwner || ''}
              onChange={(value) => updateContent({ aboutOwner: value })}
              placeholder="Cuéntanos sobre ti, tu experiencia, formación, especialidades..."
              maxLength={1500}
              minHeight="150px"
            />
          </div>

          <div>
            <h4 className="text-lg font-medium text-neutral-900 mb-4">
              Historia del negocio
            </h4>
            <RichTextEditor
              value={content.aboutBusiness || ''}
              onChange={(value) => updateContent({ aboutBusiness: value })}
              placeholder="¿Cómo empezó tu salón? ¿Qué te inspiró? ¿Cuál es tu filosofía?"
              maxLength={1500}
              minHeight="150px"
            />
          </div>

          <div>
            <h4 className="text-lg font-medium text-neutral-900 mb-4">
              Mensaje de bienvenida
            </h4>
            <RichTextEditor
              value={content.welcomeMessage || ''}
              onChange={(value) => updateContent({ welcomeMessage: value })}
              placeholder="Un mensaje corto que aparecerá en la página principal..."
              maxLength={500}
              minHeight="100px"
            />
          </div>
        </div>
      )
    },
    {
      id: 'services',
      title: 'Servicios y Precios',
      description: 'Gestiona tu catálogo de servicios',
      icon: Briefcase,
      component: (
        <ServicesManager
          services={content.services || []}
          onServicesChange={updateServices}
        />
      )
    },
    {
      id: 'hours',
      title: 'Horarios de Apertura',
      description: 'Configura tus horarios',
      icon: Clock,
      component: (
        <BusinessHoursEditor
          businessHours={content.businessHours || []}
          onBusinessHoursChange={updateBusinessHours}
        />
      )
    },
    {
      id: 'contact',
      title: 'Contacto y Redes Sociales',
      description: 'Información de contacto y enlaces',
      icon: Phone,
      component: (
        <ContactInfoEditor
          contactInfo={{
            ...(content.phone && { phone: content.phone }),
            ...(content.email && { email: content.email }),
            ...(content.website && { website: content.website }),
            ...(content.fullAddress && { fullAddress: content.fullAddress }),
            ...(content.city && { city: content.city }),
            ...(content.postalCode && { postalCode: content.postalCode }),
            ...(content.facebookUrl && { facebookUrl: content.facebookUrl }),
            ...(content.instagramUrl && { instagramUrl: content.instagramUrl }),
            ...(content.twitterUrl && { twitterUrl: content.twitterUrl }),
            ...(content.youtubeUrl && { youtubeUrl: content.youtubeUrl }),
            ...(content.tiktokUrl && { tiktokUrl: content.tiktokUrl }),
            ...(content.linkedinUrl && { linkedinUrl: content.linkedinUrl }),
          }}
          onContactInfoChange={updateContactInfo}
        />
      )
    }
  ]

  const getCompletionPercentage = (): number => {
    const fields = [
      content.salonDescription,
      content.aboutOwner,
      content.services && content.services.length > 0,
      content.businessHours && content.businessHours.some(h => h.isOpen),
      content.phone,
      content.email,
    ]

    const completed = fields.filter(field => Boolean(field)).length
    return Math.round((completed / fields.length) * 100)
  }

  const completionPercentage = getCompletionPercentage()

  if (isLoadingContent) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-neutral-600">Cargando contenido...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">
              Editor de Contenido
            </h2>
            <p className="text-neutral-600">
              Personaliza el contenido de tu sitio web
            </p>
          </div>

          {/* Save Status */}
          <div className="flex items-center gap-4">
            {lastSaved && (
              <span className="text-sm text-neutral-500">
                Guardado: {lastSaved.toLocaleTimeString()}
              </span>
            )}

            {hasChanges && (
              <span className="text-sm text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Cambios sin guardar
              </span>
            )}

            <Button
              onClick={() => handleSave()}
              disabled={!hasChanges || isSaving}
              variant="salon"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : hasChanges ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Guardado
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-neutral-200 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-sm text-neutral-600">
          Completado: {completionPercentage}% - {
            completionPercentage === 100
              ? '¡Perfecto! Tu contenido está completo'
              : completionPercentage >= 75
              ? 'Casi terminado'
              : completionPercentage >= 50
              ? 'Buen progreso'
              : 'Empezando...'
          }
        </p>
      </div>

      <div className="flex gap-6">
        {/* Navigation Sidebar */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-lg border border-neutral-200 p-4 sticky top-4">
            <h3 className="font-medium text-neutral-900 mb-4">Secciones</h3>
            <nav className="space-y-2">
              {sections.map((section, index) => {
                const Icon = section.icon
                const isActive = activeSection === index

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(index)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-colors duration-200",
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "hover:bg-neutral-50 text-neutral-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn(
                        "w-5 h-5",
                        isActive ? "text-blue-600" : "text-neutral-400"
                      )} />
                      <div>
                        <div className="font-medium">{section.title}</div>
                        <div className="text-xs text-neutral-500">
                          {section.description}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-neutral-900">
                  {sections[activeSection]?.title}
                </h3>
                <p className="text-neutral-600">
                  {sections[activeSection]?.description}
                </p>
              </div>

              {/* Navigation arrows */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                  disabled={activeSection === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveSection(Math.min(sections.length - 1, activeSection + 1))}
                  disabled={activeSection === sections.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Section Content */}
            <div className="min-h-[500px]">
              {sections[activeSection]?.component}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Cancelar
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPreview(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Vista Previa
              </Button>

              <Button
                variant="salon"
                onClick={() => handleSave()}
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar y Continuar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <ContentPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        orderId={orderId}
      />
    </div>
  )
}