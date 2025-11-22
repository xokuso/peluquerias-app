import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/auth-schemas";
import { sendVerificationEmail } from "@/lib/emails";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos de entrada
    const data = signupSchema.parse(body);

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este email" },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await hash(data.password, 12);

    // Crear usuario en la base de datos
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        salonName: data.salonName || null,
        phone: data.phone || null,
        city: data.city || null,
        address: data.address || null,
        website: data.website || null,
        businessType: data.businessType,
        hasCompletedOnboarding: false,
      },
    });

    // Enviar email de verificación
    try {
      await sendVerificationEmail(user.email, user.name || "Usuario");
    } catch (emailError) {
      console.error("Error enviando email de verificación:", emailError);
      // No fallar el registro si el email no se puede enviar
    }

    // Respuesta exitosa (no incluir datos sensibles)
    return NextResponse.json({
      message: "Usuario creado exitosamente",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        salonName: user.salonName,
      },
    });

  } catch (error) {
    console.error("Error en registro:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}