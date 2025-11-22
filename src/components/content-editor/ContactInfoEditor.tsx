'use client'

import React, { useState, useEffect } from 'react'
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Music,
  Save,
  Check,
  ExternalLink,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ContactInfo {
  // Basic contact
  phone?: string
  email?: string
  website?: string

  // Address
  fullAddress?: string
  city?: string
  postalCode?: string

  // Social media
  facebookUrl?: string
  instagramUrl?: string
  twitterUrl?: string
  youtubeUrl?: string
  tiktokUrl?: string
  linkedinUrl?: string
}

interface ContactInfoEditorProps {
  contactInfo: ContactInfo
  onContactInfoChange: (info: ContactInfo) => void
  onSave?: (info: ContactInfo) => Promise<void>
  isLoading?: boolean
}

interface SocialPlatform {
  key: keyof ContactInfo
  label: string
  icon: React.ComponentType<any>
  placeholder: string
  baseUrl: string
  pattern?: RegExp
}

const socialPlatforms: SocialPlatform[] = [
  {
    key: 'facebookUrl',
    label: 'Facebook',
    icon: Facebook,
    placeholder: 'https://facebook.com/tu-salon',
    baseUrl: 'https://facebook.com/',
    pattern: /^https:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9._-]+\/?$/
  },
  {
    key: 'instagramUrl',
    label: 'Instagram',
    icon: Instagram,
    placeholder: 'https://instagram.com/tu-salon',
    baseUrl: 'https://instagram.com/',
    pattern: /^https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._-]+\/?$/
  },
  {
    key: 'twitterUrl',
    label: 'Twitter/X',
    icon: Twitter,
    placeholder: 'https://twitter.com/tu-salon',
    baseUrl: 'https://twitter.com/',
    pattern: /^https:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9._-]+\/?$/
  },
  {
    key: 'youtubeUrl',
    label: 'YouTube',
    icon: Youtube,
    placeholder: 'https://youtube.com/channel/tu-canal',
    baseUrl: 'https://youtube.com/',
    pattern: /^https:\/\/(www\.)?youtube\.com\/(channel\/|c\/|user\/)?[a-zA-Z0-9._-]+\/?$/
  },
  {
    key: 'tiktokUrl',
    label: 'TikTok',
    icon: Music,
    placeholder: 'https://tiktok.com/@tu-salon',
    baseUrl: 'https://tiktok.com/',
    pattern: /^https:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9._-]+\/?$/
  },
  {
    key: 'linkedinUrl',
    label: 'LinkedIn',
    icon: Linkedin,
    placeholder: 'https://linkedin.com/company/tu-salon',
    baseUrl: 'https://linkedin.com/',
    pattern: /^https:\/\/(www\.)?linkedin\.com\/(company\/|in\/)[a-zA-Z0-9._-]+\/?$/
  }
]

export default function ContactInfoEditor({
  contactInfo,
  onContactInfoChange,
  onSave,
  isLoading
}: ContactInfoEditorProps) {
  const [localInfo, setLocalInfo] = useState<ContactInfo>(contactInfo)
  const [hasChanges, setHasChanges] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Update local state when props change
  useEffect(() => {
    setLocalInfo(contactInfo)
    setHasChanges(false)
  }, [contactInfo])

  // Update parent when local info changes
  useEffect(() => {
    onContactInfoChange(localInfo)
    setHasChanges(true)
  }, [localInfo, onContactInfoChange])

  const updateField = (field: keyof ContactInfo, value: string) => {
    setLocalInfo(prev => ({ ...prev, [field]: value || undefined }))

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateField = (field: keyof ContactInfo, value: string): string | null => {
    if (!value) return null

    switch (field) {
      case 'email':
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailPattern.test(value) ? null : 'Email inválido'

      case 'phone':
        const phonePattern = /^(\+34|0034|34)?[6789]\d{8}$/
        const cleanPhone = value.replace(/\s/g, '')
        return phonePattern.test(cleanPhone) ? null : 'Teléfono inválido (formato español)'

      case 'website':
        try {
          new URL(value)
          return null
        } catch {
          return 'URL inválida (debe incluir https://)'
        }

      case 'postalCode':
        const postalPattern = /^[0-9]{5}$/
        return postalPattern.test(value) ? null : 'Código postal inválido (5 dígitos)'

      default:
        // Social media validation
        const platform = socialPlatforms.find(p => p.key === field)
        if (platform?.pattern) {
          return platform.pattern.test(value) ? null : `URL de ${platform.label} inválida`
        }
        return null
    }
  }

  const handleFieldBlur = (field: keyof ContactInfo, value: string) => {
    const error = validateField(field, value)
    if (error) {
      setValidationErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '')

    // Format Spanish phone number
    if (digits.length === 9 && digits.match(/^[6789]/)) {
      return `${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6, 9)}`
    }

    return phone
  }

  const isFormValid = (): boolean => {
    return Object.keys(validationErrors).length === 0
  }

  const handleSave = async () => {
    if (onSave && isFormValid()) {
      await onSave(localInfo)
      setHasChanges(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            Información de Contacto
          </h3>
          <p className="text-sm text-neutral-600">
            Añade tus datos de contacto y redes sociales
          </p>
        </div>
        {onSave && (
          <Button
            type="button"
            variant="salon"
            onClick={handleSave}
            disabled={isLoading || !hasChanges || !isFormValid()}
          >
            {isLoading ? 'Guardando...' : hasChanges ? 'Guardar Cambios' : 'Guardado'}
            {!isLoading && (hasChanges ? <Save className="w-4 h-4 ml-2" /> : <Check className="w-4 h-4 ml-2" />)}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="space-y-6">
          <div>
            <h4 className="text-md font-medium text-neutral-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Datos de Contacto
            </h4>

            <div className="space-y-4">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={localInfo.phone || ''}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value)
                    updateField('phone', formatted)
                  }}
                  onBlur={(e) => handleFieldBlur('phone', e.target.value)}
                  placeholder="666 123 456"
                  className={cn(
                    "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                    validationErrors.phone ? "border-red-300" : "border-neutral-300"
                  )}
                />
                {validationErrors.phone && (
                  <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors.phone}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={localInfo.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                  onBlur={(e) => handleFieldBlur('email', e.target.value)}
                  placeholder="contacto@mi-salon.com"
                  className={cn(
                    "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                    validationErrors.email ? "border-red-300" : "border-neutral-300"
                  )}
                />
                {validationErrors.email && (
                  <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors.email}</span>
                  </div>
                )}
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Sitio web (opcional)
                </label>
                <input
                  type="url"
                  value={localInfo.website || ''}
                  onChange={(e) => updateField('website', e.target.value)}
                  onBlur={(e) => handleFieldBlur('website', e.target.value)}
                  placeholder="https://mi-salon.com"
                  className={cn(
                    "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                    validationErrors.website ? "border-red-300" : "border-neutral-300"
                  )}
                />
                {validationErrors.website && (
                  <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors.website}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h4 className="text-md font-medium text-neutral-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Dirección
            </h4>

            <div className="space-y-4">
              {/* Full Address */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Dirección completa
                </label>
                <input
                  type="text"
                  value={localInfo.fullAddress || ''}
                  onChange={(e) => updateField('fullAddress', e.target.value)}
                  placeholder="Calle Principal, 123"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={localInfo.city || ''}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="Madrid"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Código postal
                  </label>
                  <input
                    type="text"
                    value={localInfo.postalCode || ''}
                    onChange={(e) => updateField('postalCode', e.target.value)}
                    onBlur={(e) => handleFieldBlur('postalCode', e.target.value)}
                    placeholder="28001"
                    className={cn(
                      "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                      validationErrors.postalCode ? "border-red-300" : "border-neutral-300"
                    )}
                  />
                  {validationErrors.postalCode && (
                    <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{validationErrors.postalCode}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="space-y-6">
          <div>
            <h4 className="text-md font-medium text-neutral-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Redes Sociales
            </h4>

            <div className="space-y-4">
              {socialPlatforms.map(platform => {
                const Icon = platform.icon
                const value = localInfo[platform.key] as string || ''
                const hasError = validationErrors[platform.key]

                return (
                  <div key={platform.key}>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {platform.label}
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={value}
                        onChange={(e) => updateField(platform.key, e.target.value)}
                        onBlur={(e) => handleFieldBlur(platform.key, e.target.value)}
                        placeholder={platform.placeholder}
                        className={cn(
                          "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10",
                          hasError ? "border-red-300" : "border-neutral-300"
                        )}
                      />
                      {value && !hasError && (
                        <a
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    {hasError && (
                      <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{hasError}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Consejo:</strong> Añadir tus redes sociales ayuda a que los clientes te encuentren
                y puedan ver tu trabajo. Instagram es especialmente importante para salones de belleza.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      {(localInfo.phone || localInfo.email || localInfo.fullAddress) && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
          <h4 className="font-medium text-neutral-900 mb-3">Vista previa del contacto</h4>
          <div className="space-y-2 text-sm">
            {localInfo.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-neutral-500" />
                <span>{localInfo.phone}</span>
              </div>
            )}
            {localInfo.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-neutral-500" />
                <span>{localInfo.email}</span>
              </div>
            )}
            {localInfo.fullAddress && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neutral-500" />
                <span>
                  {localInfo.fullAddress}
                  {localInfo.city && `, ${localInfo.city}`}
                  {localInfo.postalCode && ` ${localInfo.postalCode}`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}