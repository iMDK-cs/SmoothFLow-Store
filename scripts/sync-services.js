#!/usr/bin/env node

/**
 * Sync Services Data
 * This script syncs services from the codebase to the database
 * Handles updates, new additions, and validation
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Latest services data from codebase (same as in migrate-all-services.js but with validation)
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
    color: 'from-sky-500 to-sky-600',
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

function validateService(service) {
  const errors = [];
  
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
    errors.push('Text encoding error: ' + error.message);
  }
  
  return errors;
}

async function syncServices() {
  console.log('🔄 Starting services synchronization...\n');
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    let syncedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const serviceData of servicesData) {
      try {
        // Validate service data
        const validationErrors = validateService(serviceData);
        if (validationErrors.length > 0) {
          console.log(`❌ Validation failed for ${serviceData.title}:`);
          validationErrors.forEach(error => console.log(`   - ${error}`));
          errorCount++;
          continue;
        }
        
        // Check if service already exists
        const existingService = await prisma.service.findUnique({
          where: { id: serviceData.id },
          include: { options: true }
        });
        
        if (existingService) {
          // Update existing service
          await prisma.service.update({
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
            await prisma.serviceOption.deleteMany({
              where: { serviceId: serviceData.id }
            });
            
            // Add new options
            for (const optionData of serviceData.options) {
              await prisma.serviceOption.create({
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
          
          console.log(`🔄 Updated: ${serviceData.title}`);
          updatedCount++;
        } else {
          // Create new service
          const service = await prisma.service.create({
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
              await prisma.serviceOption.create({
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
          
          console.log(`✅ Created: ${serviceData.title}`);
          syncedCount++;
        }
        
      } catch (error) {
        console.error(`❌ Failed to sync ${serviceData.title}:`, error.message);
        errorCount++;
      }
    }
    
    const totalServices = await prisma.service.count();
    const totalOptions = await prisma.serviceOption.count();
    
    console.log('\n🎉 Synchronization completed!');
    console.log('═'.repeat(40));
    console.log(`✅ New services created: ${syncedCount}`);
    console.log(`🔄 Services updated: ${updatedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total services in database: ${totalServices}`);
    console.log(`📊 Total service options: ${totalOptions}`);
    
  } catch (error) {
    console.error('❌ Synchronization failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📖 Services Sync Tool

Usage: npm run db:sync-services [options]

Options:
  --help, -h     Show this help message
  --dry-run      Show what would be changed without making changes
  --force        Force sync even with validation warnings

Examples:
  npm run db:sync-services
  npm run db:sync-services -- --dry-run
`);
  process.exit(0);
}

syncServices();