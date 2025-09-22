import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const trackingUpdateSchema = z.object({
  status: z.enum(['RECEIVED', 'CONFIRMED', 'IN_PROGRESS', 'TESTING', 'COMPLETED', 'DELIVERED']),
  title: z.string().min(1, 'العنوان مطلوب'),
  description: z.string().optional(),
  notes: z.string().optional()
})

// GET /api/orders/[orderId]/tracking - Get order tracking history
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })
    }

    const { orderId } = params

    // Get order and verify ownership or admin access
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: { id: true, email: true }
        },
        tracking: {
          orderBy: { timestamp: 'asc' }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ message: 'الطلب غير موجود' }, { status: 404 })
    }

    // Check if user owns the order or is admin
    if (order.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'غير مصرح بالوصول لهذا الطلب' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      tracking: order.tracking,
      currentStatus: order.status
    })

  } catch (error) {
    console.error('Error fetching order tracking:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// POST /api/orders/[orderId]/tracking - Add tracking update (Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'غير مصرح - مطلوب صلاحيات الإدارة' }, { status: 403 })
    }

    const { orderId } = params
    const body = await request.json()
    
    // Validate input
    const validatedData = trackingUpdateSchema.parse(body)

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json({ message: 'الطلب غير موجود' }, { status: 404 })
    }

    // Create tracking entry and update order status in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tracking entry
      const tracking = await tx.orderTracking.create({
        data: {
          orderId,
          status: validatedData.status,
          title: validatedData.title,
          description: validatedData.description,
          notes: validatedData.notes,
          adminId: session.user.id
        }
      })

      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { 
          status: validatedData.status,
          updatedAt: new Date()
        }
      })

      return { tracking, order: updatedOrder }
    })

    // Send notification to customer (you can implement this)
    // await sendOrderStatusNotification(order.userId, orderId, validatedData.status, validatedData.title)

    return NextResponse.json({
      success: true,
      message: 'تم تحديث حالة الطلب بنجاح',
      tracking: result.tracking
    })

  } catch (error) {
    console.error('Error adding order tracking:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: 'خطأ في البيانات المدخلة',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}