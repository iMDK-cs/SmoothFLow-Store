import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions, getUserFromSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Get admin dashboard data
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      pendingOrders,
      totalSupportTickets,
      openSupportTickets,
      recentOrders,
      topServices,
      monthlyStats
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { paymentStatus: 'COMPLETED' },
        _sum: { totalAmount: true }
      }),
      prisma.order.count({
        where: { status: 'PENDING' }
      }),
      prisma.supportTicket.count(),
      prisma.supportTicket.count({
        where: { status: 'OPEN' }
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: {
            include: {
              service: { select: { title: true } },
              option: { select: { title: true } }
            }
          }
        }
      }),
      prisma.orderItem.groupBy({
        by: ['serviceId'],
        _count: { serviceId: true },
        _sum: { totalPrice: true },
        orderBy: { _count: { serviceId: 'desc' } },
        take: 5
      }),
      prisma.order.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        _sum: { totalAmount: true },
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ])

    const stats = {
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingOrders,
      totalSupportTickets,
      openSupportTickets,
      recentOrders,
      topServices: await Promise.all(
        topServices.map(async (service) => {
          const serviceData = await prisma.service.findUnique({
            where: { id: service.serviceId },
            select: { title: true }
          })
          return {
            id: service.serviceId,
            title: serviceData?.title || 'Unknown Service',
            orderCount: service._count.serviceId || 0,
            revenue: service._sum.totalPrice || 0
          }
        })
      ),
      monthlyStats: monthlyStats || []
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}