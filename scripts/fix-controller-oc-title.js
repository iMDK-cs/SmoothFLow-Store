const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixControllerOcTitle() {
  try {
    console.log('🔧 Fixing controller-oc title...');
    
    await prisma.$connect();
    
    const result = await prisma.service.update({
      where: { id: 'controller-oc' },
      data: { 
        title: 'كسر سرعة القير',
        description: 'رفع أداء استجابة القير'
      }
    });
    
    console.log('✅ Successfully updated controller-oc:');
    console.log(`   Title: ${result.title}`);
    console.log(`   Description: ${result.description}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixControllerOcTitle();