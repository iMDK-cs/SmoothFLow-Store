#!/usr/bin/env node

/**
 * Add missing options for tweak service
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTweakOptions() {
  try {
    console.log('🔧 Adding options for tweak service...\n');
    
    // Check if tweak service exists
    const tweakService = await prisma.service.findUnique({
      where: { id: 'tweak' }
    });

    if (!tweakService) {
      console.log('❌ Tweak service not found');
      return;
    }

    console.log(`✅ Found service: ${tweakService.title}`);

    // Add the options
    const options = [
      {
        title: 'بدون فورمات',
        description: 'تحسين الويندوز الحالي',
        price: 0, // No additional cost
        active: true
      },
      {
        title: 'مع فورمات',
        description: 'تحسين + فورمات كامل للنظام',
        price: 30, // Additional 30 SAR
        active: true
      }
    ];

    for (const optionData of options) {
      const option = await prisma.serviceOption.create({
        data: {
          serviceId: 'tweak',
          title: optionData.title,
          description: optionData.description,
          price: optionData.price,
          active: optionData.active
        }
      });
      console.log(`✅ Created option: ${option.title} (${option.id})`);
    }

    console.log('\n🎉 Options added successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTweakOptions();