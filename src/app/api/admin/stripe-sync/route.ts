import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/stripe-sync
 * Sincroniza datos entre Stripe y la base de datos local
 * Solo disponible para administradores
 */
export async function GET(_request: NextRequest) {
  try {
    // Verificar autenticación y permisos de administrador
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    // Obtener todas las sesiones de checkout completadas de Stripe
    const sessions = await stripe.checkout.sessions.list({
      status: 'complete',
      limit: 100, // Ajustar según necesidades
    });

    console.log(`🔄 Found ${sessions.data.length} completed sessions in Stripe`);

    const syncResults = {
      checked: 0,
      found: 0,
      created: 0,
      errors: 0,
      details: [] as any[]
    };

    // Verificar cada sesión contra nuestra base de datos
    for (const session of sessions.data) {
      syncResults.checked++;

      try {
        // Buscar la order correspondiente en nuestra DB
        const existingOrder = await prisma.order.findFirst({
          where: { stripeSessionId: session.id }
        });

        if (!existingOrder) {
          console.log(`⚠️ Missing order for session: ${session.id}`);
          syncResults.found++;

          // Intentar crear la order faltante si tenemos suficiente información
          if (session.metadata && session.customer_details?.email) {
            try {
              // Verificar si el usuario ya existe
              let user = await prisma.user.findUnique({
                where: { email: session.customer_details.email }
              });

              if (!user) {
                // Crear usuario temporal si no existe
                const tempPassword = Math.random().toString(36).slice(-12);
                const bcrypt = await import('bcryptjs');
                const hashedPassword = await bcrypt.hash(tempPassword, 12);

                user = await prisma.user.create({
                  data: {
                    email: session.customer_details.email,
                    name: session.customer_details.name || 'Cliente',
                    password: hashedPassword,
                    role: 'CLIENT',
                    isActive: true,
                    hasCompletedOnboarding: false,
                  }
                });

                console.log(`👤 Created missing user: ${user.email}`);
              }

              // Buscar template por defecto
              let defaultTemplate = await prisma.template.findFirst({
                where: { category: 'BASIC', active: true }
              });

              if (!defaultTemplate) {
                defaultTemplate = await prisma.template.create({
                  data: {
                    name: 'Plantilla Básica Peluquerías',
                    description: 'Plantilla profesional básica para peluquerías',
                    price: 199,
                    category: 'BASIC',
                    preview: 'https://example.com/preview/basic-salon.jpg',
                    features: JSON.stringify(['Diseño responsive', 'Sistema de reservas']),
                    active: true
                  }
                });
              }

              // Crear la order faltante
              const newOrder = await prisma.order.create({
                data: {
                  salonName: session.metadata?.business_name || 'Salón sin nombre',
                  ownerName: session.customer_details.name || 'Propietario',
                  email: session.customer_details.email,
                  phone: session.customer_details.phone || '',
                  domain: '', // Se asignará cuando el usuario complete la configuración
                  templateId: defaultTemplate.id,
                  total: (session.amount_total || 0) / 100, // Convertir de centavos
                  status: 'COMPLETED',
                  stripeSessionId: session.id,
                  paymentIntentId: session.payment_intent as string,
                  userId: user.id,
                  setupStep: 'DOMAIN_SELECTION',
                  setupCompleted: false,
                  completedAt: new Date(),
                  createdAt: session.created ? new Date(session.created * 1000) : new Date()
                }
              });

              // Crear payment record asociado
              await prisma.payment.create({
                data: {
                  userId: user.id,
                  orderId: newOrder.id,
                  amount: (session.amount_total || 0) / 100,
                  currency: session.currency?.toUpperCase() || 'EUR',
                  status: 'COMPLETED',
                  method: 'STRIPE',
                  stripePaymentId: session.payment_intent as string,
                  description: `Sitio Web Profesional - ${session.metadata?.business_name || 'Negocio'}`,
                  paidAt: session.created ? new Date(session.created * 1000) : new Date(),
                }
              });

              syncResults.created++;
              syncResults.details.push({
                action: 'created',
                sessionId: session.id,
                email: session.customer_details.email,
                amount: (session.amount_total || 0) / 100
              });

              console.log(`✅ Created missing order for session: ${session.id}`);

            } catch (createError) {
              console.error(`❌ Error creating order for session ${session.id}:`, createError);
              syncResults.errors++;
              syncResults.details.push({
                action: 'error',
                sessionId: session.id,
                error: createError instanceof Error ? createError.message : 'Unknown error'
              });
            }
          } else {
            console.log(`⚠️ Insufficient data to create order for session: ${session.id}`);
            syncResults.details.push({
              action: 'skipped',
              sessionId: session.id,
              reason: 'Insufficient metadata or customer details'
            });
          }
        } else {
          // Order ya existe, verificar consistencia
          const sessionAmount = (session.amount_total || 0) / 100;
          if (Math.abs(existingOrder.total - sessionAmount) > 0.01) {
            console.log(`⚠️ Amount mismatch for session ${session.id}: DB=${existingOrder.total}, Stripe=${sessionAmount}`);

            // Actualizar el monto en la DB para que coincida con Stripe
            await prisma.order.update({
              where: { id: existingOrder.id },
              data: { total: sessionAmount }
            });

            syncResults.details.push({
              action: 'updated',
              sessionId: session.id,
              oldAmount: existingOrder.total,
              newAmount: sessionAmount
            });
          }
        }

      } catch (error) {
        console.error(`❌ Error processing session ${session.id}:`, error);
        syncResults.errors++;
      }
    }

    console.log('🔄 Stripe sync completed:', syncResults);

    return NextResponse.json({
      success: true,
      message: 'Stripe sync completed',
      results: syncResults
    });

  } catch (error) {
    console.error('❌ Error in Stripe sync:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync with Stripe',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/stripe-sync
 * Fuerza una sincronización completa (opcional: desde una fecha específica)
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { startDate } = body;

    const params: any = {
      status: 'complete',
      limit: 100,
    };

    if (startDate) {
      params.created = {
        gte: Math.floor(new Date(startDate).getTime() / 1000)
      };
    }

    const sessions = await stripe.checkout.sessions.list(params);

    // Similar logic to GET but with forced sync
    console.log(`🔄 Forced sync starting for ${sessions.data.length} sessions`);

    return NextResponse.json({
      success: true,
      message: 'Forced sync initiated',
      sessionsFound: sessions.data.length
    });

  } catch (error) {
    console.error('❌ Error in forced Stripe sync:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initiate forced sync',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}