const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@peluquerias.com' },
    update: {},
    create: {
      email: 'admin@peluquerias.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      hasCompletedOnboarding: true,
    }
  })

  console.log('✅ Admin user created:', admin.email)

  // Create some sample templates
  const templates = [
    {
      name: 'Elegance Salon',
      description: 'Plantilla elegante para salones de belleza premium',
      price: 299,
      category: 'PREMIUM',
      features: ['Diseño responsive', 'Galería de trabajos', 'Sistema de citas', 'Redes sociales'],
      preview: '/templates/elegance-salon-preview.jpg',
      active: true
    },
    {
      name: 'Modern Cut',
      description: 'Diseño moderno y minimalista para barberías',
      price: 199,
      category: 'STANDARD',
      features: ['Diseño responsive', 'Sistema de citas', 'Galería', 'Contacto'],
      preview: '/templates/modern-cut-preview.jpg',
      active: true
    },
    {
      name: 'Beauty Studio',
      description: 'Plantilla versátil para estudios de belleza',
      price: 249,
      category: 'STANDARD',
      features: ['Diseño responsive', 'Galería de trabajos', 'Servicios', 'Contacto'],
      preview: '/templates/beauty-studio-preview.jpg',
      active: true
    }
  ]

  for (const template of templates) {
    const createdTemplate = await prisma.template.upsert({
      where: { name: template.name },
      update: {},
      create: template
    })
    console.log(`✅ Template created: ${createdTemplate.name}`)
  }

  // Create domain pricing
  const domainPricing = [
    { extension: '.com', basePrice: 12, discount: 0, isPopular: true, isAvailable: true, sortOrder: 1 },
    { extension: '.es', basePrice: 8, discount: 0, isPopular: true, isAvailable: true, sortOrder: 2 },
    { extension: '.org', basePrice: 14, discount: 0, isPopular: false, isAvailable: true, sortOrder: 3 },
    { extension: '.net', basePrice: 15, discount: 0, isPopular: false, isAvailable: true, sortOrder: 4 },
    { extension: '.info', basePrice: 18, discount: 0, isPopular: false, isAvailable: true, sortOrder: 5 }
  ]

  for (const pricing of domainPricing) {
    const createdPricing = await prisma.domainPricing.upsert({
      where: { extension: pricing.extension },
      update: {},
      create: pricing
    })
    console.log(`✅ Domain pricing created: ${createdPricing.extension}`)
  }

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })