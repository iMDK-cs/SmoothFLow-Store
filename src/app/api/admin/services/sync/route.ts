import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions, getUserFromSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Services data to sync (same as in sync-services.js)
const servicesData = [
  // Assembly Services
  {
    id: 'ready-builds',
    title: 'تجميعات PC جاهزة',
    description: 'تجميعات متنوعة للألعاب والعمل مع ضمان شامل',
    basePrice: 0,
    category: 'assembly',
    image: '/images/services/ready-builds.jpg',
    icon: '🖥️',
    color: 'from-sky-400 to-sky-500',
    popular: true,
    active: true,
    available: true,
    options: [
      {
        title: 'خدمة سريعة',
        description: 'تجميع وتركيب في وقت اسرع',
        price: 50
      }
    ]
  },
  {
    id: 'water-cooling',
    title: 'تركيب مبرد مائي',
    description: 'تركيب بي سي بمبرد مائي',
    basePrice: 150,
    category: 'assembly',
    image: '/images/services/water-cooling.jpg',
    icon: '💧',
    color: 'from-sky-500 to-sky-600',
    popular: false,
    active: true,
    available: true
  },
  {
    id: 'air-cooling',
    title: 'تركيب مبرد هوائي',
    description: 'تركيب بي سي بمبرد هوائي',
    basePrice: 100,
    category: 'assembly',
    image: '/images/services/air-cooling.jpg',
    icon: '🌀',
    color: 'from-sky-500 to-sky-600',
    popular: false,
    active: true,
    available: true
  },
  {
    id: 'custom-build',
    title: 'تركيب مخصص',
    description: 'تركيب قطع حسب الطلب مع ضبط الأداء',
    basePrice: 200,
    category: 'assembly',
    image: '/images/services/custom-build.jpg',
    icon: '🔧',
    color: 'from-sky-400 to-sky-500',
    popular: true,
    active: true,
    available: true,
    options: [
      {
        title: 'رفع الأداء',
        description: 'كسر سرعة المعالج او الكرت',
        price: 100
      }
    ]
  },
  
  // Maintenance Services
  {
    id: 'diagnosis',
    title: 'كشف وصيانة PC',
    description: 'فحص شامل وتشخيص دقيق لجميع المكونات',
    basePrice: 100,
    category: 'maintenance',
    image: '/images/services/diagnosis.jpg',
    icon: '⚠️',
    color: 'from-sky-500 to-sky-600',
    popular: true,
    active: true,
    available: true
  },
  {
    id: 'format',
    title: 'فورمات النظام',
    description: 'فورمات شامل للنظام مع تثبيت البرامج الأساسية',
    basePrice: 30,
    category: 'maintenance',
    image: '/images/services/format.png',
    icon: '💾',
    color: 'from-sky-400 to-sky-500',
    popular: false,
    active: true,
    available: true
  },
  {
    id: 'thermal-paste',
    title: 'تغيير المعجون الحراري',
    description: 'تغيير المعجون الحراري للمعالج لتحسين الأداء',
    basePrice: 50,
    category: 'maintenance',
    image: '/images/services/thermal-paste.jpg',
    icon: '🌡️',
    color: 'from-sky-505 to-sky-600',
    popular: false,
    active: true,
    available: true
  },
  {
    id: 'pc-assembly',
    title: 'تجميع PC',
    description: 'تجميع كامل للكمبيوتر مع ضمان الجودة',
    basePrice: 150,
    category: 'maintenance',
    image: '/images/services/pc-assembly.jpg',
    icon: '🔧',
    color: 'from-sky-400 to-sky-500',
    popular: true,
    active: true,
    available: true
  },
  
  // Software Services
  {
    id: 'bios-update',
    title: 'تحديث BIOS',
    description: 'تحديث BIOS للمعالج واللوحة الأم',
    basePrice: 30,
    category: 'software',
    image: '/images/services/bios-update.jpg',
    icon: '⚡',
    color: 'from-sky-500 to-sky-600',
    popular: false,
    active: true,
    available: true
  },
  {
    id: 'bios-tweak',
    title: 'ضبط BIOS',
    description: 'ضبط إعدادات BIOS لتحسين الأداء',
    basePrice: 50,
    category: 'software',
    image: '/images/services/bios-tweak.jpg',
    icon: '⚙️',
    color: 'from-sky-400 to-sky-500',
    popular: false,
    active: true,
    available: true
  },
  {
    id: 'gpu-drivers',
    title: 'تحديث كرت الشاشة',
    description: 'تحديث تعريفات كرت الشاشة',
    basePrice: 20,
    category: 'software',
    image: '/images/services/gpu-drivers.jpg',
    icon: '🎮',
    color: 'from-sky-500 to-sky-600',
    popular: false,
    active: true,
    available: true
  },
  {
    id: 'custom-windows',
    title: 'ويندوز مخصص',
    description: 'تثبيت ويندوز مخصص محسن للأداء',
    basePrice: 100,
    category: 'software',
    image: '/images/services/custom-windows1.jpg',
    icon: '🪟',
    color: 'from-sky-400 to-sky-500',
    popular: true,
    active: true,
    available: true
  },
  {
    id: 'tweak',
    title: 'تحسين النظام',
    description: 'تحسين شامل لأداء النظام',
    basePrice: 100,
    category: 'software',
    image: '/images/services/tweak.jpg',
    icon: '🚀',
    color: 'from-sky-500 to-sky-600',
    popular: false,
    active: true,
    available: true
  },
  
  // Network Services
  {
    id: 'network',
    title: 'إعداد الشبكة',
    description: 'إعداد وتكوين الشبكة المنزلية',
    basePrice: 50,
    category: 'network',
    image: '/images/services/Network.jpg',
    icon: '🌐',
    color: 'from-sky-400 to-sky-500',
    popular: false,
    active: true,
    available: true
  },
  
  // Overclocking Services
  {
    id: 'controller-oc',
    title: 'رفع أداء المعالج',
    description: 'رفع أداء المعالج بأمان',
    basePrice: 30,
    category: 'overclocking',
    image: '/images/services/controller-oc.jpg',
    icon: '⚡',
    color: 'from-sky-500 to-sky-600',
    popular: true,
    active: true,
    available: true
  }
];

