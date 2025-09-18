import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions, getUserFromSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Enable Edge Runtime for better performance
export const runtime = 'edge'

const addToCartSchema = z.object({
  serviceId: z.string(),
  optionId: z.string().optional(),
  quantity: z.number().min(1).default(1),
})

// Cache for frequently accessed data (in-memory cache for Edge Runtime)
const serviceCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 30000 // 30 seconds

// Optimized service lookup with caching
async function getServiceWithCache(serviceId: string) {
  const cached = serviceCache.get(serviceId)
  const now = Date.now()
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.data
  }
  
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { 
      available: true, 
      stock: true, 
      title: true,
      active: true,
      basePrice: true
    }
  })
  
  if (service) {
    serviceCache.set(serviceId, { data: service, timestamp: now })
  }
  
  return service
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string | null } } | null
    const user = await getUserFromSession(session)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Optimized cart query with minimal data
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          select: {
            id: true,
            quantity: true,
            serviceId: true,
            optionId: true,
            service: {
              select: {
                id: true,
                title: true,
                basePrice: true,
                image: true
              }
            },
            option: {
              select: {
                id: true,
                title: true,
                price: true
              }
            }
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
  const startTime = Date.now()
  
  try {
    // Parse request body first
    const body = await request.json()
    const { serviceId, optionId, quantity } = addToCartSchema.parse(body)
    
    // Get session and user in parallel
    const [session, service] = await Promise.all([
      getServerSession(authOptions) as Promise<{ user?: { email?: string | null } } | null>,
      getServiceWithCache(serviceId)
    ])
    
    const user = await getUserFromSession(session)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Early validation
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (!service.available || !service.active) {
      return NextResponse.json({ error: 'Service is not available' }, { status: 400 })
    }

    // Use transaction for atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // Get or create cart and check existing item in parallel
      const [cart, existingItem] = await Promise.all([
        tx.cart.findUnique({
          where: { userId: user.id }
        }),
        tx.cartItem.findFirst({
          where: {
            serviceId,
            optionId: optionId || null,
          },
          select: { id: true, quantity: true, cartId: true }
        })
      ])

      let finalCart = cart
      if (!cart) {
        finalCart = await tx.cart.create({
          data: { userId: user.id }
        })
      }

      const totalQuantity = existingItem ? existingItem.quantity + quantity : quantity

      // Check stock if service has limited stock
      if (service.stock !== null && totalQuantity > service.stock) {
        throw new Error(`Only ${service.stock} items available for ${service.title}`)
      }

      // Update or create cart item
      if (existingItem) {
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: totalQuantity }
        })
      } else {
        await tx.cartItem.create({
          data: {
            cartId: finalCart.id,
            serviceId,
            optionId: optionId || null,
            quantity,
          }
        })
      }

      return { success: true, cartId: finalCart.id }
    })

    const executionTime = Date.now() - startTime
    console.log(`Add to cart completed in ${executionTime}ms`)

    // Return minimal response for better performance
    return NextResponse.json({ 
      success: true,
      message: 'Item added to cart',
      executionTime 
    })
    
  } catch (error) {
    const executionTime = Date.now() - startTime
    console.error(`Add to cart error (${executionTime}ms):`, error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('Only')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

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

    // Verify ownership before deletion
    const cartItem = await prisma.cartItem.findFirst({
      where: { 
        id: itemId,
        cart: { userId: user.id }
      }
    })

    if (!cartItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
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