import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: true }
    })

    if (!cart) {
      return NextResponse.json({ message: 'Cart not found' }, { status: 404 })
    }

    // Delete all cart items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    })

    return NextResponse.json({ message: 'Cart cleared successfully' })
  } catch (error) {
    console.error('Clear cart error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}