import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        active: true,
        available: true,
        basePrice: true
      }
    })

    return NextResponse.json({
      count: services.length,
      services: services
    })
  } catch (error) {
    console.error('Debug services error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}