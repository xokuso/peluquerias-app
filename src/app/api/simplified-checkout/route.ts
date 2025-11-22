import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover'
});

// Validation schema
const simplifiedCheckoutSchema = z.object({
  paymentIntentId: z.string(),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  salonName: z.string().min(2, 'El nombre del salón debe tener al menos 2 caracteres'),
  templateId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Simplified checkout request:', body);

    // Validate input data
    const validatedData = simplifiedCheckoutSchema.parse(body);
    const { paymentIntentId, name, email, salonName, templateId } = validatedData;

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'El pago no se ha completado correctamente' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user exists, just update their payment information and redirect
      await prisma.user.update({
        where: { email },
        data: {
          name,
          lastLogin: new Date(),
        },
      });

      // Create order record
      await createOrderRecord(paymentIntent, name, email, salonName, templateId, existingUser.id);

      return NextResponse.json({
        message: 'Usuario existente actualizado',
        userId: existingUser.id,
        redirectTo: '/client/dashboard',
      });
    }

    // Generate a temporary password for the user
    const tempPassword = generateTemporaryPassword();
    const hashedPassword = await hash(tempPassword, 12);

    // Create new user account
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'CLIENT',
        hasCompletedOnboarding: false,
        salonName: salonName || `${name}'s Salon`, // Use provided salon name or default
        phone: '', // Will be filled during onboarding
        city: '', // Will be filled during onboarding
        businessType: 'SALON',
        isActive: true,
        subscriptionStatus: 'SETUP_PAYMENT_RECEIVED', // Custom status for setup payment
      },
    });

    // Create order record
    await createOrderRecord(paymentIntent, name, email, salonName, templateId, user.id);

    // Set up recurring subscription for monthly maintenance
    try {
      await setupMonthlySubscription(email, name, paymentIntent.customer as string);
    } catch (subscriptionError) {
      console.error('Error setting up subscription:', subscriptionError);
      // Don't fail the user creation, but log for manual follow-up
    }

    // Send welcome email with credentials (this would be handled by the webhook in production)
    console.log(`User created: ${user.id}, Temporary password: ${tempPassword}`);

    return NextResponse.json({
      message: 'Cuenta creada exitosamente',
      userId: user.id,
      redirectTo: '/client/dashboard?onboarding=true&welcome=true',
    });

  } catch (error) {
    console.error('Simplified checkout error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: error.issues
        },
        { status: 400 }
      );
    }

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: 'Error verificando el pago',
          message: error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Error interno del servidor'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function createOrderRecord(
  paymentIntent: Stripe.PaymentIntent,
  name: string,
  email: string,
  salonName: string,
  templateId?: string,
  userId?: string
) {
  try {
    // Try to find the specific template first, then fall back to default
    let template = null;
    if (templateId) {
      template = await prisma.template.findUnique({
        where: { id: templateId },
      });
    }

    // If no specific template or not found, use default
    if (!template) {
      template = await prisma.template.findFirst({
        where: { category: 'BASIC', active: true },
      });
    }

    if (!template) {
      console.error('No template found');
      return;
    }

    await prisma.order.create({
      data: {
        salonName: salonName || `${name}'s Salon`,
        ownerName: name,
        email: email,
        phone: '', // Will be filled during onboarding
        domain: `${salonName?.toLowerCase().replace(/\s+/g, '-') || email.split('@')[0]}-salon.com`, // Generate domain from salon name
        templateId: template.id,
        total: paymentIntent.amount / 100, // Convert from cents
        status: 'PROCESSING' as const,
        paymentIntentId: paymentIntent.id,
        userId: userId || null,
      },
    });

    console.log('Order record created for simplified checkout');
  } catch (error) {
    console.error('Error creating order record:', error);
  }
}

async function setupMonthlySubscription(email: string, name: string, customerId?: string) {
  try {
    let customer: Stripe.Customer;

    if (customerId) {
      customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    } else {
      // Create a new customer if none exists
      customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          source: 'simplified-checkout',
        },
      });
    }

    // Create a price for the monthly subscription (49€/month)
    const price = await stripe.prices.create({
      unit_amount: 4900, // 49€ in cents
      currency: 'eur',
      recurring: {
        interval: 'month',
      },
      product_data: {
        name: 'Mantenimiento Web Mensual',
      },
    });

    // Create subscription (but don't start immediately - could be started after onboarding)
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      trial_period_days: 30, // Give them 30 days before first monthly charge
      metadata: {
        email,
        source: 'simplified-checkout',
      },
    });

    console.log('Monthly subscription created:', subscription.id);
    return subscription;

  } catch (error) {
    console.error('Error setting up monthly subscription:', error);
    throw error;
  }
}

function generateTemporaryPassword(): string {
  // Generate a secure temporary password
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// GET endpoint to check the status of a simplified checkout
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('payment_intent_id');

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'payment_intent_id is required' },
        { status: 400 }
      );
    }

    // Find the user associated with this payment intent
    const order = await prisma.order.findUnique({
      where: { paymentIntentId },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      orderId: order.id,
      userId: order.userId,
      email: order.email,
      status: order.status,
      userCreated: !!order.user,
    });

  } catch (error) {
    console.error('Error checking simplified checkout status:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}