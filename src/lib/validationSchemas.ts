import { z } from 'zod'

// User validation schemas
export const userRegistrationSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين').max(100, 'الاسم طويل جداً'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().regex(/^(\+966|0)?[5-9][0-9]{8}$/, 'رقم الهاتف غير صحيح').optional(),
  password: z.string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'كلمة المرور يجب أن تحتوي على حروف كبيرة وصغيرة وأرقام')
})

export const userUpdateSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين').max(100, 'الاسم طويل جداً').optional(),
  phone: z.string().regex(/^(\+966|0)?[5-9][0-9]{8}$/, 'رقم الهاتف غير صحيح').optional(),
  currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة').optional(),
  newPassword: z.string()
    .min(8, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'كلمة المرور يجب أن تحتوي على حروف كبيرة وصغيرة وأرقام')
    .optional()
})

// Service validation schemas
export const serviceSchema = z.object({
  title: z.string().min(1, 'عنوان الخدمة مطلوب').max(200, 'العنوان طويل جداً'),
  description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل').max(2000, 'الوصف طويل جداً'),
  basePrice: z.number().min(0, 'السعر يجب أن يكون أكبر من أو يساوي صفر'),
  category: z.string().min(1, 'فئة الخدمة مطلوبة'),
  image: z.string().url('رابط الصورة غير صحيح').optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'لون غير صحيح').optional(),
  popular: z.boolean().default(false),
  active: z.boolean().default(true),
  available: z.boolean().default(true),
  availabilityStatus: z.enum(['available', 'out_of_stock', 'discontinued', 'coming_soon']).default('available'),
  stock: z.number().min(0, 'الكمية يجب أن تكون أكبر من أو تساوي صفر').optional()
})

export const serviceUpdateSchema = serviceSchema.partial()

// Order validation schemas
export const orderItemSchema = z.object({
  serviceId: z.string().cuid('معرف الخدمة غير صحيح'),
  optionId: z.string().cuid('معرف الخيار غير صحيح').optional(),
  quantity: z.number().min(1, 'الكمية يجب أن تكون على الأقل 1').max(10, 'الكمية كبيرة جداً'),
  notes: z.string().max(500, 'الملاحظات طويلة جداً').optional()
})

export const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'يجب إضافة خدمة واحدة على الأقل'),
  notes: z.string().max(1000, 'الملاحظات طويلة جداً').optional(),
  scheduledDate: z.string().datetime('تاريخ غير صحيح').optional(),
  paymentMethod: z.enum(['moyasar', 'paymob', 'bank_transfer']).default('moyasar')
})

// Cart validation schemas
export const cartItemSchema = z.object({
  serviceId: z.string().cuid('معرف الخدمة غير صحيح'),
  optionId: z.string().cuid('معرف الخيار غير صحيح').optional(),
  quantity: z.number().min(1, 'الكمية يجب أن تكون على الأقل 1').max(10, 'الكمية كبيرة جداً')
})

// Payment validation schemas
export const paymentSchema = z.object({
  orderId: z.string().cuid('معرف الطلب غير صحيح'),
  amount: z.number().min(0.01, 'المبلغ يجب أن يكون أكبر من صفر'),
  currency: z.string().length(3, 'العملة يجب أن تكون 3 أحرف').default('SAR'),
  method: z.enum(['card', 'apple_pay', 'stc_pay', 'bank_transfer']),
  returnUrl: z.string().url('رابط العودة غير صحيح').optional()
})

// Booking validation schemas
export const bookingSchema = z.object({
  serviceId: z.string().cuid('معرف الخدمة غير صحيح'),
  date: z.string().datetime('التاريخ غير صحيح'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'الوقت غير صحيح'),
  notes: z.string().max(500, 'الملاحظات طويلة جداً').optional()
})


// Admin validation schemas
export const adminOrderUpdateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  notes: z.string().max(1000, 'الملاحظات طويلة جداً').optional()
})

export const adminUserUpdateSchema = z.object({
  role: z.enum(['USER', 'ADMIN']),
  verified: z.boolean().optional()
})

// File upload validation schemas
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
})

// Search and filter schemas
export const searchSchema = z.object({
  q: z.string().min(1, 'استعلام البحث مطلوب').max(100, 'استعلام البحث طويل جداً').optional(),
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'created_desc']).default('created_desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10)
})

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Common ID validation
export const idSchema = z.string().cuid('معرف غير صحيح')

// Email validation
export const emailSchema = z.string().email('البريد الإلكتروني غير صحيح')

// Phone validation for Saudi Arabia
export const phoneSchema = z.string().regex(/^(\+966|0)?[5-9][0-9]{8}$/, 'رقم الهاتف غير صحيح')

// Utility function to sanitize strings
export const sanitizeString = (str: string): string => {
  return str
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/[<>]/g, '') // Remove < and > characters
    .substring(0, 1000) // Limit length
}

// Validation error formatter
export const formatValidationError = (error: z.ZodError) => {
  return {
    message: 'خطأ في التحقق من البيانات',
    errors: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))
  }
}