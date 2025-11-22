'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight, Search, Filter, X } from 'lucide-react'
import { salonTemplates } from '@/data/salon-templates'
import TemplateFilter from '@/components/templates/TemplateFilter'
import TemplateGrid from '@/components/templates/TemplateGrid'
import type { FilterState } from '@/types/templates'

export default function PlantillasPage() {
  const [filters, setFilters] = useState<FilterState>({
    styles: [],
    colors: [],
    functionalities: [],
    search: ''
  })

  const [showFilters, setShowFilters] = useState(false)

  // Filter templates based on current filter state
  const filteredTemplates = useMemo(() => {
    return salonTemplates.filter((template) => {
      // Style filter
      const styleMatch = filters.styles.length === 0 || filters.styles.includes(template.style)

      // Color filter
      const colorMatch = filters.colors.length === 0 || filters.colors.includes(template.color)

      // Functionality filter
      const functionalityMatch = filters.functionalities.length === 0 ||
        filters.functionalities.some(func => template.functionality.includes(func))

      // Search filter
      const searchMatch = filters.search === '' ||
        template.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        template.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        template.shortDescription.toLowerCase().includes(filters.search.toLowerCase()) ||
        template.keywords.some(keyword => keyword.toLowerCase().includes(filters.search.toLowerCase()))

      return styleMatch && colorMatch && functionalityMatch && searchMatch
    })
  }, [filters])

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      styles: [],
      colors: [],
      functionalities: [],
      search: ''
    })
  }

  // Count active filters
  const activeFiltersCount = filters.styles.length + filters.colors.length + filters.functionalities.length + (filters.search ? 1 : 0)

  // Generate enhanced structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Plantillas Web para Peluquerías | Diseños Profesionales",
    "description": "Descubre nuestras plantillas exclusivas para peluquerías. Diseños modernos, elegantes y funcionales con sistema de reservas online integrado.",
    "url": "https://peluquerias-web.com/plantillas",
    "inLanguage": "es-ES",
    "isPartOf": {
      "@type": "WebSite",
      "name": "PeluqueríasPRO",
      "url": "https://peluquerias-web.com"
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": "Plantillas para Peluquerías",
      "numberOfItems": salonTemplates.length,
      "itemListElement": salonTemplates.map((template, index) => ({
        "@type": "Product",
        "position": index + 1,
        "name": template.name,
        "description": template.shortDescription,
        "category": "Website Template",
        "audience": {
          "@type": "Audience",
          "audienceType": "Hair Salon Owners"
        },
        "offers": {
          "@type": "Offer",
          "availability": "https://schema.org/InStock",
          "price": "0",
          "priceCurrency": "EUR",
          "seller": {
            "@type": "Organization",
            "name": "PeluqueríasPRO"
          }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "127",
          "bestRating": "5",
          "worstRating": "1"
        },
        "brand": {
          "@type": "Brand",
          "name": "PeluqueríasPRO"
        }
      }))
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Inicio",
          "item": "https://peluquerias-web.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Plantillas",
          "item": "https://peluquerias-web.com/plantillas"
        }
      ]
    },
    "about": {
      "@type": "Thing",
      "name": "Diseño Web para Peluquerías",
      "description": "Plantillas especializadas en el sector de belleza y peluquería"
    }
  }

  return (
    <>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link
              href="/"
              className="text-gray-500 hover:text-orange-600 transition-colors"
            >
              Inicio
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 font-medium">Plantillas</span>
          </nav>
        </div>
      </div>

      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Elige Tu Plantilla
            <span className="text-orange-600"> Perfecta</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Diseños únicos especializados en peluquerías. Elige tu estilo y personalízalo.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto mb-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o características..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full
                         focus:ring-orange-500 focus:border-orange-500 text-gray-900
                         placeholder-gray-500 bg-white shadow-sm"
            />
            {filters.search && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Toggle Button - Mobile */}
        <div className="md:hidden flex justify-center mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Results Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{filteredTemplates.length}</span>
              {' '}plantillas encontradas
            </p>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium
                           flex items-center space-x-1 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Limpiar filtros</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <TemplateFilter
                filters={filters}
                setFilters={setFilters}
                resultsCount={filteredTemplates.length}
              />
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1">
            {filteredTemplates.length > 0 ? (
              <TemplateGrid templates={filteredTemplates} />
            ) : (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron plantillas
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Intenta ajustar los filtros o prueba con otros términos de búsqueda.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700
                               transition-colors font-medium"
                  >
                    Limpiar todos los filtros
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}