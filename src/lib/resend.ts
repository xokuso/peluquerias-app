import { Resend } from 'resend';
import { render } from '@react-email/render';
import { OrderConfirmationEmail } from '@/emails/templates/OrderConfirmation';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'PeluqueríasPRO <noreply@peluqueriaspro.com>';
const REPLY_TO_EMAIL = 'soporte@peluqueriaspro.com';

// Email types
export interface OrderConfirmationData {
  salonName: string;
  ownerName: string;
  email: string;
  domainName: string;
  selectedTemplate: string;
  amount: number;
  paymentIntentId: string;
  setupFee: number;
  migrationFee?: number | undefined;
  monthlyFee?: number | undefined;
  hasMigration?: boolean | undefined;
  orderDate?: string | undefined;
}

// Send order confirmation email
export async function sendOrderConfirmationEmail(data: OrderConfirmationData): Promise<EmailResult> {
  try {
    // Set default values
    const emailData = {
      ...data,
      migrationFee: data.migrationFee || 0,
      monthlyFee: data.monthlyFee || 49,
      hasMigration: data.hasMigration || false,
      orderDate: data.orderDate || new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    // Render the email HTML
    const emailHtml = await render(OrderConfirmationEmail(emailData));

    // Send the email
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      replyTo: REPLY_TO_EMAIL,
      subject: `Confirmación de pedido #${data.paymentIntentId.slice(-8).toUpperCase()} - PeluqueríasPRO`,
      html: emailHtml,
      tags: [
        { name: 'category', value: 'order_confirmation' },
        { name: 'salon_name', value: data.salonName },
        { name: 'payment_id', value: data.paymentIntentId }
      ]
    });

    // Also send a notification to admin
    await sendAdminNotificationEmail(data);

    return {
      success: true,
      data: response.data?.id ? {
        id: response.data.id,
        data: {
          id: response.data.id
        }
      } : undefined,
      message: 'Email enviado correctamente'
    };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);

    // Log detailed error for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        data: data
      });
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al enviar email',
      message: 'No se pudo enviar el email de confirmación'
    };
  }
}

// Send admin notification email
async function sendAdminNotificationEmail(data: OrderConfirmationData) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@peluqueriaspro.com';

    const adminHtml = `
      <h2>🎉 Nueva venta realizada</h2>

      <h3>Detalles del cliente:</h3>
      <ul>
        <li><strong>Peluquería:</strong> ${data.salonName}</li>
        <li><strong>Propietario:</strong> ${data.ownerName}</li>
        <li><strong>Email:</strong> ${data.email}</li>
        <li><strong>Dominio:</strong> ${data.domainName}</li>
        <li><strong>Plantilla:</strong> ${data.selectedTemplate}</li>
      </ul>

      <h3>Detalles del pago:</h3>
      <ul>
        <li><strong>ID de pago:</strong> ${data.paymentIntentId}</li>
        <li><strong>Total pagado:</strong> ${data.amount}€</li>
        <li><strong>Setup fee:</strong> ${data.setupFee}€</li>
        ${data.hasMigration ? `<li><strong>Migración:</strong> ${data.migrationFee}€</li>` : ''}
        <li><strong>Mensualidad:</strong> ${data.monthlyFee || 49}€/mes</li>
      </ul>

      <h3>Acciones requeridas:</h3>
      <ol>
        <li>Contactar al cliente en las próximas 24-48 horas</li>
        <li>Recopilar información del negocio (logo, fotos, servicios)</li>
        <li>Configurar dominio y hosting</li>
        <li>Desarrollar la web según la plantilla seleccionada</li>
      </ol>

      <p><a href="https://dashboard.stripe.com/payments/${data.paymentIntentId}">Ver pago en Stripe →</a></p>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `💰 Nueva venta: ${data.salonName} - ${data.amount}€`,
      html: adminHtml,
      tags: [
        { name: 'category', value: 'admin_notification' },
        { name: 'type', value: 'new_sale' }
      ]
    });
  } catch (error) {
    // Don't throw error for admin notification failure
    console.error('Failed to send admin notification:', error);
  }
}

// Welcome email data interface
export interface WelcomeEmailData {
  salonName: string;
  ownerName: string;
  email: string;
  domainName: string;
  loginUrl: string;
  adminUrl: string;
}

// Send welcome email after setup is complete
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailResult> {
  try {
    const welcomeHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af; text-align: center;">¡Tu web está lista!</h1>

        <p>Hola ${data.ownerName},</p>

        <p>Nos complace informarte que tu página web profesional para <strong>${data.salonName}</strong> está completamente configurada y funcionando.</p>

        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">Accesos a tu web:</h3>

          <p><strong>Tu web pública:</strong><br>
          <a href="${data.domainName}" style="color: #1e40af;">${data.domainName}</a></p>

          <p><strong>Panel de administración:</strong><br>
          <a href="${data.adminUrl}" style="color: #1e40af;">${data.adminUrl}</a></p>

          <p><strong>Usuario:</strong> ${data.email}<br>
          <strong>Contraseña:</strong> Te la enviamos en un email separado por seguridad</p>
        </div>

        <h3>Primeros pasos:</h3>
        <ol>
          <li>Accede a tu panel de administración</li>
          <li>Personaliza los textos y añade tus fotos</li>
          <li>Configura tus horarios y servicios</li>
          <li>Activa el sistema de reservas online (opcional)</li>
        </ol>

        <p>Si necesitas ayuda, no dudes en contactarnos:</p>
        <ul>
          <li>Email: soporte@peluqueriaspro.com</li>
          <li>WhatsApp: +34 600 00 00 00</li>
        </ul>

        <p style="margin-top: 40px; color: #6b7280; font-size: 14px;">
          Gracias por confiar en PeluqueríasPRO.<br>
          Tu éxito es nuestro éxito.
        </p>
      </div>
    `;

    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      replyTo: REPLY_TO_EMAIL,
      subject: `🎉 ¡Tu web ${data.domainName} está lista!`,
      html: welcomeHtml,
      tags: [
        { name: 'category', value: 'welcome_email' },
        { name: 'salon_name', value: data.salonName }
      ]
    });

    return {
      success: true,
      data: response.data?.id ? {
        id: response.data.id,
        data: {
          id: response.data.id
        }
      } : undefined,
      message: 'Email de bienvenida enviado correctamente'
    };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      message: 'No se pudo enviar el email de bienvenida'
    };
  }
}

