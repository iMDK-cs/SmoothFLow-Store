#!/usr/bin/env node

/**
 * Add discount fields to orders table
 * This script adds the missing discount-related columns to the orders table
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function addDiscountFields() {
  try {
    console.log('🔧 Adding discount fields to orders table...\n');
    
    // Add the missing columns using raw SQL
    const queries = [
      // Add couponId column
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "couponId" TEXT;`,
      
      // Add couponCode column
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "couponCode" TEXT;`,
      
      // Add discountAmount column with default value
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;`
    ];

    // Foreign key constraint (separate handling due to PostgreSQL syntax)
    const constraintQueries = [
      // Check if constraint exists and add if not
      `DO $$ 
       BEGIN
         IF NOT EXISTS (
           SELECT 1 FROM information_schema.table_constraints 
           WHERE constraint_name = 'orders_couponId_fkey' 
           AND table_name = 'orders'
         ) THEN
           ALTER TABLE "orders" ADD CONSTRAINT "orders_couponId_fkey" 
           FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
         END IF;
       END $$;`
    ];

    // Execute column addition queries
    for (const query of queries) {
      console.log(`Executing: ${query.split('\n')[0]}...`);
      await prisma.$executeRawUnsafe(query);
      console.log('✅ Success\n');
    }

    // Execute constraint queries
    for (const query of constraintQueries) {
      console.log('Adding foreign key constraint...');
      await prisma.$executeRawUnsafe(query);
      console.log('✅ Constraint added\n');
    }
    
    console.log('✅ All discount fields added successfully!');
    console.log('\nNew columns added to orders table:');
    console.log('- couponId (TEXT, nullable)');
    console.log('- couponCode (TEXT, nullable)');
    console.log('- discountAmount (DOUBLE PRECISION, default 0)');
    
  } catch (error) {
    console.error('❌ Error adding discount fields:', error);
    
    if (error.code === 'P2010') {
      console.log('\n💡 The columns might already exist. This is normal if you\'ve run this script before.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

addDiscountFields();