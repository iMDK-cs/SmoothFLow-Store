import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
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

    const { serviceId } = await request.json()

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      )
    }

    // Check if service has active orders
    const activeOrders = await prisma.orderItem.findFirst({
      where: {
        serviceId,
        order: {
          status: {
            in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS']
          }
        }
      }
    })

    if (activeOrders) {
      return NextResponse.json(
        { error: 'Cannot delete service with active orders' },
        { status: 400 }
      )
    }

    // Delete service (this will cascade delete service options due to foreign key constraints)
    await prisma.service.delete({
      where: { id: serviceId }
    })

    return NextResponse.json({
      message: 'Service deleted successfully'
    })
  } catch (error) {
    console.error('Delete service error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}