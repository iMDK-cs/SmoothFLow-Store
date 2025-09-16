"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  paymentStatus: string
  notes?: string
  scheduledDate?: string
  createdAt: string
  user: {
    name: string | null
    email: string
  }
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    totalPrice: number
    service: {
      title: string
    }
    option?: {
      title: string
    }
  }>
}

export default function AdminOrders() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchOrders()
  }, [session, status, router])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/orders')
      
      if (!response.ok) {
        if (response.status === 403) {
          setError('ليس لديك صلاحية للوصول إلى هذه الصفحة')
          return
        }
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data.orders)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('حدث خطأ أثناء تحميل الطلبات')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(orderId)
      const response = await fetch('/api/admin/orders/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          status: newStatus
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      await fetchOrders()
    } catch (error) {
      console.error('Error updating order:', error)
      setError('حدث خطأ أثناء تحديث الطلب')
    } finally {
      setUpdating(null)
    }
  }

  const deleteOrder = async (orderId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return

    try {
      setUpdating(orderId)
      const response = await fetch('/api/admin/orders/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId })
      })

      if (!response.ok) {
        throw new Error('Failed to delete order')
      }

      await fetchOrders()
    } catch (error) {
      console.error('Error deleting order:', error)
      setError('حدث خطأ أثناء حذف الطلب')
    } finally {
      setUpdating(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500'
      case 'CONFIRMED': return 'bg-blue-500'
      case 'IN_PROGRESS': return 'bg-purple-500'
      case 'COMPLETED': return 'bg-green-500'
      case 'CANCELLED': return 'bg-red-500'
      case 'REFUNDED': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'معلق'
      case 'CONFIRMED': return 'مؤكد'
      case 'IN_PROGRESS': return 'قيد التنفيذ'
      case 'COMPLETED': return 'مكتمل'
      case 'CANCELLED': return 'ملغي'
      case 'REFUNDED': return 'مسترد'
      default: return status
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-white text-2xl font-bold mb-2">خطأ في الوصول</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            href="/"
            className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link href="/admin-dashboard" className="text-2xl font-bold text-sky-400">
                ← العودة للوحة التحكم
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-300">إدارة الطلبات</span>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <span className="text-gray-300">مرحباً، {session?.user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6">جميع الطلبات</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="pb-3 text-gray-400">رقم الطلب</th>
                  <th className="pb-3 text-gray-400">العميل</th>
                  <th className="pb-3 text-gray-400">المبلغ</th>
                  <th className="pb-3 text-gray-400">الحالة</th>
                  <th className="pb-3 text-gray-400">التاريخ</th>
                  <th className="pb-3 text-gray-400">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-700">
                    <td className="py-3 text-white font-medium">{order.orderNumber}</td>
                    <td className="py-3 text-gray-300">
                      <div>
                        <p className="font-medium">{order.user.name || 'غير محدد'}</p>
                        <p className="text-sm text-gray-400">{order.user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 text-white font-bold">{order.totalAmount.toFixed(2)} ريال</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-US')}
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-2 space-x-reverse">
                        <button
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowModal(true)
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                        >
                          عرض التفاصيل
                        </button>
                        
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                            disabled={updating === order.id}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                          >
                            {updating === order.id ? 'جاري...' : 'قبول'}
                          </button>
                        )}
                        
                        {order.status === 'CONFIRMED' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'IN_PROGRESS')}
                            disabled={updating === order.id}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                          >
                            {updating === order.id ? 'جاري...' : 'بدء التنفيذ'}
                          </button>
                        )}
                        
                        {order.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                            disabled={updating === order.id}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                          >
                            {updating === order.id ? 'جاري...' : 'إكمال'}
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteOrder(order.id)}
                          disabled={updating === order.id}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                        >
                          {updating === order.id ? 'جاري...' : 'حذف'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">تفاصيل الطلب</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">رقم الطلب</p>
                    <p className="text-white font-medium">{selectedOrder.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">المبلغ الإجمالي</p>
                    <p className="text-white font-bold">{selectedOrder.totalAmount.toFixed(2)} ريال</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">الحالة</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">تاريخ الطلب</p>
                    <p className="text-white">{new Date(selectedOrder.createdAt).toLocaleDateString('en-US')}</p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-2">العميل</p>
                  <div className="bg-gray-700 p-3 rounded">
                    <p className="text-white font-medium">{selectedOrder.user.name || 'غير محدد'}</p>
                    <p className="text-gray-300 text-sm">{selectedOrder.user.email}</p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-2">الخدمات المطلوبة</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="bg-gray-700 p-3 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-medium">{item.service.title}</p>
                            {item.option && (
                              <p className="text-gray-300 text-sm">{item.option.title}</p>
                            )}
                            <p className="text-gray-400 text-sm">الكمية: {item.quantity}</p>
                          </div>
                          <div className="text-left">
                            <p className="text-white font-bold">{item.totalPrice.toFixed(2)} ريال</p>
                            <p className="text-gray-400 text-sm">السعر: {item.unitPrice.toFixed(2)} ريال</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">ملاحظات</p>
                    <p className="text-white bg-gray-700 p-3 rounded">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}