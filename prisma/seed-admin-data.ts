import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdminData() {
  console.log('🌱 Starting admin data seed...');

  try {
    // Create admin user if doesn't exist
    const adminEmail = 'admin@peluquerias.com';
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    let adminUser;
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'Admin User',
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
          hasCompletedOnboarding: true,
          salonName: 'Admin Dashboard',
          businessType: 'SALON'
        }
      });
      console.log('✅ Admin user created:', adminEmail);
    } else {
      adminUser = existingAdmin;
      console.log('ℹ️ Admin user already exists:', adminEmail);
    }

    // Create some test templates if they don't exist
    const templates = [
      {
        name: 'Basic Website',
        description: 'Perfect for small salons starting their digital journey',
        price: 199,
        features: JSON.stringify([
          'Single page website',
          'Contact form',
          'Basic SEO',
          'Mobile responsive',
          '5 service descriptions'
        ]),
        preview: '/templates/basic.png',
        category: 'BASIC' as const,
        active: true
      },
      {
        name: 'Premium Website',
        description: 'Complete solution for established salons',
        price: 298,
        features: JSON.stringify([
          'Multi-page website',
          'Online booking system',
          'Gallery section',
          'Advanced SEO',
          'Social media integration',
          'Unlimited services',
          'Blog section'
        ]),
        preview: '/templates/premium.png',
        category: 'PREMIUM' as const,
        active: true
      },
      {
        name: 'Enterprise Solution',
        description: 'Full-featured platform for salon chains',
        price: 599,
        features: JSON.stringify([
          'Everything in Premium',
          'Multi-location support',
          'Staff management',
          'Custom integrations',
          'Priority support',
          'Analytics dashboard',
          'Custom domain'
        ]),
        preview: '/templates/enterprise.png',
        category: 'ENTERPRISE' as const,
        active: true
      }
    ];

    for (const template of templates) {
      const existing = await prisma.template.findFirst({
        where: { name: template.name }
      });

      if (!existing) {
        await prisma.template.create({ data: template });
        console.log(`✅ Template created: ${template.name}`);
      } else {
        console.log(`ℹ️ Template already exists: ${template.name}`);
      }
    }

    // Create some test users
    const testUsers = [
      {
        email: 'maria@beautysalon.com',
        name: 'Maria García',
        salonName: 'Beauty Palace',
        businessType: 'SALON' as const,
        city: 'Madrid',
        phone: '+34 611 222 333'
      },
      {
        email: 'carlos@urbancutz.com',
        name: 'Carlos Martínez',
        salonName: 'Urban Cuts',
        businessType: 'BARBERSHOP' as const,
        city: 'Barcelona',
        phone: '+34 622 333 444'
      },
      {
        email: 'ana@elegancesalon.com',
        name: 'Ana López',
        salonName: 'Elegance Salon',
        businessType: 'SALON' as const,
        city: 'Valencia',
        phone: '+34 633 444 555'
      }
    ];

    for (const userData of testUsers) {
      const existing = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (!existing) {
        const hashedPassword = await bcrypt.hash('Test123!', 10);
        await prisma.user.create({
          data: {
            ...userData,
            password: hashedPassword,
            role: 'CLIENT',
            isActive: true,
            hasCompletedOnboarding: true
          }
        });
        console.log(`✅ Test user created: ${userData.email}`);
      } else {
        console.log(`ℹ️ User already exists: ${userData.email}`);
      }
    }

    // Create some test orders
    const allTemplates = await prisma.template.findMany();
    const allUsers = await prisma.user.findMany({
      where: { role: 'CLIENT' }
    });

    if (allTemplates.length > 0 && allUsers.length > 0) {
      const orderStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'PENDING', 'COMPLETED'] as const;

      for (let i = 0; i < 5; i++) {
        const user = allUsers[i % allUsers.length];
        const template = allTemplates[i % allTemplates.length];

        if (!user || !template) {
          console.log(`⚠️ Skipping order ${i + 1}: missing user or template`);
          continue;
        }

        const domain = `${user.salonName?.toLowerCase().replace(/\s+/g, '') || 'salon'}-${i + 1}.com`;

        const existingOrder = await prisma.order.findUnique({
          where: { domain }
        });

        if (!existingOrder) {
          const status = orderStatuses[i];
          if (!status) {
            console.log(`⚠️ Skipping order ${i + 1}: invalid status`);
            continue;
          }

          await prisma.order.create({
            data: {
              salonName: user.salonName || 'Test Salon',
              ownerName: user.name || 'Test Owner',
              email: user.email,
              phone: user.phone || '+34 600 000 000',
              address: user.address || 'Test Address, Madrid',
              domain,
              templateId: template.id,
              total: template.price,
              status,
              userId: user.id,
              completedAt: status === 'COMPLETED' ? new Date() : null
            }
          });
          console.log(`✅ Test order created for domain: ${domain}`);
        } else {
          console.log(`ℹ️ Order already exists for domain: ${domain}`);
        }
      }
    }

    // Create some test contact messages
    const messageData = [
      {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '+34 644 555 666',
        subject: 'Question about pricing',
        message: 'Hello, I would like to know more about your Premium package. Can you send me more information?',
        status: 'UNREAD' as const
      },
      {
        name: 'Sofia Rodríguez',
        email: 'sofia@example.com',
        phone: '+34 655 666 777',
        subject: 'Technical support needed',
        message: 'I need help setting up my website. The booking system is not working properly.',
        status: 'UNREAD' as const
      },
      {
        name: 'Pedro Sánchez',
        email: 'pedro@example.com',
        subject: 'Partnership proposal',
        message: 'We are interested in partnering with your platform for our salon chain.',
        status: 'READ' as const
      }
    ];

    for (const msg of messageData) {
      const existing = await prisma.contactMessage.findFirst({
        where: {
          email: msg.email,
          subject: msg.subject
        }
      });

      if (!existing) {
        await prisma.contactMessage.create({ data: msg });
        console.log(`✅ Contact message created from: ${msg.name}`);
      } else {
        console.log(`ℹ️ Message already exists from: ${msg.name}`);
      }
    }

    // Create some FAQs
    const faqs = [
      {
        question: '¿Cuánto tiempo tarda en estar lista mi web?',
        answer: 'Normalmente, tu página web estará lista en 24-48 horas después de confirmar el pago y proporcionar toda la información necesaria.',
        category: 'General',
        order: 1,
        active: true
      },
      {
        question: '¿Puedo cambiar mi plantilla después?',
        answer: 'Sí, puedes actualizar a una plantilla superior en cualquier momento. Contacta con nuestro equipo de soporte para más información.',
        category: 'Templates',
        order: 2,
        active: true
      }
    ];

    for (const faq of faqs) {
      const existing = await prisma.fAQ.findFirst({
        where: { question: faq.question }
      });

      if (!existing) {
        await prisma.fAQ.create({ data: faq });
        console.log(`✅ FAQ created: ${faq.question.substring(0, 30)}...`);
      } else {
        console.log(`ℹ️ FAQ already exists: ${faq.question.substring(0, 30)}...`);
      }
    }

    // Create some testimonials
    const testimonials = [
      {
        name: 'Laura Fernández',
        salon: 'Style & Beauty',
        rating: 5,
        comment: 'Excellent service! My website looks professional and my clients love the online booking system.',
        featured: true,
        active: true
      },
      {
        name: 'Miguel Ángel',
        salon: 'The Barber Shop',
        rating: 5,
        comment: 'Very satisfied with the result. The support team is always available to help.',
        featured: false,
        active: true
      }
    ];

    for (const testimonial of testimonials) {
      const existing = await prisma.testimonial.findFirst({
        where: {
          name: testimonial.name,
          salon: testimonial.salon
        }
      });

      if (!existing) {
        await prisma.testimonial.create({ data: testimonial });
        console.log(`✅ Testimonial created from: ${testimonial.name}`);
      } else {
        console.log(`ℹ️ Testimonial already exists from: ${testimonial.name}`);
      }
    }

    console.log('\n🎉 Admin data seeding completed successfully!');
    console.log('\n📝 Admin credentials:');
    console.log('   Email: admin@peluquerias.com');
    console.log('   Password: Admin123!');

  } catch (error) {
    console.error('❌ Error seeding admin data:', error);
    throw error;
  }
}

// Run the seed function
seedAdminData()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });