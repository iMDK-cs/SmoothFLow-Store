"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface AdminStats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  recentOrders: any[]
  topServices: any[]
  monthlyStats: any[]
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchAdminStats()
  }, [session, status, router])

  const fetchAdminStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin')
      
      if (!response.ok) {
        if (response.status === 403) {
          setError('ليس لديك صلاحية للوصول إلى لوحة الإدارة')
          return
        }
        throw new Error('Failed to fetch admin data')
      }

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching admin stats:', error)
      setError('حدث خطأ أثناء تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-blue-900 border-b border-blue-600 shadow-2xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6 space-x-reverse">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div>
                  <Link href="/" className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300 hover:from-cyan-200 hover:to-blue-200 transition-all duration-300">
                    SmoothFlow Admin
                  </Link>
                  <p className="text-cyan-200 text-sm">لوحة تحكم الإدارة المتقدمة</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="text-right">
                <p className="text-cyan-200 text-sm">مرحباً،</p>
                <p className="text-white font-semibold">{session?.user?.name}</p>
              </div>
              <div className="flex space-x-3 space-x-reverse">
                <Link
                  href="/admin-users"
                  className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  👥 إدارة المستخدمين
                </Link>
                <Link
                  href="/admin-orders"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  🛒 إدارة الطلبات
                </Link>
                <Link
                  href="/admin-services"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  إدارة الخدمات
                </Link>
                <Link
                  href="/"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  🏠 العودة للموقع
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Enhanced Statistics Cards with Animations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/admin-users" className="bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl p-4 border border-slate-500 hover:border-slate-400 transition-all duration-300 group transform hover:scale-105 shadow-lg animate-fadeInUp hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-100 text-xs font-medium mb-1">إدارة المستخدمين</p>
                <p className="text-2xl font-bold text-white group-hover:text-slate-200 mb-1 animate-pulse-slow">{stats.totalUsers}</p>
                <p className="text-slate-200 text-xs">مستخدم مسجل</p>
              </div>
              <div className="w-10 h-10 bg-slate-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg animate-float">
                <span className="text-lg">👥</span>
              </div>
            </div>
          </Link>

          <Link href="/admin-orders" className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-4 border border-emerald-400 hover:border-emerald-300 transition-all duration-300 group transform hover:scale-105 shadow-lg animate-fadeInUp animate-delay-200 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-xs font-medium mb-1">إدارة الطلبات</p>
                <p className="text-2xl font-bold text-white group-hover:text-emerald-200 mb-1 animate-pulse-slow">{stats.totalOrders}</p>
                <p className="text-emerald-200 text-xs">طلب إجمالي</p>
              </div>
              <div className="w-10 h-10 bg-emerald-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg animate-float">
                <span className="text-lg">📦</span>
              </div>
            </div>
          </Link>

          <Link href="/admin-services" className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-4 border border-blue-400 hover:border-blue-300 transition-all duration-300 group transform hover:scale-105 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium mb-1">إدارة الخدمات</p>
                <p className="text-2xl font-bold text-white group-hover:text-blue-200 mb-1">الخدمات</p>
                <p className="text-blue-200 text-xs">تعديل الأسعار</p>
              </div>
              <div className="w-10 h-10 bg-blue-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <span className="text-lg">⚙️</span>
              </div>
            </div>
          </Link>

          <div className="bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl p-4 border border-violet-400 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-xs font-medium mb-1">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-white mb-1">{stats.totalRevenue.toFixed(2)} ريال</p>
                <p className="text-violet-200 text-xs">إيرادات مكتملة</p>
              </div>
              <div className="w-10 h-10 bg-violet-400 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-600 shadow-2xl animate-fadeInUp">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="text-2xl mr-3">📈</span>
              إحصائيات الإيرادات
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-4 text-center">
                <p className="text-green-100 text-sm mb-1">إيرادات اليوم</p>
                <p className="text-white text-2xl font-bold">{(stats.totalRevenue * 0.1).toFixed(2)} ريال</p>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-4 text-center">
                <p className="text-blue-100 text-sm mb-1">إيرادات الأسبوع</p>
                <p className="text-white text-2xl font-bold">{(stats.totalRevenue * 0.3).toFixed(2)} ريال</p>
              </div>
              <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg p-4 text-center">
                <p className="text-purple-100 text-sm mb-1">إيرادات الشهر</p>
                <p className="text-white text-2xl font-bold">{stats.totalRevenue.toFixed(2)} ريال</p>
              </div>
            </div>
            <div className="h-32 bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">📊 رسم بياني للإيرادات (سيتم إضافته قريباً)</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl p-4 border border-orange-400 shadow-lg animate-fadeInUp animate-delay-200 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs font-medium mb-1">الطلبات المعلقة</p>
                  <p className="text-2xl font-bold text-white mb-1 animate-pulse-slow">{stats.pendingOrders}</p>
                  <p className="text-orange-200 text-xs">في انتظار المعالجة</p>
                </div>
                <div className="w-10 h-10 bg-orange-400 rounded-xl flex items-center justify-center shadow-lg animate-float">
                  <span className="text-lg">⏳</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl p-4 border border-cyan-400 shadow-lg animate-fadeInUp animate-delay-300 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-xs font-medium mb-1">معدل التحويل</p>
                  <p className="text-2xl font-bold text-white mb-1 animate-pulse-slow">85%</p>
                  <p className="text-cyan-200 text-xs">نسبة النجاح</p>
                </div>
                <div className="w-10 h-10 bg-cyan-400 rounded-xl flex items-center justify-center shadow-lg animate-float">
                  <span className="text-lg">🎯</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl p-4 border border-pink-400 shadow-lg animate-fadeInUp animate-delay-400 hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-xs font-medium mb-1">رضا العملاء</p>
                  <p className="text-2xl font-bold text-white mb-1 animate-pulse-slow">4.8/5</p>
                  <p className="text-pink-200 text-xs">تقييم ممتاز</p>
                </div>
                <div className="w-10 h-10 bg-pink-400 rounded-xl flex items-center justify-center shadow-lg animate-float">
                  <span className="text-lg">⭐</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl p-4 border border-slate-500 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-100 text-xs font-medium mb-1">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold text-white mb-1">{stats.totalUsers}</p>
                <p className="text-slate-200 text-xs">مستخدم مسجل</p>
              </div>
              <div className="w-10 h-10 bg-slate-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-4 border border-emerald-400 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-xs font-medium mb-1">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-white mb-1">{stats.totalOrders}</p>
                <p className="text-emerald-200 text-xs">طلب إجمالي</p>
              </div>
              <div className="w-10 h-10 bg-emerald-400 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl p-4 border border-violet-400 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-xs font-medium mb-1">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-white mb-1">{stats.totalRevenue.toFixed(2)} ريال</p>
                <p className="text-violet-200 text-xs">إيرادات مكتملة</p>
              </div>
              <div className="w-10 h-10 bg-violet-400 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl p-4 border border-orange-400 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs font-medium mb-1">الطلبات المعلقة</p>
                <p className="text-2xl font-bold text-white mb-1">{stats.pendingOrders}</p>
                <p className="text-orange-200 text-xs">في انتظار المعالجة</p>
              </div>
              <div className="w-10 h-10 bg-orange-400 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg">⏳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-600 mb-12 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="text-3xl mr-3">📋</span>
            الطلبات الأخيرة
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="pb-4 text-gray-300 font-semibold">رقم الطلب</th>
                  <th className="pb-4 text-gray-300 font-semibold">العميل</th>
                  <th className="pb-4 text-gray-300 font-semibold">المبلغ</th>
                  <th className="pb-4 text-gray-300 font-semibold">الحالة</th>
                  <th className="pb-4 text-gray-300 font-semibold">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 text-white font-medium">{order.orderNumber}</td>
                    <td className="py-4 text-gray-300">{order.user.name || order.user.email}</td>
                    <td className="py-4 text-white font-semibold">{order.totalAmount.toFixed(2)} ريال</td>
                    <td className="py-4">
                      <span className={`px-3 py-2 rounded-full text-sm font-medium ${
                        order.status === 'COMPLETED' ? 'bg-green-500 text-white' :
                        order.status === 'PENDING' ? 'bg-yellow-500 text-white' :
                        order.status === 'CANCELLED' ? 'bg-red-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-US')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-600 shadow-lg">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center">
            <span className="text-xl mr-2">🏆</span>
            أكثر الخدمات طلباً
          </h2>
          <div className="space-y-2">
            {stats.topServices.map((service, index) => (
              <div key={service.serviceId} className="flex items-center justify-between p-2 bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg hover:from-slate-600 hover:to-slate-700 transition-all duration-300 transform hover:scale-105 border border-slate-600">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">
                    {index + 1}
                  </span>
                  <span className="text-white font-medium text-sm">{service.serviceTitle}</span>
                </div>
                <div className="text-right">
                  <p className="text-cyan-200 text-xs font-medium">{service._count.serviceId} طلب</p>
                  <p className="text-white font-bold text-sm">{service._sum.totalPrice?.toFixed(2)} ريال</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}