import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Use Node.js runtime for Prisma compatibility
export const runtime = 'nodejs'
export const maxDuration = 10 // 10 seconds max

const serviceQuerySchema = z.object({
  category: z.string().optional(),
  featured: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = serviceQuerySchema.parse({
      category: searchParams.get('category'),
      featured: searchParams.get('featured'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
    })

    // Build where clause
    const whereClause: {
      active: boolean
      available: boolean
      category?: string
      popular?: boolean
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' }
        description?: { contains: string; mode: 'insensitive' }
        category?: { contains: string; mode: 'insensitive' }
      }>
    } = {
      active: true,
      available: true,
    }

    if (query.category) {
      whereClause.category = query.category
    }

    if (query.featured === 'true') {
      whereClause.popular = true
    }

    if (query.search) {
      whereClause.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { category: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    // Execute query
    const services = await prisma.service.findMany({
      where: whereClause,
      orderBy: [
        { popular: 'desc' },
        { createdAt: 'desc' }
      ],
      take: query.limit ? parseInt(query.limit) : undefined,
      select: {
        id: true,
        title: true,
        description: true,
        basePrice: true,
        image: true,
        icon: true,
        category: true,
        popular: true,
        available: true,
        active: true,
        stock: true,
        options: {
          where: { active: true },
          select: {
            id: true,
            title: true,
            price: true,
            description: true,
          }
        },
        createdAt: true,
        updatedAt: true,
      }
    })

    // Group services by category for better organization
    const servicesByCategory = services.reduce((acc, service) => {
      const category = service.category || 'أخرى'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(service)
      return acc
    }, {} as Record<string, typeof services>)

    return NextResponse.json({
      success: true,
      data: {
        services,
        servicesByCategory,
        total: services.length,
        categories: Object.keys(servicesByCategory),
      }
    })

  } catch (error) {
    console.error('Services API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'خطأ في معاملات الطلب',
          details: error.issues 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'خطأ في جلب الخدمات' 
      },
      { status: 500 }
    )
  }
}