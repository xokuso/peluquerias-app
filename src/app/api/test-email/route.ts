import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, validateEmailConfiguration } from '@/lib/resend';

// Only allow in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

export async function GET() {
  if (!isDevelopment) {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    // Validate configuration
    const validation = await validateEmailConfiguration();

    return NextResponse.json({
      status: 'Email configuration test',
      environment: process.env.NODE_ENV,
      configuration: {
        isValid: validation.isValid,
        errors: validation.errors,
        hasApiKey: !!process.env.RESEND_API_KEY,
        apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 7) + '...',
        fromEmail: process.env.RESEND_FROM_EMAIL || 'Not configured',
        adminEmail: process.env.ADMIN_EMAIL || 'admin@peluqueriaspro.com'
      },
      testEndpoint: '/api/test-email',
      instructions: 'Use POST request with test data to send a test email'
    });
  } catch (error) {
    console.error('Error testing email configuration:', error);
    return NextResponse.json(
      {
        error: 'Failed to test email configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isDevelopment) {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    // Get test email from query params or use default
    const { searchParams } = new URL(request.url);
    const testEmail = searchParams.get('email') || 'test@example.com';

    // Test data
    const testData = {
      salonName: 'Peluquería Test',
      ownerName: 'Juan Pérez',
      email: testEmail,
      domainName: 'peluqueria-test.com',
      selectedTemplate: 'Plantilla Elegante',
      amount: 264,
      paymentIntentId: 'pi_test_' + Date.now(),
      setupFee: 199,
      migrationFee: 65,
      monthlyFee: 49,
      hasMigration: true,
      orderDate: new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    console.log('Sending test email to:', testEmail);

    // Send test email
    const result = await sendOrderConfirmationEmail(testData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${testEmail}`,
        emailId: result.data?.data?.id,
        testData: testData
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to send test email',
        error: result.error,
        testData: testData,
        configuration: {
          hasApiKey: !!process.env.RESEND_API_KEY,
          fromEmail: process.env.RESEND_FROM_EMAIL
        }
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      {
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE method to clear test data (if needed)
export async function DELETE() {
  if (!isDevelopment) {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  // Here you could clear any test data from queue or logs
  return NextResponse.json({
    message: 'Test data cleared',
    timestamp: new Date().toISOString()
  });
}