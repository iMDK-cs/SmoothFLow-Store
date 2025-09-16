import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendSupportTicket } from '@/lib/email'

const createTicketSchema = z.object({
  subject: z.string().min(1, 'الموضوع مطلوب'),
  message: z.string().min(10, 'الرسالة يجب أن تكون 10 أحرف على الأقل'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subject, message, priority } = createTicketSchema.parse(body)

    // Generate ticket ID
    const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    // Create support ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        id: ticketId,
        userId: session.user.id,
        subject,
        message,
        priority,
        status: 'OPEN',
      }
    })

    // Send confirmation email
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true }
      })

      if (user?.email) {
        await sendSupportTicket({
          ticketId: ticket.id,
          customerName: user.name || 'عميل',
          customerEmail: user.email,
          subject: ticket.subject,
          message: ticket.message,
          priority: ticket.priority,
          createdAt: ticket.createdAt.toLocaleDateString('ar-SA'),
        })
      }
    } catch (emailError) {
      console.error('Failed to send support ticket email:', emailError)
      // Don't fail the ticket creation if email fails
    }

    return NextResponse.json({ ticket }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create support ticket error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Get support tickets error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}