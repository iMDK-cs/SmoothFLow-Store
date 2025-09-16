"use client"

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function Payment({ params }: { params: Promise<{ orderId: string }> }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [order, setOrder] = useState<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    items: any[];
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  
  // Unwrap the params Promise
  const resolvedParams = use(params)
  const orderId = resolvedParams.orderId

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
    fetchOrder()
  }, [session, orderId, router])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (!response.ok) {
        throw new Error('Order not found')
      }
      const data = await response.json()
      setOrder(data.order)
    } catch (err) {
      console.error('Failed to load order:', err)
      setError('Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  const handleStripePayment = async () => {
    setProcessing(true)
    setError('')

    try {
      const response = await fetch('/api/payments/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          paymentMethodId: 'pm_card_visa', // This would come from Stripe Elements
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed')
      }

      // Redirect to success page
      router.push(`/orders/${orderId}?success=true`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري تحميل تفاصيل الطلب...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">خطأ</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="text-blue-400 hover:text-blue-300"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">الطلب غير موجود</h2>
          <button
            onClick={() => router.push('/')}
            className="text-blue-400 hover:text-blue-300"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">إتمام الدفع</h1>
          
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">تفاصيل الطلب</h2>
            <div className="space-y-2">
              <p className="text-gray-300">رقم الطلب: <span className="text-white font-medium">{order.orderNumber}</span></p>
              <p className="text-gray-300">المجموع: <span className="text-white font-medium">{order.totalAmount.toFixed(2)} ريال</span></p>
              <p className="text-gray-300">الحالة: <span className="text-yellow-400">{order.status}</span></p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">اختر طريقة الدفع</h2>
            
            <div className="space-y-4">
              <button
                onClick={handleStripePayment}
                disabled={processing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {processing ? 'جاري المعالجة...' : 'الدفع بالبطاقة الائتمانية'}
              </button>
            </div>

            {error && (
              <div className="mt-4 text-red-400 text-sm text-center">{error}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}