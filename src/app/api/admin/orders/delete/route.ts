import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions, getUserFromSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string | null } } | null
    const user = await getUserFromSession(session)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // First delete related payments
    await prisma.payment.deleteMany({
      where: { orderId: orderId }
    })

    // Then delete order items
    await prisma.orderItem.deleteMany({
      where: { orderId: orderId }
    })

    // Finally delete the order
    await prisma.order.delete({
      where: { id: orderId }
    })

    return NextResponse.json({
      message: 'Order deleted successfully'
    })
  } catch (error) {
    console.error('Delete order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}