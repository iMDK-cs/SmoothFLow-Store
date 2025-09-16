"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Profile() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  })

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
    fetchUserProfile()
  }, [session, router])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
        setFormData({
          name: userData.user.name || '',
          phone: userData.user.phone || '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser.user)
        setEditing(false)
        await update({ ...session, user: { ...session?.user, ...updatedUser.user } })
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري تحميل الملف الشخصي...</p>
        </div>
      </div>
    )
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

  return (
    <div className="min-h-screen bg-gray-900 py-12" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">الملف الشخصي</h1>
            <Link
              href="/"
              className="text-blue-400 hover:text-blue-300"
            >
              ← العودة للصفحة الرئيسية
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">معلومات الحساب</h2>
                
                {editing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                        الاسم
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                        رقم الهاتف
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex space-x-reverse space-x-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {loading ? 'جاري الحفظ...' : 'حفظ'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm">الاسم</p>
                      <p className="text-white">{user?.name || 'غير محدد'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">البريد الإلكتروني</p>
                      <p className="text-white">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">رقم الهاتف</p>
                      <p className="text-white">{user?.phone || 'غير محدد'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">تاريخ الانضمام</p>
                      <p className="text-white">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US') : 'غير محدد'}
                      </p>
                    </div>
                    <button
                      onClick={() => setEditing(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      تعديل الملف الشخصي
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">إجراءات سريعة</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    href="/orders"
                    className="flex items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <div>
                      <p className="text-white font-medium">طلباتي</p>
                      <p className="text-gray-400 text-sm">عرض وإدارة الطلبات</p>
                    </div>
                  </Link>

                  <Link
                    href="/bookings"
                    className="flex items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-white font-medium">حجوزاتي</p>
                      <p className="text-gray-400 text-sm">إدارة المواعيد المحجوزة</p>
                    </div>
                  </Link>

                  <Link
                    href="/reviews"
                    className="flex items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <div>
                      <p className="text-white font-medium">تقييماتي</p>
                      <p className="text-gray-400 text-sm">عرض التقييمات المقدمة</p>
                    </div>
                  </Link>

                 
                  {session.user && (session.user as { role?: string }).role === 'ADMIN' && (
                    <Link
                      href="/admin-dashboard"
                      className="flex items-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6 text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0l1.83 7.5a1.5 1.5 0 01-1.441 1.933H9.936a1.5 1.5 0 01-1.441-1.933l1.83-7.5zM18 8.25a3 3 0 00-3 3v.75a3 3 0 003 3h.75a3 3 0 003-3v-.75a3 3 0 00-3-3h-.75z" />
                      </svg>
                      <div>
                        <p className="text-white font-medium">لوحة التحكم</p>
                        <p className="text-gray-400 text-sm">إدارة النظام</p>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}