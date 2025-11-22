import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { PaymentStatus, PaymentMethod, OrderStatus } from '@prisma/client';

/**
 * Webhook handler para eventos de Stripe
 * Procesa pagos exitosos y crea automáticamente cuentas de usuario
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature') as string;

  // Create unique request ID for tracking
  const requestId = crypto.randomBytes(8).toString('hex');

  console.log(`🌐 WEBHOOK RECEIVED [${requestId}]:`, {
    timestamp: new Date().toISOString(),
    bodyLength: body.length,
    hasSignature: !!sig,
    signaturePreview: sig ? sig.substring(0, 20) + '...' : 'none',
    userAgent: headersList.get('user-agent') || 'unknown'
  });

  let event: Stripe.Event;

  try {
    // Verificar la firma del webhook
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed [${requestId}]:`, {
      error: err.message,
      signature: sig ? 'present' : 'missing',
      secret: process.env.STRIPE_WEBHOOK_SECRET ? 'configured' : 'missing'
    });
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  console.log(`🔔 Processing webhook event [${requestId}]: ${event.type}`, {
    eventId: event.id,
    created: new Date(event.created * 1000).toISOString(),
    livemode: event.livemode,
    objectType: (event.data.object as any)?.type || event.data.object?.object || 'unknown',
    apiVersion: event.api_version
  });

  // 🔒 IDEMPOTENCY CHECK: Prevent duplicate webhook processing
  const existingEvent = await prisma.stripeWebhookEvent.findUnique({
    where: { eventId: event.id }
  });

  if (existingEvent) {
    console.log(`🔄 Webhook event already processed [${requestId}]:`, {
      eventId: event.id,
      originalProcessingTime: existingEvent.processedAt.toISOString(),
      retryCount: existingEvent.retryCount + 1
    });

    // Update retry count for monitoring
    await prisma.stripeWebhookEvent.update({
      where: { eventId: event.id },
      data: {
        retryCount: existingEvent.retryCount + 1,
        metadata: {
          ...existingEvent.metadata as any,
          lastRetryAt: new Date().toISOString(),
          lastRetryRequestId: requestId
        }
      }
    });

    // Return success for already processed events to prevent Stripe retries
    return NextResponse.json({
      received: true,
      requestId,
      processingTimeMs: Date.now() - startTime,
      message: 'Event already processed',
      originalEventId: event.id
    });
  }

  // Record this event as being processed
  await prisma.stripeWebhookEvent.create({
    data: {
      eventId: event.id,
      eventType: event.type,
      success: false, // Will update to true on success
      retryCount: 0,
      metadata: {
        requestId,
        created: new Date(event.created * 1000).toISOString(),
        livemode: event.livemode,
        apiVersion: event.api_version,
        objectType: (event.data.object as any)?.type || event.data.object?.object || 'unknown'
      }
    }
  });

  let processingResult = { success: false, error: null as any };

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        processingResult = await handleCheckoutCompletedWithMonitoring(
          event.data.object as Stripe.Checkout.Session,
          requestId
        );
        break;

      case 'payment_intent.succeeded':
        processingResult = await handlePaymentSucceededWithMonitoring(
          event.data.object as Stripe.PaymentIntent,
          requestId
        );
        break;

      case 'payment_intent.payment_failed':
        processingResult = await handlePaymentFailedWithMonitoring(
          event.data.object as Stripe.PaymentIntent,
          requestId
        );
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        processingResult = { success: true, error: null };
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        processingResult = { success: true, error: null };
        break;

      default:
        console.log(`📝 Unhandled event type [${requestId}]: ${event.type}`);
        processingResult = { success: true, error: null };
    }

    const processingTime = Date.now() - startTime;

    console.log(`✅ Webhook processed successfully [${requestId}]:`, {
      eventType: event.type,
      processingTimeMs: processingTime,
      success: processingResult.success
    });

    // ✅ UPDATE IDEMPOTENCY RECORD: Mark as successfully processed
    await prisma.stripeWebhookEvent.update({
      where: { eventId: event.id },
      data: {
        success: true,
        metadata: {
          ...(await prisma.stripeWebhookEvent.findUnique({
            where: { eventId: event.id },
            select: { metadata: true }
          }))?.metadata as any,
          completedAt: new Date().toISOString(),
          processingTimeMs: processingTime,
          finalResult: processingResult
        }
      }
    });

    // Log webhook processing metrics
    if (event.type === 'checkout.session.completed') {
      try {
        await logWebhookProcessingMetrics(event, requestId, processingTime, true);
      } catch (metricsError) {
        console.error('⚠️ Failed to log metrics:', metricsError);
      }
    }

    return NextResponse.json({
      received: true,
      requestId,
      processingTimeMs: processingTime
    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;

    console.error(`❌ Error processing webhook [${requestId}] ${event.type}:`, {
      error: error.message,
      stack: error.stack,
      processingTimeMs: processingTime,
      eventId: event.id
    });

    // ❌ UPDATE IDEMPOTENCY RECORD: Mark as failed with error details
    try {
      await prisma.stripeWebhookEvent.update({
        where: { eventId: event.id },
        data: {
          success: false,
          errorMessage: error.message,
          metadata: {
            ...(await prisma.stripeWebhookEvent.findUnique({
              where: { eventId: event.id },
              select: { metadata: true }
            }))?.metadata as any,
            errorOccurredAt: new Date().toISOString(),
            processingTimeMs: processingTime,
            errorDetails: {
              name: error.name,
              message: error.message,
              stack: error.stack
            }
          }
        }
      });
    } catch (updateError) {
      console.error('⚠️ Failed to update webhook event record:', updateError);
    }

    // Log failed webhook processing
    if (event.type === 'checkout.session.completed') {
      try {
        await logWebhookProcessingMetrics(event, requestId, processingTime, false, error);
      } catch (metricsError) {
        console.error('⚠️ Failed to log error metrics:', metricsError);
      }
    }

    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        requestId,
        processingTimeMs: processingTime
      },
      { status: 500 }
    );
  }
}

/**
 * Log webhook processing metrics for monitoring and debugging
 */
