"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  verified: boolean
  createdAt: string
}

export default function AdminUsers() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [promoting, setPromoting] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchUsers()
  }, [session, status, router])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      
      if (!response.ok) {
        if (response.status === 403) {
          setError('ليس لديك صلاحية للوصول إلى هذه الصفحة')
          return
        }
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data.users)
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('حدث خطأ أثناء تحميل المستخدمين')
    } finally {
      setLoading(false)
    }
  }

  const promoteUser = async (userId: string, newRole: string) => {
    try {
      setPromoting(userId)
      const response = await fetch('/api/admin/promote-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          role: newRole
        })
      })

      if (!response.ok) {
        throw new Error('Failed to promote user')
      }

      // Refresh users list
      await fetchUsers()
    } catch (error) {
      console.error('Error promoting user:', error)
      setError('حدث خطأ أثناء ترقية المستخدم')
    } finally {
      setPromoting(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white text-xl font-medium">جاري تحميل المستخدمين...</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-blue-900 border-b border-blue-600 shadow-2xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6 space-x-reverse">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div>
                  <Link href="/admin-dashboard" className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300 hover:from-cyan-200 hover:to-blue-200 transition-all duration-300">
                    SmoothFlow Admin
                  </Link>
                  <p className="text-cyan-200 text-sm">إدارة المستخدمين</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="text-right">
                <p className="text-cyan-200 text-sm">مرحباً،</p>
                <p className="text-white font-semibold">{session?.user?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-600 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
            <span className="text-3xl mr-3">👥</span>
            قائمة المستخدمين
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-gray-600 bg-gradient-to-r from-purple-600/20 to-blue-600/20">
                  <th className="pb-4 pt-4 text-purple-300 font-semibold text-lg">الاسم</th>
                  <th className="pb-4 pt-4 text-purple-300 font-semibold text-lg">البريد الإلكتروني</th>
                  <th className="pb-4 pt-4 text-purple-300 font-semibold text-lg">الدور</th>
                  <th className="pb-4 pt-4 text-purple-300 font-semibold text-lg">الحالة</th>
                  <th className="pb-4 pt-4 text-purple-300 font-semibold text-lg">تاريخ الإنشاء</th>
                  <th className="pb-4 pt-4 text-purple-300 font-semibold text-lg">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-700 hover:bg-gradient-to-r hover:from-purple-600/10 hover:to-blue-600/10 transition-all duration-300">
                    <td className="py-4 text-white font-semibold text-lg">{user.name || 'غير محدد'}</td>
                    <td className="py-4 text-gray-300 text-base">{user.email}</td>
                    <td className="py-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                        user.role === 'ADMIN' ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' :
                        user.role === 'MODERATOR' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                        'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      }`}>
                        {user.role === 'ADMIN' ? '👑 مدير' : user.role === 'MODERATOR' ? '⚡ مشرف' : '👤 مستخدم'}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                        user.verified ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                      }`}>
                        {user.verified ? '✅ مفعل' : '❌ غير مفعل'}
                      </span>
                    </td>
                    <td className="py-4 text-gray-400 text-base font-medium">
                      {new Date(user.createdAt).toLocaleDateString('en-US')}
                    </td>
                    <td className="py-4">
                      <div className="flex space-x-3 space-x-reverse">
                        {user.role !== 'ADMIN' && (
                          <button
                            onClick={() => promoteUser(user.id, 'ADMIN')}
                            disabled={promoting === user.id}
                            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                          >
                            {promoting === user.id ? '⏳ جاري...' : '👑 ترقية لمدير'}
                          </button>
                        )}
                        {user.role !== 'MODERATOR' && (
                          <button
                            onClick={() => promoteUser(user.id, 'MODERATOR')}
                            disabled={promoting === user.id}
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                          >
                            {promoting === user.id ? '⏳ جاري...' : '⚡ ترقية لمشرف'}
                          </button>
                        )}
                        {user.role !== 'USER' && (
                          <button
                            onClick={() => promoteUser(user.id, 'USER')}
                            disabled={promoting === user.id}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                          >
                            {promoting === user.id ? '⏳ جاري...' : '👤 ترقية لمستخدم'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}