"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Checkout() {
  const { data: session } = useSession()
  const { state, getTotalPrice } = useCart()
  const router = useRouter()
  const [formData, setFormData] = useState({
    notes: '',
    scheduledDate: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
    if (!state.cart?.items || state.cart.items.length === 0) {
      router.push('/')
      return
    }
  }, [session, state.cart, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate scheduled date is not in the past
      if (formData.scheduledDate) {
        const selectedDate = new Date(formData.scheduledDate)
        const now = new Date()
        now.setHours(0, 0, 0, 0) // Reset time to start of day for comparison
        
        if (selectedDate < now) {
          setError('لا يمكن تحديد تاريخ في الماضي')
          setLoading(false)
          return
        }
      }

      // Prepare order items for payment
      const orderItems = state.cart!.items.map(item => ({
        serviceId: item.serviceId,
        optionId: item.optionId || undefined,
        quantity: item.quantity,
        unitPrice: item.option ? item.option.price : item.service.basePrice,
        totalPrice: (item.option ? item.option.price : item.service.basePrice) * item.quantity,
        notes: '',
      }))

      console.log('Prepared order items for payment:', orderItems)

      // Create a temporary order session (not persisted to database yet)
      const tempOrderData = {
        items: orderItems,
        notes: formData.notes,
        scheduledDate: formData.scheduledDate,
        totalAmount: getTotalPrice(),
        orderNumber: `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      }

      // Store temporary order data in sessionStorage
      sessionStorage.setItem('tempOrderData', JSON.stringify(tempOrderData))

      // Redirect to payment with temporary order data
      router.push(`/payment/temp?total=${tempOrderData.totalAmount}&items=${orderItems.length}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">تسجيل الدخول مطلوب</h2>
          <Link href="/auth/signin" className="text-blue-400 hover:text-blue-300">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    )
  }

  if (!state.cart?.items || state.cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">سلة التسوق فارغة</h2>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            تصفح الخدمات
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">إتمام الطلب</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">ملخص الطلب</h2>
              
              <div className="space-y-4">
                {state.cart.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{item.service.title}</h3>
                      {item.option && (
                        <p className="text-gray-400 text-sm">{item.option.title}</p>
                      )}
                      <p className="text-gray-400 text-sm">الكمية: {item.quantity}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold">
                        {((item.option ? item.option.price : item.service.basePrice) * item.quantity).toFixed(2)} ريال
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">المجموع</span>
                  <span className="text-lg font-semibold text-white">
                    {getTotalPrice().toFixed(2)} ريال
                  </span>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">تفاصيل الطلب</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
                    ملاحظات إضافية (اختياري)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="أي ملاحظات خاصة بالطلب..."
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-300 mb-2">
                    تاريخ موعد الخدمة (اختياري)
                  </label>
                  <input
                    id="scheduledDate"
                    name="scheduledDate"
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                  />
                </div>

                {error && (
                  <div className="text-red-400 text-sm">{error}</div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {loading ? 'جاري إنشاء الطلب...' : 'المتابعة للدفع'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}