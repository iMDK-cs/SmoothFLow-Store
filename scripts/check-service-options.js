#!/usr/bin/env node

/**
 * Check Service Options in Database
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkServiceOptions() {
  try {
    console.log('🔍 Checking service options in database...\n');
    
    const services = await prisma.service.findMany({
      include: {
        options: true
      },
      where: {
        id: {
          in: ['tweak', 'custom-build', 'ready-builds']
        }
      }
    });

    services.forEach(service => {
      console.log(`\n📦 Service: ${service.title} (${service.id})`);
      console.log(`   Base Price: ${service.basePrice} ريال`);
      
      if (service.options && service.options.length > 0) {
        console.log('   Options:');
        service.options.forEach(option => {
          console.log(`     • ${option.title} (${option.id}): +${option.price} ريال`);
          console.log(`       ${option.description}`);
        });
      } else {
        console.log('   No options found');
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkServiceOptions();