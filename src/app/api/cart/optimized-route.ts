import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions, getUserFromSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma-optimized'
import { z } from 'zod'

// Use Node.js runtime for Prisma compatibility
export const runtime = 'nodejs'
export const maxDuration = 5 // 5 seconds max

const addToCartSchema = z.object({
  serviceId: z.string(),
  optionId: z.string().optional(),
  quantity: z.number().min(1).default(1),
})

// In-memory cache for services
const serviceCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 300000 // 5 minutes

// Optimized service lookup with extended caching
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

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Parse request body
    const body = await request.json()
    const { serviceId, optionId, quantity } = addToCartSchema.parse(body)
    
    console.log('Add to cart request:', { serviceId, optionId, quantity })
    
    // Get session and user
    const session = await getServerSession(authOptions) as { user?: { email?: string | null } } | null
    const user = await getUserFromSession(session)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get service with cache
    const service = await getServiceWithCache(serviceId)
    console.log('Service found:', service)

    // Early validation
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (!service.available || !service.active) {
      return NextResponse.json({ error: 'Service is not available' }, { status: 400 })
    }

    // Optimized single transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get or create cart
      let cart = await tx.cart.findUnique({
        where: { userId: user.id }
      })

      if (!cart) {
        cart = await tx.cart.create({
          data: { userId: user.id }
        })
      }

      // Check existing item
      const existingItem = await tx.cartItem.findFirst({
        where: {
          cartId: cart.id,
          serviceId,
          optionId: optionId || null,
        }
      })

      const totalQuantity = existingItem ? existingItem.quantity + quantity : quantity

      // Check stock
      if (service.stock !== null && totalQuantity > service.stock) {
        throw new Error(`Only ${service.stock} items available for ${service.title}`)
      }

      // Update or create item
      if (existingItem) {
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: totalQuantity }
        })
      } else {
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