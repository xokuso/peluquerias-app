import { z } from "zod";
import { BusinessType } from "@prisma/client";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Por favor introduce un email válido")
    .min(1, "El email es obligatorio"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .min(1, "La contraseña es obligatoria"),
});

export const signupSchema = z.object({
  // Datos personales
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede tener más de 50 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "El nombre solo puede contener letras y espacios"),
  email: z
    .string()
    .email("Por favor introduce un email válido")
    .min(1, "El email es obligatorio"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
    ),
  confirmPassword: z.string().min(1, "Confirma tu contraseña"),

  // Datos del negocio
  salonName: z
    .string()
    .min(2, "El nombre del salón debe tener al menos 2 caracteres")
    .max(100, "El nombre del salón no puede tener más de 100 caracteres")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(
      /^[\+]?[0-9\s\-\(\)]{9,15}$/,
      "Por favor introduce un teléfono válido"
    )
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .min(2, "La ciudad debe tener al menos 2 caracteres")
    .max(100, "La ciudad no puede tener más de 100 caracteres")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(200, "La dirección no puede tener más de 200 caracteres")
    .optional(),
  website: z
    .string()
    .url("Por favor introduce una URL válida")
    .optional()
    .or(z.literal("")),
  businessType: z.nativeEnum(BusinessType)
    .refine((val) => Object.values(BusinessType).includes(val), {
      message: "Por favor selecciona un tipo de negocio válido",
    }),

  // Aceptación de términos
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: "Debes aceptar los términos y condiciones",
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Por favor introduce un email válido")
    .min(1, "El email es obligatorio"),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
    ),
  confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  token: z.string().min(1, "Token inválido"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede tener más de 50 caracteres")
    .optional(),
  salonName: z
    .string()
    .min(2, "El nombre del salón debe tener al menos 2 caracteres")
    .max(100, "El nombre del salón no puede tener más de 100 caracteres")
    .optional(),
  phone: z
    .string()
    .regex(
      /^[\+]?[0-9\s\-\(\)]{9,15}$/,
      "Por favor introduce un teléfono válido"
    )
    .optional(),
  city: z
    .string()
    .min(2, "La ciudad debe tener al menos 2 caracteres")
    .max(100, "La ciudad no puede tener más de 100 caracteres")
    .optional(),
  address: z
    .string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(200, "La dirección no puede tener más de 200 caracteres")
    .optional(),
  website: z
    .string()
    .url("Por favor introduce una URL válida")
    .optional()
    .or(z.literal("")),
  businessType: z.nativeEnum(BusinessType).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Constantes para tipos de negocio
export const businessTypeOptions = [
  { value: BusinessType.SALON, label: "Salón de peluquería" },
  { value: BusinessType.BARBERSHOP, label: "Barbería" },
  { value: BusinessType.PERSONAL, label: "Persona física" },
] as const;