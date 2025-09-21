import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { moyasarService } from '@/lib/moyasar';
import { z } from 'zod';

const moyasarPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId } = moyasarPaymentSchema.parse(body);

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
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    // Check if order already has Moyasar payment
    if (order.paymentId) {
      const existingPayment = await prisma.payment.findFirst({
        where: { orderId: order.id, gateway: 'moyasar' },
      });

      if (existingPayment) {
        return NextResponse.json({
          success: true,
          paymentId: existingPayment.transactionId,
          paymentUrl: moyasarService.getPaymentUrl(existingPayment.transactionId!),
        });
      }
    }

    // Create Moyasar payment intent (redirect to Moyasar checkout)
    const paymentData = {
      amount: Math.round(order.totalAmount * 100), // Convert to halalas
      currency: 'SAR',
      description: `طلب رقم ${order.orderNumber}`,
      callback_url: `${process.env.NEXTAUTH_URL}/api/webhooks/moyasar`,
      metadata: {
        order_id: order.id,
      },
    };

    const moyasarPayment = await moyasarService.createPaymentIntent(paymentData);

    // Update order with payment ID
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId: moyasarPayment.id,
        paymentMethod: 'moyasar',
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        currency: 'SAR',
        status: 'PENDING',
        method: 'moyasar',
        gateway: 'moyasar',
        transactionId: moyasarPayment.id,
        gatewayData: JSON.parse(JSON.stringify({
          moyasarPayment: moyasarPayment,
        })),
      },
    });

    return NextResponse.json({
      success: true,
      paymentId: moyasarPayment.id,
      paymentUrl: moyasarService.getPaymentUrl(moyasarPayment.id),
    });

  } catch (error) {
    console.error('Moyasar payment error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'بيانات غير صالحة', issues: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'حدث خطأ أثناء معالجة الدفع' }, { status: 500 });
  }
}