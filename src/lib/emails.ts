import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "PeluqueríasPRO <noreply@peluqueriaspro.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Plantilla de email de verificación
const verificationEmailTemplate = (name: string, verificationUrl: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifica tu cuenta - PeluqueríasPRO</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">¡Bienvenido a PeluqueríasPRO!</h1>
    </div>

    <div style="background: white; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; margin-bottom: 20px;">¡Hola ${name}!</p>

        <p style="margin-bottom: 20px;">
            ¡Gracias por unirte a PeluqueríasPRO! Estás a solo un paso de transformar tu negocio con nuestra plataforma de sitios web profesionales para peluquerías.
        </p>

        <p style="margin-bottom: 30px;">
            Para completar tu registro y activar tu cuenta, por favor verifica tu dirección de email haciendo clic en el botón de abajo:
        </p>

        <div style="text-align: center; margin: 40px 0;">
            <a href="${verificationUrl}"
               style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                      color: white;
                      padding: 15px 30px;
                      text-decoration: none;
                      border-radius: 8px;
                      font-weight: bold;
                      font-size: 16px;
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                Verificar mi email
            </a>
        </div>

        <p style="margin-bottom: 20px;">
            Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
        </p>

        <p style="word-break: break-all; background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace; color: #666;">
            ${verificationUrl}
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
            <h3 style="color: #ea580c; margin-bottom: 15px;">¿Qué viene después?</h3>
            <ul style="margin-bottom: 20px;">
                <li>Acceso a tu panel de cliente personalizado</li>
                <li>Gestión completa de tu sitio web</li>
                <li>Soporte técnico especializado</li>
                <li>Herramientas de marketing digital</li>
            </ul>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #666;">
            Si no has creado una cuenta con nosotros, puedes ignorar este email.
        </p>

        <p style="margin-top: 20px; font-size: 14px; color: #666;">
            ¿Tienes preguntas? Contáctanos en soporte@peluqueriaspro.com
        </p>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
            <p style="color: #666; font-size: 12px; margin: 0;">
                © 2024 PeluqueríasPRO. Todos los derechos reservados.
            </p>
        </div>
    </div>
</body>
</html>
`;

// Plantilla de email de restablecimiento de contraseña
const resetPasswordTemplate = (name: string, resetUrl: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablecer contraseña - PeluqueríasPRO</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Restablecer Contraseña</h1>
    </div>

    <div style="background: white; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; margin-bottom: 20px;">Hola ${name},</p>

        <p style="margin-bottom: 20px;">
            Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en PeluqueríasPRO.
        </p>

        <p style="margin-bottom: 30px;">
            Si has solicitado este cambio, haz clic en el botón de abajo para crear una nueva contraseña:
        </p>

        <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}"
               style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                      color: white;
                      padding: 15px 30px;
                      text-decoration: none;
                      border-radius: 8px;
                      font-weight: bold;
                      font-size: 16px;
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                Restablecer Contraseña
            </a>
        </div>

        <p style="margin-bottom: 20px;">
            Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
        </p>

        <p style="word-break: break-all; background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace; color: #666;">
            ${resetUrl}
        </p>

        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;">
                <strong>Importante:</strong> Este enlace expirará en 1 hora por razones de seguridad.
            </p>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #666;">
            Si no has solicitado este cambio, puedes ignorar este email. Tu contraseña no será modificada.
        </p>

        <p style="margin-top: 20px; font-size: 14px; color: #666;">
            Por seguridad, te recomendamos no compartir este enlace con nadie.
        </p>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
            <p style="color: #666; font-size: 12px; margin: 0;">
                © 2024 PeluqueríasPRO. Todos los derechos reservados.
            </p>
        </div>
    </div>
</body>
</html>
`;

// Generar token de verificación
export async function generateVerificationToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

  // Limpiar tokens anteriores
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  // Crear nuevo token
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return token;
}

// Enviar email de verificación
export async function sendVerificationEmail(email: string, name: string): Promise<boolean> {
  try {
    const token = await generateVerificationToken(email);
    const verificationUrl = `${APP_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: "Verifica tu cuenta en PeluqueríasPRO",
      html: verificationEmailTemplate(name, verificationUrl),
    });

    if (error) {
      console.error("Error enviando email de verificación:", error);
      return false;
    }

    console.log("Email de verificación enviado:", data);
    return true;
  } catch (error) {
    console.error("Error en sendVerificationEmail:", error);
    return false;
  }
}

// Generar token de restablecimiento de contraseña
export async function generateResetPasswordToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  // Limpiar tokens anteriores
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: email,
      token: { startsWith: 'reset_' }
    },
  });

  // Crear nuevo token (prefijo para identificar que es de reset)
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: `reset_${token}`,
      expires,
    },
  });

  return token;
}

// Enviar email de restablecimiento de contraseña
export async function sendResetPasswordEmail(email: string, name: string): Promise<boolean> {
  try {
    const token = await generateResetPasswordToken(email);
    const resetUrl = `${APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: "Restablecer contraseña - PeluqueríasPRO",
      html: resetPasswordTemplate(name, resetUrl),
    });

    if (error) {
      console.error("Error enviando email de reset:", error);
      return false;
    }

    console.log("Email de reset enviado:", data);
    return true;
  } catch (error) {
    console.error("Error en sendResetPasswordEmail:", error);
    return false;
  }
}

// Verificar token
export async function verifyToken(email: string, token: string, type: 'verification' | 'reset' = 'verification'): Promise<boolean> {
  try {
    const tokenToFind = type === 'reset' ? `reset_${token}` : token;

    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: tokenToFind,
        expires: { gt: new Date() },
      },
    });

    if (!verificationToken) {
      return false;
    }

    // Si es verificación de email, marcar como verificado
    if (type === 'verification') {
      await prisma.user.update({
        where: { email },
        data: { emailVerified: new Date() },
      });
    }

    // Limpiar el token usado
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token: tokenToFind,
        },
      },
    });

    return true;
  } catch (error) {
    console.error("Error verificando token:", error);
    return false;
  }
}

// Reenviar email de verificación
export async function resendVerificationEmail(email: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { name: true, emailVerified: true },
    });

    if (!user) {
      return false;
    }

    if (user.emailVerified) {
      return false; // Ya verificado
    }

    return await sendVerificationEmail(email, user.name || "Usuario");
  } catch (error) {
    console.error("Error reenviando email de verificación:", error);
    return false;
  }
}