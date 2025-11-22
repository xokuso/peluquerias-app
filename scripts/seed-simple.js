const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcryptjs')
const path = require('path')

async function main() {
  console.log('🌱 Seeding database with simple approach...')

  const dbPath = path.resolve(__dirname, '../prisma/dev.db')
  const db = new sqlite3.Database(dbPath)

  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)

    db.run(`
      INSERT OR REPLACE INTO User (
        id, email, name, password, role, isActive, hasCompletedOnboarding,
        createdAt, updatedAt
      ) VALUES (
        'admin-1', 'admin@peluquerias.com', 'Admin', ?, 'ADMIN', 1, 1,
        datetime('now'), datetime('now')
      )
    `, [hashedPassword], function(err) {
      if (err) console.error('Error creating admin:', err)
      else console.log('✅ Admin user created: admin@peluquerias.com')
    })

    // Create sample templates
    const templates = [
      {
        id: 'template-1',
        name: 'Elegance Salon',
        description: 'Plantilla elegante para salones de belleza premium',
        price: 299,
        category: 'PREMIUM'
      },
      {
        id: 'template-2',
        name: 'Modern Cut',
        description: 'Diseño moderno y minimalista para barberías',
        price: 199,
        category: 'STANDARD'
      },
      {
        id: 'template-3',
        name: 'Beauty Studio',
        description: 'Plantilla versátil para estudios de belleza',
        price: 249,
        category: 'STANDARD'
      }
    ]

    templates.forEach((template, index) => {
      db.run(`
        INSERT OR REPLACE INTO Template (
          id, name, description, price, category, features, preview, active,
          createdAt, updatedAt
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, 1,
          datetime('now'), datetime('now')
        )
      `, [
        template.id,
        template.name,
        template.description,
        template.price,
        template.category,
        JSON.stringify(['Diseño responsive', 'Galería de trabajos', 'Sistema de citas', 'Redes sociales']),
        `/templates/${template.name.toLowerCase().replace(/\s+/g, '-')}-preview.jpg`,
      ], function(err) {
        if (err) console.error(`Error creating template ${template.name}:`, err)
        else console.log(`✅ Template created: ${template.name}`)
      })
    })

    // Create domain pricing
    const domainPricing = [
      { extension: '.com', basePrice: 12, discount: 0, isPopular: 1, isAvailable: 1, sortOrder: 1 },
      { extension: '.es', basePrice: 8, discount: 0, isPopular: 1, isAvailable: 1, sortOrder: 2 },
      { extension: '.org', basePrice: 14, discount: 0, isPopular: 0, isAvailable: 1, sortOrder: 3 },
      { extension: '.net', basePrice: 15, discount: 0, isPopular: 0, isAvailable: 1, sortOrder: 4 },
      { extension: '.info', basePrice: 18, discount: 0, isPopular: 0, isAvailable: 1, sortOrder: 5 }
    ]

    domainPricing.forEach(pricing => {
      db.run(`
        INSERT OR REPLACE INTO DomainPricing (
          id, extension, basePrice, discount, isPopular, isAvailable, sortOrder,
          createdAt, updatedAt
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?,
          datetime('now'), datetime('now')
        )
      `, [
        `domain-${pricing.extension.replace('.', '')}`,
        pricing.extension,
        pricing.basePrice,
        pricing.discount,
        pricing.isPopular,
        pricing.isAvailable,
        pricing.sortOrder
      ], function(err) {
        if (err) console.error(`Error creating domain pricing ${pricing.extension}:`, err)
        else console.log(`✅ Domain pricing created: ${pricing.extension}`)
      })
    })

    setTimeout(() => {
      console.log('🎉 Seeding completed!')
      db.close()
    }, 1000)

  } catch (error) {
    console.error('Error during seeding:', error)
    db.close()
  }
}

main()