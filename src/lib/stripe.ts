import Stripe from 'stripe';
import { loadStripe, Stripe as StripeJS } from '@stripe/stripe-js';

// ============================
// CONFIGURACIÓN DEL SERVIDOR
// ============================

/**
 * Instancia de Stripe para el servidor
 * Utiliza la clave secreta para operaciones del backend
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

// ============================
// CONFIGURACIÓN DEL CLIENTE
// ============================

/**
 * Variable para almacenar la instancia de Stripe del cliente
 */
let stripePromise: Promise<StripeJS | null>;

/**
 * Obtiene la instancia de Stripe para el cliente
 * Utiliza la clave pública para operaciones del frontend
 */
export const getStripe = (): Promise<StripeJS | null> => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      throw new Error(
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY no está configurada. ' +
        'Por favor, añade tu clave pública de Stripe en las variables de entorno.'
      );
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};

// ============================
// CONFIGURACIÓN DE PRODUCTOS
// ============================

/**
 * Configuración del producto principal
 */
export const PRODUCT_CONFIG = {
  website: {
    name: 'Sitio Web Profesional para Peluquerías',
    description: 'Solución completa para hacer crecer tu peluquería online. Incluye diseño profesional, sistema de reservas, panel de administración y 6 meses de soporte técnico.',
    price: 19900, // 199€ en centavos
    currency: 'eur',
    originalPrice: 79900, // 799€ en centavos
    savings: 60000, // 600€ en centavos
    features: [
      'Diseño profesional y responsive',
      'Sistema de reservas online',
      'Integración con redes sociales',
      'Optimización SEO',
      'Gestión de clientes',
      'Integración de pagos',
      'Panel de administración',
      'Análisis y métricas',
      'Soporte técnico 6 meses',
      'Dominio personalizado incluido'
    ],
    metadata: {
      type: 'website_professional',
      category: 'peluquerias',
      support_months: '6',
      includes_domain: 'true'
    }
  }
} as const;

// ============================
// CONFIGURACIÓN DE CHECKOUT
// ============================

/**
 * URLs de redirección después del pago
 */
export const REDIRECT_URLS = {
  success: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success/autologin`,
  cancel: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`
} as const;

/**
 * Configuración por defecto para las sesiones de checkout
 */
export const DEFAULT_CHECKOUT_CONFIG = {
  mode: 'payment' as const,
  payment_method_types: ['card'] as const,
  billing_address_collection: 'required' as const,
  customer_creation: 'always' as const,
  submit_type: 'pay' as const,
  locale: 'es' as const,
  allow_promotion_codes: false,
  expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutos
} as const;

// ============================
// TIPOS Y INTERFACES
// ============================

/**
 * Interface para los datos del cliente en el checkout
 */
export interface CheckoutCustomerData {
  email: string;
  name: string;
  phone?: string;
  businessName: string;
  businessType?: string;
}

/**
 * Interface para los metadatos del checkout
 */
export interface CheckoutMetadata {
  [key: string]: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  business_name: string;
  business_type?: string;
  product_type: string;
  created_at: string;
  source: string;
}

/**
 * Interface para el evento del webhook
 */
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: Stripe.Checkout.Session | Stripe.PaymentIntent;
  };
  created: number;
}

// ============================
// FUNCIONES UTILITARIAS
// ============================

/**
 * Convierte centavos a euros para mostrar
 */
export const formatPrice = (priceInCents: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(priceInCents / 100);
};

/**
 * Valida la configuración de Stripe
 */
export const validateStripeConfig = (): void => {
  const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_APP_URL'
  ];

  const missingVars = requiredEnvVars.filter(
    varName => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Variables de entorno faltantes para Stripe: ${missingVars.join(', ')}`
    );
  }
};

/**
 * Verifica si estamos en modo de desarrollo
 */
export const isDevMode = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Obtiene la URL base de la aplicación
 */
export const getAppUrl = (): string => {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};