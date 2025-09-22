import { createMocks } from 'node-mocks-http'
import { POST } from '@/app/api/coupons/validate/route'
import { getServerSession } from 'next-auth'

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    coupon: {
      findUnique: jest.fn(),
    },
  },
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockPrisma = require('@/lib/prisma').prisma

describe('/api/coupons/validate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should reject unauthenticated requests', async () => {
    mockGetServerSession.mockResolvedValue(null)

    const { req } = createMocks({
      method: 'POST',
      body: {
        code: 'TEST20',
        orderTotal: 100
      },
    })

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.message).toBe('غير مصرح')
  })

  it('should validate and apply percentage coupon correctly', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' }
    })

    const mockCoupon = {
      id: 'coupon1',
      code: 'TEST20',
      name: 'خصم 20%',
      description: 'خصم 20% على جميع الخدمات',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minAmount: 50,
      maxDiscount: null,
      maxUses: null,
      usedCount: 5,
      active: true,
      validFrom: new Date(Date.now() - 86400000), // Yesterday
      validUntil: new Date(Date.now() + 86400000), // Tomorrow
    }

    mockPrisma.coupon.findUnique.mockResolvedValue(mockCoupon)

    const { req } = createMocks({
      method: 'POST',
      body: {
        code: 'TEST20',
        orderTotal: 100
      },
    })

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.discount).toBe(20) // 20% of 100
    expect(data.newTotal).toBe(80) // 100 - 20
  })

  it('should validate and apply fixed coupon correctly', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' }
    })

    const mockCoupon = {
      id: 'coupon2',
      code: 'SAVE50',
      name: 'خصم 50 ريال',
      discountType: 'FIXED',
      discountValue: 50,
      minAmount: null,
      maxDiscount: null,
      maxUses: null,
      usedCount: 2,
      active: true,
      validFrom: new Date(Date.now() - 86400000),
      validUntil: new Date(Date.now() + 86400000),
    }

    mockPrisma.coupon.findUnique.mockResolvedValue(mockCoupon)

    const { req } = createMocks({
      method: 'POST',
      body: {
        code: 'SAVE50',
        orderTotal: 200
      },
    })

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.discount).toBe(50)
    expect(data.newTotal).toBe(150) // 200 - 50
  })

  it('should reject invalid coupon code', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' }
    })

    mockPrisma.coupon.findUnique.mockResolvedValue(null)

    const { req } = createMocks({
      method: 'POST',
      body: {
        code: 'INVALID',
        orderTotal: 100
      },
    })

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.message).toBe('كود الخصم غير صحيح')
  })

  it('should reject inactive coupon', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' }
    })

    const inactiveCoupon = {
      id: 'coupon3',
      code: 'INACTIVE',
      active: false,
      validFrom: new Date(Date.now() - 86400000),
      validUntil: new Date(Date.now() + 86400000),
    }

    mockPrisma.coupon.findUnique.mockResolvedValue(inactiveCoupon)

    const { req } = createMocks({
      method: 'POST',
      body: {
        code: 'INACTIVE',
        orderTotal: 100
      },
    })

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.message).toBe('كود الخصم غير نشط')
  })

  it('should reject expired coupon', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' }
    })

    const expiredCoupon = {
      id: 'coupon4',
      code: 'EXPIRED',
      active: true,
      validFrom: new Date(Date.now() - 172800000), // 2 days ago
      validUntil: new Date(Date.now() - 86400000), // Yesterday
    }

    mockPrisma.coupon.findUnique.mockResolvedValue(expiredCoupon)

    const { req } = createMocks({
      method: 'POST',
      body: {
        code: 'EXPIRED',
        orderTotal: 100
      },
    })

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.message).toBe('كود الخصم منتهي الصلاحية')
  })

  it('should reject when minimum amount not met', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' }
    })

    const couponWithMinAmount = {
      id: 'coupon5',
      code: 'MIN100',
      active: true,
      minAmount: 100,
      validFrom: new Date(Date.now() - 86400000),
      validUntil: new Date(Date.now() + 86400000),
    }

    mockPrisma.coupon.findUnique.mockResolvedValue(couponWithMinAmount)

    const { req } = createMocks({
      method: 'POST',
      body: {
        code: 'MIN100',
        orderTotal: 50 // Less than minimum
      },
    })

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.message).toContain('الحد الأدنى للطلب')
  })

  it('should apply max discount limit for percentage coupons', async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' }
    })

    const couponWithMaxDiscount = {
      id: 'coupon6',
      code: 'MAXDISCOUNT',
      discountType: 'PERCENTAGE',
      discountValue: 50, // 50%
      maxDiscount: 100, // Max 100 SAR
      active: true,
      validFrom: new Date(Date.now() - 86400000),
      validUntil: new Date(Date.now() + 86400000),
    }

    mockPrisma.coupon.findUnique.mockResolvedValue(couponWithMaxDiscount)

    const { req } = createMocks({
      method: 'POST',
      body: {
        code: 'MAXDISCOUNT',
        orderTotal: 500 // 50% would be 250, but max is 100
      },
    })

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.discount).toBe(100) // Should be capped at maxDiscount
    expect(data.newTotal).toBe(400) // 500 - 100
  })
})