import { z } from "zod";

// PASO 1: Datos del Negocio
export const businessDataSchema = z.object({
  // Información básica del negocio
  salonName: z.string().min(1, "El nombre de la peluquería es obligatorio").min(2, "El nombre debe tener al menos 2 caracteres"),
  ownerName: z.string().min(1, "El nombre del propietario es obligatorio").min(2, "El nombre debe tener al menos 2 caracteres"),
  phone: z.string().min(1, "El teléfono es obligatorio").regex(/^[+]?[0-9\s\-()]+$/, "Formato de teléfono inválido"),
  email: z.string().min(1, "El email es obligatorio").email("Formato de email inválido"),

  // Dirección completa
  address: z.string().min(1, "La dirección es obligatoria").min(5, "La dirección debe ser más específica"),
  city: z.string().min(1, "La ciudad es obligatoria").min(2, "La ciudad debe tener al menos 2 caracteres"),
  postalCode: z.string().min(1, "El código postal es obligatorio").regex(/^\d{5}$/, "El código postal debe tener 5 dígitos"),

  // CIF/NIF opcional
  cifNif: z.string().optional(),
});

// PASO 2: Configuración Web
export const webConfigSchema = z.object({
  // Plantilla seleccionada (viene pre-filled desde URL param)
  selectedTemplate: z.string().min(1, "Debe seleccionar una plantilla"),

  // Dominio deseado
  domainName: z.string().min(1, "El nombre de dominio es obligatorio").regex(/^[a-zA-Z0-9-]+$/, "El dominio solo puede contener letras, números y guiones"),
  domainExtension: z.enum([".es", ".com"], {
    message: "Debe seleccionar .es o .com"
  }),

  // Dominio existente
  hasExistingDomain: z.boolean(),
  wantsMigration: z.boolean().optional(),
  existingDomainName: z.string().optional(),

  // Servicios principales (checkboxes)
  services: z.object({
    haircuts: z.boolean(),
    styling: z.boolean(),
    coloring: z.boolean(),
    treatments: z.boolean(),
    manicurePedicure: z.boolean(),
    others: z.boolean(),
  }),

  // Campo de texto para "otros" servicios
  otherServices: z.string().optional(),
}).refine((data) => {
  // Si marca "tiene dominio existente" y "quiere migración", debe especificar el dominio
  if (data.hasExistingDomain && data.wantsMigration) {
    return data.existingDomainName && data.existingDomainName.trim().length > 0;
  }
  return true;
}, {
  message: "Debe especificar el dominio existente si quiere migrarlo",
  path: ["existingDomainName"]
}).refine((data) => {
  // Si marca "otros" servicios, debe especificar cuáles
  if (data.services.others) {
    return data.otherServices && data.otherServices.trim().length > 0;
  }
  return true;
}, {
  message: "Debe especificar qué otros servicios ofrece",
  path: ["otherServices"]
});

// PASO 3: Resumen y Pago
export const paymentSchema = z.object({
  // Términos y condiciones obligatorios
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Debe aceptar los términos y condiciones"
  }),

  // Info del pago (manejado por Stripe)
  paymentMethodId: z.string().optional(),

  // Resumen de precios calculado
  pricing: z.object({
    setupFee: z.number().default(199),
    monthlyFee: z.number().default(49),
    domainMigration: z.number().default(0), // 65€ si aplica
    domainFirstYear: z.number().default(0), // Incluido
    totalToday: z.number(), // 199 + migración si aplica
  }),
});

// Schema completo del formulario
export const checkoutFormSchema = z.object({
  step1: businessDataSchema,
  step2: webConfigSchema,
  step3: paymentSchema,
});

// Tipos TypeScript derivados de los schemas
export type BusinessData = z.infer<typeof businessDataSchema>;
export type WebConfig = z.infer<typeof webConfigSchema>;
export type PaymentData = z.infer<typeof paymentSchema>;
export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

// Interfaz para el pricing según informe.md
export interface OrderPricing {
  setupFee: number;
  monthlyFee: number;
  domainMigration: number; // Solo si migra dominio existente
  domainFirstYear: number; // Incluido en setup
  totalToday: number; // 199 + 65 si migración
}

// Función helper para calcular pricing
export function calculatePricing(wantsMigration: boolean): OrderPricing {
  const setupFee = 199;
  const migrationFee = wantsMigration ? 65 : 0;

  return {
    setupFee: 199,
    monthlyFee: 49,
    domainMigration: migrationFee,
    domainFirstYear: 0,
    totalToday: setupFee + migrationFee
  };
}

// Estados del formulario multi-paso
export interface CheckoutState {
  currentStep: 1 | 2 | 3;
  businessData: Partial<BusinessData>;
  webConfig: Partial<WebConfig>;
  paymentData: Partial<PaymentData>;
  isValid: {
    step1: boolean;
    step2: boolean;
    step3: boolean;
  };
  errors: {
    step1: Record<string, string>;
    step2: Record<string, string>;
    step3: Record<string, string>;
  };
}