import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions, getUserFromSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendSupportTicketEmail } from '@/lib/emailNotifications'
import { z } from 'zod'

const createTicketSchema = z.object({
  subject: z.string().min(1, 'الموضوع مطلوب'),
  message: z.string().min(10, 'الرسالة يجب أن تكون 10 أحرف على الأقل'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as { user?: { email?: string | null } } | null
    const user = await getUserFromSession(session)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subject, message, priority } = createTicketSchema.parse(body)

    // Generate ticket ID
    const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    // Send email notifications only (no database storage)
    try {
      await sendSupportTicketEmail({
        customerName: user.name || 'عميل',
        customerEmail: user.email || '',
        ticketId: ticketId,
        subject: subject,
        message: message,
        priority: priority,
        adminEmail: process.env.ADMIN_EMAIL || 'admin@smoothflow-sa.com'
      })
      console.log(`Support message email sent for: ${ticketId}`)
    } catch (emailError) {
      console.error('Failed to send support message email:', emailError)
      // Don't fail the request if email fails
    }

    // Also save to database for admin panel viewing
    const ticket = await prisma.supportTicket.create({
      data: {
        id: ticketId,
        userId: user.id,
        subject,
        message,
        priority,
        status: 'OPEN',
      }
    })

    console.log(`Support message created: ${ticket.id} by user ${user.id}`)

    return NextResponse.json({ 
      message: 'تم إرسال رسالة الدعم الفني بنجاح',
      ticketId: ticket.id 
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
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
    const session = await getServerSession(authOptions) as { user?: { email?: string | null } } | null
    const user = await getUserFromSession(session)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: user.id },
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