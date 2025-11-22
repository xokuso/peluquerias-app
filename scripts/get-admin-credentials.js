const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function getAdminCredentials() {
  try {
    console.log('🔍 Obteniendo credenciales de administrador...');

    // Buscar usuario admin existente
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      console.log('❌ No se encontró usuario administrador.');
      return;
    }

    console.log('✅ Usuario administrador encontrado:');
    console.log('');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Nombre:', adminUser.name);
    console.log('🆔 ID:', adminUser.id);
    console.log('🏢 Peluquería:', adminUser.salonName);
    console.log('✅ Estado:', adminUser.isActive ? 'Activo' : 'Inactivo');
    console.log('');

    // Resetear contraseña para asegurar acceso
    const newPassword = 'Admin123!';
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: adminUser.id },
      data: { password: hashedPassword }
    });

    console.log('🔑 Contraseña actualizada exitosamente!');
    console.log('');
    console.log('='.repeat(50));
    console.log('🎯 CREDENCIALES DE ACCESO ADMINISTRADOR');
    console.log('='.repeat(50));
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`🔑 Contraseña: ${newPassword}`);
    console.log('');
    console.log('🌐 Accede en: http://localhost:3000/login');
    console.log('');
    console.log('⚠️  IMPORTANTE: Guarda estas credenciales de forma segura!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error obteniendo credenciales:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar script
getAdminCredentials()
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });