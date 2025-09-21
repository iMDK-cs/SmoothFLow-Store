import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const bankTransferSchema = z.object({
  receiptPath: z.string().min(1, 'مسار الإيصال مطلوب'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { orderId } = await params;
    const body = await request.json();
    const { receiptPath } = bankTransferSchema.parse(body);

    // Verify order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    // Update order with bank transfer details
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentMethod: 'bank_transfer',
        bankTransferReceipt: receiptPath,
        bankTransferStatus: 'PENDING_ADMIN_APPROVAL',
        status: 'PENDING_ADMIN_APPROVAL',
        paymentStatus: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'تم إرسال إيصال التحويل بنجاح. سيتم مراجعته من قبل الإدارة قريباً.'
    });
  } catch (error) {
    console.error('Bank transfer error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة الطلب' },
      { status: 500 }
    );
  }
}