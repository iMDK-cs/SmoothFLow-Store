import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions, getUserFromSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get all chat rooms for admin
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string | null } } | null
    const user = await getUserFromSession(session)
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'ACTIVE'
    const priority = searchParams.get('priority')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: {
      status: string
      priority?: string
    } = {
      status
    }

    if (priority) {
      where.priority = priority
    }

    const [chatRooms, totalCount] = await Promise.all([
      prisma.chatRoom.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true }
          },
          admin: {
            select: { id: true, name: true, email: true }
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              message: true,
              createdAt: true,
              sender: {
                select: { id: true, name: true, role: true }
              }
            }
          },
          _count: {
            select: {
              messages: {
                where: {
                  isRead: false,
                  sender: { role: 'USER' }
                }
              }
            }
          }
        },
        orderBy: { lastMessageAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.chatRoom.count({ where })
    ])

    return NextResponse.json({
      chatRooms,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    })
  } catch (error) {
    console.error('Get admin chat rooms error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Assign admin to chat room
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string | null } } | null
    const user = await getUserFromSession(session)
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roomId, action } = await request.json()

    if (!roomId || !action) {
      return NextResponse.json({ error: 'Room ID and action are required' }, { status: 400 })
    }

    let updatedRoom

    switch (action) {
      case 'assign':
        updatedRoom = await prisma.chatRoom.update({
          where: { id: roomId },
          data: { adminId: user.id },
          include: {
            user: {
              select: { id: true, name: true, email: true }
            },
            admin: {
              select: { id: true, name: true, email: true }
            }
          }
        })
        break

      case 'close':
        updatedRoom = await prisma.chatRoom.update({
          where: { id: roomId },
          data: { status: 'CLOSED' },
          include: {
            user: {
              select: { id: true, name: true, email: true }
            },
            admin: {
              select: { id: true, name: true, email: true }
            }
          }
        })
        break

      case 'archive':
        updatedRoom = await prisma.chatRoom.update({
          where: { id: roomId },
          data: { status: 'ARCHIVED' },
          include: {
            user: {
              select: { id: true, name: true, email: true }
            },
            admin: {
              select: { id: true, name: true, email: true }
            }
          }
        })
        break

      case 'setPriority':
        const { priority } = await request.json()
        if (!priority || !['LOW', 'NORMAL', 'HIGH', 'URGENT'].includes(priority)) {
          return NextResponse.json({ error: 'Invalid priority' }, { status: 400 })
        }
        
        updatedRoom = await prisma.chatRoom.update({
          where: { id: roomId },
          data: { priority },
          include: {
            user: {
              select: { id: true, name: true, email: true }
            },
            admin: {
              select: { id: true, name: true, email: true }
            }
          }
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ room: updatedRoom })
  } catch (error) {
    console.error('Admin chat action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