async function logWebhookProcessingMetrics(
  event: Stripe.Event,
  requestId: string,
  processingTime: number,
  success: boolean,
  error?: any
) {
  try {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    // Find the user if they exist
    let userId = null;
    if (metadata?.customer_email) {
      const user = await prisma.user.findUnique({
        where: { email: metadata.customer_email },
        select: { id: true }
      });
      userId = user?.id || null;
    }

    // Store webhook processing log
    const notificationData: any = {
      title: success ? 'Webhook Procesado Exitosamente' : 'Webhook Falló',
      message: success
        ? `Webhook ${event.type} procesado en ${processingTime}ms`
        : `Error procesando webhook: ${error?.message || 'Error desconocido'}`,
      type: 'SYSTEM',
      priority: success ? 'LOW' : 'HIGH',
      metadata: {
        webhookEventId: event.id,
        webhookType: event.type,
        requestId,
        processingTime,
        success,
        sessionId: session.id,
        paymentStatus: session.payment_status,
        error: error ? {
          message: error.message,
          name: error.name
        } : null,
        timestamp: new Date().toISOString()
      }
    };

    // Only add userId if it exists
    if (userId) {
      notificationData.userId = userId;
    }

    await prisma.notification.create({
      data: notificationData
    });

    console.log(`📊 Webhook metrics logged [${requestId}]:`, {
      success,
      processingTime,
      userId: userId || 'unknown'
    });

  } catch (logError) {
    console.error('❌ Failed to log webhook metrics:', logError);
  }
}

/**
 * Wrapper with monitoring for checkout completion
 */
async function handleCheckoutCompletedWithMonitoring(
  session: Stripe.Checkout.Session,
  requestId: string
) {
  try {
    await handleCheckoutCompleted(session, requestId);
    return { success: true, error: null };
  } catch (error: any) {
    console.error(`❌ handleCheckoutCompleted failed [${requestId}]:`, error);
    return { success: false, error };
  }
}

/**
 * Wrapper with monitoring for payment succeeded
 */
async function handlePaymentSucceededWithMonitoring(
  paymentIntent: Stripe.PaymentIntent,
  requestId: string
) {
  try {
    await handlePaymentSucceeded(paymentIntent);
    return { success: true, error: null };
  } catch (error: any) {
    console.error(`❌ handlePaymentSucceeded failed [${requestId}]:`, error);
    return { success: false, error };
  }
}

/**
 * Wrapper with monitoring for payment failed
 */
async function handlePaymentFailedWithMonitoring(
  paymentIntent: Stripe.PaymentIntent,
  requestId: string
) {
  try {
    await handlePaymentFailed(paymentIntent);
    return { success: true, error: null };
  } catch (error: any) {
    console.error(`❌ handlePaymentFailed failed [${requestId}]:`, error);
    return { success: false, error };
  }
}

/**
 * Procesa sesiones de checkout completadas
 * Crea la cuenta de usuario y order después del pago exitoso
 */
