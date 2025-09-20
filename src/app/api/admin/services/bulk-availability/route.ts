import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions, getUserFromSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const bulkAvailabilitySchema = z.object({
  serviceIds: z.array(z.string()).min(1),
  available: z.boolean(),
  availabilityStatus: z.enum(['available', 'out_of_stock', 'discontinued', 'coming_soon']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string | null } } | null
    const user = await getUserFromSession(session)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { serviceIds, available, availabilityStatus } = bulkAvailabilitySchema.parse(body)

    // Prepare update data
    const updateData = {
      available,
      ...(availabilityStatus && { availabilityStatus }),
      availabilityUpdatedAt: new Date()
    }

    // Update multiple services
    const result = await prisma.service.updateMany({
      where: {
        id: {
          in: serviceIds
        }
      },
      data: updateData
    })

    return NextResponse.json({ 
      message: 'Services updated successfully',
      updatedCount: result.count 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Bulk availability update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}