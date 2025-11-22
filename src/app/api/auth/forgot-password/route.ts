import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/auth-schemas";
import { sendResetPasswordEmail } from "@/lib/emails";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos de entrada
    const data = forgotPasswordSchema.parse(body);

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, name: true, email: true },
    });

    // Por seguridad, siempre devolvemos éxito, incluso si el usuario no existe
    if (user) {
      try {
        await sendResetPasswordEmail(user.email, user.name || "Usuario");
        console.log(`Email de reset enviado a: ${user.email}`);
      } catch (emailError) {
        console.error("Error enviando email de reset:", emailError);
        // No fallar la operación si el email no se puede enviar
        return NextResponse.json(
          { error: "Error enviando el email. Por favor intenta de nuevo." },
          { status: 500 }
        );
      }
    }

    // Siempre devolver éxito por seguridad
    return NextResponse.json({
      message: "Si existe una cuenta con ese email, recibirás un enlace de restablecimiento",
    });

  } catch (error) {
    console.error("Error en forgot password:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Email inválido", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}