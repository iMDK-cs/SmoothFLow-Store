import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const couponSchema = z.object({
  code: z.string().min(1, 'كود الكوبون مطلوب').max(50, 'كود الكوبون طويل جداً'),
  name: z.string().min(1, 'اسم الكوبون مطلوب').max(100, 'اسم الكوبون طويل جداً'),
  description: z.string().max(500, 'الوصف طويل جداً').optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED'], { message: 'نوع الخصم غير صحيح' }),
  discountValue: z.number().min(0, 'قيمة الخصم يجب أن تكون أكبر من أو تساوي صفر'),
  minAmount: z.number().min(0, 'الحد الأدنى للمبلغ يجب أن يكون أكبر من أو يساوي صفر').optional().nullable(),
  maxDiscount: z.number().min(0, 'الحد الأقصى للخصم يجب أن يكون أكبر من أو يساوي صفر').optional().nullable(),
  maxUses: z.number().min(1, 'عدد مرات الاستخدام يجب أن يكون أكبر من صفر').optional().nullable(),
  validUntil: z.string().datetime('تاريخ انتهاء الصلاحية غير صحيح')
})

// GET /api/admin/coupons - Get all coupons (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'غير مصرح - مطلوب صلاحيات الإدارة' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const search = searchParams.get('search') || ''
    const active = searchParams.get('active')

    let whereClause: any = {}
    
    if (search) {
      whereClause.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (active !== null) {
      whereClause.active = active === 'true'
    }

    const [coupons, totalCount] = await Promise.all([
      prisma.coupon.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.coupon.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      coupons,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json(
      { message: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// POST /api/admin/coupons - Create new coupon (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'غير مصرح - مطلوب صلاحيات الإدارة' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = couponSchema.parse(body)

    // Additional validation
    if (validatedData.discountType === 'PERCENTAGE' && validatedData.discountValue > 100) {
      return NextResponse.json({ message: 'نسبة الخصم لا يمكن أن تزيد عن 100%' }, { status: 400 })
    }

    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: validatedData.code.toUpperCase() }
    })

    if (existingCoupon) {
      return NextResponse.json({ message: 'كود الكوبون موجود مسبقاً' }, { status: 400 })
    }

    // Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        code: validatedData.code.toUpperCase(),
        name: validatedData.name,
        description: validatedData.description || null,
        discountType: validatedData.discountType,
        discountValue: validatedData.discountValue,
        minAmount: validatedData.minAmount || null,
        maxDiscount: validatedData.maxDiscount || null,
        maxUses: validatedData.maxUses || null,
        validUntil: new Date(validatedData.validUntil)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الكوبون بنجاح',
      coupon
    })

  } catch (error) {
    console.error('Error creating coupon:', error)
    
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