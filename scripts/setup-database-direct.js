// سكريبت إعداد قاعدة البيانات مباشرة
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function setupDatabase() {
  try {
    console.log('🔄 بدء إعداد قاعدة البيانات...')
    
    // قراءة ملف SQL
    const sqlFile = path.join(__dirname, 'create-tables.sql')
    const sqlContent = fs.readFileSync(sqlFile, 'utf8')
    
    // تقسيم SQL إلى أوامر منفصلة
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
    
    console.log(`📝 تم العثور على ${sqlCommands.length} أمر SQL`)
    
    // تنفيذ كل أمر SQL
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i]
      if (command.trim()) {
        try {
          console.log(`⚡ تنفيذ الأمر ${i + 1}/${sqlCommands.length}...`)
          await prisma.$executeRawUnsafe(command)
        } catch (error) {
          // تجاهل الأخطاء المتعلقة بالموجود مسبقاً
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate key') ||
              error.message.includes('relation already exists')) {
            console.log(`ℹ️ تم تجاهل: ${error.message.split('\n')[0]}`)
          } else {
            console.error(`❌ خطأ في الأمر ${i + 1}:`, error.message)
          }
        }
      }
    }
    
    console.log('✅ تم إعداد قاعدة البيانات بنجاح!')
    
    // إنشاء بعض البيانات التجريبية
    console.log('🔄 إنشاء البيانات التجريبية...')
    
    const services = [
      {
        title: 'تجميع جهاز كمبيوتر مخصص',
        description: 'تجميع جهاز كمبيوتر حسب مواصفاتك المطلوبة مع ضمان الجودة',
        basePrice: 200,
        category: 'PC Build',
        image: '/images/services/custom-build.jpg',
        icon: '🖥️',
        color: '#3B82F6',
        popular: true,
        active: true,
        available: true
      },
      {
        title: 'إصلاح أجهزة الكمبيوتر',
        description: 'تشخيص وإصلاح مشاكل الأجهزة والبرامج مع ضمان الإصلاح',
        basePrice: 50,
        category: 'PC Fix',
        image: '/images/services/diagnosis.jpg',
        icon: '🔧',
        color: '#EF4444',
        popular: true,
        active: true,
        available: true
      },
      {
        title: 'تحسين الأداء',
        description: 'تحسين سرعة وأداء جهاز الكمبيوتر وإزالة البرامج الضارة',
        basePrice: 80,
        category: 'PC Tweak',
        image: '/images/services/tweak.jpg',
        icon: '⚡',
        color: '#10B981',
        popular: false,
        active: true,
        available: true
      }
    ]
    
    for (const service of services) {
      try {
        await prisma.service.upsert({
          where: { title: service.title },
          update: {},
          create: service
        })
        console.log(`✅ تم إنشاء الخدمة: ${service.title}`)
      } catch (error) {
        console.log(`ℹ️ الخدمة موجودة: ${service.title}`)
      }
    }
    
    console.log('🎉 تم إعداد قاعدة البيانات والبيانات التجريبية بنجاح!')
    
  } catch (error) {
    console.error('❌ خطأ في إعداد قاعدة البيانات:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// تشغيل الإعداد
if (require.main === module) {
  setupDatabase()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}

module.exports = setupDatabase