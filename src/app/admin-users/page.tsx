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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h1 className="text-white text-xl font-bold mb-2">خطأ في الوصول</h1>
          <p className="text-slate-300 mb-4">{error}</p>
          <Link
            href="/"
            className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg"
          >
            العودة للصفحة الرئيسية
          </Link>
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
              <Link href="/admin-dashboard" className="text-xl font-bold text-white">
                SmoothFlow Admin
              </Link>
              <p className="text-slate-400 text-sm">إدارة المستخدمين</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">مرحباً،</p>
              <p className="text-white font-semibold">{session?.user?.name}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">المستخدمين ({users.length})</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="pb-3 text-slate-300 font-medium">الاسم</th>
                  <th className="pb-3 text-slate-300 font-medium">البريد الإلكتروني</th>
                  <th className="pb-3 text-slate-300 font-medium">الدور</th>
                  <th className="pb-3 text-slate-300 font-medium">الحالة</th>
                  <th className="pb-3 text-slate-300 font-medium">تاريخ الإنشاء</th>
                  <th className="pb-3 text-slate-300 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="py-3 text-white font-medium">{user.name || 'غير محدد'}</td>
                    <td className="py-3 text-slate-300">{user.email}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        user.role === 'ADMIN' ? 'bg-red-500 text-white' :
                        user.role === 'MODERATOR' ? 'bg-yellow-500 text-white' :
                        'bg-green-500 text-white'
                      }`}>
                        {user.role === 'ADMIN' ? 'مدير' : user.role === 'MODERATOR' ? 'مشرف' : 'مستخدم'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        user.verified ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {user.verified ? 'مفعل' : 'غير مفعل'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 text-sm">
                      {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-2 space-x-reverse">
                        {user.role !== 'ADMIN' && (
                          <button
                            onClick={() => promoteUser(user.id, 'ADMIN')}
                            disabled={promoting === user.id}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                          >
                            {promoting === user.id ? 'جاري...' : 'مدير'}
                          </button>
                        )}
                        {user.role !== 'MODERATOR' && (
                          <button
                            onClick={() => promoteUser(user.id, 'MODERATOR')}
                            disabled={promoting === user.id}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                          >
                            {promoting === user.id ? 'جاري...' : 'مشرف'}
                          </button>
                        )}
                        {user.role !== 'USER' && (
                          <button
                            onClick={() => promoteUser(user.id, 'USER')}
                            disabled={promoting === user.id}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                          >
                            {promoting === user.id ? 'جاري...' : 'مستخدم'}
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