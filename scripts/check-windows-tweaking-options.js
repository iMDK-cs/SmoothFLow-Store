const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkWindowsTweakingOptions() {
  try {
    console.log('🔍 Checking options for windows-tweaking service...');
    
    await prisma.$connect();
    
    const service = await prisma.service.findUnique({
      where: { id: 'windows-tweaking' }
    });
    
    if (!service) {
      console.log('❌ Service windows-tweaking not found!');
      return;
    }
    
    console.log(`✅ Service found: ${service.title}`);
    
    const options = await prisma.serviceOption.findMany({
      where: { serviceId: 'windows-tweaking' }
    });
    
    console.log(`📊 Found ${options.length} options:`);
    options.forEach(opt => {
      console.log(`- ID: ${opt.id}`);
      console.log(`  Title: ${opt.title}`);
      console.log(`  Price: ${opt.price} ريال`);
      console.log(`  Description: ${opt.description}`);
      console.log(`  Active: ${opt.active ? 'Yes' : 'No'}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWindowsTweakingOptions();