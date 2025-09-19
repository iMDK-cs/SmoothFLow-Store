#!/usr/bin/env node

/**
 * Test Database Connection
 * This script tests the database connection and displays basic info
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Test basic queries
    const userCount = await prisma.user.count();
    const serviceCount = await prisma.service.count();
    const orderCount = await prisma.order.count();
    
    console.log('\n📊 Database Statistics:');
    console.log(`👥 Users: ${userCount}`);
    console.log(`🛠️  Services: ${serviceCount}`);
    console.log(`📦 Orders: ${orderCount}`);
    
    // Test Arabic text support
    console.log('\n🔤 Testing Arabic text support...');
    const testService = await prisma.service.findFirst({
      where: {
        title: {
          contains: 'تجميع'
        }
      }
    });
    
    if (testService) {
      console.log('✅ Arabic text support working!');
      console.log(`📝 Sample: ${testService.title}`);
    } else {
      console.log('⚠️  No Arabic services found - may need to run migration');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();