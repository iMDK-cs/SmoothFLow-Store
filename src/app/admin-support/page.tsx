"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SupportTicket {
  id: string
  subject: string
  message: string
  priority: string
  status: string
  createdAt: string
  updatedAt: string
  user: {
    name?: string
    email: string
  }
  replies: Array<{
    id: string
    message: string
    isAdmin: boolean
    createdAt: string
  }>
}

export default function AdminSupport() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [replying, setReplying] = useState(false)

  const fetchSupportTickets = useCallback(async () => {
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
        throw new Error(errorData.error || 'Failed to fetch support tickets')
      }

      const data = await response.json()
      setTickets(data.tickets || [])
    } catch (error) {
      console.error('Error fetching support tickets:', error)
      setError(`حدث خطأ أثناء تحميل البيانات: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`)
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleReply = async (ticketId: string) => {
    if (!replyMessage.trim()) return

    try {
      setReplying(true)
      
      const response = await fetch('/api/admin/support/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId,
          message: replyMessage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send reply')
      }

      setReplyMessage('')
      await fetchSupportTickets() // Refresh tickets
      
      // Update selected ticket if it's the one being replied to
      if (selectedTicket?.id === ticketId) {
        const updatedTicket = await fetch(`/api/admin/support/${ticketId}`).then(res => res.json())
        setSelectedTicket(updatedTicket.ticket)
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      setError(`حدث خطأ أثناء إرسال الرد: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`)
    } finally {
      setReplying(false)
    }
  }

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/support/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId,
          status: newStatus,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update ticket status')
      }

      await fetchSupportTickets() // Refresh tickets
      
      // Update selected ticket if it's the one being updated
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null)
      }
    } catch (error) {
      console.error('Error updating ticket status:', error)
      setError(`حدث خطأ أثناء تحديث حالة التذكرة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`)
    }
  }

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchSupportTickets()
  }, [session, status, router, fetchSupportTickets])

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
                  <p className="text-cyan-200 text-sm">إدارة الدعم الفني</p>
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
                  href="/admin-dashboard"
                  className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  🏠 لوحة الإدارة
                </Link>
                <Link
                  href="/"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  🏠 الموقع الرئيسي
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-600 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="text-3xl mr-3">🎫</span>
                تذاكر الدعم الفني
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                      selectedTicket?.id === ticket.id
                        ? 'bg-blue-600 border-blue-400 shadow-lg'
                        : 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-white font-semibold text-sm">{ticket.subject}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.priority === 'HIGH' ? 'bg-red-500 text-white' :
                        ticket.priority === 'MEDIUM' ? 'bg-yellow-500 text-white' :
                        'bg-green-500 text-white'
                      }`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-gray-300 text-xs mb-2">{ticket.user.name || ticket.user.email}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(ticket.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        ticket.status === 'OPEN' ? 'bg-green-500 text-white' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-yellow-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {ticket.status === 'OPEN' ? 'مفتوح' :
                         ticket.status === 'IN_PROGRESS' ? 'قيد المعالجة' :
                         'مغلق'}
                      </span>
                      {ticket.replies.length > 0 && (
                        <span className="text-blue-400 text-xs">
                          {ticket.replies.length} رد
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-600 shadow-2xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedTicket.subject}</h2>
                    <p className="text-gray-300">
                      من: {selectedTicket.user.name || selectedTicket.user.email}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {new Date(selectedTicket.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                      className="bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600"
                    >
                      <option value="OPEN">مفتوح</option>
                      <option value="IN_PROGRESS">قيد المعالجة</option>
                      <option value="CLOSED">مغلق</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-700 rounded-lg p-4 mb-6">
                  <h3 className="text-white font-semibold mb-2">الرسالة الأصلية:</h3>
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>

                {/* Replies */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-white font-semibold">الردود:</h3>
                  {selectedTicket.replies.length > 0 ? (
                    selectedTicket.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className={`p-4 rounded-lg ${
                          reply.isAdmin
                            ? 'bg-blue-600 border-r-4 border-blue-400'
                            : 'bg-slate-700 border-r-4 border-slate-500'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">
                            {reply.isAdmin ? 'الإدارة' : 'العميل'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(reply.createdAt).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                        <p className="text-white whitespace-pre-wrap">{reply.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">لا توجد ردود بعد</p>
                  )}
                </div>

                {/* Reply Form */}
                <div className="bg-slate-700 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3">إضافة رد:</h3>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="اكتب ردك هنا..."
                    className="w-full bg-slate-800 text-white p-3 rounded-lg border border-slate-600 mb-3 resize-none"
                    rows={4}
                  />
                  <button
                    onClick={() => handleReply(selectedTicket.id)}
                    disabled={replying || !replyMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    {replying ? 'جاري الإرسال...' : 'إرسال الرد'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-600 shadow-2xl text-center">
                <div className="text-gray-400 text-6xl mb-4">🎫</div>
                <h2 className="text-white text-2xl font-bold mb-2">اختر تذكرة للعرض</h2>
                <p className="text-gray-400">اضغط على تذكرة من القائمة لعرض التفاصيل والرد عليها</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}