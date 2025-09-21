import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    // Remove authentication for now - make files public

    const { fileId } = await params;

    // Find the order with the file data
    const order = await prisma.order.findFirst({
      where: {
        id: fileId,
        paymentMethod: 'bank_transfer',
        notes: {
          contains: 'Base64:'
        }
      },
      select: {
        id: true,
        orderNumber: true,
        notes: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 });
    }

    // Extract file data from notes
    const notes = order.notes || '';
    const base64Match = notes.match(/Base64: ([A-Za-z0-9+/=]+)/);
    const typeMatch = notes.match(/Type: ([^\n]+)/);
    const nameMatch = notes.match(/File: ([^\n]+)/);

    if (!base64Match) {
      return NextResponse.json({ error: 'بيانات الملف غير موجودة' }, { status: 404 });
    }

    const base64Data = base64Match[1];
    const fileType = typeMatch ? typeMatch[1] : 'application/pdf';
    const fileName = nameMatch ? nameMatch[1] : `receipt_${order.orderNumber}.pdf`;

    // Clean the base64 data
    const cleanBase64 = base64Data.replace(/[^A-Za-z0-9+/=]/g, '');

    // Convert base64 to buffer
    const buffer = Buffer.from(cleanBase64, 'base64');

    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', fileType);
    headers.set('Content-Disposition', `inline; filename="${fileName}"`);
    headers.set('Cache-Control', 'private, max-age=3600');
    headers.set('X-Content-Type-Options', 'nosniff');

    return new NextResponse(buffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('File serving error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء عرض الملف' },
      { status: 500 }
    );
  }
}