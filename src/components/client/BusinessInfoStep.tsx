'use client'

import React from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Building2, User, Phone, Mail, MapPin, AlertCircle } from 'lucide-react'

// Zod schema for form validation
const businessInfoSchema = z.object({
  businessName: z.string()
    .min(2, 'El nombre del negocio debe tener al menos 2 caracteres')
    .max(100, 'El nombre del negocio es demasiado largo'),
  ownerName: z.string()
    .min(2, 'El nombre del propietario debe tener al menos 2 caracteres')
    .max(100, 'El nombre del propietario es demasiado largo'),
  phone: z.string()
    .min(9, 'El teléfono debe tener al menos 9 dígitos')
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Formato de teléfono no válido'),
  email: z.string()
    .email('El email no es válido')
    .max(255, 'El email es demasiado largo'),
  address: z.string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(255, 'La dirección es demasiado larga'),
  city: z.string()
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .max(100, 'El nombre de la ciudad es demasiado largo'),
  postalCode: z.string()
    .min(4, 'El código postal debe tener al menos 4 caracteres')
    .max(10, 'El código postal es demasiado largo')
    .regex(/^[0-9A-Z\s\-]+$/i, 'Formato de código postal no válido'),
  businessType: z.enum(['SALON', 'BARBERSHOP', 'PERSONAL'], {
    message: 'Selecciona un tipo de negocio'
  })
})

// TypeScript types
type BusinessInfoFormData = z.infer<typeof businessInfoSchema>

interface SetupData {
  businessName: string
  ownerName: string
  phone: string
  email: string
  address: string
  city: string
  postalCode: string
  businessType: string
}

interface BusinessInfoStepProps {
  initialData: Partial<SetupData>
  onSubmit: (data: Partial<SetupData>) => void
  isLoading: boolean
}

// Business type options with descriptions
const businessTypeOptions = [
  {
    value: 'SALON',
    label: 'Salón de peluquería',
    description: 'Peluquería tradicional con servicios completos',
    icon: Building2
  },
  {
    value: 'BARBERSHOP',
    label: 'Barbería',
    description: 'Barbería especializada en cortes masculinos',
    icon: Building2
  },
  {
    value: 'PERSONAL',
    label: 'Persona física',
    description: 'Profesional independiente de peluquería',
    icon: User
  }
]

