const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updatePcCheckPrice() {
  try {
    console.log('🔧 Updating PC check service price to 50 SAR...');

    // Update the service price in database
    const result = await prisma.service.updateMany({
      where: { id: 'Pc-check' },
      data: { basePrice: 50 }
    });

    console.log(`✅ Updated ${result.count} services in database`);

    // Verify the update
    const service = await prisma.service.findUnique({
      where: { id: 'Pc-check' },
      select: { id: true, title: true, basePrice: true }
    });

    if (service) {
      console.log('📊 Service details:', {
        id: service.id,
        title: service.title,
        basePrice: service.basePrice
      });
    }

    console.log('✅ Price update completed successfully!');
  } catch (error) {
    console.error('❌ Error updating price:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePcCheckPrice();