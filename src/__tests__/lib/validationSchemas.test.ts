import {
  userRegistrationSchema,
  serviceSchema,
  orderItemSchema,
  sanitizeString,
  formatValidationError
} from '@/lib/validationSchemas'
import { z } from 'zod'

describe('Validation Schemas', () => {
  describe('userRegistrationSchema', () => {
    it('should validate valid user registration data', () => {
      const validData = {
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        phone: '0501234567',
        password: 'Password123'
      }

      const result = userRegistrationSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        name: 'أحمد محمد',
        email: 'invalid-email',
        password: 'Password123'
      }

      expect(() => userRegistrationSchema.parse(invalidData)).toThrow()
    })

    it('should reject weak password', () => {
      const invalidData = {
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        password: 'weak'
      }

      expect(() => userRegistrationSchema.parse(invalidData)).toThrow()
    })

    it('should reject invalid Saudi phone number', () => {
      const invalidData = {
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        phone: '123456789',
        password: 'Password123'
      }

      expect(() => userRegistrationSchema.parse(invalidData)).toThrow()
    })

    it('should accept valid Saudi phone number formats', () => {
      const validFormats = [
        '0501234567',
        '+966501234567',
        '966501234567'
      ]

      validFormats.forEach(phone => {
        const data = {
          name: 'أحمد محمد',
          email: 'ahmed@example.com',
          phone,
          password: 'Password123'
        }

        expect(() => userRegistrationSchema.parse(data)).not.toThrow()
      })
    })
  })

  describe('serviceSchema', () => {
    it('should validate valid service data', () => {
      const validData = {
        title: 'صيانة الكمبيوتر',
        description: 'خدمة صيانة شاملة لأجهزة الكمبيوتر',
        basePrice: 150.00,
        category: 'صيانة',
        popular: false,
        active: true,
        available: true,
        availabilityStatus: 'available' as const
      }

      const result = serviceSchema.parse(validData)
      expect(result.title).toBe(validData.title)
      expect(result.basePrice).toBe(validData.basePrice)
    })

    it('should reject negative price', () => {
      const invalidData = {
        title: 'صيانة الكمبيوتر',
        description: 'خدمة صيانة شاملة لأجهزة الكمبيوتر',
        basePrice: -50,
        category: 'صيانة'
      }

      expect(() => serviceSchema.parse(invalidData)).toThrow()
    })

    it('should reject short description', () => {
      const invalidData = {
        title: 'صيانة الكمبيوتر',
        description: 'قصير',
        basePrice: 150,
        category: 'صيانة'
      }

      expect(() => serviceSchema.parse(invalidData)).toThrow()
    })
  })

  describe('orderItemSchema', () => {
    it('should validate valid order item', () => {
      const validData = {
        serviceId: 'clx1234567890abcdef',
        quantity: 2,
        notes: 'ملاحظات إضافية'
      }

      const result = orderItemSchema.parse(validData)
      expect(result.quantity).toBe(2)
    })

    it('should reject zero quantity', () => {
      const invalidData = {
        serviceId: 'clx1234567890abcdef',
        quantity: 0
      }

      expect(() => orderItemSchema.parse(invalidData)).toThrow()
    })

    it('should reject excessive quantity', () => {
      const invalidData = {
        serviceId: 'clx1234567890abcdef',
        quantity: 20
      }

      expect(() => orderItemSchema.parse(invalidData)).toThrow()
    })
  })

})

describe('Utility Functions', () => {
  describe('sanitizeString', () => {
    it('should remove script tags', () => {
      const input = 'Hello <script>alert("xss")</script> World'
      const result = sanitizeString(input)
      expect(result).toBe('Hello  World')
    })

    it('should remove angle brackets', () => {
      const input = 'Hello <div>World</div>'
      const result = sanitizeString(input)
      expect(result).toBe('Hello World')
    })

    it('should trim whitespace', () => {
      const input = '  Hello World  '
      const result = sanitizeString(input)
      expect(result).toBe('Hello World')
    })

    it('should limit string length', () => {
      const input = 'a'.repeat(2000)
      const result = sanitizeString(input)
      expect(result.length).toBe(1000)
    })
  })

  describe('formatValidationError', () => {
    it('should format Zod validation errors', () => {
      try {
        userRegistrationSchema.parse({
          name: '',
          email: 'invalid',
          password: 'weak'
        })
      } catch (error) {
        if (error instanceof z.ZodError) {
          const formatted = formatValidationError(error)
          expect(formatted.message).toBe('خطأ في التحقق من البيانات')
          expect(formatted.errors).toBeInstanceOf(Array)
          expect(formatted.errors.length).toBeGreaterThan(0)
        }
      }
    })
  })
})