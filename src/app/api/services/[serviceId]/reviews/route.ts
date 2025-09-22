import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/services/[serviceId]/reviews - Get reviews for a specific service
export async function GET(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const { serviceId } = params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, title: true }
    })

    if (!service) {
      return NextResponse.json({ message: 'الخدمة غير موجودة' }, { status: 404 })
    }

    const [reviews, totalCount, averageRating] = await Promise.all([
      prisma.review.findMany({
        where: { serviceId },
        include: {
          user: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.review.count({ where: { serviceId } }),
      prisma.review.aggregate({
        where: { serviceId },
        _avg: { rating: true }
      })
    ])

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { serviceId },
      _count: { rating: true }
    })

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    ratingDistribution.forEach(item => {
      distribution[item.rating as keyof typeof distribution] = item._count.rating
    })

    return NextResponse.json({
      success: true,
      reviews,
      statistics: {
        totalReviews: totalCount,
        averageRating: averageRating._avg.rating || 0,
        distribution
      },
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching service reviews:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}