'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Eye, Star, ArrowRight, Users } from 'lucide-react'
import { SalonTemplate } from '@/data/salon-templates'
import TemplatePreviewModal from './TemplatePreviewModal'

interface TemplateCardProps {
  template: SalonTemplate
  priority?: boolean
}

// Function to get style icon
const getStyleIcon = (style: string) => {
  const icons: Record<string, string> = {
    'elegante': '✨',
    'moderno': '🔥',
    'femenino': '💅',
    'masculino': '💪',
    'clasico': '🏛️',
    'vanguardista': '🚀'
  }
  return icons[style] || '✨'
}

// Function to get functionality icons
const getFunctionalityIcon = (functionality: string) => {
  const icons: Record<string, string> = {
    'reservas': '📅',
    'galeria': '🖼️',
    'blog': '📝',
    'ecommerce': '🛒'
  }
  return icons[functionality] || '⚡'
}

export default function TemplateCard({ template, priority = false }: TemplateCardProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleChooseTemplate = () => {
    // Redirect to checkout with template parameter
    window.location.href = `/checkout?template=${template.id}`
  }

  const handleViewDemo = () => {
    if (template.demoUrl) {
      // Open demo URL in new tab
      window.open(template.demoUrl, '_blank')
    } else {
      // Show preview modal if no demo URL
      setShowPreview(true)
    }
  }

  // Generate fallback gradient based on template colors
  const gradientStyle = {
    background: `linear-gradient(135deg, ${template.colors.primary}20, ${template.colors.secondary}20)`
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden
                      hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group">
        {/* Image Preview */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {!imageError ? (
            <Image
              src={template.image}
              alt={`Preview de ${template.name}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              priority={priority}
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-6xl"
              style={gradientStyle}
            >
              {getStyleIcon(template.style)}
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30
                          transition-all duration-300 flex items-center justify-center opacity-0
                          group-hover:opacity-100">
            <div className="flex space-x-3">
              <button
                onClick={handleViewDemo}
                className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium
                           hover:bg-gray-100 transition-colors flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Ver Demo</span>
              </button>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {template.popular && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium
                               flex items-center space-x-1">
                <Star className="h-3 w-3" />
                <span>Más Popular</span>
              </span>
            )}
            {template.badges?.includes('new') && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Nuevo
              </span>
            )}
            {template.badges?.includes('trending') && (
              <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Tendencia
              </span>
            )}
            {template.badges?.includes('recommended') && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Recomendado
              </span>
            )}
          </div>

          {/* Style indicator */}
          <div className="absolute top-3 right-3">
            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-full p-2">
              <span className="text-lg">{getStyleIcon(template.style)}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="mb-3">
            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-orange-600
                           transition-colors">
              {template.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{template.shortDescription}</p>
            <p className="text-xs text-gray-500 line-clamp-2">{template.description}</p>
          </div>

          {/* Features Tags */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1 mb-3">
              {template.functionality.map((func, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1 bg-gray-100 text-gray-700
                             text-xs px-2 py-1 rounded-full"
                >
                  <span>{getFunctionalityIcon(func)}</span>
                  <span className="capitalize">{func}</span>
                </span>
              ))}
            </div>

            {/* Color palette preview */}
            <div className="flex items-center space-x-1 mb-2">
              <span className="text-xs text-gray-500 mr-2">Colores:</span>
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: template.colors.primary }}
              ></div>
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: template.colors.secondary }}
              ></div>
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: template.colors.accent }}
              ></div>
            </div>
          </div>

          {/* Usage stats */}
          {template.usedBy && (
            <div className="flex items-center space-x-1 mb-4 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>{template.usedBy}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleChooseTemplate}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium
                         hover:bg-orange-700 transition-colors flex items-center justify-center
                         space-x-2 group/btn"
            >
              <span>Elegir Esta</span>
              <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleViewDemo}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium
                         hover:bg-gray-200 transition-colors flex items-center justify-center
                         space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>Ver Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <TemplatePreviewModal
          template={template}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  )
}