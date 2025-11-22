import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

// Inicializar Stripe con clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover"
});

// Schema de validación para crear Payment Intent
const createPaymentIntentSchema = z.object({
  amount: z.number().min(1, "El monto debe ser mayor a 0"),
  currency: z.string().default("eur"),
  automatic_payment_methods: z.object({
    enabled: z.boolean().default(true)
  }).optional(),
  metadata: z.object({
    salonName: z.string().optional(),
    ownerName: z.string().optional(),
    email: z.string().email().optional(),
    selectedTemplate: z.string().optional(),
    domainName: z.string().optional(),
    hasMigration: z.boolean().optional(),
    setupFee: z.number().optional(),
    migrationFee: z.number().optional(),
    totalAmount: z.number().optional(),
  }).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Creating payment intent with body:", body);

    // Validar datos de entrada
    const validatedData = createPaymentIntentSchema.parse(body);
    const { amount, currency, metadata } = validatedData;

    // Crear Payment Intent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir a centavos
      currency: currency || "eur",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        // Información del checkout para registro
        salonName: metadata?.salonName || "",
        ownerName: metadata?.ownerName || "",
        email: metadata?.email || "",
        selectedTemplate: metadata?.selectedTemplate || "",
        domainName: metadata?.domainName || "",
        hasMigration: metadata?.hasMigration ? "true" : "false",
        setupFee: metadata?.setupFee?.toString() || "0",
        migrationFee: metadata?.migrationFee?.toString() || "0",
        totalAmount: metadata?.totalAmount?.toString() || "0",
        // Timestamp para tracking
        createdAt: new Date().toISOString(),
        source: "peluquerias-checkout",
      }
    });

    console.log("Payment intent created:", paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Devolver en euros
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    });

  } catch (error) {
    console.error("Error creating payment intent:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Datos de entrada inválidos",
          details: error.issues
        },
        { status: 400 }
      );
    }

    if (error instanceof Stripe.errors.StripeError) {
      console.error("Stripe error:", error.message);
      return NextResponse.json(
        {
          error: "Error procesando el pago",
          message: error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Error interno del servidor"
      },
      { status: 500 }
    );
  }
}

// GET endpoint para recuperar Payment Intent existente
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get("payment_intent_id");

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "payment_intent_id es requerido" },
        { status: 400 }
      );
    }

    // Recuperar Payment Intent de Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return NextResponse.json({
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      metadata: paymentIntent.metadata,
    });

  } catch (error) {
    console.error("Error retrieving payment intent:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: "Payment Intent no encontrado",
          message: error.message
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: "Error interno del servidor"
      },
      { status: 500 }
    );
  }
}

// PUT endpoint para actualizar Payment Intent (útil si el usuario cambia opciones)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, amount, metadata } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "paymentIntentId es requerido" },
        { status: 400 }
      );
    }

    const updateData: Stripe.PaymentIntentUpdateParams = {};

    // Actualizar amount si se proporciona
    if (amount) {
      updateData.amount = Math.round(amount * 100);
    }

    // Actualizar metadata si se proporciona
    if (metadata) {
      updateData.metadata = {
        ...metadata,
        updatedAt: new Date().toISOString(),
      };
    }

    const updatedPaymentIntent = await stripe.paymentIntents.update(
      paymentIntentId,
      updateData
    );

    return NextResponse.json({
      paymentIntentId: updatedPaymentIntent.id,
      clientSecret: updatedPaymentIntent.client_secret,
      amount: updatedPaymentIntent.amount / 100,
      currency: updatedPaymentIntent.currency,
      status: updatedPaymentIntent.status,
      metadata: updatedPaymentIntent.metadata,
    });

  } catch (error) {
    console.error("Error updating payment intent:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: "Error actualizando Payment Intent",
          message: error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Error interno del servidor"
      },
      { status: 500 }
    );
  }
}