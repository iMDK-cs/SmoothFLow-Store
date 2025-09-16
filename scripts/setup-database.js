const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected successfully!')
    
    // Create some sample services if they don't exist
    const existingServices = await prisma.service.count()
    
    if (existingServices === 0) {
      console.log('🔄 Creating sample services...')
      
      const services = [
        {
          title: 'تجميع جهاز كمبيوتر مخصص',
          description: 'تجميع جهاز كمبيوتر حسب مواصفاتك المطلوبة',
          basePrice: 200,
          category: 'PC Build',
          image: '/images/services/custom-build.jpg',
          icon: '🖥️',
          color: '#3B82F6',
          popular: true
        },
        {
          title: 'إصلاح أجهزة الكمبيوتر',
          description: 'تشخيص وإصلاح مشاكل الأجهزة والبرامج',
          basePrice: 50,
          category: 'PC Fix',
          image: '/images/services/diagnosis.jpg',
          icon: '🔧',
          color: '#EF4444',
          popular: true
        },
        {
          title: 'تحسين الأداء',
          description: 'تحسين سرعة وأداء جهاز الكمبيوتر',
          basePrice: 80,
          category: 'PC Tweak',
          image: '/images/services/tweak.jpg',
          icon: '⚡',
          color: '#10B981',
          popular: false
        }
      ]
      
      for (const service of services) {
        await prisma.service.create({
          data: service
        })
      }
      
      console.log('✅ Sample services created!')
    } else {
      console.log('ℹ️ Services already exist, skipping...')
    }
    
    console.log('🎉 Database setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupDatabase()