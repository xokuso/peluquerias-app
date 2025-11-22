import { loadStripe, Stripe } from '@stripe/stripe-js';

// Variable para almacenar la instancia de Stripe
let stripePromise: Promise<Stripe | null>;

/**
 * Obtiene la instancia de Stripe
 * Utiliza la clave pública de Stripe para inicializar el cliente
 */
export const getStripe = (): Promise<Stripe | null> => {
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

/**
 * Configuración de productos y precios para Stripe
 * Define los productos disponibles en la aplicación
 */
export const STRIPE_CONFIG = {
  products: {
    website: {
      name: 'Sitio Web Profesional para Peluquerías',
      description: 'Solución completa para hacer crecer tu peluquería online',
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
      prices: {
        original: 799,
        current: 199,
        currency: 'EUR',
        savings: 600
      }
    }
  },

  // URLs de redirección
  redirectUrls: {
    success: '/checkout/success',
    cancel: '/checkout/cancel'
  }
} as const;

export type StripeProduct = typeof STRIPE_CONFIG.products.website;