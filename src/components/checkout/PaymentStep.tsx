"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import {
  CreditCard, CheckCircle, ArrowLeft, Shield,
  Clock, Globe, Zap, AlertCircle
} from 'lucide-react';

import {
  paymentSchema,
  type BusinessData,
  type WebConfig,
  type PaymentData,
  type OrderPricing
} from '@/lib/checkout-schemas';
import { trackEvents } from '@/lib/analytics';

interface PaymentStepProps {
  businessData: Partial<BusinessData>;
  webConfig: Partial<WebConfig>;
  paymentData: Partial<PaymentData>;
  pricing: OrderPricing;
  clientSecret: string;
  onBack: () => void;
}

export default function PaymentStep({
  businessData,
  webConfig,
  paymentData,
  pricing,
  clientSecret,
  onBack
}: PaymentStepProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      ...paymentData,
      pricing,
      acceptTerms: false
    }
  });

  const createPaymentIntent = useCallback(async () => {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: pricing.totalToday,
          currency: 'eur',
          metadata: {
            salonName: businessData.salonName,
            ownerName: businessData.ownerName,
            email: businessData.email,
            selectedTemplate: webConfig.selectedTemplate,
            domainName: `${webConfig.domainName}${webConfig.domainExtension}`,
            hasMigration: webConfig.wantsMigration,
            setupFee: pricing.setupFee,
            migrationFee: pricing.domainMigration,
            totalAmount: pricing.totalToday,
          }
        })
      });

      const data = await response.json();
      setPaymentIntentId(data.paymentIntentId);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setPaymentError('Error inicializando el pago. Por favor, recarga la página.');
    }
  }, [businessData.salonName, businessData.ownerName, businessData.email, webConfig.selectedTemplate, webConfig.domainName, webConfig.domainExtension, webConfig.wantsMigration, pricing.setupFee, pricing.domainMigration, pricing.totalToday]);

  // Crear Payment Intent cuando el componente se monta
  useEffect(() => {
    if (!clientSecret) {
      createPaymentIntent();
    }

    // Track begin checkout
    trackEvents.beginCheckout(pricing.totalToday);
  }, [clientSecret, createPaymentIntent, pricing.totalToday]);

  const onSubmit = async (formData: { acceptTerms: boolean }) => {
    if (!stripe || !elements || !formData.acceptTerms) {
      return;
    }

    setIsProcessing(true);
    setPaymentError('');

    // Track add payment info
    trackEvents.addPaymentInfo();

    try {
      // Confirmar el pago con Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?session_id=${paymentIntentId}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setPaymentError(error.message || 'Error procesando el pago');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Track successful purchase
        trackEvents.purchase(
          paymentIntent.id,
          pricing.totalToday,
          [{
            item_id: 'website_setup',
            item_name: `Website for ${businessData.salonName}`,
            price: pricing.totalToday,
            quantity: 1,
            category: 'service'
          }]
        );

        // Send confirmation email
        try {
          const emailResponse = await fetch('/api/send-confirmation-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              salonName: businessData.salonName,
              ownerName: businessData.ownerName,
              email: businessData.email,
              domainName: `${webConfig.domainName}${webConfig.domainExtension}`,
              selectedTemplate: webConfig.selectedTemplate || 'Plantilla Moderna',
              amount: pricing.totalToday,
              paymentIntentId: paymentIntent.id,
              setupFee: pricing.setupFee,
              migrationFee: pricing.domainMigration,
              monthlyFee: pricing.monthlyFee,
              hasMigration: webConfig.wantsMigration || false,
              orderDate: new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            })
          });

          const emailResult = await emailResponse.json();

          if (!emailResult.success && process.env.NODE_ENV === 'production') {
            console.error('Failed to send confirmation email:', emailResult);
            // Don't block the success flow, just log the error
          }
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't block the success flow if email fails
        }

        // Pago exitoso - redirigir a página de éxito
        router.push(`/checkout/success?payment_intent=${paymentIntent.id}`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentError('Error inesperado procesando el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* Resumen del pedido */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resumen del pedido
        </h3>

        <div className="space-y-4">
          {/* Información del negocio */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Peluquería:</span>
            <span className="font-medium text-gray-900">{businessData.salonName}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Propietario:</span>
            <span className="font-medium text-gray-900">{businessData.ownerName}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium text-gray-900">{businessData.email}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Plantilla:</span>
            <span className="font-medium text-gray-900">{webConfig.selectedTemplate}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Dominio:</span>
            <span className="font-medium text-gray-900">
              {webConfig.domainName}{webConfig.domainExtension}
            </span>
          </div>

          <hr className="border-gray-300" />

          {/* Desglose de precios */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Setup inicial:</span>
              <span className="font-medium text-gray-900">{pricing.setupFee}€</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Dominio primer año:</span>
              <span className="text-green-600 font-medium">Incluido</span>
            </div>

            {webConfig.wantsMigration && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Migración dominio:</span>
                <span className="font-medium text-gray-900">+{pricing.domainMigration}€</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Mensualidad:</span>
              <span className="font-medium text-gray-900">{pricing.monthlyFee}€/mes</span>
            </div>
          </div>

          <hr className="border-gray-300" />

          <div className="flex justify-between">
            <span className="text-lg font-semibold text-gray-900">Total a pagar HOY:</span>
            <span className="text-xl font-bold text-blue-600">{pricing.totalToday}€</span>
          </div>

          <p className="text-xs text-gray-500">
            La mensualidad de {pricing.monthlyFee}€ se cobrará después de 30 días
          </p>
        </div>
      </div>

      {/* Lo que incluye */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h4 className="text-lg font-semibold text-blue-900 mb-4">
          Lo que incluye tu web profesional:
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Globe className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-800">Dominio incluido primer año</span>
          </div>

          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-800">Hosting optimizado</span>
          </div>

          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-800">Certificado SSL gratis</span>
          </div>

          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-800">Soporte técnico 24/7</span>
          </div>
        </div>
      </div>

      {/* Formulario de pago */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Payment Element de Stripe */}
        {clientSecret && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
              Información de pago
            </h3>

            <div className="border border-gray-300 rounded-lg p-4">
              <PaymentElement
                options={{
                  layout: "tabs"
                }}
              />
            </div>
          </div>
        )}

        {/* Error de pago */}
        {paymentError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-700">{paymentError}</span>
          </div>
        )}

        {/* Términos y condiciones */}
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <input
              {...register('acceptTerms')}
              type="checkbox"
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm text-gray-700">
              Acepto los{' '}
              <a href="/terms" className="text-blue-600 hover:underline" target="_blank">
                términos y condiciones
              </a>{' '}
              y la{' '}
              <a href="/privacy" className="text-blue-600 hover:underline" target="_blank">
                política de privacidad
              </a>
            </label>
          </div>

          {errors.acceptTerms && (
            <p className="text-sm text-red-600 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.acceptTerms.message}</span>
            </p>
          )}
        </div>

        {/* Seguridad */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Pago 100% seguro</span>
          </div>
          <p className="text-xs text-green-700">
            Tu información está protegida con cifrado SSL. Procesamos pagos con Stripe,
            líder mundial en seguridad de pagos online.
          </p>
        </div>

        {/* Botones de navegación */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onBack}
            disabled={isProcessing}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Pagar {pricing.totalToday}€</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}