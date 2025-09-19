const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixWindowsTweakingOptions() {
  try {
    console.log('🔧 Fixing windows-tweaking options...');
    
    await prisma.$connect();
    
    // Delete existing options
    await prisma.serviceOption.deleteMany({
      where: { serviceId: 'windows-tweaking' }
    });
    
    console.log('✅ Deleted existing options');
    
    // Create new options with correct IDs
    const option1 = await prisma.serviceOption.create({
      data: {
        serviceId: 'windows-tweaking',
        title: 'بدون فورمات',
        description: 'تحسين الويندوز الحالي',
        price: 0, // Base price is already 100, so option adds 0
        active: true
      }
    });
    
    console.log(`✅ Created option: ${option1.title} (${option1.id})`);
    
    const option2 = await prisma.serviceOption.create({
      data: {
        serviceId: 'windows-tweaking',
        title: 'مع فورمات',
        description: 'تحسين + فورمات كامل للنظام',
        price: 30, // Adds 30 to base price of 100
        active: true
      }
    });
    
    console.log(`✅ Created option: ${option2.title} (${option2.id})`);
    
    // Update the frontend to use the new IDs
    console.log('\n📝 Frontend should use these option IDs:');
    console.log(`- without-format: ${option1.id}`);
    console.log(`- with-format: ${option2.id}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixWindowsTweakingOptions();