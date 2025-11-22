'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { X, ExternalLink, Star, Check, ArrowRight } from 'lucide-react'
import { SalonTemplate } from '@/data/salon-templates'

interface TemplatePreviewModalProps {
  template: SalonTemplate
  isOpen: boolean
  onClose: () => void
}

export default function TemplatePreviewModal({ template, isOpen, onClose }: TemplatePreviewModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleChooseTemplate = () => {
    onClose()
    window.location.href = `/checkout?template=${template.id}`
  }

  const handleOpenDemo = () => {
    if (template.demoUrl) {
      window.open(template.demoUrl, '_blank')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
            {template.popular && (
              <span className="bg-orange-100 text-orange-800 text-sm px-2 py-1 rounded-full font-medium flex items-center space-x-1">
                <Star className="h-4 w-4" />
                <span>Más Popular</span>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Image and Demo */}
            <div className="space-y-6">
              {/* Main Preview Image */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                <Image
                  src={template.image}
                  alt={`Preview completo de ${template.name}`}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Demo Button */}
              {template.demoUrl && (
                <button
                  onClick={handleOpenDemo}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium
                             hover:bg-blue-700 transition-colors flex items-center justify-center
                             space-x-2"
                >
                  <ExternalLink className="h-5 w-5" />
                  <span>Ver Demo en Vivo</span>
                </button>
              )}

              {/* Color Palette */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Paleta de Colores</h4>
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(template.colors).map(([key, color]) => (
                    <div key={key} className="text-center">
                      <div
                        className="w-full h-12 rounded-lg border border-gray-200 mb-1"
                        style={{ backgroundColor: color }}
                      ></div>
                      <div className="text-xs text-gray-600 capitalize">{key}</div>
                      <div className="text-xs text-gray-400 font-mono">{color}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
                <p className="text-gray-600 mb-2">{template.shortDescription}</p>
                <p className="text-gray-500 text-sm">{template.description}</p>
              </div>

              {/* Style & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Estilo</h4>
                  <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm capitalize">
                    {template.style}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Categoría</h4>
                  <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm capitalize">
                    {template.category}
                  </span>
                </div>
              </div>

              {/* Functionalities */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Funcionalidades Incluidas</h4>
                <div className="space-y-2">
                  {template.functionality.map((func, index) => {
                    const functionalityLabels: Record<string, string> = {
                      'reservas': 'Sistema de Reservas Online',
                      'galeria': 'Galería Avanzada',
                      'blog': 'Sistema de Blog',
                      'ecommerce': 'Tienda Online'
                    }
                    return (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="text-gray-700">{functionalityLabels[func] || func}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Características Destacadas</h4>
                <div className="space-y-2">
                  {template.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage Statistics */}
              {template.usedBy && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Uso Actual</h4>
                  <p className="text-gray-600">{template.usedBy}</p>
                </div>
              )}

              {/* Keywords */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {template.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-orange-100 text-orange-800 text-sm px-2 py-1 rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleChooseTemplate}
                className="flex-1 bg-orange-600 text-white py-4 px-6 rounded-lg font-semibold
                           hover:bg-orange-700 transition-colors flex items-center justify-center
                           space-x-2 group"
              >
                <span>Elegir {template.name}</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onClose}
                className="sm:w-auto w-full bg-gray-200 text-gray-700 py-4 px-6 rounded-lg font-semibold
                           hover:bg-gray-300 transition-colors"
              >
                Seguir Viendo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}