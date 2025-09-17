import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions, getUserFromSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const addToCartSchema = z.object({
  serviceId: z.string(),
  optionId: z.string().optional(),
  quantity: z.number().min(1).default(1),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string | null } } | null
    const user = await getUserFromSession(session)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            service: true,
            option: true,
          }
        }
      }
    })

    return NextResponse.json({ cart })
  } catch (error) {
    console.error('Get cart error:', error)
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
    const { serviceId, optionId, quantity } = addToCartSchema.parse(body)
    
    console.log('Add to cart request:', { serviceId, optionId, quantity })

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id }
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id }
      })
    }

    // Check service availability and stock
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { available: true, stock: true, title: true }
    })

    console.log('Service found:', service)

    if (!service) {
      console.log('Service not found:', serviceId)
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (!service.available) {
      console.log('Service not available:', serviceId)
      return NextResponse.json({ error: 'Service is not available' }, { status: 400 })
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        serviceId,
        optionId: optionId || null,
      }
    })

    const totalQuantity = existingItem ? existingItem.quantity + quantity : quantity

    // Check stock if service has limited stock
    if (service.stock !== null && totalQuantity > service.stock) {
      return NextResponse.json({ 
        error: `Only ${service.stock} items available for ${service.title}` 
      }, { status: 400 })
    }

    if (existingItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: totalQuantity }
      })
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          serviceId,
          optionId: optionId || null,
          quantity,
        }
      })
    }

    return NextResponse.json({ message: 'Item added to cart' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Add to cart error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string | null } } | null
    const user = await getUserFromSession(session)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
    }

    await prisma.cartItem.delete({
      where: { id: itemId }
    })

    return NextResponse.json({ message: 'Item removed from cart' })
  } catch (error) {
    console.error('Remove from cart error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}