export async function handleCheckoutCompleted(session: Stripe.Checkout.Session, requestId?: string) {
  console.log('🛒 Processing checkout completion:', {
    sessionId: session.id,
    paymentStatus: session.payment_status,
    amountTotal: session.amount_total,
    currency: session.currency,
    customerId: session.customer,
    customerEmail: session.customer_email,
    metadataKeys: session.metadata ? Object.keys(session.metadata) : [],
    created: new Date(session.created * 1000).toISOString()
  });

  if (session.payment_status !== 'paid') {
    console.log('⚠️ Payment not completed yet, skipping', {
      currentStatus: session.payment_status,
      expectedStatus: 'paid'
    });
    return;
  }

  const metadata = session.metadata;
  if (!metadata) {
    console.error('❌ No metadata found in session');
    return;
  }

  const {
    customer_email,
    customer_name,
    customer_phone,
    business_name,
    business_type,
    product_type,
    source
  } = metadata;

  if (!customer_email || !customer_name || !business_name) {
    console.error('❌ Missing required metadata:', metadata);
    return;
  }

  try {
    // Usar transacción para garantizar consistencia de datos
    await prisma.$transaction(async (tx) => {
      // 1. Verificar si el usuario ya existe
      let user = await tx.user.findUnique({
        where: { email: customer_email }
      });

      if (user) {
        console.log('👤 User already exists, updating...');

        // Actualizar información del usuario existente
        user = await tx.user.update({
          where: { id: user.id },
          data: {
            salonName: business_name,
            phone: customer_phone || user.phone,
            businessType: business_type === 'barbershop' ? 'BARBERSHOP' : 'SALON',
            subscriptionStatus: 'active',
            lastLogin: new Date(),
            hasCompletedOnboarding: false // Necesitará completar el onboarding
          }
        });
      } else {
        console.log('👤 Creating new user...');

        // Generar password temporal
        const tempPassword = generateSecurePassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        // Crear nuevo usuario
        user = await tx.user.create({
          data: {
            name: customer_name,
            email: customer_email,
            password: hashedPassword,
            salonName: business_name,
            phone: customer_phone || null,
            businessType: business_type === 'barbershop' ? 'BARBERSHOP' : 'SALON',
            role: 'CLIENT',
            subscriptionStatus: 'active',
            hasCompletedOnboarding: false,
            isActive: true,
            lastLogin: new Date()
          }
        });

        console.log('✅ User created with ID:', user.id);

        // TODO: Enviar email de bienvenida con credenciales temporales
        // await sendWelcomeEmail(user.email, tempPassword);
      }

      // 2. Crear registro de pago
      const payment = await tx.payment.create({
        data: {
          userId: user.id,
          amount: (session.amount_total || 0) / 100, // Convertir de centavos a euros
          currency: session.currency?.toUpperCase() || 'EUR',
          status: 'COMPLETED',
          method: 'STRIPE',
          stripePaymentId: session.payment_intent as string,
          description: `Sitio Web Profesional para ${business_name}`,
          paidAt: new Date(),
          metadata: {
            sessionId: session.id,
            customerId: typeof session.customer === 'string' ? session.customer : '',
            productType: product_type,
            source: source,
            businessName: business_name
          }
        }
      });

      console.log('💳 Payment record created:', payment.id);

      // 3. Buscar o crear template por defecto
      let defaultTemplate = await tx.template.findFirst({
        where: { category: 'BASIC', active: true }
      });

      if (!defaultTemplate) {
        // Crear template por defecto si no existe
        defaultTemplate = await tx.template.create({
          data: {
            name: 'Plantilla Básica Peluquerías',
            description: 'Plantilla profesional básica para peluquerías y salones de belleza',
            price: 199,
            category: 'BASIC',
            preview: 'https://example.com/preview/basic-salon.jpg',
            features: JSON.stringify([
              'Diseño responsive',
              'Sistema de reservas',
              'Galería de trabajos',
              'Información de contacto',
              'Horarios de apertura'
            ]),
            active: true
          }
        });
      }

      // 4. Crear order asociada
      const order = await tx.order.create({
        data: {
          salonName: business_name,
          ownerName: customer_name,
          email: customer_email,
          phone: customer_phone || '',
          domain: '', // Se asignará cuando el usuario complete la configuración
          templateId: defaultTemplate.id,
          total: (session.amount_total || 0) / 100,
          status: 'COMPLETED',
          stripeSessionId: session.id,
          paymentIntentId: session.payment_intent as string,
          userId: user.id,
          setupStep: 'DOMAIN_SELECTION',
          setupCompleted: false,
          completedAt: new Date()
        }
      });

      console.log('📋 Order created:', order.id);

      // 5. Asociar pago con order
      await tx.payment.update({
        where: { id: payment.id },
        data: { orderId: order.id }
      });

      // 6. Crear notificación para el usuario
      await tx.notification.create({
        data: {
          userId: user.id,
          title: '¡Bienvenido a PeluqueríasPRO!',
          message: `Tu pago ha sido procesado exitosamente. Te hemos enviado las instrucciones de acceso a ${customer_email}. Tu sitio web estará listo en 48 horas.`,
          type: 'PAYMENT',
          priority: 'HIGH',
          actionUrl: '/client/onboarding',
          actionText: 'Completar configuración',
          metadata: {
            orderId: order.id,
            amount: payment.amount,
            businessName: business_name
          }
        }
      });

      console.log('🔔 Welcome notification created');

      // 7. Crear token de auto-login para acceso inmediato post-pago
      const autoLoginToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

      const createdTokenRecord = await tx.autoLoginToken.create({
        data: {
          token: autoLoginToken,
          userId: user.id,
          email: customer_email,
          sessionId: session.id,
          expiresAt: tokenExpiry,
          metadata: {
            orderId: order.id,
            sessionId: session.id,
            source: 'stripe_checkout',
            businessName: business_name
          }
        }
      });

      console.log('🔐 Auto-login token created successfully:', {
        tokenId: createdTokenRecord.id,
        tokenPreview: autoLoginToken.substring(0, 8) + '...',
        sessionId: session.id,
        userId: user.id,
        email: customer_email,
        expiresAt: tokenExpiry.toISOString(),
        expiresInMinutes: 15,
        metadata: {
          orderId: order.id,
          sessionId: session.id,
          source: 'stripe_checkout',
          businessName: business_name
        }
      });

      // Store token in metadata for redirect URL
      await tx.order.update({
        where: { id: order.id },
        data: {
          notes: `Auto-login token: ${autoLoginToken}`
        }
      });
    });

    console.log('✅ Checkout processing completed successfully');

  } catch (error) {
    console.error('❌ Error in checkout processing:', error);
    throw error;
  }
}

