import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@peluquerias.com' }
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists');
    return;
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@peluquerias.com',
      password: hashedPassword,
      role: 'ADMIN',
      hasCompletedOnboarding: true,
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create some sample templates
  const templates = await prisma.template.createMany({
    data: [
      {
        name: 'Elegancia Clásica',
        description: 'Plantilla elegante para salones de belleza premium',
        price: 49.99,
        category: 'BASIC',
        preview: '/templates/elegance-salon-preview.jpg',
        features: JSON.stringify([
          'Diseño responsive',
          'Galería de fotos',
          'Formulario de contacto',
          'Información de servicios'
        ]),
      },
      {
        name: 'Estilo Moderno',
        description: 'Diseño contemporáneo para peluquerías urbanas',
        price: 79.99,
        category: 'PREMIUM',
        preview: '/templates/modern-cut-preview.jpg',
        features: JSON.stringify([
          'Animaciones CSS',
          'Reserva online',
          'Blog integrado',
          'SEO optimizado'
        ]),
      },
    ],
  });

  console.log('✅ Sample templates created');

  console.log('🌱 Database seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });