"use client"

import { useState, useEffect } from 'react'
import { CheckCircle, Star, Shield, Zap, ArrowRight, Sparkles, Eye, Check, Crown, Heart, Building2, User, Mail, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'



// Template types
interface Template {
  id: string
  name: string
  category: 'Moderno' | 'Clásico' | 'Minimalista' | 'Elegante' | 'Trendy'
  image: string
  features: string[]
  popular?: boolean
  recommended?: boolean
  originalPrice: number
  discountedPrice: number
  description: string
}

// Template data - precios se cargarán dinámicamente
const getTemplates = (originalPrice: number, offerPrice: number): Template[] => [
  {
    id: 'elegance-studio',
    name: 'Elegance Studio',
    category: 'Elegante',
    image: '/api/placeholder/400/300',
    features: ['Reservas online', 'Galería premium', 'Blog integrado', 'SEO optimizado'],
    popular: true,
    originalPrice,
    discountedPrice: offerPrice,
    description: 'Diseño sofisticado perfecto para peluquerías de alta gama'
  },
  {
    id: 'modern-cut',
    name: 'Modern Cut',
    category: 'Moderno',
    image: '/api/placeholder/400/300',
    features: ['Diseño responsive', 'Animaciones CSS', 'SEO optimizado', 'Galería interactiva'],
    recommended: true,
    originalPrice,
    discountedPrice: offerPrice,
    description: 'Template contemporáneo con líneas limpias y funcionalidad avanzada'
  },
  {
    id: 'beauty-salon',
    name: 'Beauty Salon',
    category: 'Clásico',
    image: '/api/placeholder/400/300',
    features: ['Estilo atemporal', 'Fácil navegación', 'Multidioma', 'Sistema de citas'],
    originalPrice,
    discountedPrice: offerPrice,
    description: 'Diseño tradicional y elegante que nunca pasa de moda'
  },
  {
    id: 'minimal-hair',
    name: 'Minimal Hair',
    category: 'Minimalista',
    image: '/api/placeholder/400/300',
    features: ['Diseño limpio', 'Carga rápida', 'Mobile-first', 'Portfolio integrado'],
    originalPrice,
    discountedPrice: offerPrice,
    description: 'Menos es más. Diseño minimalista que destaca tu trabajo'
  }
]

export default function OfertaPage() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<'template' | 'info'>('template')
  const [pricing, setPricing] = useState({ originalPrice: 799, offerPrice: 199 })
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    businessName: '',
    selectedTemplate: ''
  })

  // Cargar precios dinámicos
  useEffect(() => {
    async function loadPricing() {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const settings = await response.json()
          const newPricing = {
            originalPrice: 799,
            offerPrice: settings.templatePricing?.offerPrice || 199
          }
          setPricing(newPricing)
          setTemplates(getTemplates(newPricing.originalPrice, newPricing.offerPrice))
        } else {
          // Usar valores por defecto si no se puede cargar
          setTemplates(getTemplates(799, 199))
        }
      } catch (error) {
        console.error('Error loading pricing:', error)
        setTemplates(getTemplates(799, 199))
      }
    }
    loadPricing()
  }, [])

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    setFormData(prev => ({ ...prev, selectedTemplate: templateId }))
  }

  const handleContinue = () => {
    if (selectedTemplate) {
      setCurrentStep('info')
    }
  }

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.email && formData.businessName && selectedTemplate) {
      setLoading(true)

      try {
        // Crear sesión de checkout directamente con Stripe
        const response = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            name: formData.name,
            businessName: formData.businessName,
            source: 'other'
          }),
        })

        const result = await response.json()

        if (result.success && result.url) {
          // Redirigir a Stripe Checkout
          window.location.href = result.url
        } else {
          throw new Error(result.error || 'Error al crear la sesión de checkout')
        }
      } catch (error) {
        console.error('Error:', error)
        alert('Error al procesar el pago. Por favor, inténtalo de nuevo.')
        setLoading(false)
      }
    }
  }

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* HERO SECTION */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/20 to-transparent rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/20 to-transparent rounded-full blur-3xl transform -translate-x-32 translate-y-32"></div>
        </div>

        <div className="container max-w-4xl mx-auto px-4 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center bg-white/80 backdrop-blur-lg border border-slate-200/50 rounded-full px-6 py-2 mb-8 shadow-lg">
            <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm font-semibold text-slate-700">Oferta especial por tiempo limitado</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Presencia digital profesional
            <span className="block text-transparent bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text">
              para tu peluquería
            </span>
          </h1>

          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Elige tu plantilla, comparte tu información básica y ten tu sitio web profesional funcionando en 48 horas.
          </p>

          {/* SECCIÓN DE PRECIO PROMINENTE */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 max-w-2xl mx-auto mb-12 shadow-2xl border border-blue-200">
            <div className="text-center text-white">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-bold">
                  🔥 OFERTA ESPECIAL
                </span>
                <span className="bg-green-500 text-white rounded-full px-4 py-2 text-sm font-bold animate-pulse">
                  75% DESCUENTO
                </span>
              </div>

              <div className="mb-4">
                <div className="text-lg opacity-90 mb-2">Precio normal:</div>
                <div className="text-3xl font-bold line-through opacity-75">€799</div>
              </div>

              <div className="mb-6">
                <div className="text-lg opacity-90 mb-2">🎉 Tu precio HOY:</div>
                <div className="text-6xl font-bold mb-2">€199</div>
                <div className="text-xl opacity-90">¡Ahorras €600!</div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => {
                    const templateSection = document.getElementById('template-selector')
                    templateSection?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center gap-3"
                >
                  <Sparkles className="w-6 h-6" />
                  ¡QUIERO MI WEB AHORA!
                  <ArrowRight className="w-6 h-6" />
                </button>

                <span className="text-white/80 text-sm">o</span>

                <a
                  href="https://wa.me/34123456789?text=Hola,%20estoy%20interesado%20en%20la%20oferta%20de%20web%20para%20peluquer%C3%ADa%20por%20199%E2%82%AC"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center gap-3"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
              </div>

              <div className="mt-4 text-sm opacity-90">
                ⏰ Oferta válida por tiempo limitado
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-slate-600 mb-12">
            <div className="flex items-center bg-white/50 backdrop-blur-sm rounded-full px-4 py-2">
              <CheckCircle className="w-5 h-5 text-emerald-500 mr-2" />
              <span className="font-medium">75% descuento</span>
            </div>
            <div className="flex items-center bg-white/50 backdrop-blur-sm rounded-full px-4 py-2">
              <Star className="w-5 h-5 text-amber-500 mr-2" />
              <span className="font-medium">Sin pagos mensuales</span>
            </div>
            <div className="flex items-center bg-white/50 backdrop-blur-sm rounded-full px-4 py-2">
              <Shield className="w-5 h-5 text-blue-500 mr-2" />
              <span className="font-medium">Garantía 30 días</span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="pb-20">
        <div className="container max-w-6xl mx-auto px-4" id="template-selector">
          {currentStep === 'template' ? (
            /* TEMPLATE SELECTION */
            <div className="space-y-12">
              {/* Header */}
              <div className="text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  Elige tu plantilla favorita
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Todas las plantillas incluyen las mismas funcionalidades. Solo elige el diseño que más te guste.
                </p>
              </div>

              {/* Templates Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden cursor-pointer ${
                      selectedTemplate === template.id
                        ? 'ring-4 ring-blue-500 ring-opacity-50 scale-105'
                        : ''
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    {/* Badges */}
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                      {template.popular && (
                        <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
                          <Crown className="w-3 h-3 mr-1" />
                          POPULAR
                        </span>
                      )}
                      {template.recommended && (
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
                          <Star className="w-3 h-3 mr-1" />
                          RECOMENDADO
                        </span>
                      )}
                    </div>

                    {/* Selection indicator */}
                    {selectedTemplate === template.id && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="bg-blue-500 text-white rounded-full p-2 shadow-lg">
                          <Check className="w-4 h-4" />
                        </div>
                      </div>
                    )}

                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={template.image}
                        alt={`Template ${template.name}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Demo button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-white transition-all duration-200 flex items-center gap-2 shadow-lg">
                          <Eye className="w-4 h-4" />
                          Ver Demo
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Header */}
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{template.name}</h3>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                          {template.category}
                        </span>
                      </div>

                      {/* Pricing */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg text-slate-400 line-through">€{template.originalPrice}</span>
                          <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">-75%</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">€{template.discountedPrice}</div>
                        <div className="text-sm text-slate-600">+ €49/mes mantenimiento</div>
                        <div className="text-xs text-green-600 font-medium">¡Ahorras €600!</div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-2 mb-6">
                        {template.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-slate-600">
                            <Zap className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {/* Select button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTemplateSelect(template.id)
                        }}
                        className={`w-full px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                          selectedTemplate === template.id
                            ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {selectedTemplate === template.id ? (
                          <>
                            <Check className="w-4 h-4" />
                            Seleccionada
                          </>
                        ) : (
                          <>
                            <Heart className="w-4 h-4" />
                            Seleccionar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue button */}
              {selectedTemplate && (
                <div className="text-center">
                  <button
                    onClick={handleContinue}
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center"
                  >
                    Continuar con {selectedTemplateData?.name}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* CUSTOMER INFO FORM */
            <div className="max-w-2xl mx-auto">
              {/* Selected template summary */}
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-20 h-16 rounded-lg overflow-hidden">
                    <Image
                      src={selectedTemplateData?.image || '/api/placeholder/80/64'}
                      alt={selectedTemplateData?.name || 'Template'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900">{selectedTemplateData?.name}</h3>
                    <p className="text-slate-600">{selectedTemplateData?.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-400 line-through">€{selectedTemplateData?.originalPrice}</div>
                    <div className="text-2xl font-bold text-slate-900">€{selectedTemplateData?.discountedPrice}</div>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentStep('template')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  ← Cambiar plantilla
                </button>
              </div>

              {/* Customer info form */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">
                    Información de tu peluquería
                  </h2>
                  <p className="text-lg text-slate-600">
                    Solo necesitamos estos datos para personalizar tu sitio web
                  </p>
                </div>

                <form onSubmit={handleInfoSubmit} className="space-y-6">
                  {/* Name field */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                      Tu nombre completo
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200"
                        placeholder="Ej: María García"
                      />
                    </div>
                  </div>

                  {/* Email field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                      Tu email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200"
                        placeholder="maria@mimail.com"
                      />
                    </div>
                  </div>

                  {/* Salon name field */}
                  <div className="space-y-2">
                    <label htmlFor="businessName" className="block text-sm font-semibold text-slate-700">
                      Nombre de tu peluquería
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="businessName"
                        type="text"
                        required
                        value={formData.businessName}
                        onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                        className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200"
                        placeholder="Ej: Salón María"
                      />
                    </div>
                  </div>

                  {/* Order summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <h4 className="font-semibold text-slate-900 mb-4">Resumen del pedido</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Plantilla {selectedTemplateData?.name}</span>
                        <span className="font-medium">€{selectedTemplateData?.discountedPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Descuento aplicado</span>
                        <span className="font-medium text-green-600">-€{(selectedTemplateData?.originalPrice || 299) - (selectedTemplateData?.discountedPrice || 209)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Mantenimiento mensual</span>
                        <span>€49/mes (a partir del mes 2)</span>
                      </div>
                      <div className="border-t border-blue-200 pt-3">
                        <div className="flex justify-between text-lg font-bold text-slate-900">
                          <span>Total a pagar hoy</span>
                          <span>€{selectedTemplateData?.discountedPrice}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                  >
                    Continuar al pago
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>

                  <p className="text-xs text-center text-slate-500 mt-4">
                    Al continuar, aceptas nuestros términos de servicio. Tu sitio web estará listo en máximo 48 horas.
                  </p>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}