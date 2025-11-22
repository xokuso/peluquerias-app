'use client';

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Star, TrendingUp, Award, Sparkles } from 'lucide-react'
import { SalonTemplate, salonTemplates } from '@/data/salon-templates'
import TemplateCarousel from '@/components/ui/TemplateCarousel'
import { cn } from '@/lib/utils'

// Golden Ratio constant for spacing
const PHI = 1.618033988749895

interface TemplatesGalleryProps {
  onSelectTemplate: (templateId: string) => void
  selectedTemplateId?: string
  showFilters?: boolean
  showSearch?: boolean
  className?: string
}

/**
 * TemplatesGallery - Psychology-optimized template discovery experience
 * Implements the complete UX specification for template selection
 */
export default function TemplatesGallery({
  onSelectTemplate,
  selectedTemplateId,
  showFilters = true,
  showSearch = false,
  className
}: TemplatesGalleryProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'popular' | 'recommended' | 'trending' | string>('popular')
  const [searchQuery, setSearchQuery] = useState('')
  const [displayedTemplates, setDisplayedTemplates] = useState<SalonTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Filter options with professional neutral color mapping
  const filterOptions = [
    {
      id: 'popular',
      label: 'Más Elegidos',
      icon: TrendingUp,
      description: 'Las plantillas más exitosas',
      psychology: 'Social proof - siguiendo la mayoría'
    },
    {
      id: 'recommended',
      label: 'Recomendados',
      icon: Award,
      description: 'Seleccionados por expertos',
      psychology: 'Authority - validación de expertos'
    },
    {
      id: 'trending',
      label: 'Tendencias',
      icon: Star,
      description: 'Lo más nuevo y actual',
      psychology: 'FOMO - miedo a perderse lo último'
    },
    {
      id: 'elegant',
      label: 'Elegancia',
      icon: Sparkles,
      description: 'Alta gama y sofisticación',
      psychology: 'Aspiración - deseo de exclusividad'
    },
    {
      id: 'modern',
      label: 'Modernos',
      icon: TrendingUp,
      description: 'Innovación y vanguardia',
      psychology: 'Innovación - estar a la vanguardia'
    }
  ]

  // Template filtering logic with psychology consideration
  const getFilteredTemplates = useMemo(() => {
    let filtered: SalonTemplate[] = []

    switch (selectedFilter) {
      case 'popular':
        filtered = salonTemplates.filter(t => t.badges?.includes('popular'))
        break
      case 'recommended':
        filtered = salonTemplates.filter(t => t.badges?.includes('recommended'))
        break
      case 'trending':
        filtered = salonTemplates.filter(t => t.badges?.includes('trending'))
        break
      case 'all':
        filtered = salonTemplates
        break
      default:
        // Category filtering
        filtered = salonTemplates.filter(t => t.category === selectedFilter)
    }

    // If no templates found for filter, show all
    if (filtered.length === 0) {
      filtered = salonTemplates
    }

    // Apply search if provided
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tagline.toLowerCase().includes(query) ||
        template.features.some(feature =>
          feature.toLowerCase().includes(query)
        )
      )
    }

    return filtered
  }, [selectedFilter, searchQuery])

  // Update displayed templates with loading state for UX
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setDisplayedTemplates(getFilteredTemplates)
      setIsLoading(false)
    }, 150) // Brief loading state for smooth transition

    return () => clearTimeout(timer)
  }, [getFilteredTemplates])

  // Analytics tracking for conversion optimization
  const trackFilterSelection = (filterId: string) => {
    // Future: Analytics integration
    console.log('Filter selected:', filterId)
    setSelectedFilter(filterId)
  }

  const trackTemplateView = (templateId: string) => {
    // Future: Analytics integration
    console.log('Template viewed:', templateId)
  }

  return (
    <section
      className={cn(
        'relative min-h-screen py-16',
        'bg-white',
        className
      )}
      id="templates-gallery"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, var(--neutral-200) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }}
        />
      </div>

      <div className="relative container mx-auto px-4" style={{ gap: `${PHI}rem` }}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className={cn(
            'text-center relative',
            'bg-white border border-neutral-200',
            'rounded-2xl p-8 md:p-12',
            'shadow-md hover:shadow-lg transition-all duration-300'
          )}
          style={{
            marginBottom: `${PHI * 2}rem`
          }}
          transition={{
            opacity: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
            y: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
          }}
        >

          <div className="relative z-10">
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-neutral-800">
                Encuentra tu{' '}
              </span>
              <span className="text-accent-primary">
                plantilla perfecta
              </span>
            </motion.h2>
            <motion.p
              className="text-xl md:text-2xl text-neutral-600 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              Cada plantilla está diseñada específicamente para diferentes tipos de peluquerías.
              Encuentra la que mejor represente la personalidad de tu salón.
            </motion.p>
          </div>

        </motion.div>

        {/* Filters Section */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.1,
              ease: [0.16, 1, 0.3, 1]
            }}
            style={{ marginBottom: `${PHI * 1.5}rem` }}
          >
            <div className="flex flex-wrap justify-center" style={{ gap: `${PHI * 0.5}rem` }}>
              {filterOptions.map((filter, index) => {
                const isSelected = selectedFilter === filter.id
                const Icon = filter.icon

                return (
                  <motion.button
                    key={filter.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: index * 0.05,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    onClick={() => trackFilterSelection(filter.id)}
                    className={cn(
                      'group relative px-6 py-3 rounded-xl transition-all duration-300',
                      'font-medium text-sm',
                      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary/30',
                      // Base styling
                      'bg-white border border-neutral-200',
                      'hover:bg-neutral-50 hover:border-neutral-300',
                      'hover:shadow-sm',
                      // Selected state
                      isSelected && [
                        'bg-accent-primary text-white border-accent-primary',
                        'shadow-md'
                      ],
                      // Non-selected state
                      !isSelected && 'text-neutral-600 hover:text-neutral-800'
                    )}
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{
                      scale: 0.98,
                      transition: { duration: 0.1 }
                    }}
                  >
                    <div className="relative flex items-center gap-2">
                      <Icon className={cn(
                        'w-4 h-4 transition-colors duration-200',
                        isSelected ? 'text-white' : 'text-neutral-500'
                      )} />
                      <span className="relative">{filter.label}</span>
                    </div>

                    {/* Tooltip */}
                    <div className={cn(
                      'absolute -top-12 left-1/2 -translate-x-1/2 z-20',
                      'px-3 py-2 bg-neutral-800 text-white text-xs rounded-lg',
                      'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                      'whitespace-nowrap pointer-events-none',
                      'shadow-lg'
                    )}>
                      {filter.description}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800" />
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Active Filter Description */}
            <motion.div
              key={selectedFilter}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1]
              }}
              className={cn(
                'text-center mt-6 p-4 rounded-xl',
                'bg-beige-50 border border-beige-100'
              )}
            >
              <p className="text-neutral-600 text-sm">
                {filterOptions.find(f => f.id === selectedFilter)?.description}
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Search Bar */}
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="max-w-lg mx-auto"
            style={{ marginBottom: `${PHI * 1.5}rem` }}
          >
            <div className="relative group">
              {/* Search Icon */}
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5 z-10 transition-colors duration-200 group-focus-within:text-accent-primary" />

              {/* Search Input */}
              <input
                type="text"
                placeholder="Buscar por estilo, características..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'w-full pl-12 pr-6 py-4 rounded-xl',
                  'bg-white border border-neutral-200',
                  'hover:border-neutral-300',
                  'focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20',
                  'text-neutral-800 placeholder-neutral-500',
                  'text-base md:text-lg',
                  'transition-all duration-200'
                )}
              />
            </div>
          </motion.div>
        )}

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.3,
            ease: [0.16, 1, 0.3, 1]
          }}
          className={cn(
            'text-center relative',
            'bg-beige-50 rounded-xl p-6',
            'border border-beige-100'
          )}
          style={{ marginBottom: `${PHI * 1.5}rem` }}
        >
          <p className="text-neutral-700 text-lg">
            <span className="font-bold text-2xl text-accent-primary">
              {displayedTemplates.length}
            </span>{' '}
            <span className="font-medium">
              {displayedTemplates.length === 1 ? 'plantilla encontrada' : 'plantillas encontradas'}
            </span>
            {selectedFilter !== 'all' && (
              <span className="text-neutral-500 ml-2 text-base">
                en {filterOptions.find(f => f.id === selectedFilter)?.label}
              </span>
            )}
          </p>
        </motion.div>

        {/* Templates Carousel Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.4,
            ease: [0.16, 1, 0.3, 1]
          }}
          className={cn(
            'relative',
            'bg-white rounded-2xl',
            'border border-neutral-200 shadow-lg',
            'p-6 md:p-8'
          )}
          style={{ marginBottom: `${PHI * 2}rem` }}
        >

          <div className="relative">
            {isLoading ? (
              // Skeleton Loading State
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                style={{ gap: `${PHI}rem` }}
              >
                {Array.from({ length: 3 }).map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: index * 0.1,
                      duration: 0.6,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    className="relative"
                  >
                    {/* Skeleton Card */}
                    <div className={cn(
                      'bg-neutral-100 rounded-xl p-4',
                      'border border-neutral-200',
                      'animate-pulse'
                    )}>
                      {/* Image Placeholder */}
                      <div className="relative aspect-[4/3] rounded-lg mb-4 bg-neutral-200" />

                      {/* Text Placeholders */}
                      <div className="space-y-3">
                        <div className="h-4 bg-neutral-300 rounded w-3/4" />
                        <div className="h-3 bg-neutral-300 rounded w-1/2" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : displayedTemplates.length > 0 ? (
              <TemplateCarousel
                templates={displayedTemplates}
                onSelectTemplate={(templateId: string) => {
                  trackTemplateView(templateId)
                  onSelectTemplate(templateId)
                }}
                selectedTemplateId={selectedTemplateId}
                showDots={true}
                className=""
              />
            ) : (
              // No Results State
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className={cn(
                  'text-center relative',
                  'bg-neutral-50 rounded-xl p-12',
                  'border border-neutral-200'
                )}
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-neutral-100 rounded-full flex items-center justify-center">
                  <Search className="w-10 h-10 text-neutral-400" />
                </div>

                <h3 className="text-xl font-bold text-neutral-800 mb-4">
                  No encontramos plantillas
                </h3>
                <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                  No hay plantillas que coincidan con tu búsqueda.
                </p>

                {/* Reset Button */}
                <motion.button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedFilter('popular')
                  }}
                  className={cn(
                    'px-8 py-3 rounded-xl font-medium transition-all duration-200',
                    'bg-accent-primary text-white',
                    'hover:bg-accent-primary/90',
                    'focus:outline-none focus:ring-2 focus:ring-accent-primary/30'
                  )}
                  whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Ver todas las plantillas
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Conversion Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.5,
            ease: [0.16, 1, 0.3, 1]
          }}
          className={cn(
            'relative text-center',
            'bg-beige-50 rounded-2xl p-8 lg:p-12',
            'border border-beige-100'
          )}
          style={{ marginBottom: 'clamp(2rem, 5vw, 5.236rem)' }}
        >

          <div className="relative">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              <span className="text-neutral-800">¿No encuentras</span>{' '}
              <span className="text-accent-primary">
                lo que buscas?
              </span>
            </h3>
            <p className="text-lg sm:text-xl text-neutral-600 mb-6 sm:mb-8 lg:mb-10 max-w-3xl mx-auto leading-relaxed">
              Cada plantilla puede personalizarse completamente. Nuestro equipo puede adaptar
              cualquier diseño a la identidad específica de tu peluquería.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 lg:gap-6 w-full">
              {/* Secondary Button */}
              <motion.button
                className={cn(
                  'px-6 sm:px-8 py-4 min-h-[48px] rounded-xl font-medium transition-all duration-200 w-full sm:w-auto',
                  'bg-white border border-neutral-300',
                  'hover:bg-neutral-50 hover:border-neutral-400',
                  'focus:outline-none focus:ring-2 focus:ring-accent-primary/30',
                  'text-neutral-700',
                  'text-base md:text-lg'
                )}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                Contactar por personalización
              </motion.button>

              {/* Primary Button */}
              <motion.button
                onClick={() => trackFilterSelection('all')}
                className={cn(
                  'px-6 sm:px-8 py-4 min-h-[48px] rounded-xl font-medium transition-all duration-200 w-full sm:w-auto',
                  'bg-accent-primary text-white',
                  'hover:bg-accent-primary/90',
                  'focus:outline-none focus:ring-2 focus:ring-accent-primary/30',
                  'text-base md:text-lg'
                )}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                Ver todas las plantillas
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Trust Signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.6,
            delay: 0.6,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 text-center gap-4 sm:gap-6 lg:gap-8 w-full max-w-full"
          style={{ marginTop: 'clamp(1.5rem, 4vw, 2.427rem)' }}
        >
          {/* Trust Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.7,
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1]
            }}
            className={cn(
              'relative group w-full max-w-full',
              'bg-white rounded-xl p-4 sm:p-6 lg:p-8',
              'border border-neutral-200 shadow-md',
              'hover:shadow-lg hover:border-neutral-300',
              'transition-all duration-300 min-h-[180px] flex flex-col justify-center'
            )}
          >
            <div className="relative space-y-4">
              {/* Icon Container */}
              <div className="w-12 sm:w-16 h-12 sm:h-16 mx-auto bg-accent-primary/10 rounded-full flex items-center justify-center min-h-[48px] min-w-[48px]">
                <Award className="w-6 sm:w-8 h-6 sm:h-8 text-accent-primary" />
              </div>

              <h4 className="font-bold text-neutral-800 text-base sm:text-lg">
                Diseño Profesional
              </h4>
              <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
                Creado por expertos en UX específicamente para peluquerías
              </p>
            </div>
          </motion.div>

          {/* Trust Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.8,
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1]
            }}
            className={cn(
              'relative group',
              'bg-white rounded-xl p-8',
              'border border-neutral-200 shadow-md',
              'hover:shadow-lg hover:border-neutral-300',
              'transition-all duration-300'
            )}
          >
            <div className="relative space-y-4">
              {/* Icon Container */}
              <div className="w-16 h-16 mx-auto bg-accent-primary/10 rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-accent-primary" />
              </div>

              <h4 className="font-bold text-neutral-800 text-lg">
                Fácil de Usar
              </h4>
              <p className="text-neutral-600 text-base leading-relaxed">
                Tu web estará lista en menos de 24 horas
              </p>
            </div>
          </motion.div>

          {/* Trust Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.9,
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1]
            }}
            className={cn(
              'relative group',
              'bg-white rounded-xl p-8',
              'border border-neutral-200 shadow-md',
              'hover:shadow-lg hover:border-neutral-300',
              'transition-all duration-300'
            )}
          >
            <div className="relative space-y-4">
              {/* Icon Container */}
              <div className="w-16 h-16 mx-auto bg-accent-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-accent-primary" />
              </div>

              <h4 className="font-bold text-neutral-800 text-lg">
                Completamente Personalizable
              </h4>
              <p className="text-neutral-600 text-base leading-relaxed">
                Adaptamos cada detalle a tu marca y estilo
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}