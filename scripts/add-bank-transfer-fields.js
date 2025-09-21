const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addBankTransferFields() {
  console.log('Adding bank transfer fields to Order model...');
  
  try {
    // This will be handled by Prisma migration
    // We just need to run: npx prisma db push
    
    console.log('✅ Bank transfer fields will be added via Prisma migration');
    console.log('Run: npx prisma db push');
    
  } catch (error) {
    console.error('❌ Error adding bank transfer fields:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addBankTransferFields();