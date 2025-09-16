import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, getUserFromSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { sendPaymentConfirmation } from '@/lib/email'

// Initialize Stripe only if secret key is available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    })
  : null

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { 
          error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.',
          details: 'See STRIPE_SETUP.md for instructions'
        }, 
        { status: 503 }
      )
    }

    const session = await getServerSession(authOptions)
    
    const user = await getUserFromSession(session)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, paymentMethodId } = await request.json()

    if (!orderId || !paymentMethodId) {
      return NextResponse.json(
        { error: 'Order ID and payment method ID are required' },
        { status: 400 }
      )
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            service: true,
            option: true,
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Convert to cents
      currency: 'sar',
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}`,
    })

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount: order.totalAmount,
        currency: 'SAR',
        method: 'card',
        gateway: 'stripe',
        transactionId: paymentIntent.id,
        status: paymentIntent.status === 'succeeded' ? 'COMPLETED' : 'PENDING',
        gatewayData: JSON.parse(JSON.stringify(paymentIntent)),
      }
    })

    // Update order status
    if (paymentIntent.status === 'succeeded') {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'COMPLETED',
          paymentId: payment.id,
        }
      })

      // Send payment confirmation email
      try {
        const userData = await prisma.user.findUnique({
          where: { id: user.id },
          select: { name: true, email: true }
        })

        if (userData?.email) {
          await sendPaymentConfirmation({
            orderId: orderId,
            customerName: userData.name || 'عميل',
            customerEmail: userData.email,
            amount: order.totalAmount,
            paymentMethod: 'بطاقة ائتمان',
            transactionId: paymentIntent.id,
            paymentDate: new Date().toLocaleDateString('ar-SA'),
          })
        }
      } catch (emailError) {
        console.error('Failed to send payment confirmation email:', emailError)
        // Don't fail the payment if email fails
      }
    }

    return NextResponse.json({
      paymentIntent,
      payment,
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('Stripe payment error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}