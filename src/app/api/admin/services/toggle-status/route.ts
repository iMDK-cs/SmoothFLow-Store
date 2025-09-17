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

    const { serviceId, active } = await request.json()

    if (!serviceId || active === undefined) {
      return NextResponse.json(
        { error: 'Service ID and active status are required' },
        { status: 400 }
      )
    }

    // Toggle service status
    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: { active },
      include: {
        options: {
          where: { active: true },
          orderBy: { price: 'asc' }
        }
      }
    })

    return NextResponse.json({
      message: `Service ${active ? 'activated' : 'deactivated'} successfully`,
      service: updatedService
    })
  } catch (error) {
    console.error('Toggle service status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}