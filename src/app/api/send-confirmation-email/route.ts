import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendOrderConfirmationEmail, retryEmailSend, validateEmailConfiguration } from '@/lib/resend';

// Schema for validating the request body
const sendEmailSchema = z.object({
  salonName: z.string().min(1, 'Salon name is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
  email: z.string().email('Valid email is required'),
  domainName: z.string().min(1, 'Domain name is required'),
  selectedTemplate: z.string().min(1, 'Template is required'),
  amount: z.number().positive('Amount must be positive'),
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
  setupFee: z.number().nonnegative('Setup fee must be non-negative'),
  migrationFee: z.number().optional(),
  monthlyFee: z.number().optional(),
  hasMigration: z.boolean().optional(),
  orderDate: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    // Validate email configuration first
    const configValidation = await validateEmailConfiguration();
    if (!configValidation.isValid) {
      console.error('Email configuration errors:', configValidation.errors);

      // In development, we might want to continue anyway
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          {
            error: 'Email service not configured',
            details: configValidation.errors
          },
          { status: 503 }
        );
      }
    }

    // Parse and validate request body
    const body = await request.json();
    console.log('Sending confirmation email for:', body.salonName);

    const validatedData = sendEmailSchema.parse(body);

    // Send email with retry logic
    const result = await retryEmailSend(
      sendOrderConfirmationEmail,
      validatedData,
      3, // max retries
      1000 // initial delay in ms
    );

    if (result.success) {
      console.log('Confirmation email sent successfully to:', validatedData.email);

      return NextResponse.json({
        success: true,
        message: 'Email de confirmación enviado correctamente',
        emailId: result.data?.id || result.data?.data?.id
      });
    } else {
      console.error('Failed to send confirmation email:', result.error);

      // Return success in development even if email fails
      // This prevents blocking the checkout flow during development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Development mode: Returning success despite email failure');
        return NextResponse.json({
          success: true,
          message: 'Email simulado en desarrollo',
          warning: 'Email not actually sent in development mode',
          error: result.error
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Error enviando email de confirmación',
          details: result.error
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in send-confirmation-email endpoint:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    // In development, return success to not block the flow
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        success: true,
        message: 'Email simulado en desarrollo',
        warning: 'Development mode - email not sent'
      });
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'No se pudo procesar la solicitud'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing email configuration
export async function GET() {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    const validation = await validateEmailConfiguration();

    return NextResponse.json({
      configured: validation.isValid,
      errors: validation.errors,
      environment: {
        hasApiKey: !!process.env.RESEND_API_KEY,
        hasFromEmail: !!process.env.RESEND_FROM_EMAIL,
        fromEmail: process.env.RESEND_FROM_EMAIL || 'Not configured',
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error('Error checking email configuration:', error);
    return NextResponse.json(
      { error: 'Failed to check email configuration' },
      { status: 500 }
    );
  }
}