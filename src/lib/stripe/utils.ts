import Stripe from 'stripe';

/**
 * Instancia de Stripe para el servidor
 * Utiliza la clave secreta de Stripe
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

/**
 * Formatea un precio en centavos a formato de moneda
 */
export const formatPrice = (amount: number, _currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: _currency.toUpperCase(),
  }).format(amount / 100);
};

/**
 * Convierte un precio de euros a centavos para Stripe
 */
export const formatAmountForStripe = (amount: number, _currency: string = 'EUR'): number => {
  // Stripe maneja los precios en centavos
  return Math.round(amount * 100);
};

/**
 * Valida el webhook de Stripe usando la signature
 */
export const verifyWebhookSignature = (
  payload: string | Buffer,
  signature: string | string[] | undefined,
  webhookSecret: string
): Stripe.Event => {
  if (!signature) {
    throw new Error('No Stripe signature found');
  }

  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Tipos de eventos de webhook que nos interesan
 */
export const WEBHOOK_EVENTS = {
  CHECKOUT_COMPLETED: 'checkout.session.completed',
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_FAILED: 'payment_intent.payment_failed',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
} as const;

export type WebhookEventType = typeof WEBHOOK_EVENTS[keyof typeof WEBHOOK_EVENTS];