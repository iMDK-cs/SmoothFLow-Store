import { NextRequest, NextResponse } from 'next/server';
import { moyasarService } from '@/lib/moyasar';
import { prisma } from '@/lib/prisma';
import { sendOrderStatusEmail } from '@/lib/emailNotifications';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-moyasar-signature') || '';

    // Verify webhook signature
    if (!moyasarService.verifyWebhookSignature(payload, signature)) {
      console.error('Invalid Moyasar webhook signature');
      return NextResponse.json({ message: 'Invalid signature' }, { status: 403 });
    }

    const data: {
      id: string;
      status: string;
      metadata?: {
        order_id: string;
        customer_name: string;
        customer_email: string;
      };
    } = JSON.parse(payload);
    console.log('Moyasar webhook received:', data);

    const paymentId = data.id;
    const status = data.status;
    const orderId = data.metadata?.order_id;

    if (!orderId) {
      console.error('Order ID not found in Moyasar webhook');
      return NextResponse.json({ message: 'Order ID not found' }, { status: 400 });
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            service: true,
            option: true,
          },
        },
      },
    });

    if (!order) {
      console.error('Order not found for Moyasar payment:', paymentId);
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // Update payment status
    let paymentStatus: string;
    let orderStatus: string;

    if (status === 'paid') {
      paymentStatus = 'COMPLETED';
      orderStatus = 'PROCESSING';
    } else if (status === 'failed') {
      paymentStatus = 'FAILED';
      orderStatus = 'CANCELLED';
    } else {
      paymentStatus = 'PENDING';
      orderStatus = 'PENDING';
    }

    // Update order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: orderStatus,
        paymentStatus: paymentStatus,
      },
    });

    // Update payment record
    await prisma.payment.updateMany({
      where: {
        orderId: orderId,
        transactionId: paymentId,
      },
      data: {
        status: paymentStatus,
        gatewayData: data,
      },
    });

    // Send email notification
    await sendOrderStatusEmail({
      customerName: order.user.name || 'عميلنا العزيز',
      customerEmail: order.user.email,
      orderNumber: order.orderNumber,
      orderStatus: orderStatus,
      paymentStatus: paymentStatus,
      paymentMethod: 'moyasar',
      totalAmount: order.totalAmount,
      items: order.items.map(item => ({
        serviceTitle: item.service.title,
        optionTitle: item.option?.title,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
      })),
    });

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });

  } catch (error) {
    console.error('Moyasar webhook error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}