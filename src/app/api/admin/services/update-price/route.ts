import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions, getUserFromSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const { serviceId, basePrice } = await request.json()

    if (!serviceId || basePrice === undefined) {
      return NextResponse.json(
        { error: 'Service ID and base price are required' },
        { status: 400 }
      )
    }

    if (basePrice < 0) {
      return NextResponse.json(
        { error: 'Base price cannot be negative' },
        { status: 400 }
      )
    }

    // Update service price
    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: { basePrice },
      include: {
        options: {
          where: { active: true },
          orderBy: { price: 'asc' }
        }
      }
    })

    return NextResponse.json({
      message: 'Service price updated successfully',
      service: updatedService
    })
  } catch (error) {
    console.error('Update service price error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}