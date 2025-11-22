import { NextRequest, NextResponse } from 'next/server';
import { handleCheckoutCompleted } from '../stripe/webhooks/route';

/**
 * Endpoint de test para simular un checkout completo
 * POST /api/test-checkout
 */
export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    console.log('🧪 TEST: Simulating checkout completion for session:', sessionId);

    // Crear un objeto de sesión simulado que imita la estructura de Stripe
    const mockSession = {
      id: sessionId,
      payment_status: 'paid',
      amount_total: 19900, // €199.00 en centavos
      currency: 'eur',
      customer: 'cus_test_123',
      customer_email: 'test@peluqueria-test.com',
      customer_details: {
        email: 'test@peluqueria-test.com',
        name: 'María José Test'
      },
      created: Math.floor(Date.now() / 1000),
      metadata: {
        customer_email: 'test@peluqueria-test.com',
        customer_name: 'María José Test',
        customer_phone: '+34 600 123 456',
        business_name: 'Peluquería TEST Auto-Login',
        business_type: 'salon',
        product_type: 'website_pro',
        source: 'test_checkout'
      },
      payment_intent: 'pi_test_' + Math.random().toString(36).substr(2, 9)
    };

    console.log('🧪 TEST: Mock session created:', {
      sessionId: mockSession.id,
      customerEmail: mockSession.customer_email,
      businessName: mockSession.metadata.business_name,
      paymentStatus: mockSession.payment_status
    });

    // Llamar directamente a la función de procesamiento de checkout
    await handleCheckoutCompleted(mockSession as any);

    console.log('✅ TEST: Checkout processing completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Test checkout processed successfully',
      sessionId: sessionId,
      mockData: {
        customerEmail: mockSession.customer_email,
        businessName: mockSession.metadata.business_name,
        autoLoginUrl: `/checkout/success/autologin?session_id=${sessionId}`
      }
    });

  } catch (error: any) {
    console.error('❌ TEST: Error in test checkout:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Test checkout failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}