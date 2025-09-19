const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mapping of old IDs to new IDs
const serviceIdMappings = {
  'diagnosis': 'Pc-check',
  'format': 'windows-format', 
  'ram-oc': 'bios-tweak',
  'tweak': 'windows-tweaking',
  'custom-windows': 'gaming-windows',
  'network': 'internet-tweak',
  'gpu-drivers': 'controller-oc'
};

async function updateServiceIds() {
  console.log('🔄 Starting service ID updates...');
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    for (const [oldId, newId] of Object.entries(serviceIdMappings)) {
      console.log(`\n🔄 Updating ${oldId} → ${newId}`);
      
      // Check if old service exists
      const oldService = await prisma.service.findUnique({
        where: { id: oldId }
      });
      
      if (!oldService) {
        console.log(`⚠️ Service ${oldId} not found, skipping...`);
        continue;
      }
      
      // Check if new service already exists
      const existingNewService = await prisma.service.findUnique({
        where: { id: newId }
      });
      
      if (existingNewService) {
        console.log(`⚠️ Service ${newId} already exists, skipping...`);
        continue;
      }
      
      // Update service ID
      await prisma.service.update({
        where: { id: oldId },
        data: { id: newId }
      });
      
      // Update service options
      await prisma.serviceOption.updateMany({
        where: { serviceId: oldId },
        data: { serviceId: newId }
      });
      
      // Update order items
      await prisma.orderItem.updateMany({
        where: { serviceId: oldId },
        data: { serviceId: newId }
      });
      
      // Update cart items
      await prisma.cartItem.updateMany({
        where: { serviceId: oldId },
        data: { serviceId: newId }
      });
      
      
      console.log(`✅ Successfully updated ${oldId} → ${newId}`);
    }
    
    console.log('\n🎉 All service ID updates completed successfully!');
    
    // Show updated services
    console.log('\n📊 Updated services:');
    const updatedServices = await prisma.service.findMany({
      where: {
        id: {
          in: Object.values(serviceIdMappings)
        }
      },
      include: {
        options: true
      }
    });
    
    updatedServices.forEach(service => {
      console.log(`\n${service.title} (${service.id})`);
      console.log(`  Price: ${service.basePrice} ريال`);
      console.log(`  Options: ${service.options.length}`);
      service.options.forEach(opt => {
        console.log(`    - ${opt.title}: ${opt.price} ريال`);
      });
    });
    
  } catch (error) {
    console.error('❌ Error updating service IDs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateServiceIds();