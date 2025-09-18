#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests the connection to PostgreSQL database
 */

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  console.log('🔍 Testing database connection...');
  console.log('📡 DATABASE_URL:', process.env.DATABASE_URL ? 'Set ✅' : 'Not set ❌');
  console.log('📡 DIRECT_URL:', process.env.DIRECT_URL ? 'Set ✅' : 'Not set ❌');
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    const serviceCount = await prisma.service.count();
    console.log(`🛠️  Total services in database: ${serviceCount}`);
    
    // Test database info
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('🗄️  Database version:', result[0]?.version || 'Unknown');
    
    console.log('🎉 All tests passed! Database is ready.');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'P1001') {
      console.error('💡 This usually means the database server is not reachable.');
      console.error('   Check your DATABASE_URL and make sure the database is running.');
    } else if (error.code === 'P1002') {
      console.error('💡 This usually means the database server was reached but timed out.');
      console.error('   Check your network connection and database server status.');
    } else if (error.code === 'P1003') {
      console.error('💡 This usually means the database does not exist.');
      console.error('   Make sure the database name in your DATABASE_URL is correct.');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testConnection();