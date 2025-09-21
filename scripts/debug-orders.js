const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugOrders() {
  console.log('🔍 Debugging orders database...');
  
  try {
    // Check if orders table exists and has correct structure
    console.log('\n📋 Checking database structure...');
    
    // Try to create a test order
    const testOrderData = {
      userId: 'test-user-id',
      orderNumber: `TEST-${Date.now()}`,
      totalAmount: 100.0,
      paymentMethod: 'stripe',
      items: {
        create: [{
          serviceId: 'custom-build',
          quantity: 1,
          unitPrice: 100.0,
          totalPrice: 100.0,
          notes: 'Test order item'
        }]
      }
    };
    
    console.log('📝 Test order data:', JSON.stringify(testOrderData, null, 2));
    
    // Check if services exist
    const services = await prisma.service.findMany({
      select: { id: true, title: true, active: true }
    });
    console.log('\n🔧 Available services:', services.length);
    console.log('Services:', JSON.stringify(services, null, 2));
    
    // Check users
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    });
    console.log('\n👥 Users in database:', users.length);
    console.log('Users:', JSON.stringify(users, null, 2));
    
  } catch (error) {
    console.error('❌ Database error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  } finally {
    await prisma.$disconnect();
  }
}

debugOrders();