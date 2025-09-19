import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    title: 'تويك البايوس',
    description: 'تحسين إعدادات البايوس للأداء الأمثل',
    basePrice: 50,
    category: 'tweaks',
    image: '/images/services/bios-tweak.jpg',
    icon: '⚙️',
    color: '#84CC16',
    popular: true,
    active: true,
    available: true,
    stock: 10
  },
  {
    title: 'تويك الويندوز',
    description: 'تحسين إعدادات الويندوز للأداء الأمثل',
    basePrice: 40,
    category: 'tweaks',
    image: '/images/services/custom-windows1.jpg',
    icon: '🪟',
    color: '#06B6D4',
    popular: true,
    active: true,
    available: true,
    stock: 12
  },
  {
    title: 'تثبيت ويندوز مخصص',
    description: 'تثبيت ويندوز مخصص مع التحسينات',
    basePrice: 70,
    category: 'installation',
    image: '/images/services/custom-windows.gif',
    icon: '💿',
    color: '#8B5CF6',
    popular: true,
    active: true,
    available: true,
    stock: 8
  },
  {
    title: 'تويك الانترنت',
    description: 'تحسين سرعة الانترنت وإعدادات الشبكة',
    basePrice: 30,
    category: 'network',
    image: '/images/services/network1.gif',
    icon: '🌐',
    color: '#14B8A6',
    popular: true,
    active: true,
    available: true,
    stock: 15
  },
  {
    title: 'كسر سرعة القير',
    description: 'رفع أداء كرت الشاشة عبر كسر السرعة',
    basePrice: 90,
    category: 'overclocking',
    image: '/images/services/controller-oc.jpg',
    icon: '🎮',
    color: '#EC4899',
    popular: true,
    active: true,
    available: true,
    stock: 6
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
  },
  {
    title: 'تغيير المعجون الحراري',
    description: 'تغيير المعجون الحراري للمعالج',
    basePrice: 25,
    category: 'maintenance',
    image: '/images/services/thermal-paste.jpg',
    icon: '🌡️',
    color: '#F59E0B',
    popular: false,
    active: true,
    available: true,
    stock: 20
  }
]

export async function POST() {
  try {
    console.log('🌱 Starting to seed services...')
    
    // Check if services already exist
    const existingServices = await prisma.service.count()
    console.log(`📊 Existing services count: ${existingServices}`)
    
    if (existingServices > 0) {
      return NextResponse.json({ 
        message: 'Services already exist',
        count: existingServices 
      })
    }

    // Add services
    const createdServices = []
    for (const service of services) {
      const createdService = await prisma.service.create({
        data: service
      })
      createdServices.push(createdService)
      console.log(`✅ Created service: ${createdService.title}`)
    }

    console.log(`🎉 Successfully created ${createdServices.length} services`)

    return NextResponse.json({ 
      message: 'Services added successfully',
      count: createdServices.length,
      services: createdServices.map(s => ({ id: s.id, title: s.title }))
    })
    
  } catch (error) {
    console.error('❌ Seed services error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}