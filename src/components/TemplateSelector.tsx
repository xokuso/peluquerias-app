"use client"

import { useState } from 'react'
import { Eye, Check, Star, Zap, Crown, Heart } from 'lucide-react'
import Image from 'next/image'

// Tipos para las plantillas
interface Template {
  id: string
  name: string
  category: 'Moderno' | 'Clásico' | 'Minimalista' | 'Elegante' | 'Trendy'
  image: string
  features: string[]
  popular?: boolean
  recommended?: boolean
  price: string
  description: string
}

// Datos de las plantillas
const templates: Template[] = [
  {
    id: 'elegance-studio',
    name: 'Elegance Studio',
    category: 'Elegante',
    image: '/api/placeholder/400/300',
    features: ['Reservas online', 'Galería premium', 'Blog integrado'],
    popular: true,
    price: 'Incluido',
    description: 'Diseño sofisticado perfecto para peluquerías de alta gama'
  },
  {
    id: 'modern-cut',
    name: 'Modern Cut',
    category: 'Moderno',
    image: '/api/placeholder/400/300',
    features: ['Diseño responsive', 'Animaciones CSS', 'SEO optimizado'],
    recommended: true,
    price: 'Incluido',
    description: 'Template contemporáneo con líneas limpias y funcionalidad avanzada'
  },
  {
    id: 'beauty-salon',
    name: 'Beauty Salon',
    category: 'Clásico',
    image: '/api/placeholder/400/300',
    features: ['Estilo atemporal', 'Fácil navegación', 'Multidioma'],
    price: 'Incluido',
    description: 'Diseño tradicional y elegante que nunca pasa de moda'
  }
]

const categories = ['Todos', 'Moderno', 'Clásico', 'Minimalista', 'Elegante', 'Trendy'] as const

export default function TemplateSelector() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  // Filtrar plantillas por categoría
  const filteredTemplates = selectedCategory === 'Todos'
    ? templates
    : templates.filter(template => template.category === selectedCategory)

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId)
    // Aquí podrías agregar lógica para guardar la selección
  }

  const handleViewDemo = (templateId: string) => {
    // Lógica para mostrar demo de la plantilla
    console.log(`Ver demo de template: ${templateId}`)
  }

  return (
    <section className="py-16 bg-white">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Elige el diseño perfecto para
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 block sm:inline">
              {' '}tu peluquería
            </span>
          </h2>

          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Todas nuestras plantillas incluyen reservas online, galería de trabajos,
            información de servicios y están optimizadas para aparecer en Google
          </p>
        </div>

        {/* Filtros de categoría */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 hover:scale-105 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid de plantillas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden ${
                selectedTemplate === template.id
                  ? 'ring-4 ring-blue-500 ring-opacity-50'
                  : ''
              }`}
            >
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {template.popular && (
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
                    <Crown className="w-3 h-3 mr-1" />
                    MÁS POPULAR
                  </span>
                )}
                {template.recommended && (
                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
                    <Star className="w-3 h-3 mr-1" />
                    RECOMENDADO
                  </span>
                )}
              </div>

              {/* Badge de seleccionado */}
              {selectedTemplate === template.id && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-green-500 text-white rounded-full p-2 shadow-lg">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              )}

              {/* Imagen */}
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <Image
                  src={template.image}
                  alt={`Template ${template.name}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Botón demo overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => handleViewDemo(template.id)}
                    className="bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-white transition-all duration-200 flex items-center gap-2 shadow-lg"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Demo
                  </button>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6">
                {/* Cabecera con nombre y categoría */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{template.name}</h3>
                    <span className="text-green-600 font-semibold text-sm bg-green-50 px-2 py-1 rounded">
                      {template.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                      {template.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600 ml-1">5.0</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {template.description}
                  </p>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Incluye:</h4>
                  <ul className="space-y-1">
                    {template.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <Zap className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDemo(template.id)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Demo
                  </button>

                  <button
                    onClick={() => handleSelectTemplate(template.id)}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-1 ${
                      selectedTemplate === template.id
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    {selectedTemplate === template.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        Seleccionado
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4" />
                        Elegir
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>


        {/* Nota informativa */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            ✨ <strong>Todas las plantillas incluyen:</strong> Hosting premium, certificado SSL,
            optimización SEO, responsive design y soporte técnico durante el primer año
          </p>
        </div>
      </div>
    </section>
  )
}