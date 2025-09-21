import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions, getUserFromSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendOrderStatusEmail } from '@/lib/emailNotifications'

const createOrderSchema = z.object({
  items: z.array(z.object({
    serviceId: z.string(),
    optionId: z.string().nullable().optional(),
    quantity: z.number().min(1),
    unitPrice: z.number(),
    totalPrice: z.number(),
    notes: z.string().optional(),
  })),
  notes: z.string().optional(),
  scheduledDate: z.string().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string | null } } | null
    const user = await getUserFromSession(session)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            service: true,
            option: true,
          }
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string | null } } | null
    const user = await getUserFromSession(session)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Order creation request body:', JSON.stringify(body, null, 2))
    
    const { items, notes, scheduledDate } = createOrderSchema.parse(body)
    console.log('Parsed order data:', { items, notes, scheduledDate })

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0)

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        orderNumber,
        totalAmount,
        notes,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        paymentMethod: 'stripe', // Default payment method
        items: {
          create: items.map(item => ({
            serviceId: item.serviceId,
            optionId: item.optionId || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            notes: item.notes,
          }))
        }
      },
      include: {
        items: {
          include: {
            service: true,
            option: true,
          }
        }
      }
    })

    // Clear cart after successful order
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id }
    })

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      })
    }

    // Send order confirmation email
    try {
      const userData = await prisma.user.findUnique({
        where: { id: user.id },
        select: { name: true, email: true }
      })

      if (userData?.email) {
        await sendOrderStatusEmail({
          customerName: userData.name || 'عميلنا العزيز',
          customerEmail: userData.email,
          orderNumber: order.orderNumber,
          orderStatus: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod || 'stripe',
          totalAmount: order.totalAmount,
          items: order.items.map(item => ({
            serviceTitle: item.service.title,
            optionTitle: item.option?.title,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
          })),
        })
      }
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError)
      // Don't fail the order creation if email fails
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.issues)
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}