"use client"

import { useState, useEffect, use, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function OrderDetails({ params }: { params: Promise<{ orderId: string }> }) {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
    items: Array<{
      id: string;
      service: { title: string };
      quantity: number;
      unitPrice: number;
    }>;
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const isSuccess = searchParams.get('success') === 'true'
  
  // Unwrap the params Promise
  const resolvedParams = use(params)
  const orderId = resolvedParams.orderId

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
    fetchOrder()
  }, [session, orderId, router, fetchOrder])

  const fetchOrder = useCallback(async () => {
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
  }, [orderId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-400'
      case 'CONFIRMED': return 'text-blue-400'
      case 'IN_PROGRESS': return 'text-purple-400'
      case 'COMPLETED': return 'text-green-400'
      case 'CANCELLED': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'في الانتظار'
      case 'CONFIRMED': return 'تم التأكيد'
      case 'IN_PROGRESS': return 'قيد التنفيذ'
      case 'COMPLETED': return 'مكتمل'
      case 'CANCELLED': return 'ملغي'
      default: return status
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
        <div className="max-w-4xl mx-auto">
          {isSuccess && (
            <div className="bg-green-800/20 border border-green-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-400 font-medium">تم إنشاء الطلب بنجاح!</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">تفاصيل الطلب</h1>
            <Link
              href="/orders"
              className="text-blue-400 hover:text-blue-300"
            >
              ← العودة لجميع الطلبات
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">معلومات الطلب</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">رقم الطلب</p>
                    <p className="text-white font-medium">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">تاريخ الطلب</p>
                    <p className="text-white font-medium">
                      {new Date(order.createdAt).toLocaleDateString('en-US')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">الحالة</p>
                    <p className={`font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">حالة الدفع</p>
                    <p className={`font-medium ${getStatusColor(order.paymentStatus)}`}>
                      {getStatusText(order.paymentStatus)}
                    </p>
                  </div>
                </div>
                {order.notes && (
                  <div className="mt-4">
                    <p className="text-gray-400 text-sm">ملاحظات</p>
                    <p className="text-white">{order.notes}</p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">الخدمات المطلوبة</h2>
                <div className="space-y-4">
                  {order.items.map((item: { id: string; service: { title: string }; option?: { title: string }; quantity: number; unitPrice: number }) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{item.service.title}</h3>
                        {item.option && (
                          <p className="text-gray-400 text-sm">{item.option.title}</p>
                        )}
                        <p className="text-gray-400 text-sm">الكمية: {item.quantity}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-white font-semibold">
                          {item.totalPrice.toFixed(2)} ريال
                        </p>
                        <p className="text-gray-400 text-sm">
                          {item.unitPrice.toFixed(2)} ريال × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">ملخص الطلب</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">المجموع الفرعي</span>
                    <span className="text-white">{order.totalAmount.toFixed(2)} ريال</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">الضريبة</span>
                    <span className="text-white">0.00 ريال</span>
                  </div>
                  <div className="border-t border-gray-700 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-white">المجموع الكلي</span>
                      <span className="text-lg font-semibold text-white">{order.totalAmount.toFixed(2)} ريال</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">معلومات التواصل</h2>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm">البريد الإلكتروني</p>
                  <p className="text-white">{session?.user?.email}</p>
                  <p className="text-gray-400 text-sm">الاسم</p>
                  <p className="text-white">{session?.user?.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}