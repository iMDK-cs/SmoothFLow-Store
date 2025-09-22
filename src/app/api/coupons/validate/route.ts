import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const validateCouponSchema = z.object({
  code: z.string().min(1, 'كود الكوبون مطلوب'),
  orderTotal: z.number().min(0, 'مجموع الطلب يجب أن يكون أكبر من أو يساوي صفر')
})

// POST /api/coupons/validate - Validate and apply coupon
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { code, orderTotal } = validateCouponSchema.parse(body)

    // Find the coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!coupon) {
      return NextResponse.json({ message: 'كود الخصم غير صحيح' }, { status: 400 })
    }

    // Check if coupon is active
    if (!coupon.active) {
      return NextResponse.json({ message: 'كود الخصم غير نشط' }, { status: 400 })
    }

    // Check if coupon is still valid (not expired)
    const now = new Date()
    if (now < new Date(coupon.validFrom) || now > new Date(coupon.validUntil)) {
      return NextResponse.json({ message: 'كود الخصم منتهي الصلاحية' }, { status: 400 })
    }

    // Check if coupon has reached max uses
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ message: 'تم استنفاد عدد مرات استخدام هذا الكود' }, { status: 400 })
    }

    // Check minimum amount requirement
    if (coupon.minAmount && orderTotal < coupon.minAmount) {
      return NextResponse.json({ 
        message: `الحد الأدنى للطلب لاستخدام هذا الكود هو ${coupon.minAmount} ريال` 
      }, { status: 400 })
    }

    // Calculate discount
    let discount = 0
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (orderTotal * coupon.discountValue) / 100
      // Apply max discount limit if set
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount
      }
    } else {
      // Fixed discount
      discount = Math.min(coupon.discountValue, orderTotal)
    }

    // Round discount to 2 decimal places
    discount = Math.round(discount * 100) / 100

    return NextResponse.json({
      success: true,
      message: 'تم تطبيق كود الخصم بنجاح',
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount
      },
      discount,
      newTotal: orderTotal - discount
    })

  } catch (error) {
    console.error('Error validating coupon:', error)
    
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