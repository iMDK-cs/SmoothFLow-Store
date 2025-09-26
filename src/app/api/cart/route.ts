import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions, getUserFromSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { withRateLimit, cartRateLimit } from '@/lib/rateLimit'

// Use Node.js runtime for Prisma compatibility
export const runtime = 'nodejs'
export const maxDuration = 5 // 5 seconds max

const addToCartSchema = z.object({
  serviceId: z.string(),
  optionId: z.string().optional(),
  quantity: z.number().min(1).default(1),
})

const updateQuantitySchema = z.object({
  itemId: z.string(),
  quantity: z.number().min(1),
})

// Global cache for services (shared across requests)
const serviceCache = new Map<string, { data: { available: boolean; stock: number | null; title: string; active: boolean; basePrice: number } | null; timestamp: number }>()
const CACHE_TTL = 600000 // 10 minutes - longer cache time
const MAX_CACHE_SIZE = 2000 // Increased cache size for better hit rate
// const CART_CACHE_TTL = 30000 // 30 seconds for cart operations - reserved for future use

// Cache cleanup function
function cleanupCache() {
  const now = Date.now()
  for (const [key, value] of serviceCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      serviceCache.delete(key)
    }
  }
  
  // If cache is too large, remove oldest entries
  if (serviceCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(serviceCache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    const toRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE)
    toRemove.forEach(([key]) => serviceCache.delete(key))
  }
}

// Optimized service lookup with caching
async function getServiceWithCache(serviceId: string) {
  const cached = serviceCache.get(serviceId)
  const now = Date.now()
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.data
  }
  
  // Cleanup cache periodically
  if (Math.random() < 0.1) { // 10% chance to cleanup
    cleanupCache()
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
    // Rate limiting check
    const rateLimitCheck = await withRateLimit(cartRateLimit)(request)
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: rateLimitCheck.error },
        { status: 429 }
      )
    }

    // Parse request body first
    const body = await request.json()
    const { serviceId, optionId, quantity } = addToCartSchema.parse(body)
    
    // Get session first
    const session = await getServerSession(authOptions) as { user?: { email?: string | null } } | null
    const user = await getUserFromSession(session)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get service with cache (this should be very fast now)
    const service = await getServiceWithCache(serviceId)

    // Early validation
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (!service.available || !service.active) {
      return NextResponse.json({ error: 'Service is not available' }, { status: 400 })
    }

    // Ultra-optimized single transaction with upsert
    await prisma.$transaction(async (tx) => {
      // Upsert cart (create if not exists, update if exists)
      const cart = await tx.cart.upsert({
        where: { userId: user.id },
        update: { updatedAt: new Date() },
        create: { userId: user.id }
      })

      // Check stock if service has limited stock (do this before upsert)
      if (service.stock !== null) {
        const existingQuantity = await tx.cartItem.findFirst({
          where: {
            cartId: cart.id,
            serviceId,
            optionId: optionId || null,
          },
          select: { quantity: true }
        })
        
        const totalQuantity = (existingQuantity?.quantity || 0) + quantity
        if (totalQuantity > service.stock) {
          throw new Error(`Only ${service.stock} items available for ${service.title}`)
        }
      }

      // Check if item already exists and update or create
      const existingItem = await tx.cartItem.findFirst({
        where: {
          cartId: cart.id,
          serviceId,
          optionId: optionId || null,
        }
      })

      if (existingItem) {
        // Update existing item
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: { increment: quantity },
            updatedAt: new Date()
          }
        })
      } else {
        // Create new item
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            serviceId,
            optionId: optionId || null,
            quantity,
          }
        })
      }

      return { success: true, cartId: cart.id }
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

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string | null } } | null
    const user = await getUserFromSession(session)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { itemId, quantity } = updateQuantitySchema.parse(body)

    // Verify ownership before update
    const cartItem = await prisma.cartItem.findFirst({
      where: { 
        id: itemId,
        cart: { userId: user.id }
      }
    })

    if (!cartItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity }
    })

    return NextResponse.json({ message: 'Quantity updated successfully' })
  } catch (error) {
    console.error('Update quantity error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
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