'use client'

import { Dispatch, SetStateAction } from 'react'
import { Check } from 'lucide-react'
import type { FilterState, StyleFilter, ColorFilter, FunctionalityFilter } from '@/types/templates'

interface TemplateFilterProps {
  filters: FilterState
  setFilters: Dispatch<SetStateAction<FilterState>>
  resultsCount: number
}

// Filter options data
const STYLE_OPTIONS: { value: StyleFilter; label: string; icon: string }[] = [
  { value: 'elegante', label: 'Elegante', icon: '✨' },
  { value: 'moderno', label: 'Moderno', icon: '🔥' },
  { value: 'femenino', label: 'Femenino', icon: '💅' },
  { value: 'masculino', label: 'Masculino', icon: '💪' },
  { value: 'clasico', label: 'Clásico', icon: '🏛️' },
  { value: 'vanguardista', label: 'Vanguardista', icon: '🚀' }
]

const COLOR_OPTIONS: { value: ColorFilter; label: string; color: string }[] = [
  { value: 'dorado', label: 'Dorados', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600' },
  { value: 'naranja', label: 'Naranjas', color: 'bg-gradient-to-r from-orange-400 to-orange-600' },
  { value: 'negro', label: 'Negros', color: 'bg-gradient-to-r from-gray-700 to-gray-900' },
  { value: 'rosado', label: 'Rosados', color: 'bg-gradient-to-r from-pink-400 to-pink-600' },
  { value: 'verde', label: 'Verdes', color: 'bg-gradient-to-r from-green-400 to-green-600' },
  { value: 'multicolor', label: 'Multicolor', color: 'bg-gradient-to-r from-purple-400 via-pink-400 to-red-400' }
]

const FUNCTIONALITY_OPTIONS: { value: FunctionalityFilter; label: string; description: string }[] = [
  { value: 'reservas', label: 'Reservas Online', description: 'Sistema de citas integrado' },
  { value: 'galeria', label: 'Galería Avanzada', description: 'Portafolio de trabajos' },
  { value: 'blog', label: 'Blog', description: 'Sistema de contenido' },
  { value: 'ecommerce', label: 'E-commerce', description: 'Tienda online integrada' }
]

export default function TemplateFilter({ filters, setFilters, resultsCount }: TemplateFilterProps) {

  // Toggle filter functions
  const toggleStyle = (style: StyleFilter) => {
    setFilters(prev => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter(s => s !== style)
        : [...prev.styles, style]
    }))
  }

  const toggleColor = (color: ColorFilter) => {
    setFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }))
  }

  const toggleFunctionality = (functionality: FunctionalityFilter) => {
    setFilters(prev => ({
      ...prev,
      functionalities: prev.functionalities.includes(functionality)
        ? prev.functionalities.filter(f => f !== functionality)
        : [...prev.functionalities, functionality]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {resultsCount} resultados
        </span>
      </div>

      {/* Style Filters */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          Por Estilo
          <span className="ml-2 text-xs text-gray-500">
            ({filters.styles.length} seleccionados)
          </span>
        </h4>
        <div className="space-y-2">
          {STYLE_OPTIONS.map((option) => {
            const isSelected = filters.styles.includes(option.value)
            return (
              <label
                key={option.value}
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <div className={`
                  w-5 h-5 border-2 rounded flex items-center justify-center transition-all
                  ${isSelected
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : 'border-gray-300 group-hover:border-orange-400'
                  }
                `}>
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
                <span className="text-xl">{option.icon}</span>
                <span className={`text-sm transition-colors ${
                  isSelected ? 'text-gray-900 font-medium' : 'text-gray-700 group-hover:text-gray-900'
                }`}>
                  {option.label}
                </span>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleStyle(option.value)}
                  className="sr-only"
                />
              </label>
            )
          })}
        </div>
      </div>

      {/* Color Filters */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          Por Color
          <span className="ml-2 text-xs text-gray-500">
            ({filters.colors.length} seleccionados)
          </span>
        </h4>
        <div className="space-y-2">
          {COLOR_OPTIONS.map((option) => {
            const isSelected = filters.colors.includes(option.value)
            return (
              <label
                key={option.value}
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <div className={`
                  w-5 h-5 border-2 rounded flex items-center justify-center transition-all
                  ${isSelected
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : 'border-gray-300 group-hover:border-orange-400'
                  }
                `}>
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
                <div className={`w-6 h-6 rounded-full border border-gray-300 ${option.color}`}></div>
                <span className={`text-sm transition-colors ${
                  isSelected ? 'text-gray-900 font-medium' : 'text-gray-700 group-hover:text-gray-900'
                }`}>
                  {option.label}
                </span>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleColor(option.value)}
                  className="sr-only"
                />
              </label>
            )
          })}
        </div>
      </div>

      {/* Functionality Filters */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          Por Funcionalidad
          <span className="ml-2 text-xs text-gray-500">
            ({filters.functionalities.length} seleccionados)
          </span>
        </h4>
        <div className="space-y-3">
          {FUNCTIONALITY_OPTIONS.map((option) => {
            const isSelected = filters.functionalities.includes(option.value)
            return (
              <label
                key={option.value}
                className="flex items-start space-x-3 cursor-pointer group"
              >
                <div className={`
                  w-5 h-5 border-2 rounded flex items-center justify-center transition-all mt-0.5
                  ${isSelected
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : 'border-gray-300 group-hover:border-orange-400'
                  }
                `}>
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
                <div className="flex-1">
                  <div className={`text-sm transition-colors ${
                    isSelected ? 'text-gray-900 font-medium' : 'text-gray-700 group-hover:text-gray-900'
                  }`}>
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {option.description}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleFunctionality(option.value)}
                  className="sr-only"
                />
              </label>
            )
          })}
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.styles.length > 0 || filters.colors.length > 0 || filters.functionalities.length > 0) && (
        <div className="pt-4 border-t border-gray-200">
          <h5 className="text-sm font-medium text-gray-900 mb-2">Filtros activos:</h5>
          <div className="space-y-1 text-xs">
            {filters.styles.length > 0 && (
              <div className="text-gray-600">
                <span className="font-medium">Estilos:</span> {filters.styles.join(', ')}
              </div>
            )}
            {filters.colors.length > 0 && (
              <div className="text-gray-600">
                <span className="font-medium">Colores:</span> {filters.colors.join(', ')}
              </div>
            )}
            {filters.functionalities.length > 0 && (
              <div className="text-gray-600">
                <span className="font-medium">Funciones:</span> {filters.functionalities.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}