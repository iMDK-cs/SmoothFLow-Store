import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
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