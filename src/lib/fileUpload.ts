import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Use /tmp directory for Vercel compatibility
const UPLOAD_DIR = join('/tmp', 'uploads', 'receipts');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

export interface FileUploadResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  error?: string;
}

export async function uploadReceiptFile(
  file: File,
  orderId: string
): Promise<FileUploadResult> {
  try {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        error: 'نوع الملف غير مدعوم. يرجى رفع ملف PDF أو صورة (JPG, PNG)'
      };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: 'حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت'
      };
    }

    // Create upload directory if it doesn't exist
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `receipt_${orderId}_${timestamp}.${fileExtension}`;
    const filePath = join(UPLOAD_DIR, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return file path for database storage
    // Note: In Vercel, files in /tmp are temporary and will be deleted
    // For production, consider using cloud storage (AWS S3, Cloudinary, etc.)
    const relativePath = `/tmp/uploads/receipts/${fileName}`;

    return {
      success: true,
      filePath: relativePath,
      fileName: fileName
    };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء رفع الملف. يرجى المحاولة مرة أخرى'
    };
  }
}

export function validateFileType(file: File): boolean {
  return ALLOWED_TYPES.includes(file.type);
}

export function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

export function getFileSizeInMB(file: File): string {
  return (file.size / (1024 * 1024)).toFixed(2);
}