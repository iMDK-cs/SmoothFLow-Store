#!/usr/bin/env node

/**
 * Migrate Paymob Fields
 * This script adds Paymob fields to existing database
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migratePaymobFields() {
  try {
    console.log('🔄 Starting Paymob fields migration...\n');
    
    // Check if columns already exist by trying to query them
    try {
      await prisma.$queryRaw`SELECT "paymobOrderId" FROM "orders" LIMIT 1`;
      console.log('✅ Paymob fields already exist in orders table');
    } catch (error) {
      console.log('📝 Adding Paymob fields to orders table...');
      
      // Add Paymob fields to orders table
      await prisma.$executeRaw`
        ALTER TABLE "orders" 
        ADD COLUMN IF NOT EXISTS "paymobOrderId" INTEGER,
        ADD COLUMN IF NOT EXISTS "paymobPaymentKey" TEXT,
        ADD COLUMN IF NOT EXISTS "paymobTransactionId" TEXT
      `;
      
      console.log('✅ Paymob fields added to orders table');
    }
    
    // Check if Paymob fields exist in payments table
    try {
      await prisma.$queryRaw`SELECT "paymobTransactionId" FROM "payments" LIMIT 1`;
      console.log('✅ Paymob fields already exist in payments table');
    } catch (error) {
      console.log('📝 Adding Paymob fields to payments table...');
      
      // Add Paymob fields to payments table
      await prisma.$executeRaw`
        ALTER TABLE "payments" 
        ADD COLUMN IF NOT EXISTS "paymobTransactionId" TEXT,
        ADD COLUMN IF NOT EXISTS "paymobOrderId" INTEGER,
        ADD COLUMN IF NOT EXISTS "paymobPaymentKey" TEXT,
        ADD COLUMN IF NOT EXISTS "paymobData" JSONB
      `;
      
      console.log('✅ Paymob fields added to payments table');
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('📊 Database is now ready for Paymob integration');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migratePaymobFields();