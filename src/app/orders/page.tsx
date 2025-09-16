"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Orders() {
  const { data: session } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Array<{
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
  }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
    fetchOrders()
  }, [session, router])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      const data = await response.json()
      setOrders(data.orders)
    } catch (err) {
      console.error('Failed to load orders:', err)
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'CONFIRMED': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'IN_PROGRESS': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'COMPLETED': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'CANCELLED': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
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
          <p className="text-white text-lg">جاري تحميل الطلبات...</p>
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

  return (
    <div className="min-h-screen bg-gray-900 py-12" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">طلباتي</h1>
            <Link
              href="/"
              className="text-blue-400 hover:text-blue-300"
            >
              ← العودة للصفحة الرئيسية
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="text-xl font-semibold text-white mb-2">لا توجد طلبات</h2>
              <p className="text-gray-400 mb-4">لم تقم بإنشاء أي طلبات بعد</p>
              <Link
                href="/"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                تصفح الخدمات
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{order.orderNumber}</h3>
                      <p className="text-gray-400 text-sm">
                        {new Date(order.createdAt).toLocaleDateString('en-US')}
                      </p>
                    </div>
                    <div className="text-left">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <p className="text-white font-semibold mt-2">
                        {order.totalAmount.toFixed(2)} ريال
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">عدد الخدمات</p>
                      <p className="text-white">{order.items.length} خدمة</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">حالة الدفع</p>
                      <p className={`${getStatusColor(order.paymentStatus || '').split(' ')[1]}`}>
                        {getStatusText(order.paymentStatus || '')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item: { id: string; service: { title: string } }) => (
                        <span key={item.id} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                          {item.service.title}
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                          +{order.items.length - 3} أخرى
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      عرض التفاصيل
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}