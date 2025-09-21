import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paymobService } from '@/lib/paymob';
import { sendOrderStatusEmail } from '@/lib/emailNotifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paymob-signature') || '';

    // Verify webhook signature
    if (!paymobService.verifyWebhookSignature(body, signature)) {
      console.error('Invalid Paymob webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(body);
    console.log('Paymob webhook received:', data);

    // Extract transaction details
    const {
      obj: {
        id: transactionId,
        order: { id: paymobOrderId, merchant_order_id: orderNumber },
        success,
        pending,
        amount_cents,
        currency,
        created_at,
        data: transactionData,
      }
    } = data;

    // Find the order
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { paymobOrderId: paymobOrderId },
          { orderNumber: orderNumber }
        ]
      },
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
      console.error('Order not found for Paymob order ID:', paymobOrderId);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Determine payment status
    let paymentStatus = 'PENDING';
    let orderStatus = 'PENDING';

    if (success && !pending) {
      paymentStatus = 'COMPLETED';
      orderStatus = 'CONFIRMED';
    } else if (pending) {
      paymentStatus = 'PENDING';
      orderStatus = 'PENDING';
    } else {
      paymentStatus = 'FAILED';
      orderStatus = 'CANCELLED';
    }

    // Update order
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: orderStatus,
        paymentStatus: paymentStatus,
        paymobTransactionId: transactionId.toString(),
      },
    });

    // Update payment record
    await prisma.payment.updateMany({
      where: {
        orderId: order.id,
        paymobOrderId: paymobOrderId,
      },
      data: {
        status: paymentStatus,
        transactionId: transactionId.toString(),
        paymobTransactionId: transactionId.toString(),
        paymobData: {
          transactionId,
          paymobOrderId,
          success,
          pending,
          amount_cents,
          currency,
          created_at,
          data: transactionData,
        },
      },
    });

    // Send email notification
    try {
      await sendOrderStatusEmail({
        customerName: order.user.name || 'عميلنا العزيز',
        customerEmail: order.user.email,
        orderNumber: order.orderNumber,
        orderStatus: orderStatus,
        paymentStatus: paymentStatus,
        paymentMethod: 'paymob',
        totalAmount: order.totalAmount,
        items: order.items.map(item => ({
          serviceTitle: item.service.title,
          optionTitle: item.option?.title,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
        })),
      });
    } catch (emailError) {
      console.error('Failed to send order status email:', emailError);
      // Don't fail the webhook if email fails
    }

    console.log(`Order ${order.orderNumber} updated to ${orderStatus} with payment ${paymentStatus}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Paymob webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}