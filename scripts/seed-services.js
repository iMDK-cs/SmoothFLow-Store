const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const services = [
  {
    title: 'تركيب حاسوب كامل',
    description: 'تركيب حاسوب كامل مع جميع المكونات والبرامج الأساسية',
    basePrice: 150,
    category: 'assembly',
    image: '/images/services/pc-assembly.jpg',
    icon: '🖥️',
    color: '#3B82F6',
    popular: true,
    active: true,
    available: true,
    stock: 10
  },
  {
    title: 'صيانة الحاسوب',
    description: 'صيانة شاملة للحاسوب وتنظيف المكونات',
    basePrice: 80,
    category: 'maintenance',
    image: '/images/services/pc-fix.jpg',
    icon: '🔧',
    color: '#10B981',
    popular: true,
    active: true,
    available: true,
    stock: 15
  },
  {
    title: 'تسريع الحاسوب',
    description: 'تحسين أداء الحاسوب وتسريع التشغيل',
    basePrice: 60,
    category: 'optimization',
    image: '/images/services/tweak.jpg',
    icon: '⚡',
    color: '#F59E0B',
    popular: true,
    active: true,
    available: true,
    stock: 20
  },
  {
    title: 'تركيب نظام تبريد مائي',
    description: 'تركيب نظام تبريد مائي متقدم للحاسوب',
    basePrice: 200,
    category: 'cooling',
    image: '/images/services/water-cooling.jpg',
    icon: '❄️',
    color: '#06B6D4',
    popular: false,
    active: true,
    available: true,
    stock: 5
  },
  {
    title: 'تركيب نظام تبريد هوائي',
    description: 'تركيب نظام تبريد هوائي عالي الأداء',
    basePrice: 120,
    category: 'cooling',
    image: '/images/services/air-cooling.jpg',
    icon: '🌪️',
    color: '#8B5CF6',
    popular: false,
    active: true,
    available: true,
    stock: 8
  },
  {
    title: 'تحديث BIOS',
    description: 'تحديث BIOS الأم إلى أحدث إصدار',
    basePrice: 40,
    category: 'firmware',
    image: '/images/services/bios-update.jpg',
    icon: '💾',
    color: '#EF4444',
    popular: false,
    active: true,
    available: true,
    stock: 12
  },
  {
    title: 'تحسين BIOS',
    description: 'تحسين إعدادات BIOS للأداء الأمثل',
    basePrice: 50,
    category: 'firmware',
    image: '/images/services/bios-tweak.jpg',
    icon: '⚙️',
    color: '#84CC16',
    popular: false,
    active: true,
    available: true,
    stock: 10
  },
  {
    title: 'تركيب كرت شاشة',
    description: 'تركيب كرت شاشة جديد مع تحديث التعريفات',
    basePrice: 100,
    category: 'hardware',
    image: '/images/services/gpu-drivers.jpg',
    icon: '🎮',
    color: '#EC4899',
    popular: true,
    active: true,
    available: true,
    stock: 6
  },
  {
    title: 'تشخيص الأعطال',
    description: 'تشخيص شامل لأعطال الحاسوب',
    basePrice: 30,
    category: 'diagnosis',
    image: '/images/services/diagnosis.jpg',
    icon: '🔍',
    color: '#F97316',
    popular: true,
    active: true,
    available: true,
    stock: 25
  },
  {
    title: 'إعداد الشبكة',
    description: 'إعداد وتكوين الشبكة المنزلية',
    basePrice: 70,
    category: 'network',
    image: '/images/services/Network.jpg',
    icon: '🌐',
    color: '#14B8A6',
    popular: false,
    active: true,
    available: true,
    stock: 8
  }
]

async function seedServices() {
  try {
    console.log('🌱 بدء إضافة الخدمات...')
    
    // Clear existing services
    await prisma.service.deleteMany({})
    console.log('🗑️ تم حذف الخدمات الموجودة')
    
    // Add new services
    for (const service of services) {
      const createdService = await prisma.service.create({
        data: service
      })
      console.log(`✅ تم إضافة الخدمة: ${createdService.title}`)
    }
    
    console.log(`🎉 تم إضافة ${services.length} خدمة بنجاح!`)
    
    // Add service options for some services
    const assemblyService = await prisma.service.findFirst({
      where: { title: 'تركيب حاسوب كامل' }
    })
    
    if (assemblyService) {
      const options = [
        {
          serviceId: assemblyService.id,
          title: 'تركيب أساسي',
          description: 'تركيب الحاسوب مع النظام الأساسي',
          price: 0,
          active: true
        },
        {
          serviceId: assemblyService.id,
          title: 'تركيب متقدم',
          description: 'تركيب الحاسوب مع البرامج المتقدمة',
          price: 50,
          active: true
        },
        {
          serviceId: assemblyService.id,
          title: 'تركيب احترافي',
          description: 'تركيب الحاسوب مع جميع البرامج والتحسينات',
          price: 100,
          active: true
        }
      ]
      
      for (const option of options) {
        await prisma.serviceOption.create({
          data: option
        })
        console.log(`✅ تم إضافة خيار: ${option.title}`)
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ في إضافة الخدمات:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedServices()