#!/usr/bin/env node

/**
 * Cart Performance Test Script
 * Tests the optimized cart API performance
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCartPerformance() {
  console.log('🚀 Testing cart performance...');

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');

    // Test 1: Service lookup performance
    console.log('\n📊 Test 1: Service lookup performance');
    const serviceStart = Date.now();
    
    const services = await prisma.service.findMany({
      where: { active: true, available: true },
      select: {
        id: true,
        title: true,
        available: true,
        stock: true,
        active: true
      },
      take: 10
    });
    
    const serviceTime = Date.now() - serviceStart;
    console.log(`✅ Service lookup: ${serviceTime}ms (${services.length} services)`);

    // Test 2: Cart operations performance
    console.log('\n📊 Test 2: Cart operations performance');
    
    // Find a test user
    const testUser = await prisma.user.findFirst({
      where: { role: 'USER' }
    });

    if (!testUser) {
      console.log('❌ No test user found');
      return;
    }

    console.log(`👤 Testing with user: ${testUser.email}`);

    // Test cart creation/lookup
    const cartStart = Date.now();
    
    let cart = await prisma.cart.findUnique({
      where: { userId: testUser.id }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: testUser.id }
      });
    }

    const cartTime = Date.now() - cartStart;
    console.log(`✅ Cart lookup/creation: ${cartTime}ms`);

    // Test 3: Cart item operations
    console.log('\n📊 Test 3: Cart item operations');
    
    if (services.length > 0) {
      const testService = services[0];
      const itemStart = Date.now();

      // Check existing item
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          serviceId: testService.id,
          optionId: null,
        }
      });

      const itemTime = Date.now() - itemStart;
      console.log(`✅ Cart item lookup: ${itemTime}ms`);

      // Test item creation/update
      const updateStart = Date.now();
      
      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + 1 }
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            serviceId: testService.id,
            optionId: null,
            quantity: 1,
          }
        });
      }

      const updateTime = Date.now() - updateStart;
      console.log(`✅ Cart item update/create: ${updateTime}ms`);
    }

    // Test 4: Full cart query performance
    console.log('\n📊 Test 4: Full cart query performance');
    const fullCartStart = Date.now();
    
    const fullCart = await prisma.cart.findUnique({
      where: { userId: testUser.id },
      include: {
        items: {
          include: {
            service: {
              select: {
                id: true,
                title: true,
                basePrice: true,
                image: true
              }
            },
            option: {
              select: {
                id: true,
                title: true,
                price: true
              }
            }
          }
        }
      }
    });

    const fullCartTime = Date.now() - fullCartStart;
    console.log(`✅ Full cart query: ${fullCartTime}ms (${fullCart?.items.length || 0} items)`);

    // Test 5: Transaction performance
    console.log('\n📊 Test 5: Transaction performance');
    const transactionStart = Date.now();
    
    await prisma.$transaction(async (tx) => {
      // Simulate add to cart transaction
      const cart = await tx.cart.findUnique({
        where: { userId: testUser.id }
      });

      if (cart) {
        const existingItem = await tx.cartItem.findFirst({
          where: {
            cartId: cart.id,
            serviceId: services[0]?.id,
            optionId: null,
          }
        });

        if (existingItem) {
          await tx.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + 1 }
          });
        }
      }
    });

    const transactionTime = Date.now() - transactionStart;
    console.log(`✅ Transaction: ${transactionTime}ms`);

    // Performance summary
    console.log('\n📈 Performance Summary:');
    console.log(`Service lookup: ${serviceTime}ms`);
    console.log(`Cart operations: ${cartTime}ms`);
    console.log(`Full cart query: ${fullCartTime}ms`);
    console.log(`Transaction: ${transactionTime}ms`);
    
    const totalTime = serviceTime + cartTime + fullCartTime + transactionTime;
    console.log(`Total time: ${totalTime}ms`);

    // Performance recommendations
    console.log('\n💡 Performance Recommendations:');
    
    if (serviceTime > 100) {
      console.log('⚠️  Service lookup is slow - consider adding indexes');
    }
    
    if (fullCartTime > 200) {
      console.log('⚠️  Full cart query is slow - optimize includes');
    }
    
    if (transactionTime > 300) {
      console.log('⚠️  Transaction is slow - check database performance');
    }

    if (totalTime < 500) {
      console.log('✅ Overall performance is good!');
    } else if (totalTime < 1000) {
      console.log('⚠️  Performance could be improved');
    } else {
      console.log('❌ Performance needs optimization');
    }

  } catch (error) {
    console.error('❌ Performance test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testCartPerformance()
  .catch((e) => {
    console.error('❌ Test failed:', e);
    process.exit(1);
  });