/**
 * Procesa pagos exitosos (confirmación adicional)
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('💰 Payment succeeded:', paymentIntent.id);

  // Actualizar el estado del pago si existe
  try {
    await prisma.payment.updateMany({
      where: { stripePaymentId: paymentIntent.id },
      data: {
        status: 'COMPLETED',
        paidAt: new Date()
      }
    });

    console.log('✅ Payment status updated to COMPLETED');
  } catch (error) {
    console.error('❌ Error updating payment status:', error);
  }
}

/**
 * Procesa pagos fallidos
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('💥 Payment failed:', paymentIntent.id);

  try {
    await prisma.payment.updateMany({
      where: { stripePaymentId: paymentIntent.id },
      data: {
        status: 'FAILED',
        failedAt: new Date()
      }
    });

    // También actualizar la order asociada
    await prisma.order.updateMany({
      where: { paymentIntentId: paymentIntent.id },
      data: { status: 'CANCELLED' }
    });

    console.log('❌ Payment and order marked as failed');
  } catch (error) {
    console.error('❌ Error updating failed payment:', error);
  }
}

/**
 * Procesa pagos de facturas exitosos
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('📄 Invoice payment succeeded:', invoice.id);
  // Implementar lógica para facturas recurrentes si es necesario
}

/**
 * Procesa suscripciones creadas (para futuras features)
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('🔄 Subscription created:', subscription.id);
  // Implementar lógica para suscripciones recurrentes
}

/**
 * Genera una contraseña temporal segura usando generación criptográficamente segura
 */
function generateSecurePassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';

  // Usar crypto.randomInt() para generación segura de números aleatorios
  let password = '';
  password += uppercase[crypto.randomInt(0, uppercase.length)];
  password += lowercase[crypto.randomInt(0, lowercase.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  password += symbols[crypto.randomInt(0, symbols.length)];

  const allChars = uppercase + lowercase + numbers + symbols;
  for (let i = 4; i < 12; i++) {
    password += allChars[crypto.randomInt(0, allChars.length)];
  }

  // Fisher-Yates shuffle con crypto.randomInt() para mezcla segura
  const passwordArray = password.split('');
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    // Usar variable temporal para evitar problemas de tipo con TypeScript
    const temp = passwordArray[i]!;
    passwordArray[i] = passwordArray[j]!;
    passwordArray[j] = temp;
  }

  return passwordArray.join('');
}

/**
 * Genera sugerencia de dominio basada en el nombre del negocio
 */
function generateDomainSuggestion(businessName: string): string {
  const cleanName = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);

  return `${cleanName}peluqueria.es`;
}

/**
 * Envía email de bienvenida con credenciales temporales
 * TODO: Implementar usando Resend
 */
async function sendWelcomeEmail(email: string, tempPassword: string): Promise<void> {
  // Esta función se implementará con Resend
  console.log(`📧 TODO: Send welcome email to ${email} with temp password`);
}