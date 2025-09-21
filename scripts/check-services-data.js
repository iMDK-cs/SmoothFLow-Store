const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkServicesData() {
  console.log('Checking services data...');
  
  try {
    const services = await prisma.service.findMany({
      select: {
        id: true,
        title: true,
        available: true,
        active: true,
        category: true,
        basePrice: true
      }
    });
    
    console.log('Services found:', services.length);
    console.log('Services data:', JSON.stringify(services, null, 2));
    
    // Check ready-builds specifically
    const readyBuilds = services.filter(s => s.category === 'ready-builds');
    console.log('Ready builds:', JSON.stringify(readyBuilds, null, 2));
    
  } catch (error) {
    console.error('❌ Error checking services:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkServicesData();