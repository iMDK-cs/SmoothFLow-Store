import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions, getUserFromSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string | null } } | null
    const user = await getUserFromSession(session)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Get all services with options
    const services = await prisma.service.findMany({
      include: {
        options: {
          where: { active: true },
          orderBy: { price: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ services })
  } catch (error) {
    console.error('Get services error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

const updateServiceSchema = z.object({
  basePrice: z.number().min(0).optional(),
  available: z.boolean().optional(),
  availabilityStatus: z.enum(['available', 'out_of_stock', 'discontinued', 'coming_soon']).optional(),
  stock: z.number().min(0).optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string | null } } | null
    const user = await getUserFromSession(session)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')
    
    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 })
    }

    const body = await request.json()
    const { basePrice, available, availabilityStatus, stock } = updateServiceSchema.parse(body)

    // Prepare update data
    const updateData: any = {
      ...(basePrice !== undefined && { basePrice }),
      ...(available !== undefined && { available }),
      ...(availabilityStatus !== undefined && { availabilityStatus }),
      ...(stock !== undefined && { stock }),
    }

    // If availability status is being updated, also update the timestamp
    if (availabilityStatus !== undefined || available !== undefined) {
      updateData.availabilityUpdatedAt = new Date()
    }

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: updateData
    })

    return NextResponse.json({ service: updatedService })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Update service error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}