// Subscription reminder email data interface
export interface SubscriptionReminderData {
  salonName: string;
  ownerName: string;
  email: string;
  amount: number;
  nextBillingDate: string;
}

// Send monthly subscription reminder
export async function sendSubscriptionReminderEmail(data: SubscriptionReminderData): Promise<EmailResult> {
  try {
    const reminderHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Recordatorio de pago mensual</h2>

        <p>Hola ${data.ownerName},</p>

        <p>Te recordamos que el próximo <strong>${data.nextBillingDate}</strong> se realizará el cargo mensual de <strong>${data.amount}€</strong> correspondiente al mantenimiento de tu página web para ${data.salonName}.</p>

        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Tu suscripción incluye:</h3>
          <ul>
            <li>Hosting y mantenimiento web</li>
            <li>Certificado SSL de seguridad</li>
            <li>Copias de seguridad diarias</li>
            <li>Soporte técnico 24/7</li>
            <li>Actualizaciones de seguridad</li>
          </ul>
        </div>

        <p>Si necesitas actualizar tu método de pago o tienes alguna pregunta, no dudes en contactarnos.</p>

        <p style="margin-top: 40px; color: #6b7280; font-size: 14px;">
          Gracias por seguir confiando en PeluqueríasPRO.
        </p>
      </div>
    `;

    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      replyTo: REPLY_TO_EMAIL,
      subject: `Recordatorio de pago mensual - ${data.salonName}`,
      html: reminderHtml,
      tags: [
        { name: 'category', value: 'subscription_reminder' },
        { name: 'salon_name', value: data.salonName }
      ]
    });

    return {
      success: true,
      data: response.data?.id ? {
        id: response.data.id,
        data: {
          id: response.data.id
        }
      } : undefined,
      message: 'Recordatorio enviado correctamente'
    };
  } catch (error) {
    console.error('Error sending subscription reminder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      message: 'No se pudo enviar el recordatorio'
    };
  }
}

// Email function result type
export interface EmailResult {
  success: boolean;
  error?: string | undefined;
  message?: string | undefined;
  data?: {
    id?: string | undefined;
    data?: {
      id?: string | undefined;
    } | undefined;
  } | undefined;
}

// Generic email function type
export type EmailFunction<T = unknown> = (data: T) => Promise<EmailResult>;

// Retry logic for failed emails with proper typing
export async function retryEmailSend<T = OrderConfirmationData>(
  emailFunction: EmailFunction<T>,
  data: T,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<EmailResult> {
  let lastError: string | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await emailFunction(data);
      if (result.success) {
        return result;
      }
      lastError = result.error;
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error occurred';
    }

    // Wait before retrying (exponential backoff)
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }

  // All retries failed
  return {
    success: false,
    error: lastError || 'Unknown error',
    message: `Failed after ${maxRetries} retries`
  };
}

// Validate email configuration
export async function validateEmailConfiguration(): Promise<{
  isValid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  if (!process.env.RESEND_API_KEY) {
    errors.push('RESEND_API_KEY is not configured');
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    errors.push('RESEND_FROM_EMAIL is not configured');
  }

  // Test Resend connection if API key is present
  if (process.env.RESEND_API_KEY) {
    try {
      // Try to get API key info to validate connection
      const testResend = new Resend(process.env.RESEND_API_KEY);
      // This is a lightweight test that doesn't send an email
      await testResend.domains.list();
    } catch {
      errors.push('Invalid RESEND_API_KEY or connection error');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}