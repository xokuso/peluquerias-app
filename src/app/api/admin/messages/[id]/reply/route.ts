import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

// Email configuration
const createTransporter = () => {
  // Use environment variables for email configuration
  const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  };

  return nodemailer.createTransport(emailConfig);
};

// Send reply to a message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Check admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      );
    }

    const messageId = params.id;
    const body = await request.json();
    const { subject, replyContent, cc, bcc } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: 'ID de mensaje requerido' },
        { status: 400 }
      );
    }

    if (!subject || !replyContent) {
      return NextResponse.json(
        { error: 'Asunto y contenido del mensaje son requeridos' },
        { status: 400 }
      );
    }

    // Get the original message
    const message = await prisma.contactMessage.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Mensaje no encontrado' },
        { status: 404 }
      );
    }

    // Check if email configuration is available
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn('Email configuration not found. Simulating email send.');

      // Update message status to REPLIED
      await prisma.contactMessage.update({
        where: { id: messageId },
        data: {
          status: 'REPLIED',
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Respuesta simulada enviada (configuración de email no disponible)',
        simulatedEmail: {
          to: message.email,
          subject,
          content: replyContent,
          cc,
          bcc
        }
      });
    }

    try {
      // Create email transporter
      const transporter = createTransporter();

      // Prepare email HTML content
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #f97316; color: white; padding: 20px; text-align: center; }
              .content { background-color: #ffffff; padding: 30px; border: 1px solid #ddd; }
              .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
              .original-message { background-color: #f5f5f5; padding: 15px; margin-top: 20px; border-left: 3px solid #f97316; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Respuesta a su consulta</h1>
              </div>
              <div class="content">
                <p>Estimado/a ${message.name},</p>

                <div style="margin: 20px 0;">
                  ${replyContent.replace(/\n/g, '<br>')}
                </div>

                <div class="original-message">
                  <p><strong>Su mensaje original:</strong></p>
                  <p><strong>Asunto:</strong> ${message.subject || 'Sin asunto'}</p>
                  <p><strong>Mensaje:</strong><br>${message.message.replace(/\n/g, '<br>')}</p>
                </div>

                <p style="margin-top: 30px;">
                  Saludos cordiales,<br>
                  <strong>${session.user.name || 'Equipo de Soporte'}</strong>
                </p>
              </div>
              <div class="footer">
                <p>Este es un mensaje automático enviado desde el panel de administración.</p>
                <p>Por favor, no responda directamente a este correo.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      // Prepare email options
      const mailOptions: any = {
        from: `"${session.user.name || 'Admin'}" <${process.env.SMTP_USER}>`,
        to: message.email,
        subject: `Re: ${subject}`,
        html: htmlContent,
        text: `${replyContent}\n\n---\nMensaje original:\n${message.message}`
      };

      if (cc) mailOptions.cc = cc;
      if (bcc) mailOptions.bcc = bcc;

      // Send email
      const info = await transporter.sendMail(mailOptions);

      // Update message status to REPLIED
      await prisma.contactMessage.update({
        where: { id: messageId },
        data: {
          status: 'REPLIED',
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Respuesta enviada correctamente',
        messageId: info.messageId
      });

    } catch (emailError) {
      console.error('Error sending email:', emailError);

      // Even if email fails, we might want to update the status
      // but inform the user about the email failure
      return NextResponse.json(
        {
          error: 'Error al enviar el correo electrónico',
          details: emailError instanceof Error ? emailError.message : 'Error desconocido'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error processing reply:', error);
    return NextResponse.json(
      { error: 'Error al procesar la respuesta' },
      { status: 500 }
    );
  }
}