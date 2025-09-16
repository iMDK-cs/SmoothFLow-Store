import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createReviewSchema = z.object({
  serviceId: z.string(),
  orderId: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')

    const reviews = await prisma.review.findMany({
      where: serviceId ? { serviceId } : {},
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        },
        service: {
          select: {
            id: true,
            title: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { serviceId, orderId, rating, comment } = createReviewSchema.parse(body)

    // Check if user already reviewed this service
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        serviceId,
        orderId: orderId || null,
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this service' },
        { status: 400 }
      )
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        serviceId,
        orderId,
        rating,
        comment,
        verified: true, // Auto-verify for now
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        },
        service: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}