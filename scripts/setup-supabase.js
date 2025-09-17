// سكريبت إعداد قاعدة البيانات مع Supabase
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupSupabaseDatabase() {
  try {
    console.log('🔄 بدء إعداد قاعدة البيانات مع Supabase...')
    
    // اختبار الاتصال
    await prisma.$connect()
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح!')
    
    // إنشاء الخدمات الأساسية
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
      },
      {
        title: 'تحديث BIOS',
        description: 'تحديث BIOS بأمان لتحسين الأداء والاستقرار',
        basePrice: 30,
        category: 'PC Tweak',
        image: '/images/services/bios-update.jpg',
        icon: '🔧',
        color: '#8B5CF6',
        popular: false,
        active: true,
        available: true
      },
      {
        title: 'تركيب نظام تبريد مائي',
        description: 'تركيب نظام تبريد مائي متقدم لتحسين الأداء',
        basePrice: 150,
        category: 'PC Build',
        image: '/images/services/water-cooling.jpg',
        icon: '❄️',
        color: '#06B6D4',
        popular: true,
        active: true,
        available: true
      }
    ]
    
    console.log('🔄 إنشاء الخدمات...')
    
    for (const service of services) {
      const existingService = await prisma.service.findFirst({
        where: { title: service.title }
      })
      
      if (!existingService) {
        await prisma.service.create({ data: service })
        console.log(`✅ تم إنشاء الخدمة: ${service.title}`)
      } else {
        console.log(`ℹ️ الخدمة موجودة: ${service.title}`)
      }
    }
    
    // إنشاء خيارات للخدمات
    const serviceOptions = [
      {
        serviceTitle: 'تجميع جهاز كمبيوتر مخصص',
        options: [
          { title: 'معالج Intel Core i5', description: 'معالج قوي للألعاب والعمل', price: 50 },
          { title: 'معالج Intel Core i7', description: 'معالج متقدم للأداء العالي', price: 100 },
          { title: 'معالج Intel Core i9', description: 'معالج احترافي للأداء المتميز', price: 200 },
          { title: 'كارت شاشة RTX 3060', description: 'كارت شاشة ممتاز للألعاب', price: 80 },
          { title: 'كارت شاشة RTX 4070', description: 'كارت شاشة متقدم للألعاب', price: 150 },
          { title: 'ذاكرة 16GB RAM', description: 'ذاكرة عشوائية سريعة', price: 30 },
          { title: 'ذاكرة 32GB RAM', description: 'ذاكرة عشوائية عالية الأداء', price: 60 }
        ]
      },
      {
        serviceTitle: 'إصلاح أجهزة الكمبيوتر',
        options: [
          { title: 'تشخيص شامل', description: 'فحص شامل لجميع مكونات الجهاز', price: 20 },
          { title: 'إصلاح البرامج', description: 'إصلاح مشاكل النظام والبرامج', price: 30 },
          { title: 'إصلاح الأجهزة', description: 'إصلاح أو استبدال المكونات التالفة', price: 50 }
        ]
      }
    ]
    
    console.log('🔄 إنشاء خيارات الخدمات...')
    
    for (const serviceOption of serviceOptions) {
      const service = await prisma.service.findFirst({
        where: { title: serviceOption.serviceTitle }
      })
      
      if (service) {
        for (const option of serviceOption.options) {
          const existingOption = await prisma.serviceOption.findFirst({
            where: { 
              serviceId: service.id,
              title: option.title 
            }
          })
          
          if (!existingOption) {
            await prisma.serviceOption.create({
              data: {
                serviceId: service.id,
                title: option.title,
                description: option.description,
                price: option.price
              }
            })
            console.log(`✅ تم إنشاء الخيار: ${option.title}`)
          }
        }
      }
    }
    
    console.log('🎉 تم إعداد قاعدة البيانات بنجاح!')
    console.log('📊 يمكنك الآن عرض البيانات في:')
    console.log('   - Supabase Dashboard: https://supabase.com/dashboard')
    console.log('   - Prisma Studio: npx prisma studio')
    
  } catch (error) {
    console.error('❌ فشل في إعداد قاعدة البيانات:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupSupabaseDatabase()