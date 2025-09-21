"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SupportMessage {
  id: string
  subject: string
  message: string
  priority: string
  createdAt: string
  user: {
    name?: string
    email: string
  }
}

export default function AdminSupport() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchSupportMessages = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/admin/support', {
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
        throw new Error(errorData.error || 'Failed to fetch support messages')
      }

      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Error fetching support messages:', error)
      setError(`حدث خطأ أثناء تحميل البيانات: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchSupportMessages()
  }, [session, status, router, fetchSupportMessages])

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
              <p className="text-slate-400 text-sm">الدعم الفني</p>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="text-right">
                <p className="text-slate-400 text-sm">مرحباً،</p>
                <p className="text-white font-semibold">{session?.user?.name}</p>
              </div>
              <div className="flex space-x-2 space-x-reverse">
                <Link
                  href="/admin-dashboard"
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg"
                >
                  🏠 لوحة الإدارة
                </Link>
                <Link
                  href="/"
                  className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg"
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
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">رسائل الدعم الفني ({messages.length})</h2>
          
          <div className="space-y-4">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div key={message.id} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-white font-semibold">{message.subject}</h3>
                    <span className={`px-2 py-1 rounded text-sm ${
                      message.priority === 'HIGH' ? 'bg-red-500 text-white' :
                      message.priority === 'MEDIUM' ? 'bg-yellow-500 text-white' :
                      'bg-green-500 text-white'
                    }`}>
                      {message.priority === 'HIGH' ? 'عالي' :
                       message.priority === 'MEDIUM' ? 'متوسط' : 'منخفض'}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-slate-300 text-sm mb-1">
                      من: {message.user.name || message.user.email}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {new Date(message.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  
                  <div className="bg-slate-600 rounded p-3">
                    <p className="text-white whitespace-pre-wrap">{message.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-slate-400 text-4xl mb-4">📧</div>
                <h3 className="text-white text-lg font-semibold mb-2">لا توجد رسائل دعم</h3>
                <p className="text-slate-400">لم يتم إرسال أي رسائل دعم فني بعد</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}