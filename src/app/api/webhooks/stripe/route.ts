import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { sendOrderConfirmationEmail, retryEmailSend } from '@/lib/resend';
import { hash } from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover'
});

// Webhook secret from Stripe Dashboard
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    // Get the raw body
    const body = await request.text();

    // Get the signature from headers
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    console.log(`Webhook received: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);

        // Extract metadata
        const metadata = paymentIntent.metadata;

        // Handle simplified checkout payments
        if (metadata && metadata.source === 'simplified-checkout') {
          await handleSimplifiedCheckoutWebhook(paymentIntent);
          break;
        }

        if (metadata && metadata.salonName && metadata.email) {
          // Send confirmation email with retry logic
          const emailResult = await retryEmailSend(
            sendOrderConfirmationEmail,
            {
              salonName: metadata.salonName,
              ownerName: metadata.ownerName || '',
              email: metadata.email,
              domainName: metadata.domainName || '',
              selectedTemplate: metadata.selectedTemplate || 'Plantilla Moderna',
              amount: paymentIntent.amount / 100, // Convert from cents to euros
              paymentIntentId: paymentIntent.id,
              setupFee: parseInt(metadata.setupFee || '199'),
              migrationFee: parseInt(metadata.migrationFee || '0'),
              monthlyFee: 49,
              hasMigration: metadata.hasMigration === 'true',
              orderDate: new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            },
            3, // max retries
            2000 // initial delay
          );

          if (!emailResult.success) {
            console.error('Failed to send confirmation email via webhook:', emailResult.error);
            // Log to monitoring service or database for manual follow-up
            await logFailedEmail({
              paymentIntentId: paymentIntent.id,
              email: metadata.email,
              error: emailResult.error,
              timestamp: new Date().toISOString()
            });
          } else {
            console.log('Confirmation email sent successfully via webhook');
          }
        }

        // Here you could also:
        // - Update database with order information
        // - Create customer record
        // - Trigger other workflows
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);

        // You might want to send a different email here
        // or update the database with the failure
        break;
      }

      case 'charge.succeeded': {
        const charge = event.data.object as Stripe.Charge;
        console.log('Charge succeeded:', charge.id);

        // Additional processing if needed
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription created:', subscription.id);

        // Handle subscription creation
        // You might want to set up the recurring billing here
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription cancelled:', subscription.id);

        // Handle subscription cancellation
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return success response to Stripe
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);

    // Return error to Stripe (will retry)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Handle simplified checkout webhook events
async function handleSimplifiedCheckoutWebhook(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Handling simplified checkout webhook for payment:', paymentIntent.id);

    // Check if we already processed this payment
    const existingOrder = await prisma.order.findUnique({
      where: { paymentIntentId: paymentIntent.id },
      include: { user: true },
    });

    if (existingOrder && existingOrder.user) {
      console.log('Payment already processed, user already exists');
      return;
    }

    // Extract customer information from payment intent
    const customerEmail = paymentIntent.receipt_email;

    if (!customerEmail) {
      console.error('No customer email found in payment intent for simplified checkout');
      return;
    }

    // Try to get customer name from Stripe customer data
    let customerName = 'New Customer';
    if (paymentIntent.customer) {
      try {
        const customer = await stripe.customers.retrieve(paymentIntent.customer as string);
        if (customer && !customer.deleted && customer.name) {
          customerName = customer.name;
        }
      } catch (error) {
        console.warn('Could not retrieve customer data:', error);
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    let userId: string;

    if (existingUser) {
      // Update existing user
      await prisma.user.update({
        where: { email: customerEmail },
        data: {
          name: customerName,
          lastLogin: new Date(),
        },
      });
      userId = existingUser.id;
      console.log('Updated existing user:', existingUser.id);
    } else {
      // Create new user
      const tempPassword = generateTemporaryPassword();
      const hashedPassword = await hash(tempPassword, 12);

      const user = await prisma.user.create({
        data: {
          name: customerName,
          email: customerEmail,
          password: hashedPassword,
          role: 'CLIENT',
          hasCompletedOnboarding: false,
          salonName: `${customerName}'s Salon`,
          phone: '',
          city: '',
          businessType: 'SALON',
          isActive: true,
          subscriptionStatus: 'SETUP_PAYMENT_RECEIVED',
        },
      });

      userId = user.id;
      console.log('Created new user via webhook:', user.id, 'temp password:', tempPassword);
    }

    // Create or update order record
    if (existingOrder) {
      await prisma.order.update({
        where: { id: existingOrder.id },
        data: {
          userId: userId,
          status: 'PROCESSING' as const,
        },
      });
    } else {
      // Get default template
      const defaultTemplate = await prisma.template.findFirst({
        where: { category: 'BASIC', active: true },
      });

      if (defaultTemplate) {
        await prisma.order.create({
          data: {
            salonName: `${customerName}'s Salon`,
            ownerName: customerName,
            email: customerEmail,
            phone: '',
            domain: `${customerEmail.split('@')[0]}-salon.com`,
            templateId: defaultTemplate.id,
            total: paymentIntent.amount / 100,
            status: 'PROCESSING' as const,
            paymentIntentId: paymentIntent.id,
            userId: userId,
          },
        });
      }
    }

    console.log('Simplified checkout webhook processing completed');

  } catch (error) {
    console.error('Error processing simplified checkout webhook:', error);
    throw error; // Re-throw to trigger webhook retry
  }
}

function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Log failed email attempts for manual follow-up
async function logFailedEmail(data: {
  paymentIntentId: string;
  email: string;
  error: unknown;
  timestamp: string;
}) {
  // In production, you'd want to:
  // 1. Save to database
  // 2. Send to error tracking service (Sentry, etc.)
  // 3. Notify admin team

  console.error('Failed email logged for manual follow-up:', data);

  // For now, just log to console
  // In production, implement proper error tracking

  try {
    // Example: Send to admin notification system
    if (process.env.ADMIN_WEBHOOK_URL) {
      await fetch(process.env.ADMIN_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'email_failure',
          data: data,
          severity: 'high',
          action_required: true
        })
      });
    }
  } catch (notifyError) {
    console.error('Failed to notify admin:', notifyError);
  }
}

// Health check endpoint for the webhook
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    webhook: 'stripe',
    configured: !!process.env.STRIPE_WEBHOOK_SECRET,
    timestamp: new Date().toISOString()
  });
}