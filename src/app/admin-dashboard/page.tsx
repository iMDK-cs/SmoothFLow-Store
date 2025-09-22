"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface AdminStats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    user: {
      name?: string;
      email: string;
    };
  }>
  topServices: Array<{
    id: string;
    title: string;
    orderCount: number;
    revenue: number;
  }>
  monthlyStats: Array<{
    month: string;
    orders: number;
    revenue: number;
  }>
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAdminStats = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/admin', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('يجب تسجيل الدخول أولاً')
          router.push('/auth/signin')
          return
        }
        if (response.status === 403) {
          setError('ليس لديك صلاحية للوصول إلى لوحة الإدارة. يجب أن تكون مديراً.')
          return
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch admin data')
      }

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching admin stats:', error)
      setError(`حدث خطأ أثناء تحميل البيانات: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchAdminStats()
  }, [session, status, router, fetchAdminStats])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white text-xl font-medium">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-8xl mb-6">⚠️</div>
          <h1 className="text-white text-3xl font-bold mb-4">خطأ في تحميل البيانات</h1>
          <p className="text-gray-300 text-lg mb-6">لم يتم تحميل البيانات بنجاح</p>
          <button
            onClick={fetchAdminStats}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg transition-colors text-lg font-medium"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-8xl mb-6">⚠️</div>
          <h1 className="text-white text-3xl font-bold mb-4">خطأ في الوصول</h1>
          <p className="text-gray-300 text-lg mb-6">{error}</p>
          <Link
            href="/"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg transition-colors text-lg font-medium"
          >
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h1 className="text-white text-2xl font-bold mb-2">لا توجد بيانات</h1>
          <p className="text-gray-400">لم يتم العثور على بيانات الإدارة</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/" className="text-2xl font-bold text-white">
                SmoothFlow Admin
              </Link>
              <p className="text-slate-400 text-sm">لوحة تحكم الإدارة</p>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="text-right">
                <p className="text-slate-400 text-sm">مرحباً،</p>
                <p className="text-white font-semibold">{session?.user?.name}</p>
              </div>
              <div className="flex space-x-2 space-x-reverse">
                <Link
                  href="/admin-users"
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  👥 المستخدمين
                </Link>
                <Link
                  href="/admin-orders"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  🛒 الطلبات
                </Link>
                <Link
                  href="/admin-services"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  ⚙️ الخدمات
                </Link>
                <Link
                  href="/admin-bank-transfers"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  🏦 التحويلات
                </Link>
                <Link
                  href="/"
                  className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  🏠 الموقع
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/admin-users" className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm mb-1">المستخدمين</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>
              <span className="text-2xl">👥</span>
            </div>
          </Link>

          <Link href="/admin-orders" className="bg-emerald-600 rounded-lg p-4 hover:bg-emerald-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-200 text-sm mb-1">الطلبات</p>
                <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
              </div>
              <span className="text-2xl">📦</span>
            </div>
          </Link>

          <Link href="/admin-services" className="bg-blue-600 rounded-lg p-4 hover:bg-blue-700 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm mb-1">الخدمات</p>
                <p className="text-2xl font-bold text-white">الخدمات</p>
              </div>
              <span className="text-2xl">⚙️</span>
            </div>
          </Link>

        </div>

        {/* Revenue and Pending Orders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">الإيرادات</h3>
            <p className="text-3xl font-bold text-white">{(stats.totalRevenue ?? 0).toFixed(2)} ريال</p>
            <p className="text-slate-400 text-sm">إجمالي الإيرادات المكتملة</p>
          </div>
          
          <div className="bg-orange-600 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">الطلبات المعلقة</h3>
            <p className="text-3xl font-bold text-white">{stats.pendingOrders}</p>
            <p className="text-orange-200 text-sm">في انتظار المعالجة</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">الطلبات الأخيرة</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="pb-3 text-slate-300 font-medium">رقم الطلب</th>
                  <th className="pb-3 text-slate-300 font-medium">العميل</th>
                  <th className="pb-3 text-slate-300 font-medium">المبلغ</th>
                  <th className="pb-3 text-slate-300 font-medium">الحالة</th>
                  <th className="pb-3 text-slate-300 font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {(stats.recentOrders || []).map((order) => (
                  <tr key={order.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="py-3 text-white font-medium">{order.orderNumber}</td>
                    <td className="py-3 text-slate-300">{order.user.name || order.user.email}</td>
                    <td className="py-3 text-white font-semibold">{(order.totalAmount ?? 0).toFixed(2)} ريال</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        order.status === 'COMPLETED' ? 'bg-green-500 text-white' :
                        order.status === 'PENDING' ? 'bg-yellow-500 text-white' :
                        order.status === 'CANCELLED' ? 'bg-red-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                     <td className="py-3 text-slate-400 text-sm">
                         {new Date(order.createdAt).toLocaleDateString('en-GB')}
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-slate-800 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-bold text-white mb-4">أكثر الخدمات طلباً</h2>
          <div className="space-y-3">
            {(stats.topServices || []).map((service, index) => (
              <div key={service.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {index + 1}
                  </span>
                  <span className="text-white font-medium">{service.title}</span>
                </div>
                <div className="text-right">
                  <p className="text-slate-300 text-sm">{service.orderCount} طلب</p>
                  <p className="text-white font-bold">{(service.revenue ?? 0).toFixed(2)} ريال</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}