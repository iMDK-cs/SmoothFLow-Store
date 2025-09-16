import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendOrderConfirmation } from '@/lib/email'

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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
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
        userId: session.user.id,
        orderNumber,
        totalAmount,
        notes,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
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
      where: { userId: session.user.id }
    })

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      })
    }

    // Send order confirmation email
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true }
      })

      if (user?.email) {
        await sendOrderConfirmation({
          orderId: order.id,
          customerName: user.name || 'عميل',
          customerEmail: user.email,
          items: order.items.map(item => ({
            serviceName: item.service.title,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
          totalAmount: order.totalAmount,
          orderDate: order.createdAt.toLocaleDateString('ar-SA'),
          status: order.status,
        })
      }
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError)
      // Don't fail the order creation if email fails
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
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