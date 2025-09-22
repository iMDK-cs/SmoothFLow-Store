import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateCouponSchema = z.object({
  name: z.string().min(1, 'اسم الكوبون مطلوب').max(100, 'اسم الكوبون طويل جداً').optional(),
  description: z.string().max(500, 'الوصف طويل جداً').optional().nullable(),
  discountType: z.enum(['PERCENTAGE', 'FIXED'], { message: 'نوع الخصم غير صحيح' }).optional(),
  discountValue: z.number().min(0, 'قيمة الخصم يجب أن تكون أكبر من أو تساوي صفر').optional(),
  minAmount: z.number().min(0, 'الحد الأدنى للمبلغ يجب أن يكون أكبر من أو يساوي صفر').optional().nullable(),
  maxDiscount: z.number().min(0, 'الحد الأقصى للخصم يجب أن يكون أكبر من أو يساوي صفر').optional().nullable(),
  maxUses: z.number().min(1, 'عدد مرات الاستخدام يجب أن يكون أكبر من صفر').optional().nullable(),
  validUntil: z.string().datetime('تاريخ انتهاء الصلاحية غير صحيح').optional(),
  active: z.boolean().optional()
})

// GET /api/admin/coupons/[couponId] - Get specific coupon (Admin only)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ couponId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'غير مصرح - مطلوب صلاحيات الإدارة' }, { status: 403 })
    }

    const { couponId } = await context.params

    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            discountAmount: true,
            createdAt: true,
            user: {
              select: { name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10 // Last 10 orders that used this coupon
        }
      }
    })

    if (!coupon) {
      return NextResponse.json({ message: 'الكوبون غير موجود' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      coupon
    })

  } catch (error) {
    console.error('Error fetching coupon:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/coupons/[couponId] - Update coupon (Admin only)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ couponId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'غير مصرح - مطلوب صلاحيات الإدارة' }, { status: 403 })
    }

    const { couponId } = await context.params
    const body = await request.json()
    const validatedData = updateCouponSchema.parse(body)

    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id: couponId }
    })

    if (!existingCoupon) {
      return NextResponse.json({ message: 'الكوبون غير موجود' }, { status: 404 })
    }

    // Additional validation
    if (validatedData.discountType === 'PERCENTAGE' && validatedData.discountValue && validatedData.discountValue > 100) {
      return NextResponse.json({ message: 'نسبة الخصم لا يمكن أن تزيد عن 100%' }, { status: 400 })
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {}
    
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.discountType !== undefined) updateData.discountType = validatedData.discountType
    if (validatedData.discountValue !== undefined) updateData.discountValue = validatedData.discountValue
    if (validatedData.minAmount !== undefined) updateData.minAmount = validatedData.minAmount
    if (validatedData.maxDiscount !== undefined) updateData.maxDiscount = validatedData.maxDiscount
    if (validatedData.maxUses !== undefined) updateData.maxUses = validatedData.maxUses
    if (validatedData.validUntil !== undefined) updateData.validUntil = new Date(validatedData.validUntil)
    if (validatedData.active !== undefined) updateData.active = validatedData.active

    // Update coupon
    const updatedCoupon = await prisma.coupon.update({
      where: { id: couponId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الكوبون بنجاح',
      coupon: updatedCoupon
    })

  } catch (error) {
    console.error('Error updating coupon:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: 'خطأ في البيانات المدخلة',
          errors: error.issues.map(err => ({
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

// DELETE /api/admin/coupons/[couponId] - Delete coupon (Admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ couponId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'غير مصرح - مطلوب صلاحيات الإدارة' }, { status: 403 })
    }

    const { couponId } = await context.params

    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      include: {
        orders: {
          select: { id: true }
        }
      }
    })

    if (!existingCoupon) {
      return NextResponse.json({ message: 'الكوبون غير موجود' }, { status: 404 })
    }

    // Check if coupon has been used in any orders
    if (existingCoupon.orders.length > 0) {
      return NextResponse.json({ 
        message: 'لا يمكن حذف الكوبون لأنه تم استخدامه في طلبات سابقة. يمكنك إيقافه بدلاً من ذلك.' 
      }, { status: 400 })
    }

    // Delete coupon
    await prisma.coupon.delete({
      where: { id: couponId }
    })

    return NextResponse.json({
      success: true,
      message: 'تم حذف الكوبون بنجاح'
    })

  } catch (error) {
    console.error('Error deleting coupon:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}