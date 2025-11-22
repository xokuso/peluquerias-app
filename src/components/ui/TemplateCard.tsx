'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SalonTemplate } from '@/data/salon-templates'
import { cn } from '@/lib/utils'
import { trackEvents } from '@/lib/analytics'

interface TemplateCardProps {
  template: SalonTemplate
  onSelect: (templateId: string) => void
  isActive?: boolean
  priority?: boolean // For loading optimization
  className?: string
}

/**
 * TemplateCard - Optimized for conversion with psychological triggers
 * Simplified version to work with existing SalonTemplate structure
 */
export default function TemplateCard({
  template,
  onSelect,
  isActive = false,
  priority = false, // eslint-disable-line @typescript-eslint/no-unused-vars
  className
}: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showDetailedInfo, setShowDetailedInfo] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout>()

  // Progressive information disclosure timing
  useEffect(() => {
    if (isHovered) {
      // Delay detailed info reveal to avoid overwhelming
      hoverTimeoutRef.current = setTimeout(() => {
        setShowDetailedInfo(true)
      }, 300) // 300ms delay for progressive disclosure
    } else {
      setShowDetailedInfo(false)
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [isHovered])

  // Accessibility: Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(template.id)
    }
  }

  // Badge component for social proof
  const Badge = ({ type, children }: { type: string; children: React.ReactNode }) => {
    const badgeStyles = {
      popular: 'bg-orange-500 text-white',
      new: 'bg-green-500 text-white',
      recommended: 'bg-amber-500 text-white',
      trending: 'bg-purple-500 text-white'
    }

    return (
      <span className={cn(
        'px-2 py-1 rounded-full text-xs font-medium',
        badgeStyles[type as keyof typeof badgeStyles] || 'bg-gray-500 text-white'
      )}>
        {children}
      </span>
    )
  }

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative group cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-300',
        'shadow-lg hover:shadow-xl',
        isActive
          ? 'border-orange-500 ring-4 ring-orange-100'
          : 'border-gray-200 hover:border-gray-300',
        className
      )}
      style={{
        backgroundColor: template.colors.background,
        borderColor: isActive ? template.colors.primary : undefined
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.2,
        ease: "easeOut"
      }}
      whileHover={{
        scale: 1.03,
        transition: {
          duration: 0.15,
          ease: "easeOut"
        }
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(template.id)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Seleccionar plantilla ${template.name} - ${template.description}`}
      aria-describedby={`template-${template.id}-details`}
    >
      {/* Social Proof Badges - Top Corner */}
      {template.badges && template.badges.length > 0 && (
        <div className="absolute top-3 left-3 z-20 flex gap-2">
          {template.badges.map((badge, index) => (
            <motion.div
              key={badge}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Badge type={badge}>
                {badge === 'popular' && '🔥 Más elegido'}
                {badge === 'new' && '✨ Nuevo'}
                {badge === 'recommended' && '⭐ Recomendado'}
                {badge === 'trending' && '📈 Tendencia'}
              </Badge>
            </motion.div>
          ))}
        </div>
      )}

      {/* Template Mockup Preview - Simulated Design */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <div className="absolute inset-0 p-4">
          {/* Simulated Browser Interface */}
          <div className="h-full bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Browser Header */}
            <div className="h-6 bg-gray-100 flex items-center px-2 gap-1">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              </div>
              <div className="ml-2 text-xs text-gray-500 flex-1 truncate">
                {template.name.toLowerCase().replace(/\s+/g, '')}.com
              </div>
            </div>

            {/* Website Content */}
            <div className="p-2 space-y-1 h-full bg-white">
              {/* Hero Section */}
              <div
                className="h-12 rounded flex items-center justify-center"
                style={{
                  backgroundColor: template.colors.primary,
                  color: template.colors.primary === '#1A1A1A' || template.colors.primary === '#1B3B36' || template.colors.primary === '#263238' ? '#FFFFFF' : template.colors.text
                }}
              >
                <div className="text-center">
                  <div className="text-xs font-bold">{template.name}</div>
                  <div className="text-xs opacity-80">{template.tagline}</div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-1 h-4">
                {['Inicio', 'Servicios', 'Galería', 'Contacto'].map((item, index) => (
                  <div
                    key={item}
                    className="flex-1 rounded text-xs flex items-center justify-center"
                    style={{
                      backgroundColor: index === 0 ? template.colors.secondary : template.colors.accent,
                      color: template.colors.text,
                      fontSize: '0.5rem'
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* Content Sections */}
              <div className="grid grid-cols-2 gap-1 h-8">
                <div
                  className="rounded p-1"
                  style={{ backgroundColor: template.colors.accent }}
                >
                  <div className="text-xs font-medium" style={{ color: template.colors.text, fontSize: '0.4rem' }}>
                    Servicios
                  </div>
                  <div
                    className="w-full h-1 rounded mt-0.5 opacity-60"
                    style={{ backgroundColor: template.colors.secondary }}
                  ></div>
                </div>
                <div
                  className="rounded p-1 opacity-70"
                  style={{ backgroundColor: template.colors.secondary }}
                >
                  <div className="text-xs font-medium" style={{ color: template.colors.text, fontSize: '0.4rem' }}>
                    Horarios
                  </div>
                  <div
                    className="w-full h-1 rounded mt-0.5 opacity-60"
                    style={{ backgroundColor: template.colors.primary }}
                  ></div>
                </div>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-3 gap-1 h-8">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="rounded opacity-40"
                    style={{ backgroundColor: template.colors.accent }}
                  ></div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="flex justify-center pt-1">
                <div
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: template.colors.primary,
                    color: '#FFFFFF',
                    fontSize: '0.5rem'
                  }}
                >
                  Reservar Cita
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hover Overlay with Progressive Disclosure */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ delay: 0.1 }}
                className="text-white text-center space-y-2"
              >
                <div className="text-lg font-semibold">Ver en detalle</div>
                <div className="text-sm opacity-90">{template.tagline}</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Template Information */}
      <div className="p-4 space-y-3">
        {/* Header Info - Always Visible */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3
              className="text-xl font-bold leading-tight"
              style={{ color: template.colors.text }}
            >
              {template.name}
            </h3>
            {/* Category Badge */}
            <div
              className="px-3 py-1 rounded-full text-xs font-medium capitalize text-white"
              style={{ backgroundColor: template.colors.primary }}
            >
              {template.category}
            </div>
          </div>

          <p
            className="text-sm leading-relaxed"
            style={{ color: template.colors.text }}
          >
            {template.description}
          </p>

          {/* Target Audience Hint */}
          <div
            className="inline-block px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${template.colors.primary}20`,
              color: template.colors.primary
            }}
          >
            Estilo: {template.category === 'elegant' ? 'Elegancia' : template.category === 'modern' ? 'Moderno' : template.category === 'beauty' ? 'Belleza' : template.category === 'barber' ? 'Barbería' : template.category === 'classic' ? 'Clásico' : 'Creativo'}
          </div>
        </div>

        {/* Progressive Disclosure - Core Features */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {template.features.slice(0, 3).map((feature) => (
              <span
                key={feature}
                className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-700"
              >
                {feature}
              </span>
            ))}
            {template.features.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-500">
                +{template.features.length - 3} más
              </span>
            )}
          </div>

          {/* Social Proof */}
          {template.usedBy && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{template.usedBy}</span>
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                <span>4.8</span>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Information - Revealed on Hover */}
        <AnimatePresence>
          {showDetailedInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 border-t pt-3"
              id={`template-${template.id}-details`}
            >
              {/* All Features */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">
                  Características completas:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {template.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 text-xs rounded-md"
                      style={{
                        backgroundColor: `${template.colors.primary}10`,
                        color: template.colors.primary
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Additional Info based on category */}
              <div
                className="p-3 rounded-lg border-l-4"
                style={{
                  backgroundColor: `${template.colors.primary}05`,
                  borderColor: template.colors.primary
                }}
              >
                <p className="text-sm text-gray-700">
                  {template.category === 'elegant' && 'Diseño minimalista con enfoque en la elegancia y sofisticación. Ideal para salones premium.'}
                  {template.category === 'modern' && 'Diseño contemporáneo con últimas tecnologías. Perfecto para salones innovadores.'}
                  {template.category === 'beauty' && 'Estilo especializado en tratamientos de belleza. Ideal para estudios de estética.'}
                  {template.category === 'barber' && 'Diseño masculino especializado en barbería. Perfecto para barber shops tradicionales.'}
                  {template.category === 'classic' && 'Estilo atemporal que transmite tradición y confianza. Ideal para salones familiares.'}
                  {template.category === 'trendy' && 'Diseño vanguardista para estilistas creativos que buscan destacar.'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Button */}
        <motion.button
          className={cn(
            "w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          )}
          style={{
            backgroundColor: template.colors.primary
          }}
          whileHover={{
            scale: 1.02
          }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation()
            trackEvents.selectTemplate(template.name)
            onSelect(template.id)
          }}
          aria-label={`Elegir plantilla ${template.name}`}
        >
          {template.buttonText}
        </motion.button>
      </div>

      {/* Selection State Indicator */}
      {isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center"
        >
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  )
}