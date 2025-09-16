import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      pendingOrders
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          totalAmount: true
        }
      }),
      prisma.order.count({
        where: {
          status: 'PENDING'
        }
      })
    ])

    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingOrders
    })
  } catch (error) {
    console.error('Get admin stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}