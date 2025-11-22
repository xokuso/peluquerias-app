const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email)
      return existingAdmin
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@peluquerias.com',
        password: hashedPassword,
        role: 'ADMIN',
        businessType: 'SALON',
        hasCompletedOnboarding: true,
        isActive: true,
        salonName: 'Panel de Administración',
        city: 'Madrid',
        phone: '+34 600 000 000',
        address: 'Calle Admin 123',
        website: 'https://admin.peluquerias.com'
      }
    })

    console.log('Admin user created successfully:', {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role
    })

    return adminUser

  } catch (error) {
    console.error('Error creating admin user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
  .catch(console.error)