'use client';

import React, { useState } from 'react';
import { z } from 'zod';

// ============================
// SCHEMAS Y VALIDACIÓN
// ============================

const checkoutFormSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Por favor ingresa un email válido'),
  phone: z.string().min(9, 'El teléfono debe tener al menos 9 dígitos').optional().or(z.literal('')),
  businessName: z.string().min(2, 'El nombre del negocio debe tener al menos 2 caracteres'),
  businessType: z.enum(['salon', 'barbershop', 'personal']).optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'Debes aceptar los términos y condiciones')
});

type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

// ============================
// INTERFACES
// ============================

interface CheckoutFormProps {
  onSubmit?: (data: CheckoutFormData) => void;
  isLoading?: boolean;
  className?: string;
}

interface FormErrors {
  [key: string]: string;
}

// ============================
// COMPONENTE PRINCIPAL
// ============================

export default function CheckoutForm({ onSubmit, isLoading = false, className = '' }: CheckoutFormProps) {
  // Estados
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: 'salon',
    acceptTerms: false
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manejadores
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Limpiar error del campo al cambiar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    try {
      checkoutFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.issues.forEach((err: any) => {
          const fieldName = err.path[0] as string;
          newErrors[fieldName] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Llamar checkout de Stripe
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: 'pricing_page'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el pago');
      }

      if (data.success && data.url) {
        // Redirigir al checkout de Stripe
        window.location.href = data.url;
      } else {
        throw new Error('Error al crear la sesión de checkout');
      }

    } catch (error) {
      console.error('Error:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Error al procesar el pago'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================
  // RENDER
  // ============================

  return (
    <div className={`max-w-lg mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos personales */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            Datos personales
          </h3>

          {/* Nombre completo */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Nombre completo *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Tu nombre completo"
              className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-white/20'
              }`}
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="tu@email.com"
              className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-white/20'
              }`}
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
              Teléfono (opcional)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+34 600 000 000"
              className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                errors.phone ? 'border-red-500' : 'border-white/20'
              }`}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Datos del negocio */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            Datos del negocio
          </h3>

          {/* Nombre del negocio */}
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-300 mb-2">
              Nombre de tu peluquería *
            </label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              placeholder="Peluquería Bella Vista"
              className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                errors.businessName ? 'border-red-500' : 'border-white/20'
              }`}
              required
            />
            {errors.businessName && (
              <p className="mt-1 text-sm text-red-400">{errors.businessName}</p>
            )}
          </div>

          {/* Tipo de negocio */}
          <div>
            <label htmlFor="businessType" className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de negocio
            </label>
            <select
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="salon" className="bg-gray-800 text-white">Peluquería unisex</option>
              <option value="barbershop" className="bg-gray-800 text-white">Barbería</option>
              <option value="personal" className="bg-gray-800 text-white">Estilista personal</option>
            </select>
          </div>
        </div>

        {/* Términos y condiciones */}
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="acceptTerms"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleInputChange}
              className="mt-0.5 h-4 w-4 text-amber-500 bg-white/10 border-white/20 rounded focus:ring-amber-500 focus:ring-2"
              required
            />
            <label htmlFor="acceptTerms" className="text-sm text-gray-300">
              Acepto los{' '}
              <a
                href="/terminos"
                className="text-amber-400 hover:text-amber-300 underline"
                target="_blank"
              >
                términos y condiciones
              </a>
              {' '}y la{' '}
              <a
                href="/privacidad"
                className="text-amber-400 hover:text-amber-300 underline"
                target="_blank"
              >
                política de privacidad
              </a>
              . *
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-sm text-red-400">{errors.acceptTerms}</p>
          )}
        </div>

        {/* Error general */}
        {errors.submit && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
            <p className="text-red-400 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Botón de submit */}
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full py-4 px-8 bg-gradient-to-r from-amber-600 to-amber-700 text-charcoal font-bold text-xl rounded-xl hover:from-amber-500 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin"></div>
              <span>Procesando...</span>
            </div>
          ) : (
            '¡Pagar 199€ y Crear Mi Sitio Web!'
          )}
        </button>

        {/* Información adicional */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            🔒 Pago seguro procesado por Stripe
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Después del pago recibirás las instrucciones de acceso por email
          </p>
        </div>
      </form>
    </div>
  );
}