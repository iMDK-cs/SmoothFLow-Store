import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCachedServices, setCachedServices, createServicesCacheKey } from '@/lib/cache'

// Use Node.js runtime for Prisma compatibility
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const popular = searchParams.get('popular')
    
    // Create cache key
    const cacheKey = createServicesCacheKey(category, popular)
    const cached = getCachedServices(cacheKey)
    
    // Return cached data if still valid
    if (cached) {
      return NextResponse.json({ 
        services: cached,
        cached: true,
        timestamp: Date.now()
      })
    }
    
    // Build query conditions - return all services regardless of availability
    const where: Record<string, unknown> = {
      active: true
    }
    
    if (category) {
      where.category = category
    }
    
    if (popular === 'true') {
      where.popular = true
    }
    
    // Optimized query with minimal data
    const services = await prisma.service.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        basePrice: true,
        category: true,
        image: true,
        icon: true,
        color: true,
        popular: true,
        stock: true,
        available: true,
        availabilityStatus: true,
        active: true
      },
      orderBy: [
        { popular: 'desc' },
        { createdAt: 'desc' }
      ]
    })
    
    // Cache the result
    setCachedServices(cacheKey, services)
    
    return NextResponse.json({ 
      services,
      cached: false,
      timestamp: Date.now()
    })
    
  } catch (error) {
    console.error('Get services error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}