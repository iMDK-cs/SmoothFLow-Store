import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  // Restrict to development environment or explicit debug flag
  const isDevelopment = process.env.NODE_ENV === 'development'
  const debugAllowed = process.env.DEBUG_ALLOW === 'true'
  
  if (!isDevelopment && !debugAllowed) {
    return NextResponse.json(
      { error: 'Not Found' },
      { status: 404 }
    )
  }

  try {
    const debug = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        url: process.env.DATABASE_URL ? '***' : 'Not set',
        connection: 'Testing...'
      },
      nextauth: {
        secret: process.env.NEXTAUTH_SECRET ? '***' : 'Not set',
        url: process.env.NEXTAUTH_URL ? '***' : 'Not set'
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