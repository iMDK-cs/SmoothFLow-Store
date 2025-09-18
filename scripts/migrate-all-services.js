#!/usr/bin/env node

/**
 * Migrate All Services to Database
 * This script transfers all services from the code to the database
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// All services data from the codebase
const allServicesData = [
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
    basePrice: 175,
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
    basePrice: 75,
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
    basePrice: 50,
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
    basePrice: 30,
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
    basePrice: 120,
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
    basePrice: 80,
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
    basePrice: 60,
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
    basePrice: 25,
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
    basePrice: 70,
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
    basePrice: 90,
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
    basePrice: 120,
    category: 'overclocking',
    image: '/images/services/controller-oc.jpg',
    icon: '⚡',
    color: 'from-sky-500 to-sky-600',
    popular: true,
    active: true,
    available: true
  }
];

async function migrateAllServices() {
  console.log('🚀 Starting migration of all services to database...');

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');

    // Clear existing services (optional - remove if you want to keep existing)
    console.log('🗑️  Clearing existing services...');
    await prisma.serviceOption.deleteMany();
    await prisma.service.deleteMany();
    console.log('✅ Existing services cleared!');

    // Create admin user if it doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pcservices.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!existingAdmin) {
      console.log('👤 Creating admin user...');
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'Admin',
          password: hashedPassword,
          role: 'ADMIN',
          verified: true
        }
      });
      console.log('✅ Admin user created successfully!');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Migrate all services
    console.log('📦 Migrating services...');
    let migratedCount = 0;

    for (const serviceData of allServicesData) {
      try {
        // Create the service
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

        // Create service options if they exist
        if (serviceData.options && serviceData.options.length > 0) {
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

        console.log(`✅ Migrated: ${service.title}`);
        migratedCount++;

      } catch (error) {
        console.error(`❌ Failed to migrate ${serviceData.title}:`, error.message);
      }
    }

    console.log(`\n🎉 Migration completed successfully!`);
    console.log(`📊 Total services migrated: ${migratedCount}`);
    console.log(`📊 Total services in database: ${await prisma.service.count()}`);
    console.log(`📊 Total service options: ${await prisma.serviceOption.count()}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateAllServices()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  });