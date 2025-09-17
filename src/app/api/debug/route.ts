import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const debug = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        url: process.env.DATABASE_URL ? 'Set' : 'Not set',
        connection: 'Testing...'
      },
      nextauth: {
        secret: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
        url: process.env.NEXTAUTH_URL || 'Not set'
      }
    }

    // Test database connection
    try {
      await prisma.$connect()
      await prisma.$queryRaw`SELECT 1`
      debug.database.connection = 'Connected ✅'
    } catch (dbError) {
      debug.database.connection = `Error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`
    } finally {
      await prisma.$disconnect()
    }

    return NextResponse.json(debug, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      error: 'Debug failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}