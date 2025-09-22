'use client'

import React, { useState } from 'react'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { ErrorMessage, SuccessMessage } from './ui/ErrorBoundary'

interface Coupon {
  id: string
  code: string
  name: string
  description?: string
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  minAmount?: number
  maxDiscount?: number
  maxUses?: number
  usedCount: number
  validFrom: string
  validUntil: string
  active: boolean
}

interface CouponSystemProps {
  orderTotal: number
  onCouponApplied: (discount: number, couponCode: string) => void
  onCouponRemoved: () => void
  appliedCoupon?: string
}

export const CouponSystem: React.FC<CouponSystemProps> = ({
  orderTotal,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon
}) => {
  const [couponCode, setCouponCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [couponDetails, setCouponDetails] = useState<Coupon | null>(null)

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('يرجى إدخال كود الخصم')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
          orderTotal
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'كود الخصم غير صحيح')
      }

      const { coupon, discount } = data
      setCouponDetails(coupon)
      setSuccess(`تم تطبيق كود الخصم بنجاح! وفرت ${discount} ريال`)
      onCouponApplied(discount, coupon.code)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  const removeCoupon = () => {
    setCouponCode('')
    setCouponDetails(null)
    setSuccess(null)
    setError(null)
    onCouponRemoved()
  }


  const formatDiscount = (coupon: Coupon): string => {
    if (coupon.discountType === 'PERCENTAGE') {
      return `${coupon.discountValue}%${coupon.maxDiscount ? ` (حد أقصى ${coupon.maxDiscount} ريال)` : ''}`
    } else {
      return `${coupon.discountValue} ريال`
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">كود الخصم</h3>

      {error && (
        <ErrorMessage 
          error={error} 
          className="mb-4" 
          onDismiss={() => setError(null)} 
        />
      )}

      {success && (
        <SuccessMessage 
          message={success} 
          className="mb-4" 
          onDismiss={() => setSuccess(null)} 
        />
      )}

      {!appliedCoupon ? (
        <div className="space-y-4">
          <div className="flex space-x-2 rtl:space-x-reverse">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="أدخل كود الخصم"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              onClick={applyCoupon}
              disabled={loading || !couponCode.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" color="white" className="mr-2" />
                  جاري التحقق...
                </>
              ) : (
                'تطبيق'
              )}
            </button>
          </div>

          <div className="text-sm text-gray-600">
            <p>💡 نصائح لاستخدام كود الخصم:</p>
            <ul className="mt-1 space-y-1 list-disc list-inside text-xs">
              <li>تأكد من إدخال الكود بشكل صحيح</li>
              <li>تحقق من تاريخ انتهاء صلاحية الكود</li>
              <li>بعض الأكواد لها حد أدنى للمبلغ</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-800">
                  تم تطبيق كود الخصم: {appliedCoupon}
                </p>
                {couponDetails && (
                  <p className="text-xs text-green-600 mt-1">
                    {couponDetails.name} - خصم {formatDiscount(couponDetails)}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={removeCoupon}
              className="text-green-600 hover:text-green-800 text-sm underline"
            >
              إزالة
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Admin component for managing coupons
interface AdminCouponManagerProps {
  onCouponCreated?: () => void
}

export const AdminCouponManager: React.FC<AdminCouponManagerProps> = ({
  onCouponCreated
}) => {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: 0,
    minAmount: '',
    maxDiscount: '',
    maxUses: '',
    validUntil: ''
  })

  React.useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/coupons')
      if (!response.ok) throw new Error('فشل في تحميل الكوبونات')
      
      const data = await response.json()
      setCoupons(data.coupons || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  const createCoupon = async () => {
    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          code: formData.code.toUpperCase(),
          minAmount: formData.minAmount ? parseFloat(formData.minAmount) : null,
          maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'فشل في إنشاء الكوبون')
      }

      setShowCreateForm(false)
      setFormData({
        code: '', name: '', description: '', discountType: 'PERCENTAGE',
        discountValue: 0, minAmount: '', maxDiscount: '', maxUses: '', validUntil: ''
      })
      fetchCoupons()
      onCouponCreated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
    }
  }

  const toggleCouponStatus = async (couponId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active })
      })

      if (response.ok) {
        setCoupons(prev => prev.map(coupon => 
          coupon.id === couponId ? { ...coupon, active } : coupon
        ))
      }
    } catch (err) {
      console.error('Failed to toggle coupon status:', err)
    }
  }

  if (loading) {
    return <LoadingSpinner text="جاري تحميل الكوبونات..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">إدارة كوبونات الخصم</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          إضافة كوبون جديد
        </button>
      </div>

      {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}

      {showCreateForm && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">إنشاء كوبون جديد</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                كود الكوبون
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SAVE20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم الكوبون
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="خصم 20%"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الوصف
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="وصف الكوبون..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نوع الخصم
              </label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PERCENTAGE">نسبة مئوية</option>
                <option value="FIXED">مبلغ ثابت</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                قيمة الخصم {formData.discountType === 'PERCENTAGE' ? '(%)' : '(ريال)'}
              </label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max={formData.discountType === 'PERCENTAGE' ? "100" : undefined}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الحد الأدنى للمبلغ (ريال)
              </label>
              <input
                type="number"
                value={formData.minAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, minAmount: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="اختياري"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الحد الأقصى للخصم (ريال)
              </label>
              <input
                type="number"
                value={formData.maxDiscount}
                onChange={(e) => setFormData(prev => ({ ...prev, maxDiscount: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="اختياري"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                عدد مرات الاستخدام
              </label>
              <input
                type="number"
                value={formData.maxUses}
                onChange={(e) => setFormData(prev => ({ ...prev, maxUses: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="غير محدود"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تاريخ انتهاء الصلاحية
              </label>
              <input
                type="datetime-local"
                value={formData.validUntil}
                onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex space-x-3 rtl:space-x-reverse mt-6">
            <button
              onClick={createCoupon}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              إنشاء الكوبون
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Coupons List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {coupons.map((coupon) => (
            <li key={coupon.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {coupon.code} - {coupon.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded ${
                      coupon.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {coupon.active ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {coupon.description}
                  </p>
                  
                  <div className="mt-2 flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-500">
                    <span>خصم: {formatDiscount(coupon)}</span>
                    <span>استخدم: {coupon.usedCount} مرة</span>
                    {coupon.maxUses && <span>من أصل: {coupon.maxUses}</span>}
                    <span>ينتهي: {new Date(coupon.validUntil).toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 rtl:space-x-reverse ml-4">
                  <button
                    onClick={() => toggleCouponStatus(coupon.id, !coupon.active)}
                    className={`px-3 py-1 text-sm rounded ${
                      coupon.active
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {coupon.active ? 'إيقاف' : 'تفعيل'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default CouponSystem