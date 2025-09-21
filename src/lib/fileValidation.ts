// Client-side file validation utilities

export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFileType(file: File): boolean {
  return ALLOWED_FILE_TYPES.includes(file.type);
}

export function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

export function getFileSizeInMB(file: File): string {
  return (file.size / (1024 * 1024)).toFixed(2);
}

export function getFileTypeErrorMessage(): string {
  return 'نوع الملف غير مدعوم. يرجى رفع ملف PDF أو صورة (JPG, PNG)';
}

export function getFileSizeErrorMessage(): string {
  return 'حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت';
}