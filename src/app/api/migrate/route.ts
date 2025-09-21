import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    console.log('🔄 Starting Vercel migration...')
    
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Check if Paymob fields exist in orders table
    try {
      await prisma.$queryRaw`SELECT "paymobOrderId" FROM "orders" LIMIT 1`
      console.log('✅ Paymob fields already exist in orders table')
    } catch {
      console.log('📝 Adding Paymob fields to orders table...')
      
      // Add Paymob fields to orders table
      await prisma.$executeRaw`
        ALTER TABLE "orders" 
        ADD COLUMN IF NOT EXISTS "paymobOrderId" INTEGER,
        ADD COLUMN IF NOT EXISTS "paymobPaymentKey" TEXT,
        ADD COLUMN IF NOT EXISTS "paymobTransactionId" TEXT
      `
      
      console.log('✅ Paymob fields added to orders table')
    }
    
    // Check if Paymob fields exist in payments table
    try {
      await prisma.$queryRaw`SELECT "paymobTransactionId" FROM "payments" LIMIT 1`
      console.log('✅ Paymob fields already exist in payments table')
    } catch {
      console.log('📝 Adding Paymob fields to payments table...')
      
      // Add Paymob fields to payments table
      await prisma.$executeRaw`
        ALTER TABLE "payments" 
        ADD COLUMN IF NOT EXISTS "paymobTransactionId" TEXT,
        ADD COLUMN IF NOT EXISTS "paymobOrderId" INTEGER,
        ADD COLUMN IF NOT EXISTS "paymobPaymentKey" TEXT,
        ADD COLUMN IF NOT EXISTS "paymobData" JSONB
      `
      
      console.log('✅ Paymob fields added to payments table')
    }
    
    // Test creating a simple order to verify the schema
    console.log('🧪 Testing order creation...')
    const testOrder = await prisma.order.create({
      data: {
        userId: 'test-user-id',
        orderNumber: 'TEST-' + Date.now(),
        totalAmount: 0,
        paymentMethod: 'test',
        items: {
          create: []
        }
      }
    })
    
    await prisma.order.delete({
      where: { id: testOrder.id }
    })
    
    console.log('✅ Order creation test passed')
    console.log('🎉 Vercel migration completed successfully!')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Migration completed successfully' 
    })
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}