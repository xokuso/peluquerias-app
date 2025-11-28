"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  Loader2,
  Mail,
  User,
  CreditCard,
  Shield,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe - Fix environment variable access
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.error('❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY no está configurada');
  throw new Error('Configuración de Stripe incompleta');
}

const stripePromise = loadStripe(stripePublishableKey);

// Form validation schema
const checkoutSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Por favor introduce un email válido'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: (data: { paymentIntentId: string; email: string; name: string }) => void;
}

function CheckoutForm({ clientSecret, amount, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const handleSubmit = async (data: CheckoutFormData) => {
    if (!stripe || !elements) {
      setError('Error de inicialización. Por favor, recarga la página.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || 'Error procesando el pago');
        setIsProcessing(false);
        return;
      }

      // Confirm payment with user details
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/client/dashboard?onboarding=true`,
          receipt_email: data.email,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || 'Error procesando el pago');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Call the simplified checkout API to create user account
        const createUserResponse = await fetch('/api/simplified-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            name: data.name,
            email: data.email,
          }),
        });

        const result = await createUserResponse.json();

        if (!createUserResponse.ok) {
          throw new Error(result.error || 'Error creando la cuenta');
        }

        onSuccess({
          paymentIntentId: paymentIntent.id,
          email: data.email,
          name: data.name,
        });
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Error procesando el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Customer Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Información de contacto</h3>

        {/* Name field */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
            Nombre completo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="name"
              type="text"
              {...form.register('name')}
              className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
              placeholder="Tu nombre completo"
              disabled={isProcessing}
            />
          </div>
          {form.formState.errors.name && (
            <p className="text-red-600 text-xs mt-1">{form.formState.errors.name.message}</p>
          )}
        </div>

        {/* Email field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="email"
              type="email"
              {...form.register('email')}
              className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
              placeholder="tu@email.com"
              disabled={isProcessing}
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-red-600 text-xs mt-1">{form.formState.errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Payment Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Información de pago
        </h3>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <PaymentElement
            options={{
              layout: 'tabs',
              paymentMethodOrder: ['card', 'paypal']
            }}
          />
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h4 className="font-semibold text-slate-900 mb-4">Resumen del pedido</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Configuración inicial</span>
            <span className="font-medium">199€</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Mantenimiento mensual</span>
            <span className="font-medium">49€/mes</span>
          </div>
          <div className="border-t border-blue-200 pt-3">
            <div className="flex justify-between text-lg font-bold text-slate-900">
              <span>Total hoy</span>
              <span>{amount}€</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Security Note */}
      <div className="flex items-center text-sm text-slate-600 bg-slate-50 rounded-xl p-4">
        <Shield className="w-5 h-5 mr-2 text-emerald-500" />
        <span>Pago seguro procesado por Stripe. Tu información está protegida con encriptación SSL.</span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full flex items-center justify-center px-4 py-4 border border-transparent rounded-xl shadow-sm text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Completar pago • {amount}€
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </button>
    </form>
  );
}

interface SimplifiedCheckoutProps {
  className?: string;
}

export default function SimplifiedCheckout({ className = "" }: SimplifiedCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  // Pricing configuration
  const setupFee = 199; // €199 one-time setup
  const monthlyFee = 49; // €49/month (will be set up as subscription after payment)

  const initializePayment = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: setupFee,
          currency: 'eur',
          metadata: {
            setupFee: setupFee,
            monthlyFee: monthlyFee,
            source: 'simplified-checkout',
            totalAmount: setupFee,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error inicializando el pago');
      }

      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Payment initialization error:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = (_data: { paymentIntentId: string; email: string; name: string }) => {
    setSuccess(true);

    // Redirect to client dashboard with onboarding
    startTransition(() => {
      setTimeout(() => {
        router.push('/client/dashboard?onboarding=true&welcome=true');
      }, 2000);
    });
  };

  if (success) {
    return (
      <div className={`w-full max-w-md mx-auto ${className}`}>
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-slate-200/50 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            ¡Pago completado!
          </h2>

          <p className="text-slate-600 mb-6">
            Tu cuenta ha sido creada exitosamente. Te redirigiremos a tu panel de control para completar la configuración.
          </p>

          <div className="flex items-center justify-center text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Redirigiendo...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-lg mx-auto ${className}`}>
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-slate-200/50">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Finalizar proyecto
          </h2>
          <p className="text-slate-600">
            Solo necesitamos algunos datos para empezar
          </p>
        </div>

        {!clientSecret ? (
          <div className="text-center">
            <button
              onClick={initializePayment}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-xl shadow-sm text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Iniciar proyecto • {setupFee}€
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>

            <div className="mt-6 text-xs text-slate-500 space-y-2">
              <p>• Configuración completa en 48 horas</p>
              <p>• Incluye hosting, SSL y mantenimiento</p>
              <p>• Garantía de satisfacción 30 días</p>
            </div>
          </div>
        ) : (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#2563eb',
                  colorBackground: '#ffffff',
                  colorText: '#1e293b',
                  colorDanger: '#ef4444',
                  fontFamily: 'system-ui, sans-serif',
                  borderRadius: '12px',
                },
              },
            }}
          >
            <CheckoutForm
              clientSecret={clientSecret}
              amount={setupFee}
              onSuccess={handleSuccess}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}