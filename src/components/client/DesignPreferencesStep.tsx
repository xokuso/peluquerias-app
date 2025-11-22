'use client'

import React from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import {
  Palette,
  Type,
  Layout,
  AlertCircle,
  Eye,
  Star,
  Check,
  Sparkles
} from 'lucide-react'

// Zod schema for form validation
const designPreferencesSchema = z.object({
  primaryColor: z.string()
    .min(1, 'Selecciona un color principal'),
  secondaryColor: z.string()
    .min(1, 'Selecciona un color secundario'),
  fontStyle: z.enum(['modern', 'classic', 'elegant', 'bold'], {
    message: 'Selecciona un estilo de tipografía'
  }),
  layoutPreference: z.enum(['minimal', 'standard', 'rich'], {
    message: 'Selecciona un estilo de diseño'
  })
})

// TypeScript types
type DesignPreferencesFormData = z.infer<typeof designPreferencesSchema>

interface SetupData {
  primaryColor: string
  secondaryColor: string
  fontStyle: 'modern' | 'classic' | 'elegant' | 'bold'
  layoutPreference: 'minimal' | 'standard' | 'rich'
}

interface DesignPreferencesStepProps {
  initialData: Partial<SetupData>
  onSubmit: (data: Partial<SetupData>) => void
  isLoading: boolean
}

// Color options with names and descriptions
const colorOptions = [
  {
    value: '#3B82F6',
    label: 'Azul profesional',
    description: 'Confianza y profesionalidad',
    category: 'professional'
  },
  {
    value: '#EC4899',
    label: 'Rosa elegante',
    description: 'Feminidad y sofisticación',
    category: 'elegant'
  },
  {
    value: '#10B981',
    label: 'Verde natural',
    description: 'Frescura y bienestar',
    category: 'natural'
  },
  {
    value: '#F59E0B',
    label: 'Naranja cálido',
    description: 'Energía y creatividad',
    category: 'warm'
  },
  {
    value: '#8B5CF6',
    label: 'Púrpura sofisticado',
    description: 'Lujo y exclusividad',
    category: 'luxury'
  },
  {
    value: '#EF4444',
    label: 'Rojo pasión',
    description: 'Intensidad y atención',
    category: 'bold'
  },
  {
    value: '#6B7280',
    label: 'Gris moderno',
    description: 'Elegancia atemporal',
    category: 'modern'
  },
  {
    value: '#0EA5E9',
    label: 'Azul cielo',
    description: 'Serenidad y claridad',
    category: 'fresh'
  }
]

// Font style options with previews
const fontStyles = [
  {
    value: 'modern',
    label: 'Moderno',
    description: 'Limpio y contemporáneo',
    preview: 'font-sans text-lg tracking-wide',
    sampleText: 'Salón Moderno',
    icon: Type
  },
  {
    value: 'classic',
    label: 'Clásico',
    description: 'Tradicional y confiable',
    preview: 'font-serif text-lg',
    sampleText: 'Salón Clásico',
    icon: Type
  },
  {
    value: 'elegant',
    label: 'Elegante',
    description: 'Sofisticado y refinado',
    preview: 'font-serif text-lg italic',
    sampleText: 'Salón Elegante',
    icon: Sparkles
  },
  {
    value: 'bold',
    label: 'Llamativo',
    description: 'Impactante y memorable',
    preview: 'font-bold text-lg tracking-wider uppercase',
    sampleText: 'Salón Bold',
    icon: Star
  }
]

// Layout preference options
const layoutOptions = [
  {
    value: 'minimal',
    label: 'Minimalista',
    description: 'Limpio, simple y directo',
    features: ['Diseño limpio', 'Navegación simple', 'Enfoque en contenido esencial'],
    icon: Layout,
    preview: 'Menos es más'
  },
  {
    value: 'standard',
    label: 'Estándar',
    description: 'Equilibrado y profesional',
    features: ['Diseño balanceado', 'Funcionalidades completas', 'Experiencia óptima'],
    icon: Eye,
    preview: 'Perfecto equilibrio'
  },
  {
    value: 'rich',
    label: 'Rico',
    description: 'Detallado y completo',
    features: ['Diseño elaborado', 'Máximo contenido', 'Experiencia inmersiva'],
    icon: Star,
    preview: 'Experiencia completa'
  }
]

export default function DesignPreferencesStep({
  initialData,
  onSubmit,
  isLoading: _isLoading
}: DesignPreferencesStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<DesignPreferencesFormData>({
    resolver: zodResolver(designPreferencesSchema),
    defaultValues: {
      primaryColor: initialData.primaryColor || '#3B82F6',
      secondaryColor: initialData.secondaryColor || '#10B981',
      fontStyle: initialData.fontStyle || 'modern',
      layoutPreference: initialData.layoutPreference || 'standard'
    },
    mode: 'onChange'
  })

  const selectedPrimaryColor = watch('primaryColor')
  const selectedSecondaryColor = watch('secondaryColor')
  const selectedFontStyle = watch('fontStyle')
  const selectedLayoutPreference = watch('layoutPreference')

  const onFormSubmit: SubmitHandler<DesignPreferencesFormData> = (data) => {
    onSubmit(data)
  }


  const handleColorSelect = (colorValue: string, type: 'primary' | 'secondary') => {
    if (type === 'primary') {
      setValue('primaryColor', colorValue, { shouldValidate: true })
    } else {
      setValue('secondaryColor', colorValue, { shouldValidate: true })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Palette className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
            Personaliza tu diseño
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Elige los colores y estilos que mejor representen la personalidad de tu salón
          </p>
        </div>

        {/* Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6"
        >
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            Vista previa de tu diseño
          </h3>
          <div
            className="rounded-lg p-6 border-2 transition-all duration-300"
            style={{
              borderColor: selectedPrimaryColor,
              background: `linear-gradient(135deg, ${selectedPrimaryColor}08 0%, ${selectedSecondaryColor}08 100%)`
            }}
          >
            <div className="text-center">
              <h4
                className={`text-2xl mb-2 ${fontStyles.find(f => f.value === selectedFontStyle)?.preview || ''}`}
                style={{ color: selectedPrimaryColor }}
              >
                {fontStyles.find(f => f.value === selectedFontStyle)?.sampleText || 'Tu Salón'}
              </h4>
              <div className="flex justify-center items-center gap-4 mb-4">
                <div
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: selectedPrimaryColor }}
                  title="Color principal"
                />
                <div
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: selectedSecondaryColor }}
                  title="Color secundario"
                />
              </div>
              <p className="text-sm text-neutral-600">
                Diseño {layoutOptions.find(l => l.value === selectedLayoutPreference)?.label.toLowerCase()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Color Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6"
        >
          <h3 className="text-lg font-semibold text-neutral-900 mb-6">
            Colores de tu marca
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-4">
                <Palette className="w-4 h-4 inline mr-2" />
                Color principal *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {colorOptions.map((color) => (
                  <motion.button
                    key={`primary-${color.value}`}
                    type="button"
                    onClick={() => handleColorSelect(color.value, 'primary')}
                    className={`
                      relative h-20 rounded-lg border-2 transition-all duration-200 group
                      hover:scale-105 hover:shadow-lg
                      ${selectedPrimaryColor === color.value
                        ? 'border-neutral-900 shadow-lg scale-105'
                        : 'border-neutral-200'}
                    `}
                    style={{ backgroundColor: color.value }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title={color.label}
                    aria-label={`Seleccionar ${color.label} como color principal`}
                  >
                    {selectedPrimaryColor === color.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-4 h-4 text-neutral-900" />
                        </div>
                      </motion.div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      {color.label}
                    </div>
                  </motion.button>
                ))}
              </div>
              {errors.primaryColor && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 text-sm text-red-600 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.primaryColor.message}
                </motion.p>
              )}
            </div>

            {/* Secondary Color */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-4">
                <Palette className="w-4 h-4 inline mr-2" />
                Color secundario *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {colorOptions.map((color) => (
                  <motion.button
                    key={`secondary-${color.value}`}
                    type="button"
                    onClick={() => handleColorSelect(color.value, 'secondary')}
                    className={`
                      relative h-20 rounded-lg border-2 transition-all duration-200 group
                      hover:scale-105 hover:shadow-lg
                      ${selectedSecondaryColor === color.value
                        ? 'border-neutral-900 shadow-lg scale-105'
                        : 'border-neutral-200'}
                    `}
                    style={{ backgroundColor: color.value }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title={color.label}
                    aria-label={`Seleccionar ${color.label} como color secundario`}
                  >
                    {selectedSecondaryColor === color.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-4 h-4 text-neutral-900" />
                        </div>
                      </motion.div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      {color.label}
                    </div>
                  </motion.button>
                ))}
              </div>
              {errors.secondaryColor && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 text-sm text-red-600 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.secondaryColor.message}
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Font Style Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6"
        >
          <h3 className="text-lg font-semibold text-neutral-900 mb-6">
            Estilo de tipografía *
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {fontStyles.map((style) => {
              const Icon = style.icon
              return (
                <motion.label
                  key={style.value}
                  className="relative cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="radio"
                    value={style.value}
                    {...register('fontStyle')}
                    className="sr-only"
                  />
                  <div className={`
                    p-6 rounded-lg border-2 transition-all duration-200 h-full
                    hover:border-blue-300 hover:shadow-md
                    ${selectedFontStyle === style.value
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-neutral-200 bg-white'}
                  `}>
                    <div className="text-center">
                      <Icon className={`
                        w-6 h-6 mx-auto mb-3
                        ${selectedFontStyle === style.value
                          ? 'text-blue-600'
                          : 'text-neutral-400'}
                      `} />
                      <h4 className={`
                        font-medium mb-2
                        ${selectedFontStyle === style.value
                          ? 'text-blue-900'
                          : 'text-neutral-900'}
                      `}>
                        {style.label}
                      </h4>
                      <div className={`text-sm mb-3 ${style.preview}`}>
                        {style.sampleText}
                      </div>
                      <p className={`
                        text-xs
                        ${selectedFontStyle === style.value
                          ? 'text-blue-700'
                          : 'text-neutral-600'}
                      `}>
                        {style.description}
                      </p>
                    </div>
                    {selectedFontStyle === style.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2"
                      >
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.label>
              )
            })}
          </div>
          {errors.fontStyle && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 text-sm text-red-600 flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4" />
              {errors.fontStyle.message}
            </motion.p>
          )}
        </motion.div>

        {/* Layout Preference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6"
        >
          <h3 className="text-lg font-semibold text-neutral-900 mb-6">
            Estilo de diseño *
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {layoutOptions.map((layout) => {
              const Icon = layout.icon
              return (
                <motion.label
                  key={layout.value}
                  className="relative cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="radio"
                    value={layout.value}
                    {...register('layoutPreference')}
                    className="sr-only"
                  />
                  <div className={`
                    p-6 rounded-lg border-2 transition-all duration-200 h-full
                    hover:border-blue-300 hover:shadow-md
                    ${selectedLayoutPreference === layout.value
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-neutral-200 bg-white'}
                  `}>
                    <div className="text-center mb-4">
                      <Icon className={`
                        w-8 h-8 mx-auto mb-3
                        ${selectedLayoutPreference === layout.value
                          ? 'text-blue-600'
                          : 'text-neutral-400'}
                      `} />
                      <h4 className={`
                        font-semibold text-lg mb-2
                        ${selectedLayoutPreference === layout.value
                          ? 'text-blue-900'
                          : 'text-neutral-900'}
                      `}>
                        {layout.label}
                      </h4>
                      <p className={`
                        text-sm mb-4
                        ${selectedLayoutPreference === layout.value
                          ? 'text-blue-700'
                          : 'text-neutral-600'}
                      `}>
                        {layout.description}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {layout.features.map((feature, index) => (
                        <div
                          key={index}
                          className={`
                            flex items-center gap-2 text-xs
                            ${selectedLayoutPreference === layout.value
                              ? 'text-blue-700'
                              : 'text-neutral-600'}
                          `}
                        >
                          <Check className="w-3 h-3" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    {selectedLayoutPreference === layout.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3"
                      >
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.label>
              )
            })}
          </div>
          {errors.layoutPreference && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 text-sm text-red-600 flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4" />
              {errors.layoutPreference.message}
            </motion.p>
          )}
        </motion.div>


        {/* Help Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                Consejos de diseño
              </h3>
              <p className="text-sm text-blue-800 mb-2">
                Elige colores que reflejen la personalidad de tu salón:
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Azul:</strong> Transmite confianza y profesionalidad</li>
                <li>• <strong>Rosa:</strong> Ideal para salones femeninos y elegantes</li>
                <li>• <strong>Verde:</strong> Perfecto para spas y bienestar</li>
                <li>• <strong>Naranja:</strong> Energético y acogedor</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </form>
    </motion.div>
  )
}