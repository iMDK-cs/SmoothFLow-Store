const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateAvailabilitySchema() {
  try {
    console.log('🔄 Updating database schema for availability management...')
    
    // First, let's check if the new fields exist
    const services = await prisma.service.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        available: true,
        availabilityStatus: true
      }
    })

    console.log(`📊 Found ${services.length} services`)

    // Set ready-pc products as unavailable by default
    const readyPcServices = services.filter(service => 
      service.title.includes('تجميعات PC جاهزة') || 
      service.title.includes('Ready PC') ||
      service.title.includes('ready-pc') ||
      service.category === 'ready-pc'
    )

    console.log(`🎯 Found ${readyPcServices.length} ready PC services`)

    // Update ready-pc services to be unavailable
    for (const service of readyPcServices) {
      await prisma.service.update({
        where: { id: service.id },
        data: {
          available: false,
          availabilityStatus: 'out_of_stock',
          availabilityUpdatedAt: new Date()
        }
      })
      console.log(`✅ Updated: ${service.title} - Set as unavailable`)
    }

    // Update all other services to have proper availability status
    const otherServices = services.filter(service => 
      !service.title.includes('تجميعات PC جاهزة') && 
      !service.title.includes('Ready PC') &&
      !service.title.includes('ready-pc') &&
      service.category !== 'ready-pc'
    )

    for (const service of otherServices) {
      const availabilityStatus = service.available ? 'available' : 'out_of_stock'
      
      await prisma.service.update({
        where: { id: service.id },
        data: {
          availabilityStatus: availabilityStatus,
          availabilityUpdatedAt: new Date()
        }
      })
    }

    console.log(`✅ Updated ${otherServices.length} other services with availability status`)

    console.log('🎉 Database schema update completed successfully!')
    
  } catch (error) {
    console.error('❌ Error updating database schema:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
updateAvailabilitySchema()
  .then(() => {
    console.log('✅ Migration completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })