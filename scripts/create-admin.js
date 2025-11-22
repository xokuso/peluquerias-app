const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔐 Creando usuario administrador...');

    // Verificar si ya existe un admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('✅ Ya existe un usuario administrador:');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Nombre:', existingAdmin.name);
      console.log('🆔 ID:', existingAdmin.id);
      return {
        email: existingAdmin.email,
        password: 'La contraseña existente (no se puede mostrar por seguridad)'
      };
    }

    // Crear nuevo admin
    const adminEmail = 'admin@peluqueriaspro.com';
    const adminPassword = 'AdminPeluquerias2024!';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const adminUser = await prisma.user.create({
      data: {
        name: 'Administrador Sistema',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        hasCompletedOnboarding: true,
        salonName: 'Panel de Administración',
        isActive: true,
        subscriptionStatus: 'ACTIVE',
        emailVerified: new Date(),
      }
    });

    console.log('✅ Usuario administrador creado exitosamente!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Contraseña:', adminPassword);
    console.log('🆔 ID:', adminUser.id);
    console.log('');
    console.log('🌐 Puedes acceder en: http://localhost:3000/login');
    console.log('');
    console.log('⚠️  IMPORTANTE: Guarda esta contraseña en un lugar seguro!');

    return {
      email: adminEmail,
      password: adminPassword
    };

  } catch (error) {
    console.error('❌ Error creando admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar script
createAdminUser()
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });