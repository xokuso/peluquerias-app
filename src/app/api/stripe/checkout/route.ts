import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRODUCT_CONFIG, REDIRECT_URLS, DEFAULT_CHECKOUT_CONFIG, CheckoutCustomerData, CheckoutMetadata } from '@/lib/stripe';
import { getSettings } from '@/lib/settings';
import { z } from 'zod';

// ============================
// VALIDACIÓN DE DATOS
// ============================

const checkoutSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().optional(),
  businessName: z.string().min(2, 'El nombre del negocio debe tener al menos 2 caracteres'),
  businessType: z.string().optional(),
  source: z.enum(['pricing_page', 'landing_page', 'other']).default('pricing_page')
});

type CheckoutRequest = z.infer<typeof checkoutSchema>;

// ============================
// ENDPOINT PRINCIPAL
// ============================

export async function POST(req: NextRequest) {
  try {
    // 1. Obtener configuración de precios dinámicos
    const settings = await getSettings();
    const dynamicPrice = settings.templatePricing.offerPrice * 100; // Convertir a centavos

    // 2. Parsear y validar datos del request
    const body: CheckoutRequest = await req.json();

    const validatedData = checkoutSchema.parse(body);

    // 2. Preparar metadatos para la sesión de checkout
    const metadata: Record<string, string> = {
      customer_email: validatedData.email,
      customer_name: validatedData.name,
      customer_phone: validatedData.phone || '',
      business_name: validatedData.businessName,
      business_type: validatedData.businessType || '',
      product_type: 'website_professional',
      created_at: new Date().toISOString(),
      source: validatedData.source
    };

    // 3. Verificar si el cliente ya existe en Stripe
    let customerId: string | undefined;

    try {
      const existingCustomers = await stripe.customers.list({
        email: validatedData.email,
        limit: 1
      });

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0]?.id;
      }
    } catch (error) {
      console.warn('Error checking existing customer:', error);
      // Continuamos sin customer ID si falla la búsqueda
    }

    // 4. Crear sesión de checkout de Stripe
    const sessionConfig: any = {
      mode: 'payment',
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      submit_type: 'pay',
      locale: 'es',
      allow_promotion_codes: false,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutos
      line_items: [
        {
          price_data: {
            currency: PRODUCT_CONFIG.website.currency,
            product_data: {
              name: PRODUCT_CONFIG.website.name,
              description: PRODUCT_CONFIG.website.description,
            },
            unit_amount: dynamicPrice
          },
          quantity: 1
        }
      ],
      success_url: `${REDIRECT_URLS.success}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: REDIRECT_URLS.cancel,
      metadata,
      phone_number_collection: {
        enabled: true
      },
      shipping_address_collection: {
        allowed_countries: ['ES']
      },
      automatic_tax: {
        enabled: false
      }
    };

    // Añadir customer o customer_email según corresponda
    if (customerId) {
      sessionConfig.customer = customerId;
    } else {
      sessionConfig.customer_creation = 'always';
      sessionConfig.customer_email = validatedData.email;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // 5. Log para debugging (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log('🛒 Checkout session created:', {
        sessionId: session.id,
        email: validatedData.email,
        businessName: validatedData.businessName,
        amount: dynamicPrice,
        url: session.url
      });
    }

    // 6. Retornar URL de checkout
    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id
    });

  } catch (error: any) {
    // Manejo de errores detallado
    console.error('❌ Error creating checkout session:', error);

    // Errores de validación
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    // Errores de Stripe
    if (error.type) {
      let errorMessage = 'Error al procesar el pago';
      let statusCode = 500;

      switch (error.type) {
        case 'StripeCardError':
          errorMessage = 'Error con la tarjeta de crédito';
          statusCode = 400;
          break;
        case 'StripeRateLimitError':
          errorMessage = 'Demasiadas solicitudes. Inténtalo de nuevo en unos minutos.';
          statusCode = 429;
          break;
        case 'StripeInvalidRequestError':
          errorMessage = 'Solicitud inválida';
          statusCode = 400;
          break;
        case 'StripeAPIError':
          errorMessage = 'Error interno del servicio de pagos';
          statusCode = 500;
          break;
        case 'StripeConnectionError':
          errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
          statusCode = 503;
          break;
        case 'StripeAuthenticationError':
          errorMessage = 'Error de autenticación del servicio de pagos';
          statusCode = 500;
          break;
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          code: error.code || error.type
        },
        { status: statusCode }
      );
    }

    // Error genérico
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// ============================
// MÉTODO GET PARA TESTING
// ============================

export async function GET() {
  try {
    const settings = await getSettings();
    const dynamicPrice = settings.templatePricing.offerPrice;

    return NextResponse.json({
      message: 'Stripe Checkout API funcionando',
      product: {
        name: PRODUCT_CONFIG.website.name,
        price: dynamicPrice, // Precio dinámico en euros
        currency: PRODUCT_CONFIG.website.currency
      },
      urls: REDIRECT_URLS
    });
  } catch (error) {
    console.error('Error getting settings for GET endpoint:', error);
    // Fallback a precio por defecto si hay error
    return NextResponse.json({
      message: 'Stripe Checkout API funcionando (fallback)',
      product: {
        name: PRODUCT_CONFIG.website.name,
        price: PRODUCT_CONFIG.website.price / 100, // Fallback en euros
        currency: PRODUCT_CONFIG.website.currency
      },
      urls: REDIRECT_URLS
    });
  }
}