export default function BusinessInfoStep({
  initialData,
  onSubmit,
  isLoading: _isLoading
}: BusinessInfoStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch
  } = useForm<BusinessInfoFormData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      businessName: initialData.businessName || '',
      ownerName: initialData.ownerName || '',
      phone: initialData.phone || '',
      email: initialData.email || '',
      address: initialData.address || '',
      city: initialData.city || '',
      postalCode: initialData.postalCode || '',
      businessType: (initialData.businessType as BusinessInfoFormData['businessType']) || 'SALON'
    },
    mode: 'onChange'
  })

  const selectedBusinessType = watch('businessType')

  const onFormSubmit: SubmitHandler<BusinessInfoFormData> = (data) => {
    onSubmit(data)
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sm:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2 flex items-center gap-3">
              <Building2 className="w-6 h-6 text-blue-600" />
              Información de tu negocio
            </h2>
            <p className="text-neutral-600">
              Completa los datos de tu salón para personalizar tu sitio web
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Business Name */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label
                htmlFor="businessName"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                <Building2 className="w-4 h-4 inline mr-2" />
                Nombre del negocio *
              </label>
              <input
                id="businessName"
                type="text"
                {...register('businessName')}
                className={`
                  w-full px-4 py-3 border border-neutral-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-colors duration-200
                  ${errors.businessName ? 'border-red-300 bg-red-50' : ''}
                  ${touchedFields.businessName && !errors.businessName ? 'border-green-300 bg-green-50' : ''}
                `}
                placeholder="Ej: Salón María Belleza"
                aria-describedby={errors.businessName ? 'businessName-error' : undefined}
              />
              {errors.businessName && (
                <motion.p
                  id="businessName-error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 text-sm text-red-600 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.businessName.message}
                </motion.p>
              )}
            </motion.div>

            {/* Owner Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label
                htmlFor="ownerName"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                <User className="w-4 h-4 inline mr-2" />
                Nombre del propietario *
              </label>
              <input
                id="ownerName"
                type="text"
                {...register('ownerName')}
                className={`
                  w-full px-4 py-3 border border-neutral-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-colors duration-200
                  ${errors.ownerName ? 'border-red-300 bg-red-50' : ''}
                  ${touchedFields.ownerName && !errors.ownerName ? 'border-green-300 bg-green-50' : ''}
                `}
                placeholder="Ej: María García"
                aria-describedby={errors.ownerName ? 'ownerName-error' : undefined}
              />
              {errors.ownerName && (
                <motion.p
                  id="ownerName-error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 text-sm text-red-600 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.ownerName.message}
                </motion.p>
              )}
            </motion.div>

            {/* Phone */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                <Phone className="w-4 h-4 inline mr-2" />
                Teléfono *
              </label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                className={`
                  w-full px-4 py-3 border border-neutral-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-colors duration-200
                  ${errors.phone ? 'border-red-300 bg-red-50' : ''}
                  ${touchedFields.phone && !errors.phone ? 'border-green-300 bg-green-50' : ''}
                `}
                placeholder="Ej: +34 666 777 888"
                aria-describedby={errors.phone ? 'phone-error' : undefined}
              />
              {errors.phone && (
                <motion.p
                  id="phone-error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 text-sm text-red-600 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.phone.message}
                </motion.p>
              )}
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Email *
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className={`
                  w-full px-4 py-3 border border-neutral-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-colors duration-200
                  ${errors.email ? 'border-red-300 bg-red-50' : ''}
                  ${touchedFields.email && !errors.email ? 'border-green-300 bg-green-50' : ''}
                `}
                placeholder="Ej: maria@salon.com"
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <motion.p
                  id="email-error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 text-sm text-red-600 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.email.message}
                </motion.p>
              )}
            </motion.div>

            {/* Address */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label
                htmlFor="address"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                <MapPin className="w-4 h-4 inline mr-2" />
                Dirección completa *
              </label>
              <input
                id="address"
                type="text"
                {...register('address')}
                className={`
                  w-full px-4 py-3 border border-neutral-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-colors duration-200
                  ${errors.address ? 'border-red-300 bg-red-50' : ''}
                  ${touchedFields.address && !errors.address ? 'border-green-300 bg-green-50' : ''}
                `}
                placeholder="Ej: Calle Principal, 123"
                aria-describedby={errors.address ? 'address-error' : undefined}
              />
              {errors.address && (
                <motion.p
                  id="address-error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 text-sm text-red-600 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.address.message}
                </motion.p>
              )}
            </motion.div>

            {/* City */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label
                htmlFor="city"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Ciudad *
              </label>
              <input
                id="city"
                type="text"
                {...register('city')}
                className={`
                  w-full px-4 py-3 border border-neutral-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-colors duration-200
                  ${errors.city ? 'border-red-300 bg-red-50' : ''}
                  ${touchedFields.city && !errors.city ? 'border-green-300 bg-green-50' : ''}
                `}
                placeholder="Ej: Madrid"
                aria-describedby={errors.city ? 'city-error' : undefined}
              />
              {errors.city && (
                <motion.p
                  id="city-error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 text-sm text-red-600 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.city.message}
                </motion.p>
              )}
            </motion.div>

            {/* Postal Code */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label
                htmlFor="postalCode"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Código postal *
              </label>
              <input
                id="postalCode"
                type="text"
                {...register('postalCode')}
                className={`
                  w-full px-4 py-3 border border-neutral-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-colors duration-200
                  ${errors.postalCode ? 'border-red-300 bg-red-50' : ''}
                  ${touchedFields.postalCode && !errors.postalCode ? 'border-green-300 bg-green-50' : ''}
                `}
                placeholder="Ej: 28001"
                aria-describedby={errors.postalCode ? 'postalCode-error' : undefined}
              />
              {errors.postalCode && (
                <motion.p
                  id="postalCode-error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 text-sm text-red-600 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.postalCode.message}
                </motion.p>
              )}
            </motion.div>
          </div>

          {/* Business Type Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-8"
          >
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Tipo de negocio *
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {businessTypeOptions.map((option) => {
                const Icon = option.icon
                return (
                  <label
                    key={option.value}
                    className="relative cursor-pointer"
                  >
                    <input
                      type="radio"
                      value={option.value}
                      {...register('businessType')}
                      className="sr-only"
                    />
                    <div className={`
                      p-4 rounded-lg border-2 transition-all duration-200 h-full
                      hover:border-blue-300 hover:shadow-md
                      ${selectedBusinessType === option.value
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-neutral-200 bg-white'}
                    `}>
                      <div className="flex items-start gap-3">
                        <Icon className={`
                          w-5 h-5 mt-1 flex-shrink-0
                          ${selectedBusinessType === option.value
                            ? 'text-blue-600'
                            : 'text-neutral-400'}
                        `} />
                        <div>
                          <h4 className={`
                            font-medium text-sm
                            ${selectedBusinessType === option.value
                              ? 'text-blue-900'
                              : 'text-neutral-900'}
                          `}>
                            {option.label}
                          </h4>
                          <p className={`
                            text-xs mt-1
                            ${selectedBusinessType === option.value
                              ? 'text-blue-700'
                              : 'text-neutral-600'}
                          `}>
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
            {errors.businessType && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 text-sm text-red-600 flex items-center gap-1"
              >
                <AlertCircle className="w-4 h-4" />
                {errors.businessType.message}
              </motion.p>
            )}
          </motion.div>

        </div>

        {/* Help Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                ¿Necesitas ayuda?
              </h3>
              <p className="text-sm text-blue-800">
                Esta información se utilizará para crear tu sitio web personalizado.
                Podrás modificar todos estos datos más adelante desde tu panel de control.
              </p>
            </div>
          </div>
        </motion.div>
      </form>
    </motion.div>
  )
}