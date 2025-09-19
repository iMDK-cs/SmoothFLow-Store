import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Enable Edge Runtime for better performance
export const runtime = 'edge'

// Cache for services data
const servicesCache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 60000 // 1 minute

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const popular = searchParams.get('popular')
    
    // Create cache key
    const cacheKey = `services-${category || 'all'}-${popular || 'all'}`
    const cached = servicesCache.get(cacheKey)
    const now = Date.now()
    
    // Return cached data if still valid
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      return NextResponse.json({ 
        services: cached.data,
        cached: true,
        timestamp: cached.timestamp
      })
    }
    
    // Build query conditions
    const where: Record<string, unknown> = {
      active: true,
      available: true
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
        stock: true
      },
      orderBy: [
        { popular: 'desc' },
        { createdAt: 'desc' }
      ]
    })
    
    // Cache the result
    servicesCache.set(cacheKey, { data: services, timestamp: now })
    
    return NextResponse.json({ 
      services,
      cached: false,
      timestamp: now
    })
    
  } catch (error) {
    console.error('Get services error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}