import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions, getUserFromSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get user's chat rooms
export async function GET() {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string | null } } | null
    const user = await getUserFromSession(session)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const chatRooms = await prisma.chatRoom.findMany({
      where: {
        userId: user.id
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
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
              select: { id: true, name: true }
            }
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: user.id }
              }
            }
          }
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    })

    return NextResponse.json(chatRooms)
  } catch (error) {
    console.error('Get chat rooms error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create new chat room
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string | null } } | null
    const user = await getUserFromSession(session)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subject, priority = 'NORMAL' } = await request.json()

    // Check if user already has an active chat room
    const existingRoom = await prisma.chatRoom.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE'
      }
    })

    if (existingRoom) {
      return NextResponse.json({
        room: existingRoom,
        message: 'You already have an active chat room'
      })
    }

    const chatRoom = await prisma.chatRoom.create({
      data: {
        userId: user.id,
        subject,
        priority,
        lastMessageAt: new Date()
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({ room: chatRoom })
  } catch (error) {
    console.error('Create chat room error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