function validateService(service: any) {
  const errors: string[] = [];
  
  if (!service.id || typeof service.id !== 'string') {
    errors.push('Service ID is required and must be a string');
  }
  
  if (!service.title || typeof service.title !== 'string') {
    errors.push('Service title is required and must be a string');
  }
  
  if (!service.description || typeof service.description !== 'string') {
    errors.push('Service description is required and must be a string');
  }
  
  if (typeof service.basePrice !== 'number' || service.basePrice < 0) {
    errors.push('Base price must be a non-negative number');
  }
  
  if (!service.category || typeof service.category !== 'string') {
    errors.push('Service category is required and must be a string');
  }
  
  // Validate UTF-8 encoding for Arabic text
  try {
    const titleEncoded = Buffer.from(service.title, 'utf8').toString('utf8');
    const descEncoded = Buffer.from(service.description, 'utf8').toString('utf8');
    
    if (titleEncoded !== service.title || descEncoded !== service.description) {
      errors.push('Text encoding validation failed');
    }
  } catch (error) {
    errors.push('Text encoding error: ' + (error as Error).message);
  }
  
  return errors;
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string | null } } | null
    const user = await getUserFromSession(session)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    let syncedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Use transaction for data consistency
    await prisma.$transaction(async (tx) => {
      for (const serviceData of servicesData) {
        try {
          // Validate service data
          const validationErrors = validateService(serviceData);
          if (validationErrors.length > 0) {
            errors.push(`Validation failed for ${serviceData.title}: ${validationErrors.join(', ')}`);
            errorCount++;
            continue;
          }
          
          // Check if service already exists
          const existingService = await tx.service.findUnique({
            where: { id: serviceData.id },
            include: { options: true }
          });
          
          if (existingService) {
            // Update existing service
            await tx.service.update({
              where: { id: serviceData.id },
              data: {
                title: serviceData.title,
                description: serviceData.description,
                basePrice: serviceData.basePrice,
                category: serviceData.category,
                image: serviceData.image,
                icon: serviceData.icon,
                color: serviceData.color,
                popular: serviceData.popular,
                active: serviceData.active,
                available: serviceData.available
              }
            });
            
            // Handle options
            if (serviceData.options) {
              // Remove existing options
              await tx.serviceOption.deleteMany({
                where: { serviceId: serviceData.id }
              });
              
              // Add new options
              for (const optionData of serviceData.options) {
                await tx.serviceOption.create({
                  data: {
                    serviceId: serviceData.id,
                    title: optionData.title,
                    description: optionData.description,
                    price: optionData.price,
                    active: true
                  }
                });
              }
            }
            
            updatedCount++;
          } else {
            // Create new service
            const service = await tx.service.create({
              data: {
                id: serviceData.id,
                title: serviceData.title,
                description: serviceData.description,
                basePrice: serviceData.basePrice,
                category: serviceData.category,
                image: serviceData.image,
                icon: serviceData.icon,
                color: serviceData.color,
                popular: serviceData.popular,
                active: serviceData.active,
                available: serviceData.available
              }
            });
            
            // Create options
            if (serviceData.options) {
              for (const optionData of serviceData.options) {
                await tx.serviceOption.create({
                  data: {
                    serviceId: service.id,
                    title: optionData.title,
                    description: optionData.description,
                    price: optionData.price,
                    active: true
                  }
                });
              }
            }
            
            syncedCount++;
          }
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to sync ${serviceData.title}: ${errorMessage}`);
          errorCount++;
        }
      }
    });

    const totalServices = await prisma.service.count();
    const totalOptions = await prisma.serviceOption.count();

    return NextResponse.json({
      success: true,
      message: 'Services synchronized successfully',
      stats: {
        total: servicesData.length,
        created: syncedCount,
        updated: updatedCount,
        errors: errorCount
      },
      summary: {
        totalServices,
        totalOptions
      },
      errors: errorCount > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Service sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}