const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addBankTransferFields() {
  try {
    console.log('Adding bank transfer fields to existing orders...');
    
    // Update existing orders to have default bank transfer status
    const updatedOrders = await prisma.order.updateMany({
      where: {
        bankTransferStatus: null
      },
      data: {
        bankTransferStatus: 'PENDING'
      }
    });
    
    console.log(`Updated ${updatedOrders.count} orders with default bank transfer status`);
    
    console.log('Bank transfer fields added successfully!');
  } catch (error) {
    console.error('Error adding bank transfer fields:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addBankTransferFields()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });