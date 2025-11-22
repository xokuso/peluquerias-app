import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import crypto from 'crypto';

/**
 * POST /api/auth/auto-login/fallback
 * Creates a fallback auto-login token when webhooks fail
 * Verifies the Stripe session directly and creates token if valid
 */
export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    console.log('🔄 Attempting fallback token creation for session:', sessionId);

    // Step 1: Check if token already exists
    const existingTokens = await prisma.autoLoginToken.findMany({
      where: {
        used: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    const existingToken = existingTokens.find(token => {
      if (!token.metadata) return false;
      const metadata = token.metadata as any;
      return metadata.sessionId === sessionId;
    });

    if (existingToken) {
      console.log('✅ Found existing valid token for session');
      return NextResponse.json({
        success: true,
        token: existingToken.token,
        source: 'existing'
      });
    }

    // Step 2: Verify session with Stripe directly
    let stripeSession;
    try {
      stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (stripeError: any) {
      console.error('❌ Failed to retrieve Stripe session:', stripeError.message);
      return NextResponse.json(
        { success: false, error: 'Invalid session ID' },
        { status: 400 }
      );
    }

    // Step 3: Verify session is paid and has required metadata
    if (stripeSession.payment_status !== 'paid') {
      console.log('❌ Session not paid yet:', stripeSession.payment_status);
      return NextResponse.json(
        { success: false, error: 'Payment not completed' },
        { status: 400 }
      );
    }

    const metadata = stripeSession.metadata;
    if (!metadata?.customer_email || !metadata?.customer_name) {
      console.error('❌ Session missing required metadata');
      return NextResponse.json(
        { success: false, error: 'Invalid session metadata' },
        { status: 400 }
      );
    }

    // Step 4: Check if user exists and order exists
    const user = await prisma.user.findUnique({
      where: { email: metadata.customer_email }
    });

    if (!user) {
      console.error('❌ User not found for email:', metadata.customer_email);

      // This means the webhook completely failed, we need to create everything
      return NextResponse.json(
        {
          success: false,
          error: 'User account not created. Please contact support.',
          supportInfo: {
            sessionId,
            email: metadata.customer_email,
            issue: 'webhook_completely_failed'
          }
        },
        { status: 500 }
      );
    }

    // Step 5: Check if order exists
    const order = await prisma.order.findFirst({
      where: { stripeSessionId: sessionId }
    });

    if (!order) {
      console.log('⚠️ Order not found, but user exists. Creating minimal order record...');

      // Create a minimal order record for tracking
      try {
        await prisma.order.create({
          data: {
            salonName: metadata.business_name || user.salonName || 'Negocio',
            ownerName: metadata.customer_name || user.name || 'Cliente',
            email: metadata.customer_email,
            phone: metadata.customer_phone || '',
            domain: '',
            templateId: '1', // Will need to be set to a valid template ID
            total: (stripeSession.amount_total || 0) / 100,
            status: 'COMPLETED',
            stripeSessionId: sessionId,
            paymentIntentId: (typeof stripeSession.payment_intent === 'string' ? stripeSession.payment_intent : '') || '',
            userId: user.id,
            setupStep: 'DOMAIN_SELECTION',
            setupCompleted: false,
            completedAt: new Date(),
            notes: 'Created via fallback process'
          }
        });

        console.log('✅ Minimal order record created');
      } catch (orderError) {
        console.error('❌ Failed to create order record:', orderError);
        // Continue anyway, the auto-login can still work
      }
    }

    // Step 6: Create the auto-login token
    const autoLoginToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const createdToken = await prisma.autoLoginToken.create({
      data: {
        token: autoLoginToken,
        userId: user.id,
        email: metadata.customer_email,
        sessionId: sessionId,
        expiresAt: tokenExpiry,
        metadata: {
          orderId: order?.id || null,
          sessionId: sessionId,
          source: 'fallback_creation',
          businessName: metadata.business_name || user.salonName,
          createdViaFallback: true,
          originalWebhookMissed: true
        }
      }
    });

    console.log('🔐 Fallback auto-login token created successfully:', {
      tokenId: createdToken.id,
      sessionId: sessionId,
      userId: user.id,
      email: metadata.customer_email,
      source: 'fallback'
    });

    // Step 7: Log this incident for monitoring
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Acceso recuperado automáticamente',
          message: 'Tu acceso fue configurado usando nuestro sistema de recuperación automática.',
          type: 'SYSTEM',
          priority: 'MEDIUM',
          metadata: {
            sessionId,
            fallbackUsed: true,
            reason: 'webhook_delay_or_failure'
          }
        }
      });
    } catch (notificationError) {
      console.error('⚠️ Failed to create notification:', notificationError);
      // Don't fail the whole process for this
    }

    return NextResponse.json({
      success: true,
      token: autoLoginToken,
      source: 'fallback_created',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error: any) {
    console.error('❌ Error in fallback token creation:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create fallback token',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/auto-login/fallback?session_id=xxx
 * Check if fallback token creation is needed/possible
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

    // Check if we can create a fallback token
    let stripeSession;
    try {
      stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (stripeError) {
      return NextResponse.json({
        success: false,
        canCreateFallback: false,
        reason: 'invalid_session'
      });
    }

    const canCreate = stripeSession.payment_status === 'paid' &&
                     stripeSession.metadata?.customer_email;

    return NextResponse.json({
      success: true,
      canCreateFallback: canCreate,
      sessionStatus: stripeSession.payment_status,
      hasMetadata: !!stripeSession.metadata?.customer_email
    });

  } catch (error) {
    console.error('❌ Error checking fallback possibility:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}