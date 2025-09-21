const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixServiceAvailability() {
  try {
    console.log('🔧 Fixing service availability...');

    // Get all services
    const services = await prisma.service.findMany();
    console.log(`📊 Found ${services.length} services`);

    // Update water-cooling service to be available
    const waterCoolingService = await prisma.service.findFirst({
      where: { id: 'water-cooling' }
    });

    if (waterCoolingService) {
      console.log('💧 Found water-cooling service:', waterCoolingService.title);
      console.log('📊 Current status:', {
        active: waterCoolingService.active,
        available: waterCoolingService.available,
        availabilityStatus: waterCoolingService.availabilityStatus
      });

      // Update to make it available
      const updated = await prisma.service.update({
        where: { id: 'water-cooling' },
        data: {
          active: true,
          available: true,
          availabilityStatus: 'available',
          availabilityUpdatedAt: new Date()
        }
      });

      console.log('✅ Updated water-cooling service:', {
        active: updated.active,
        available: updated.available,
        availabilityStatus: updated.availabilityStatus
      });
    } else {
      console.log('❌ water-cooling service not found in database');
    }

    // Update custom-build service to be available
    const customBuildService = await prisma.service.findFirst({
      where: { id: 'custom-build' }
    });

    if (customBuildService) {
      console.log('🔧 Found custom-build service:', customBuildService.title);
      console.log('📊 Current status:', {
        active: customBuildService.active,
        available: customBuildService.available,
        availabilityStatus: customBuildService.availabilityStatus
      });

      // Update to make it available
      const updated = await prisma.service.update({
        where: { id: 'custom-build' },
        data: {
          active: true,
          available: true,
          availabilityStatus: 'available',
          availabilityUpdatedAt: new Date()
        }
      });

      console.log('✅ Updated custom-build service:', {
        active: updated.active,
        available: updated.available,
        availabilityStatus: updated.availabilityStatus
      });
    } else {
      console.log('❌ custom-build service not found in database');
    }

    // List all services and their availability
    console.log('\n📋 All services status:');
    const allServices = await prisma.service.findMany({
      select: {
        id: true,
        title: true,
        active: true,
        available: true,
        availabilityStatus: true
      }
    });

    allServices.forEach(service => {
      console.log(`- ${service.id}: ${service.title} | Active: ${service.active} | Available: ${service.available} | Status: ${service.availabilityStatus}`);
    });

    console.log('\n✅ Service availability fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing service availability:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixServiceAvailability();