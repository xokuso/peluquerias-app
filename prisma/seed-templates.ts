import { PrismaClient, TemplateCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding templates...");

  const templates = [
    {
      name: "Elegance Pro",
      description: "Plantilla profesional para salones de belleza modernos con diseño elegante y funcionalidades avanzadas",
      price: 299,
      features: [
        "Diseño responsive premium",
        "Sistema de reservas online",
        "Galería de trabajos",
        "Integración con redes sociales",
        "SEO optimizado",
        "Certificado SSL incluido",
      ],
      preview: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
      category: TemplateCategory.PREMIUM,
      active: true,
    },
    {
      name: "Beauty Starter",
      description: "Plantilla básica perfecta para peluquerías que están empezando su presencia online",
      price: 99,
      features: [
        "Diseño responsive",
        "Página de servicios",
        "Formulario de contacto",
        "Mapa de ubicación",
        "Optimización móvil",
      ],
      preview: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800",
      category: TemplateCategory.BASIC,
      active: true,
    },
    {
      name: "Salon Suite Enterprise",
      description: "Solución completa para cadenas de salones con múltiples ubicaciones y gestión avanzada",
      price: 599,
      features: [
        "Multi-ubicación",
        "Sistema de reservas avanzado",
        "Portal de empleados",
        "Gestión de inventario",
        "Programa de fidelización",
        "Analytics dashboard",
        "API personalizada",
        "Soporte prioritario 24/7",
      ],
      preview: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800",
      category: TemplateCategory.ENTERPRISE,
      active: true,
    },
    {
      name: "Barber Shop Classic",
      description: "Diseño clásico y masculino ideal para barberías tradicionales y modernas",
      price: 199,
      features: [
        "Diseño temático barbería",
        "Catálogo de cortes",
        "Sistema de citas",
        "Blog integrado",
        "Galería antes/después",
        "Testimonios de clientes",
      ],
      preview: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800",
      category: TemplateCategory.PREMIUM,
      active: true,
    },
    {
      name: "Minimalist Beauty",
      description: "Plantilla minimalista con diseño limpio y moderno para salones contemporáneos",
      price: 149,
      features: [
        "Diseño minimalista",
        "Animaciones suaves",
        "Paleta de colores personalizable",
        "Galería Instagram",
        "Formulario de newsletter",
      ],
      preview: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
      category: TemplateCategory.BASIC,
      active: true,
    },
    {
      name: "Luxury Spa & Salon",
      description: "Experiencia premium para spas y salones de lujo con funcionalidades exclusivas",
      price: 449,
      features: [
        "Diseño luxury",
        "Reservas con pago online",
        "Catálogo de productos",
        "Gift cards digitales",
        "Membresías VIP",
        "Chat en vivo",
        "Multi-idioma",
      ],
      preview: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800",
      category: TemplateCategory.PREMIUM,
      active: true,
    },
    {
      name: "Express Cut",
      description: "Plantilla rápida y eficiente para peluquerías express y franquicias",
      price: 179,
      features: [
        "Carga ultra-rápida",
        "Reservas rápidas",
        "Lista de precios clara",
        "Localización GPS",
        "Notificaciones push",
      ],
      preview: "https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?w=800",
      category: TemplateCategory.BASIC,
      active: false,
    },
    {
      name: "Colorist Studio",
      description: "Especializada en salones de coloración con galerías de transformaciones",
      price: 259,
      features: [
        "Galería de coloraciones",
        "Simulador de color",
        "Blog de tendencias",
        "Booking especializado",
        "Portfolio de estilistas",
        "Calculadora de precios",
      ],
      preview: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800",
      category: TemplateCategory.PREMIUM,
      active: true,
    },
  ];

  // Check for existing templates and only add new ones
  const existingTemplates = await prisma.template.findMany({
    select: { name: true },
  });
  const existingNames = new Set(existingTemplates.map(t => t.name));

  // Create new templates that don't exist
  let createdCount = 0;
  for (const template of templates) {
    if (!existingNames.has(template.name)) {
      const created = await prisma.template.create({
        data: template,
      });
      console.log(`Created template: ${created.name}`);
      createdCount++;
    } else {
      console.log(`Template already exists: ${template.name}`);
    }
  }

  console.log(`Successfully created ${createdCount} new templates (${existingNames.size} already existed)`);
}

main()
  .catch((e) => {
    console.error("Error seeding templates:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });