const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const servicesData = {
  assembly: {
    title: 'تركيب وبناء PC',
    icon: '🖥️',
    color: 'from-sky-400 to-sky-500',
    services: [
      {
        id: 'ready-builds',
        title: 'تجميعات PC جاهزة',
        description: 'تجميعات متنوعة للألعاب والعمل مع ضمان شامل',
        basePrice: 0,
        image: '💻',
        popular: true,
        rating: 5,
        color: 'from-sky-400 to-sky-500'
      },
      {
        id: 'consultation',
        title: 'استشارة القطع',
        description: 'مساعدة في اختيار أفضل القطع حسب الميزانية',
        basePrice: 100,
        image: '💡',
        rating: 4.9,
        color: 'from-sky-400 to-sky-500'
      },
      {
        id: 'water-cooling',
        title: 'تركيب مبرد مائي',
        description: 'تركيب بي سي بمبرد مائي ',
        basePrice: 150,
        image: '💧',
        rating: 5,
        color: 'from-sky-500 to-sky-600'
      },
      {
        id: 'air-cooling',
        title: 'تركيب مبرد هوائي',
        description: 'تركيب بي سي بمبرد هوائي ',
        basePrice: 100,
        image: '🌀',
        rating: 4.7,
        color: 'from-sky-500 to-sky-600'
      },
      {
        id: 'custom-build',
        title: 'تركيب مخصص',
        description: 'تركيب قطع حسب الطلب مع ضبط الأداء',
        basePrice: 200,
        image: '🔧',
        rating: 4.8,
        color: 'from-sky-400 to-sky-500'
      }
    ]
  },
  maintenance: {
    title: 'الصيانة والإصلاح',
    icon: '🛠️',
    color: 'from-sky-500 to-sky-600',
    services: [
      {
        id: 'diagnosis',
        title: 'كشف وصيانة PC',
        description: 'فحص شامل وتشخيص دقيق لجميع المكونات',
        basePrice: 50,
        image: '🔍',
        popular: true,
        rating: 4.9,
        color: 'from-sky-500 to-sky-600'
      },
      {
        id: 'format',
        title: 'فورمات النظام',
        description: 'تهيئة وإعادة تثبيت الويندوز مع التعريفات',
        basePrice: 30,
        image: '💿',
        rating: 4.6,
        color: 'from-sky-500 to-sky-600'
      },
      {
        id: 'gpu-drivers',
        title: ' تعديل درايفر الكرت GPU',
        description: 'حذف وتحديث تعريفات كرت الشاشة',
        basePrice: 30,
        image: '🎮',
        rating: 4.8,
        color: 'from-sky-500 to-sky-600'
      },
      {
        id: 'thermal-paste',
        title: 'تغيير المعجون',
        description: 'استبدال المعجون الحراري لتحسين التبريد',
        basePrice: 50,
        image: '🌡️',
        rating: 5,
        color: 'from-sky-500 to-sky-600'
      },
      {
        id: 'bios-update',
        title: 'تحديث البايوس',
        description: 'تحديث البايوس لأحدث إصدار بأمان',
        basePrice: 50,
        image: '⚙️',
        rating: 4.9,
        color: 'from-sky-500 to-sky-600'
      }
    ]
  },
  tweaking: {
    title: 'التحسين والتطوير',
    icon: '⚡',
    color: 'from-sky-600 to-sky-700',
    services: [
      {
        id: 'ram-oc',
        title: 'تويك للبايوس وكسر سرعة الرامات',
        description: 'تحسين أداء الرام عبر البايوس',
        basePrice: 50,
        image: '🧠',
        rating: 4.8,
        color: 'from-purple-500 to-purple-600'
      },
      {
        id: 'windows-tweaking',
        title: 'تويك الويندوز',
        description: 'تسريع وتحسين الويندوز',
        basePrice: 150,
        image: '🪟',
        popular: true,
        rating: 4.9,
        color: 'from-purple-500 to-purple-600',
        options: [
          { id: 'without-format', title: 'بدون فورمات', price: 150, description: 'تحسين الويندوز الحالي' },
          { id: 'with-format', title: 'مع فورمات', price: 180, description: 'تحسين + فورمات كامل للنظام' }
        ]
      },
      {
        id: 'gaming-windows',
        title: 'تثبيت ويندوز مخصص للالعاب ',
        description: 'ويندوز محسن خصيصاً للألعاب',
        basePrice: 100,
        image: '🎯',
        rating: 4.7,
        color: 'from-purple-500 to-purple-600'
      },
      {
        id: 'gpu-oc',
        title: 'كسر سرعة  القير ',
        description: 'رفع أداء استجابة القير ',
        basePrice: 30,
        image: '🚀',
        rating: 4.6,
        color: 'from-purple-500 to-purple-600'
      },
      {
        id: 'network-tweak',
        title: 'تحسين الشبكة',
        description: 'تحسين سرعة وثبات الاتصال بالإنترنت',
        basePrice: 40,
        image: '🌐',
        rating: 4.7,
        color: 'from-blue-500 to-cyan-600'
      }
    ]
  }
}

async function seedServices() {
  try {
    console.log('Starting to seed services...')

    // Clear existing services
    await prisma.serviceOption.deleteMany()
    await prisma.service.deleteMany()

    // Seed services
    for (const [categoryKey, category] of Object.entries(servicesData)) {
      for (const service of category.services) {
        const createdService = await prisma.service.create({
          data: {
            id: service.id,
            title: service.title,
            description: service.description,
            basePrice: service.basePrice,
            category: categoryKey,
            image: service.image,
            icon: service.image,
            color: service.color,
            popular: service.popular || false,
            active: true
          }
        })

        console.log(`Created service: ${service.title}`)

        // Create service options if they exist
        if (service.options && service.options.length > 0) {
          for (const option of service.options) {
            await prisma.serviceOption.create({
              data: {
                id: option.id,
                serviceId: createdService.id,
                title: option.title,
                description: option.description,
                price: option.price,
                active: true
              }
            })
            console.log(`Created option: ${option.title} for ${service.title}`)
          }
        }
      }
    }

    console.log('Services seeded successfully!')
  } catch (error) {
    console.error('Error seeding services:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedServices()