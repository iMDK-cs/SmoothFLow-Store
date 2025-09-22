#!/usr/bin/env node

/**
 * Create missing tables for the updated schema
 * This script creates all missing tables and columns
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function createMissingTables() {
  try {
    console.log('🔧 Creating missing tables and fields...\n');
    
    // First, create the coupons table
    const createCouponsTable = `
      CREATE TABLE IF NOT EXISTS "coupons" (
        "id" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "discountType" TEXT NOT NULL,
        "discountValue" DOUBLE PRECISION NOT NULL,
        "minAmount" DOUBLE PRECISION,
        "maxDiscount" DOUBLE PRECISION,
        "maxUses" INTEGER,
        "usedCount" INTEGER NOT NULL DEFAULT 0,
        "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "validUntil" TIMESTAMP(3) NOT NULL,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
      );
    `;

    console.log('Creating coupons table...');
    await prisma.$executeRawUnsafe(createCouponsTable);
    console.log('✅ Coupons table created\n');

    // Add unique constraint for coupon code
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "coupons_code_key" ON "coupons"("code");
    `);
    console.log('✅ Unique constraint added for coupon code\n');

    // Create order_tracking table
    const createOrderTrackingTable = `
      CREATE TABLE IF NOT EXISTS "order_tracking" (
        "id" TEXT NOT NULL,
        "orderId" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "notes" TEXT,
        "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "adminId" TEXT,

        CONSTRAINT "order_tracking_pkey" PRIMARY KEY ("id")
      );
    `;

    console.log('Creating order_tracking table...');
    await prisma.$executeRawUnsafe(createOrderTrackingTable);
    console.log('✅ Order tracking table created\n');

    // Now add the discount fields to orders table
    const orderQueries = [
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "couponId" TEXT;`,
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "couponCode" TEXT;`,
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;`,
      
      // Bank transfer fields
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "bankTransferReceipt" TEXT;`,
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "bankTransferStatus" TEXT;`,
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "adminNotes" TEXT;`,
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "adminApprovedBy" TEXT;`,
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "adminApprovedAt" TIMESTAMP(3);`
    ];

    for (const query of orderQueries) {
      console.log(`Adding column: ${query.split('"')[3]}...`);
      try {
        await prisma.$executeRawUnsafe(query);
        console.log('✅ Success');
      } catch (error) {
        if (error.code === 'P2010' && error.meta?.message?.includes('already exists')) {
          console.log('⚠️  Column already exists, skipping');
        } else {
          throw error;
        }
      }
    }

    // Add foreign key constraints (using DO blocks for safety)
    const constraintQueries = [
      // Foreign key for couponId
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
       END $$;`,
       
      // Foreign key for order tracking
      `DO $$ 
       BEGIN
         IF NOT EXISTS (
           SELECT 1 FROM information_schema.table_constraints 
           WHERE constraint_name = 'order_tracking_orderId_fkey' 
           AND table_name = 'order_tracking'
         ) THEN
           ALTER TABLE "order_tracking" ADD CONSTRAINT "order_tracking_orderId_fkey" 
           FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
         END IF;
       END $$;`
    ];

    console.log('\nAdding foreign key constraints...');
    for (const query of constraintQueries) {
      try {
        await prisma.$executeRawUnsafe(query);
        console.log('✅ Constraint added');
      } catch (error) {
        console.log('⚠️  Constraint might already exist:', error.message);
      }
    }
    
    console.log('✅ All discount fields and tables created successfully!');
    console.log('\nTables and columns added:');
    console.log('- coupons table (complete)');
    console.log('- order_tracking table (complete)');
    console.log('- orders.couponId (TEXT, nullable)');
    console.log('- orders.couponCode (TEXT, nullable)');
    console.log('- orders.discountAmount (DOUBLE PRECISION, default 0)');
    console.log('- orders bank transfer fields');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    
    if (error.code === 'P2010') {
      console.log('\n💡 Some tables/columns might already exist. This is normal if you\'ve run this script before.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createMissingTables();