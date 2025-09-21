import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadReceiptFile } from '@/lib/fileUpload';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const orderId = formData.get('orderId') as string;

    if (!file) {
      return NextResponse.json({ error: 'لم يتم رفع أي ملف' }, { status: 400 });
    }

    if (!orderId) {
      return NextResponse.json({ error: 'معرف الطلب مطلوب' }, { status: 400 });
    }

    // Upload file
    const result = await uploadReceiptFile(file, orderId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      filePath: result.filePath,
      fileName: result.fileName
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء رفع الملف' },
      { status: 500 }
    );
  }
}