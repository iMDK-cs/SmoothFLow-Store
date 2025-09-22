import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/reviews/[reviewId]/helpful - Mark review as helpful
export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })
    }

    const { reviewId } = params

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      return NextResponse.json({ message: 'التقييم غير موجود' }, { status: 404 })
    }

    // For simplicity, we'll just increment the helpful count
    // In a more complex system, you'd track which users marked it as helpful
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        helpful: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل تقييمك للمراجعة',
      helpful: updatedReview.helpful
    })

  } catch (error) {
    console.error('Error marking review as helpful:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}