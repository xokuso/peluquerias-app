'use client'

import React, { useState, useEffect } from 'react'
import {
  Eye,
  Clock,
  Phone,
  Mail,
  MapPin,
  Globe,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Service } from './ServicesManager'
import { BusinessHours, DayOfWeek } from './BusinessHoursEditor'
import { ContactInfo } from './ContactInfoEditor'

interface ContentPreviewProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
}

interface PreviewData {
  salonDescription?: string
  aboutOwner?: string
  aboutBusiness?: string
  welcomeMessage?: string
  services?: Service[]
  businessHours?: BusinessHours[]
  contactInfo?: ContactInfo
  businessName?: string
}

const dayLabels: Record<DayOfWeek, string> = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo'
}

export default function ContentPreview({ isOpen, onClose, orderId }: ContentPreviewProps) {
  const [previewData, setPreviewData] = useState<PreviewData>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPreviewData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/content/${orderId}`)

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.content) {
            setPreviewData({
              salonDescription: data.content.salonDescription,
              aboutOwner: data.content.aboutOwner,
              aboutBusiness: data.content.aboutBusiness,
              welcomeMessage: data.content.welcomeMessage,
              services: data.content.services || [],
              businessHours: data.content.businessHours || [],
              contactInfo: {
                phone: data.content.phone,
                email: data.content.email,
                website: data.content.website,
                fullAddress: data.content.fullAddress,
                city: data.content.city,
                postalCode: data.content.postalCode,
                facebookUrl: data.content.facebookUrl,
                instagramUrl: data.content.instagramUrl,
                twitterUrl: data.content.twitterUrl,
                youtubeUrl: data.content.youtubeUrl,
                tiktokUrl: data.content.tiktokUrl,
                linkedinUrl: data.content.linkedinUrl,
              },
              businessName: 'Mi Salón' // This would come from the order data
            })
          }
        }
      } catch (error) {
        console.error('Error loading preview data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen && orderId) {
      loadPreviewData()
    }
  }, [isOpen, orderId])

  const formatPrice = (service: Service): string => {
    if (service.priceType === 'CONSULTATION') return 'Consultar'
    if (service.priceType === 'RANGE' && service.priceFrom && service.priceTo) {
      return `${service.priceFrom}€ - ${service.priceTo}€`
    }
    if (service.priceType === 'FROM' && service.priceFrom) {
      return `Desde ${service.priceFrom}€`
    }
    if (service.price) return `${service.price}€`
    return 'Sin precio'
  }

  // Function to format hours - currently not used but available for future implementation
  // const formatHours = (hours: BusinessHours[]): string => {
  //   const openHours = hours.filter(h => h.isOpen)
  //   if (openHours.length === 0) return 'Cerrado'
  //   return openHours.map(h =>
  //     `${dayLabels[h.dayOfWeek]}: ${h.openTime} - ${h.closeTime}`
  //   ).join(', ')
  // }

  const groupServicesByCategory = (services: Service[]) => {
    return services.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = []
      }
      acc[service.category]!.push(service)
      return acc
    }, {} as Record<string, Service[]>)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-neutral-900">
              Vista Previa del Contenido
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="p-6 space-y-8">
              {/* Hero Section */}
              <div className="text-center">
                <h1 className="text-3xl font-bold text-neutral-900 mb-4">
                  {previewData.businessName || 'Mi Salón de Belleza'}
                </h1>
                {previewData.welcomeMessage && (
                  <div
                    className="text-lg text-neutral-600 max-w-2xl mx-auto"
                    dangerouslySetInnerHTML={{ __html: previewData.welcomeMessage }}
                  />
                )}
              </div>

              {/* About Section */}
              {(previewData.salonDescription || previewData.aboutOwner || previewData.aboutBusiness) && (
                <div className="bg-neutral-50 rounded-lg p-6">
                  <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Sobre Nosotros</h2>

                  {previewData.salonDescription && (
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-neutral-800 mb-2">Nuestro Salón</h3>
                      <div
                        className="text-neutral-600 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: previewData.salonDescription }}
                      />
                    </div>
                  )}

                  {previewData.aboutOwner && (
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-neutral-800 mb-2">Nuestro Equipo</h3>
                      <div
                        className="text-neutral-600 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: previewData.aboutOwner }}
                      />
                    </div>
                  )}

                  {previewData.aboutBusiness && (
                    <div>
                      <h3 className="text-lg font-medium text-neutral-800 mb-2">Nuestra Historia</h3>
                      <div
                        className="text-neutral-600 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: previewData.aboutBusiness }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Services Section */}
              {previewData.services && previewData.services.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Nuestros Servicios</h2>

                  {Object.entries(groupServicesByCategory(previewData.services)).map(([category, services]) => (
                    <div key={category} className="mb-6">
                      <h3 className="text-lg font-medium text-neutral-800 mb-4 capitalize">
                        {category.toLowerCase().replace('_', ' ')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map(service => (
                          <div key={service.id} className="bg-white border border-neutral-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-neutral-900">{service.name}</h4>
                              <span className="font-semibold text-blue-600">
                                {formatPrice(service)}
                              </span>
                            </div>
                            {service.description && (
                              <p className="text-sm text-neutral-600 mb-2">{service.description}</p>
                            )}
                            {service.duration && (
                              <div className="flex items-center text-xs text-neutral-500">
                                <Clock className="w-3 h-3 mr-1" />
                                {service.duration} min
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Contact & Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Info */}
                {previewData.contactInfo && (
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">Contacto</h3>
                    <div className="space-y-3">
                      {previewData.contactInfo.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-blue-600" />
                          <span>{previewData.contactInfo.phone}</span>
                        </div>
                      )}
                      {previewData.contactInfo.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-blue-600" />
                          <span>{previewData.contactInfo.email}</span>
                        </div>
                      )}
                      {(previewData.contactInfo.fullAddress || previewData.contactInfo.city) && (
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          <span>
                            {previewData.contactInfo.fullAddress}
                            {previewData.contactInfo.city && `, ${previewData.contactInfo.city}`}
                            {previewData.contactInfo.postalCode && ` ${previewData.contactInfo.postalCode}`}
                          </span>
                        </div>
                      )}
                      {previewData.contactInfo.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-blue-600" />
                          <a
                            href={previewData.contactInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {previewData.contactInfo.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Business Hours */}
                {previewData.businessHours && previewData.businessHours.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">Horarios</h3>
                    <div className="space-y-2">
                      {previewData.businessHours.map(hours => (
                        <div key={hours.dayOfWeek} className="flex justify-between">
                          <span className="font-medium">{dayLabels[hours.dayOfWeek]}</span>
                          <span className={cn(
                            hours.isOpen ? 'text-green-600' : 'text-red-500'
                          )}>
                            {hours.isOpen && hours.openTime && hours.closeTime
                              ? `${hours.openTime} - ${hours.closeTime}`
                              : 'Cerrado'
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Social Media */}
              {previewData.contactInfo && (
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Síguenos</h3>
                  <div className="flex gap-4">
                    {previewData.contactInfo.facebookUrl && (
                      <a
                        href={previewData.contactInfo.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Facebook
                      </a>
                    )}
                    {previewData.contactInfo.instagramUrl && (
                      <a
                        href={previewData.contactInfo.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-700"
                      >
                        Instagram
                      </a>
                    )}
                    {previewData.contactInfo.twitterUrl && (
                      <a
                        href={previewData.contactInfo.twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-500"
                      >
                        Twitter
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 p-4 bg-neutral-50">
          <p className="text-sm text-neutral-600 text-center">
            Esta es una vista previa de cómo se verá tu contenido en la web final.
          </p>
        </div>
      </div>
    </div>
  )
}