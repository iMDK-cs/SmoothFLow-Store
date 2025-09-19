import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions, getUserFromSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string | null } } | null
    const user = await getUserFromSession(session)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { serviceId } = params
    const { field } = await request.json()

    // Validate field
    if (!['active', 'available', 'popular'].includes(field)) {
      return NextResponse.json(
        { error: 'Invalid field. Must be one of: active, available, popular' },
        { status: 400 }
      )
    }

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!existingService) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Toggle the field
    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        [field]: !existingService[field as keyof typeof existingService]
      }
    })

    return NextResponse.json({
      success: true,
      message: `Service ${field} status updated successfully`,
      service: {
        id: updatedService.id,
        title: updatedService.title,
        [field]: updatedService[field as keyof typeof updatedService]
      }
    })

  } catch (error) {
    console.error('Service toggle error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}