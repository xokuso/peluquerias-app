'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Check,
  Loader2,
  Info,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  DollarSign,
  AlertCircle,
  ChevronRight,
  CheckCircle,
  XCircle,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/useDebounce'

// Domain extension configuration with pricing
const DOMAIN_EXTENSIONS = [
  {
    extension: '.es',
    price: 9.99,
    label: 'España',
    popular: true,
    badge: 'Recomendado',
    description: 'Ideal para negocios españoles'
  },
  {
    extension: '.com',
    price: 12.99,
    label: 'Internacional',
    popular: true,
    description: 'El más reconocido mundialmente'
  },
  {
    extension: '.net',
    price: 13.99,
    label: 'Red',
    popular: false,
    description: 'Alternativa profesional'
  },
  {
    extension: '.org',
    price: 14.99,
    label: 'Organización',
    popular: false,
    description: 'Para organizaciones'
  }
]

const FREE_DOMAIN_THRESHOLD = 15.00

interface DomainCheckResult {
  available: boolean
  domain: string
  price?: number
  suggestions?: string[]
  error?: string
}

interface DomainSearchProps {
  onDomainSelected: (domain: string, extension: string, price: number) => void
  initialDomain?: string
  salonName?: string
  showPricingInfo?: boolean
}

export default function DomainSearchPanel({
  onDomainSelected,
  initialDomain = '',
  salonName = '',
  showPricingInfo = true
}: DomainSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialDomain)
  const [isChecking, setIsChecking] = useState(false)
  const [checkResults, setCheckResults] = useState<Record<string, DomainCheckResult>>({})
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Generate smart suggestions based on salon name
  const generateSmartSuggestions = useCallback(() => {
    if (!salonName) return []

    const baseName = salonName.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove multiple hyphens
      .trim()

    return [
      baseName,
      `${baseName}-peluqueria`,
      `${baseName}-salon`,
      `${baseName}-hair`,
      `peluqueria-${baseName}`,
      `salon-${baseName}`
    ].filter((suggestion, index, self) => self.indexOf(suggestion) === index)
  }, [salonName])

  // Check domain availability for all extensions
  const checkAllDomainExtensions = async (domain: string) => {
    if (!domain || domain.length < 3) return

    setIsChecking(true)
    setError(null)

    // Check all extensions in parallel
    const checkPromises = DOMAIN_EXTENSIONS.map(async (extensionData) => {
      try {
        const response = await fetch('/api/check-domain', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            domain,
            extension: extensionData.extension
          })
        })

        if (!response.ok) {
          throw new Error('Error al verificar el dominio')
        }

        const data: DomainCheckResult = await response.json()
        return {
          key: `${domain}${extensionData.extension}`,
          data
        }
      } catch (err) {
        console.error(`Error checking ${domain}${extensionData.extension}:`, err)
        return {
          key: `${domain}${extensionData.extension}`,
          data: {
            available: false,
            domain: `${domain}${extensionData.extension}`,
            error: 'Error al verificar'
          }
        }
      }
    })

    try {
      const results = await Promise.all(checkPromises)

      const newResults: Record<string, DomainCheckResult> = {}
      results.forEach(({ key, data }) => {
        newResults[key] = data
      })

      setCheckResults(prev => ({ ...prev, ...newResults }))

      // Check if any domain has suggestions to show
      const hasSuggestions = Object.values(newResults).some(result =>
        result.suggestions && result.suggestions.length > 0
      )
      if (hasSuggestions) {
        setShowSuggestions(true)
      }
    } catch (err) {
      console.error('Error checking domains:', err)
      setError('Error al verificar la disponibilidad. Por favor, inténtalo de nuevo.')
    } finally {
      setIsChecking(false)
    }
  }

  // Auto-check when search term changes
  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.length >= 3) {
      checkAllDomainExtensions(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm])

  // Calculate final price for the user
  const calculateUserPrice = (domainPrice: number) => {
    if (domainPrice <= FREE_DOMAIN_THRESHOLD) {
      return 0
    }
    return domainPrice - FREE_DOMAIN_THRESHOLD
  }

  // Handle continue to next step
  const handleContinue = () => {
    if (!selectedDomain) return

    const [domain, ...extensionParts] = selectedDomain.split('.')
    const extension = `.${extensionParts.join('.')}`
    const extensionData = DOMAIN_EXTENSIONS.find(e => e.extension === extension)
    const price = extensionData?.price || 12.99

    onDomainSelected(domain || '', extension, price)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          Paso 1 de 4 - Elige tu dominio
        </div>

        <h2 className="text-3xl font-bold text-neutral-900">
          Elige el dominio perfecto para tu web
        </h2>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Tu dominio es la dirección web donde tus clientes te encontrarán.
          Elige uno memorable y profesional.
        </p>
      </motion.div>

      {/* Pricing Info Banner */}
      {showPricingInfo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-1">
                Dominios incluidos hasta 15€
              </h3>
              <p className="text-green-700 text-sm">
                Los dominios con un precio hasta 15€ están incluidos GRATIS en tu plan.
                Solo pagarás la diferencia si eliges uno más caro.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6"
      >
        <div className="space-y-4">
          {/* Instructions */}
          {!searchTerm && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Search className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">
                    Busca tu dominio ideal
                  </h3>
                  <p className="text-blue-700 text-sm">
                    Introduce al menos 3 caracteres. Te mostraremos la disponibilidad
                    para todas las extensiones y podrás elegir la que más te guste.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Domain Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="ej: mi-peluqueria (mínimo 3 caracteres)"
              className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              minLength={3}
            />
            {isChecking && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              </div>
            )}
            {/* Character counter */}
            {searchTerm && searchTerm.length < 3 && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <span className="text-sm text-amber-600">
                  {3 - searchTerm.length} más
                </span>
              </div>
            )}
          </div>

          {/* Smart Suggestions - Always show when salon name exists */}
          {salonName && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Sugerencias basadas en &quot;{salonName}&quot;:
              </p>
              <div className="flex flex-wrap gap-2">
                {generateSmartSuggestions().slice(0, 6).map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setSearchTerm(suggestion)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors duration-200 border border-blue-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search tips for empty state */}
          {!searchTerm && !salonName && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-700">Ideas para tu dominio:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'salon-belleza',
                  'peluqueria-center',
                  'hair-studio',
                  'beauty-salon',
                  'estilo-hair',
                  'cut-style'
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setSearchTerm(suggestion)}
                    className="px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-lg text-sm hover:bg-neutral-200 transition-colors duration-200 border border-neutral-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Results Section - Checkbox based approach */}
      <AnimatePresence>
        {searchTerm && searchTerm.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Available Domains List */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
              <div className="p-6 border-b border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Dominios disponibles para &quot;{searchTerm}&quot;
                </h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Selecciona el dominio que más te guste marcando la casilla
                </p>
              </div>

              <div className="divide-y divide-neutral-100">
                {DOMAIN_EXTENSIONS.map((extensionData) => {
                  const fullDomain = `${searchTerm}${extensionData.extension}`
                  const result = checkResults[fullDomain]
                  const domainPrice = extensionData.price
                  const userPrice = calculateUserPrice(domainPrice)
                  const isCheckingThisDomain = !result && isChecking
                  const isSelected = selectedDomain === fullDomain

                  return (
                    <div key={extensionData.extension} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Checkbox for available domains */}
                          {result?.available ? (
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  setSelectedDomain(isSelected ? null : fullDomain)
                                }}
                                className="w-5 h-5 text-blue-600 border-neutral-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                            </label>
                          ) : (
                            <div className="w-5 h-5 flex items-center justify-center">
                              {result ? (
                                <XCircle className="w-5 h-5 text-red-500" />
                              ) : isCheckingThisDomain ? (
                                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                              ) : (
                                <div className="w-5 h-5 border border-neutral-300 rounded bg-neutral-100" />
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            <div>
                              <p className="text-lg font-semibold text-neutral-900">{fullDomain}</p>
                              <div className="flex items-center gap-2">
                                {extensionData.popular && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                    Popular
                                  </span>
                                )}
                                {extensionData.badge && (
                                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                    {extensionData.badge}
                                  </span>
                                )}
                                <span className="text-sm text-neutral-600">{extensionData.description}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          {result ? (
                            result.available ? (
                              <div className="space-y-1">
                                {userPrice === 0 ? (
                                  <div>
                                    <p className="text-lg font-bold text-green-600">GRATIS</p>
                                    <p className="text-xs text-neutral-600">Incluido en tu plan</p>
                                  </div>
                                ) : (
                                  <div>
                                    <p className="text-lg font-bold text-neutral-900">+{userPrice.toFixed(2)}€</p>
                                    <p className="text-xs text-neutral-600 line-through">{domainPrice.toFixed(2)}€</p>
                                    <p className="text-xs text-green-600">Ahorras {FREE_DOMAIN_THRESHOLD}€</p>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="text-sm text-green-700 font-medium">Disponible</span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center">
                                <p className="text-sm text-red-600 font-medium">No disponible</p>
                                <p className="text-xs text-neutral-500">Ya registrado</p>
                              </div>
                            )
                          ) : isCheckingThisDomain ? (
                            <div className="text-center">
                              <p className="text-sm text-neutral-600">Verificando...</p>
                            </div>
                          ) : (
                            <div className="text-center">
                              <p className="text-lg font-bold text-neutral-900">{domainPrice.toFixed(2)}€</p>
                              <p className="text-xs text-neutral-600">Sin verificar</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Alternative Suggestions Section */}
            {Object.values(checkResults).some(result => result.suggestions && result.suggestions.length > 0) && showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-neutral-200 shadow-sm"
              >
                <div className="p-6 border-b border-neutral-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      Alternativas sugeridas
                    </h3>
                    <button
                      onClick={() => setShowSuggestions(false)}
                      className="text-neutral-500 hover:text-neutral-700"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-sm text-neutral-600 mt-1">
                    Otras opciones disponibles basadas en tu búsqueda
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.values(checkResults)[0]?.suggestions?.slice(0, 6).map((suggestion) => {
                      const [, extensionPart] = suggestion.split('.')
                      const ext = `.${extensionPart}`
                      const extensionData = DOMAIN_EXTENSIONS.find(e => e.extension === ext)
                      const price = extensionData?.price || 12.99
                      const userPrice = calculateUserPrice(price)
                      const isSelected = selectedDomain === suggestion

                      return (
                        <motion.div
                          key={suggestion}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`rounded-lg border p-4 transition-all duration-200 cursor-pointer ${
                            isSelected ? 'border-blue-500 bg-blue-50' : 'border-neutral-200 hover:border-blue-300'
                          }`}
                          onClick={() => setSelectedDomain(isSelected ? null : suggestion)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => setSelectedDomain(isSelected ? null : suggestion)}
                                className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                              <div>
                                <p className="font-medium text-neutral-900">{suggestion}</p>
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="text-sm text-green-700">Disponible</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              {userPrice === 0 ? (
                                <p className="text-green-600 font-semibold">Gratis</p>
                              ) : (
                                <p className="text-neutral-900 font-semibold">+{userPrice.toFixed(2)}€</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Next Button */}
      {searchTerm && searchTerm.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <Button
            onClick={handleContinue}
            disabled={!selectedDomain}
            size="lg"
            className={`min-w-[200px] transition-all duration-300 ${
              selectedDomain
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg scale-105'
                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
            }`}
          >
            {selectedDomain ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Continuar al siguiente paso
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                Selecciona un dominio para continuar
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </motion.div>
      )}

      {/* Workflow Preview - Show when no search yet */}
      {!searchTerm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            ¿Cómo funciona la búsqueda de dominios?
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-700 font-semibold">1</span>
              </div>
              <h4 className="font-medium text-blue-900 mb-1">Buscar</h4>
              <p className="text-sm text-blue-700">
                Introduce el nombre que quieres para tu dominio
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-700 font-semibold">2</span>
              </div>
              <h4 className="font-medium text-green-900 mb-1">Seleccionar</h4>
              <p className="text-sm text-green-700">
                Marca la casilla del dominio que más te guste
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-700 font-semibold">3</span>
              </div>
              <h4 className="font-medium text-purple-900 mb-1">Continuar</h4>
              <p className="text-sm text-purple-700">
                Haz clic en el botón verde para avanzar
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8"
      >
        <div className="text-center space-y-2 p-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="font-semibold text-neutral-900">Protección incluida</h4>
          <p className="text-sm text-neutral-600">
            Privacidad WHOIS y protección contra transferencias no autorizadas
          </p>
        </div>

        <div className="text-center space-y-2 p-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Zap className="w-6 h-6 text-green-600" />
          </div>
          <h4 className="font-semibold text-neutral-900">Activación inmediata</h4>
          <p className="text-sm text-neutral-600">
            Tu dominio estará activo en menos de 24 horas tras el pago
          </p>
        </div>

        <div className="text-center space-y-2 p-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <h4 className="font-semibold text-neutral-900">Renovación automática</h4>
          <p className="text-sm text-neutral-600">
            Nunca pierdas tu dominio con nuestra renovación automática anual
          </p>
        </div>
      </motion.div>
    </div>
  )
}