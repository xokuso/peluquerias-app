const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createClientUser() {
  try {
    // Check if client already exists
    const existingClient = await prisma.user.findFirst({
      where: { email: 'cliente@peluquerias.com' }
    })

    if (existingClient) {
      console.log('Client user already exists:', existingClient.email)
      return existingClient
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('cliente123', 12)

    // Create client user
    const clientUser = await prisma.user.create({
      data: {
        name: 'Cliente Test',
        email: 'cliente@peluquerias.com',
        password: hashedPassword,
        role: 'CLIENT',
        businessType: 'SALON',
        hasCompletedOnboarding: false,
        isActive: true,
        salonName: 'Mi Peluquería Test',
        city: 'Barcelona',
        phone: '+34 600 111 222',
        address: 'Calle Cliente 456'
      }
    })

    console.log('Client user created successfully:', {
      id: clientUser.id,
      email: clientUser.email,
      role: clientUser.role
    })

    return clientUser

  } catch (error) {
    console.error('Error creating client user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createClientUser()
  .catch(console.error)