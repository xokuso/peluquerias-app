'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  Palette,
  Upload,
  Rocket,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Loader2,
  Building2,
  Image,
  Type,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import DomainSearchPanel from '@/components/client/DomainSearchPanel'
import PhotoUpload, { UploadedPhoto } from '@/components/client/PhotoUpload'
import ContentEditor from '@/components/content-editor/ContentEditor'
import BusinessInfoStep from '@/components/client/BusinessInfoStep'
import DesignPreferencesStep from '@/components/client/DesignPreferencesStep'
import Link from 'next/link'

// Setup steps configuration
const SETUP_STEPS = [
  {
    id: 'domain',
    title: 'Dominio',
    description: 'Elige tu dirección web',
    icon: Globe,
    color: 'blue'
  },
  {
    id: 'business',
    title: 'Información del negocio',
    description: 'Datos de tu salón',
    icon: Building2,
    color: 'purple'
  },
  {
    id: 'design',
    title: 'Preferencias de diseño',
    description: 'Personaliza tu estilo',
    icon: Palette,
    color: 'pink'
  },
  {
    id: 'content',
    title: 'Editor de Contenido',
    description: 'Información y servicios',
    icon: Type,
    color: 'orange'
  },
  {
    id: 'photos',
    title: 'Galería de Fotos',
    description: 'Imágenes del salón',
    icon: Upload,
    color: 'indigo'
  },
  {
    id: 'review',
    title: 'Revisión y lanzamiento',
    description: 'Revisa y publica',
    icon: Rocket,
    color: 'green'
  }
]

interface SetupData {
  // Domain step
  domain: string
  domainExtension: string
  domainPrice: number

  // Business info step
  businessName: string
  ownerName: string
  phone: string
  email: string
  address: string
  city: string
  postalCode: string
  businessType: string

  // Design preferences step
  primaryColor: string
  secondaryColor: string
  fontStyle: 'modern' | 'classic' | 'elegant' | 'bold'
  layoutPreference: 'minimal' | 'standard' | 'rich'

  // Content step
  businessContent?: {
    aboutText?: string
    services?: Array<{
      name: string
      description?: string
      price?: number
      duration?: number
    }>
    businessHours?: Array<{
      dayOfWeek: string
      isOpen: boolean
      openTime?: string
      closeTime?: string
    }>
  }

  // Photos step
  logo?: File
  photos: UploadedPhoto[]

  // Review step
  termsAccepted: boolean
  launchDate?: Date
}

export default function ClientSetupPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [setupData, setSetupData] = useState<Partial<SetupData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  // Load existing order data if available
  useEffect(() => {
    const loadOrderData = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/orders/current?userId=${session.user.id}`)
          if (response.ok) {
            const data = await response.json()
            if (data.order) {
              setOrderId(data.order.id)
              // Set current step based on order setup progress
              const stepIndex = SETUP_STEPS.findIndex(s => s.id === data.order.setupStep?.toLowerCase())
              setCurrentStep(stepIndex >= 0 ? stepIndex : 0)

              // Pre-fill data if available
              if (data.order.domain) {
                setSetupData(prev => ({
                  ...prev,
                  domain: data.order.domain.split('.')[0],
                  domainExtension: `.${data.order.domain.split('.')[1]}`,
                  businessName: data.order.salonName,
                  ownerName: data.order.ownerName,
                  email: data.order.email,
                  phone: data.order.phone,
                  address: data.order.address
                }))
              }
            }
          }
        } catch (err) {
          console.error('Error loading order data:', err)
        }
      }
    }

    if (status === 'authenticated') {
      loadOrderData()
    }
  }, [session, status])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/client/setup')
    }
  }, [status, router])

  const handleDomainSelected = async (domain: string, extension: string, price: number) => {
    setSetupData(prev => ({
      ...prev,
      domain,
      domainExtension: extension,
      domainPrice: price
    }))

    // Save domain selection to database
    if (orderId) {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/orders/${orderId}/update-domain`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            domain: `${domain}${extension}`,
            domainExtension: extension,
            domainPrice: price,
            domainUserPrice: price <= 15 ? 0 : price - 15
          })
        })

        if (!response.ok) {
          throw new Error('Error saving domain selection')
        }

        // Move to next step
        handleNextStep()
      } catch (err) {
        console.error('Error saving domain:', err)
        setError('Error al guardar el dominio. Por favor, inténtalo de nuevo.')
      } finally {
        setIsLoading(false)
      }
    } else {
      // If no order exists, just move to next step (will create order later)
      handleNextStep()
    }
  }

  const handleNextStep = () => {
    if (currentStep < SETUP_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
      setError(null)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setError(null)
    }
  }

  const handleSkipStep = () => {
    handleNextStep()
  }

  const handleGoToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex)
    setError(null)
  }

  const handleBusinessInfoSubmit = async (data: Partial<SetupData>) => {
    setSetupData(prev => ({ ...prev, ...data }))

    // Save business info and move to next step
    if (orderId) {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/orders/${orderId}/update-business`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })

        if (!response.ok) {
          throw new Error('Error saving business info')
        }

        handleNextStep()
      } catch (err) {
        console.error('Error saving business info:', err)
        setError('Error al guardar la información. Por favor, inténtalo de nuevo.')
      } finally {
        setIsLoading(false)
      }
    } else {
      handleNextStep()
    }
  }

  const renderStepContent = () => {
    const currentStepData = SETUP_STEPS[currentStep]
    if (!currentStepData) return null

    switch (currentStepData.id) {
      case 'domain':
        return (
          <DomainSearchPanel
            onDomainSelected={handleDomainSelected}
            initialDomain={setupData.domain ?? ''}
            salonName={setupData.businessName ?? session?.user?.salonName ?? ''}
            showPricingInfo={true}
          />
        )

      case 'business':
        return (
          <BusinessInfoStep
            initialData={setupData}
            onSubmit={handleBusinessInfoSubmit}
            isLoading={isLoading}
          />
        )

      case 'design':
        return (
          <DesignPreferencesStep
            initialData={setupData}
            onSubmit={(data) => {
              setSetupData(prev => ({ ...prev, ...data }))
              handleNextStep()
            }}
            isLoading={isLoading}
          />
        )

      case 'content':
        return (
          <ContentEditorStep
            orderId={orderId}
            onSubmit={() => handleNextStep()}
            isLoading={isLoading}
          />
        )

      case 'photos':
        return (
          <PhotoUploadStep
            initialData={setupData}
            onSubmit={(data) => {
              setSetupData(prev => ({ ...prev, ...data }))
              handleNextStep()
            }}
            isLoading={isLoading}
            orderId={orderId}
          />
        )

      case 'review':
        return (
          <ReviewLaunchStep
            setupData={setupData as SetupData}
            onLaunch={async () => {
              // Handle final launch
              setIsLoading(true)
              try {
                // API call to finalize setup
                await new Promise(resolve => setTimeout(resolve, 2000))
                router.push('/client/projects')
              } catch {
                setError('Error al lanzar el sitio. Por favor, contacta con soporte.')
              } finally {
                setIsLoading(false)
              }
            }}
            isLoading={isLoading}
          />
        )

      default:
        return null
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
        {/* Setup Header with Navigation Options */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Configuración de tu web</h1>
              <p className="text-neutral-600">Configura tu sitio web paso a paso</p>
            </div>

            {/* Quick Navigation */}
            <div className="flex items-center gap-4">
              <Link
                href="/client/projects"
                className="text-sm text-neutral-600 hover:text-neutral-900 underline"
              >
                Ver mis proyectos
              </Link>
              <Link
                href="/client"
                className="px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Ir al panel principal
              </Link>
            </div>
          </div>

          {/* Navigation Freedom Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-600 mt-0.5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-900 mb-1">
                  Navegación libre habilitada
                </h3>
                <p className="text-sm text-green-800">
                  Ahora puedes navegar libremente por tu panel usando el sidebar de la izquierda,
                  saltar pasos o continuar con la configuración cuando quieras.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-8">
            {SETUP_STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep

              return (
                <React.Fragment key={step.id}>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => handleGoToStep(index)}
                  >
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center mb-2
                        transition-all duration-300 hover:scale-105 hover:shadow-md
                        ${isActive ? 'bg-blue-600 text-white shadow-lg scale-110' : ''}
                        ${isCompleted ? 'bg-green-600 text-white hover:bg-green-700' : ''}
                        ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-400 hover:bg-gray-300 hover:text-gray-600' : ''}
                      `}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <span className={`
                      text-xs font-medium text-center max-w-[80px]
                      ${isActive ? 'text-blue-600' : 'text-gray-500'}
                    `}>
                      {step.title}
                    </span>
                  </motion.div>

                  {index < SETUP_STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 bg-gray-200 mx-2">
                      <motion.div
                        className="h-full bg-green-600"
                        initial={{ width: '0%' }}
                        animate={{ width: index < currentStep ? '100%' : '0%' }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>

          {/* Current Step Title */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              {SETUP_STEPS[currentStep]?.title ?? ''}
            </h1>
            <p className="text-lg text-neutral-600 mb-4">
              {SETUP_STEPS[currentStep]?.description ?? ''}
            </p>
            <p className="text-sm text-neutral-500">
              💡 Puedes hacer clic en cualquier paso de arriba para navegar libremente
            </p>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </motion.div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex justify-between items-center"
        >
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={currentStep === 0 || isLoading}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <div className="flex items-center gap-3">
            {currentStep < SETUP_STEPS.length - 1 && (
              <>
                <Button
                  variant="ghost"
                  onClick={handleSkipStep}
                  disabled={isLoading}
                  className="text-neutral-600 hover:text-neutral-900"
                >
                  Saltar paso
                </Button>

                <Button
                  variant="salon"
                  onClick={handleNextStep}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      Siguiente
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </>
            )}

            {currentStep === SETUP_STEPS.length - 1 && (
              <Link href="/client/projects">
                <Button variant="outline">
                  Ir a mis proyectos
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
    </div>
  )
}


// Content Editor Step Component
interface ContentEditorStepProps {
  orderId: string | null
  onSubmit: () => void
  isLoading: boolean
}

function ContentEditorStep({ orderId, onSubmit, isLoading }: ContentEditorStepProps) {
  if (!orderId) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-neutral-900 mb-2">
          Error de configuración
        </h3>
        <p className="text-neutral-600">
          No se pudo cargar el editor de contenido. Por favor, contacta con soporte.
        </p>
      </div>
    )
  }

  return (
    <ContentEditor
      orderId={orderId}
      onSave={() => onSubmit()}
      isLoading={isLoading}
    />
  )
}

// Photo Upload Step Component
interface PhotoUploadStepProps {
  initialData: Partial<SetupData>
  onSubmit: (data: Partial<SetupData>) => void
  isLoading: boolean
  orderId: string | null
}

function PhotoUploadStep({ initialData, onSubmit, isLoading, orderId }: PhotoUploadStepProps) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>(initialData.photos || [])

  const handlePhotosChange = (newPhotos: UploadedPhoto[]) => {
    setPhotos(newPhotos)
  }

  const handleSubmit = async () => {
    onSubmit({ photos })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Galería de fotos
          </h3>
          <p className="text-sm text-neutral-600 mb-4">
            Sube fotos de tu salón, trabajos realizados, ambiente, etc. Esto ayudará a tus clientes a conocer tu negocio.
          </p>

          <PhotoUpload
            maxFiles={10}
            onPhotosChange={handlePhotosChange}
            orderId={orderId ?? ''}
            className="mb-4"
          />
        </div>

        {/* Logo Upload (placeholder for future implementation) */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Logo del negocio (opcional)
          </h3>
          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
            <Image className="w-8 h-8 mx-auto mb-2 text-neutral-400" aria-label="Logo icon" />
            <p className="text-sm font-medium text-neutral-700 mb-1">
              Logo del negocio
            </p>
            <p className="text-xs text-neutral-500 mb-3">
              PNG, JPG o SVG (max. 5MB) - Próximamente disponible
            </p>
            <Button variant="outline" size="sm" disabled>
              Próximamente
            </Button>
          </div>
        </div>

        {/* Help Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                ¿No tienes el material ahora?
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  No te preocupes. Puedes continuar sin subir fotos.
                  Nuestro equipo te ayudará a completar el contenido visual después del lanzamiento.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-end">
          <Button
            variant="salon"
            onClick={handleSubmit}
            disabled={isLoading}
            className="min-w-[150px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                Continuar
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Review and Launch Step Component
interface ReviewLaunchStepProps {
  setupData: Partial<SetupData>
  onLaunch: () => Promise<void>
  isLoading: boolean
}

function ReviewLaunchStep({ setupData, onLaunch, isLoading }: ReviewLaunchStepProps) {
  const [termsAccepted, setTermsAccepted] = useState(false)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 space-y-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            ¡Todo listo para lanzar tu web!
          </h2>
          <p className="text-neutral-600">
            Revisa el resumen de tu configuración antes de lanzar
          </p>
        </div>

        {/* Configuration Summary */}
        <div className="space-y-4">
          <div className="p-4 bg-neutral-50 rounded-lg">
            <h3 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Dominio
            </h3>
            <p className="text-neutral-700">
              {setupData.domain}{setupData.domainExtension}
            </p>
            {(setupData.domainPrice ?? 0) <= 15 ? (
              <p className="text-sm text-green-600 mt-1">Incluido gratis en tu plan</p>
            ) : (
              <p className="text-sm text-neutral-600 mt-1">
                Coste adicional: {((setupData.domainPrice ?? 0) - 15).toFixed(2)}€
              </p>
            )}
          </div>

          <div className="p-4 bg-neutral-50 rounded-lg">
            <h3 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Información del negocio
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="text-neutral-600">Nombre:</p>
              <p className="text-neutral-700">{setupData.businessName}</p>
              <p className="text-neutral-600">Ciudad:</p>
              <p className="text-neutral-700">{setupData.city}</p>
              <p className="text-neutral-600">Teléfono:</p>
              <p className="text-neutral-700">{setupData.phone}</p>
            </div>
          </div>

          <div className="p-4 bg-neutral-50 rounded-lg">
            <h3 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Diseño personalizado
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full border-2 border-neutral-300"
                  style={{ backgroundColor: setupData.primaryColor }}
                />
                <span className="text-sm text-neutral-600">Color principal</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full border-2 border-neutral-300"
                  style={{ backgroundColor: setupData.secondaryColor }}
                />
                <span className="text-sm text-neutral-600">Color secundario</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms Acceptance */}
        <div className="border-t pt-6">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-neutral-600">
              Acepto los términos y condiciones y autorizo el lanzamiento de mi sitio web.
              Entiendo que mi web estará disponible en 24-48 horas.
            </span>
          </label>
        </div>

        {/* Launch Button */}
        <div className="flex justify-center">
          <Button
            variant="salon"
            size="lg"
            onClick={onLaunch}
            disabled={!termsAccepted || isLoading}
            className="min-w-[200px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Lanzando...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5 mr-2" />
                Lanzar mi web
              </>
            )}
          </Button>
        </div>

        {/* Success Message Preview */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-900">
                ¿Qué pasa después?
              </p>
              <p className="text-sm text-green-700 mt-1">
                Nuestro equipo revisará tu configuración y comenzará a trabajar en tu web.
                Recibirás actualizaciones por email y podrás seguir el progreso desde tu panel.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}