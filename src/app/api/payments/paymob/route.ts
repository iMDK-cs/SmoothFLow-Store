import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { paymobService } from '@/lib/paymob';
import { z } from 'zod';

const paymobPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  billingData: z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    phone_number: z.string().min(1, 'Phone number is required'),
    email: z.string().email('Valid email is required'),
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    country: z.string().min(1, 'Country is required'),
    zip_code: z.string().min(1, 'ZIP code is required'),
  }),
  integrationId: z.number().default(3), // Default integration ID for cards
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, billingData, integrationId } = paymobPaymentSchema.parse(body);

    // Get order details
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
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
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    // Check if order already has Paymob data
    const orderWithPaymob = order as typeof order & {
      paymobOrderId?: number;
      paymobPaymentKey?: string;
    };
    
    if (orderWithPaymob.paymobOrderId && orderWithPaymob.paymobPaymentKey) {
      return NextResponse.json({
        success: true,
        paymentKey: orderWithPaymob.paymobPaymentKey,
        orderId: orderWithPaymob.paymobOrderId,
        iframeUrl: paymobService.getIframeUrl(orderWithPaymob.paymobPaymentKey),
      });
    }

    // Create Paymob order
    const paymobOrderData = {
      auth_token: '', // Will be set by service
      delivery_needed: false,
      amount_cents: Math.round(order.totalAmount * 100), // Convert to cents
      currency: 'EGP', // Paymob uses EGP
      merchant_order_id: order.orderNumber,
      items: order.items.map(item => ({
        name: item.service.title,
        amount_cents: Math.round(item.totalPrice * 100),
        description: item.option ? `${item.service.title} - ${item.option.title}` : item.service.title,
        quantity: item.quantity,
      })),
      shipping_data: {
        first_name: billingData.first_name,
        last_name: billingData.last_name,
        phone_number: billingData.phone_number,
        email: billingData.email,
        street: billingData.street,
        city: billingData.city,
        country: billingData.country,
      },
    };

    const paymobOrder = await paymobService.createOrder(paymobOrderData);

    // Generate payment key
    const paymentKeyData = {
      auth_token: '', // Will be set by service
      amount_cents: Math.round(order.totalAmount * 100),
      expiration: 3600, // 1 hour
      order_id: paymobOrder.id,
      billing_data: billingData,
      currency: 'EGP',
      integration_id: integrationId,
      lock_order_when_paid: true,
    };

    const paymentKey = await paymobService.generatePaymentKey(paymentKeyData);

    // Update order with Paymob data
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymobOrderId: paymobOrder.id,
        paymobPaymentKey: paymentKey.token,
        paymentMethod: 'paymob',
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: orderId,
        amount: order.totalAmount,
        currency: 'SAR',
        status: 'PENDING',
        method: 'paymob',
        gateway: 'paymob',
        paymobOrderId: paymobOrder.id,
        paymobPaymentKey: paymentKey.token,
        gatewayData: JSON.parse(JSON.stringify({
          paymobOrder: paymobOrder,
          paymentKey: paymentKey,
        })),
      },
    });

    return NextResponse.json({
      success: true,
      paymentKey: paymentKey.token,
      orderId: paymobOrder.id,
      iframeUrl: paymobService.getIframeUrl(paymentKey.token),
    });

  } catch (error) {
    console.error('Paymob payment error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة الدفع' },
      { status: 500 }
    );
  }
}