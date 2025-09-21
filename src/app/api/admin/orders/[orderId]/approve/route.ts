import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendOrderStatusEmail } from '@/lib/emailNotifications';
import { z } from 'zod';

const approveOrderSchema = z.object({
  adminNotes: z.string().optional(),
  action: z.enum(['approve', 'reject']),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { orderId } = await params;
    const body = await request.json();
    const { adminNotes, action } = approveOrderSchema.parse(body);

    // Verify order exists and is a bank transfer order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        paymentMethod: 'bank_transfer',
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

    // Update order based on action
    const updateData = {
      bankTransferStatus: action === 'approve' ? 'APPROVED' : 'REJECTED',
      status: action === 'approve' ? 'CONFIRMED' : 'CANCELLED',
      paymentStatus: action === 'approve' ? 'PAID' : 'FAILED',
      adminNotes: adminNotes || null,
      adminApprovedBy: session.user.id,
      adminApprovedAt: new Date(),
    };

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    // Send email notification to customer
    try {
        await sendOrderStatusEmail({
          customerName: order.user.name || 'عميلنا العزيز',
          customerEmail: order.user.email,
          orderNumber: order.orderNumber,
          orderStatus: updatedOrder.status,
          paymentStatus: updatedOrder.paymentStatus,
          paymentMethod: order.paymentMethod,
          bankTransferStatus: updatedOrder.bankTransferStatus || undefined,
          adminNotes: updatedOrder.adminNotes || undefined,
          totalAmount: order.totalAmount,
          items: order.items.map(item => ({
            serviceTitle: item.service.title,
            optionTitle: item.option?.title,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
          })),
        });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: action === 'approve' 
        ? 'تم الموافقة على الطلب بنجاح' 
        : 'تم رفض الطلب بنجاح'
    });
  } catch (error) {
    console.error('Error approving/rejecting order:', error);
    
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