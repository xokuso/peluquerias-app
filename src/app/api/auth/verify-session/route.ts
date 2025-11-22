import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

/**
 * GET /api/auth/verify-session?session_id=xxx
 * Verifies that a Stripe session exists and was paid, and returns user info
 * Used for manual login fallback when auto-login fails
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    console.log('🔍 Verifying Stripe session for manual login:', sessionId);

    // Step 1: Verify session with Stripe
    let stripeSession;
    try {
      stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (stripeError: any) {
      console.error('❌ Failed to retrieve Stripe session:', stripeError.message);
      return NextResponse.json(
        { success: false, error: 'Invalid session ID' },
        { status: 404 }
      );
    }

    // Step 2: Check if session is paid
    if (stripeSession.payment_status !== 'paid') {
      console.log('❌ Session not paid:', stripeSession.payment_status);
      return NextResponse.json(
        {
          success: false,
          error: 'Payment not completed',
          paymentStatus: stripeSession.payment_status
        },
        { status: 400 }
      );
    }

    // Step 3: Check metadata
    const metadata = stripeSession.metadata;
    if (!metadata?.customer_email) {
      console.error('❌ Session missing customer email');
      return NextResponse.json(
        { success: false, error: 'Session missing required data' },
        { status: 400 }
      );
    }

    // Step 4: Check if user exists in our database
    const user = await prisma.user.findUnique({
      where: { email: metadata.customer_email },
      select: {
        id: true,
        email: true,
        name: true,
        salonName: true,
        hasCompletedOnboarding: true,
        createdAt: true
      }
    });

    if (!user) {
      console.error('❌ User not found in database:', metadata.customer_email);
      return NextResponse.json(
        {
          success: false,
          error: 'User account not created. Please contact support.',
          email: metadata.customer_email,
          sessionId
        },
        { status: 404 }
      );
    }

    // Step 5: Check if order exists
    const order = await prisma.order.findFirst({
      where: { stripeSessionId: sessionId },
      select: {
        id: true,
        status: true,
        total: true,
        salonName: true,
        completedAt: true
      }
    });

    console.log('✅ Session verification successful:', {
      sessionId,
      userEmail: user.email,
      userName: user.name,
      orderExists: !!order,
      orderStatus: order?.status || 'not_found'
    });

    return NextResponse.json({
      success: true,
      email: user.email,
      user: {
        name: user.name,
        salonName: user.salonName,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        accountCreated: user.createdAt
      },
      order: order ? {
        id: order.id,
        status: order.status,
        total: order.total,
        salonName: order.salonName,
        completedAt: order.completedAt
      } : null,
      paymentInfo: {
        sessionId,
        paymentStatus: stripeSession.payment_status,
        amountTotal: (stripeSession.amount_total || 0) / 100,
        currency: stripeSession.currency
      }
    });

  } catch (error: any) {
    console.error('❌ Error verifying session:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Session verification failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}