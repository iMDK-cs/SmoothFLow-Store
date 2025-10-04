'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ChatRoom {
  id: string
  subject?: string
  priority: string
  status: string
  createdAt: string
  lastMessageAt?: string
  user: {
    id: string
    name?: string
    email: string
    phone?: string
  }
  admin?: {
    id: string
    name?: string
    email: string
  }
  messages: Array<{
    id: string
    message: string
    createdAt: string
    sender: {
      id: string
      name?: string
      role: string
    }
  }>
  _count: {
    messages: number
  }
}

interface ChatMessage {
  id: string
  message: string
  messageType: string
  fileUrl?: string
  createdAt: string
  sender: {
    id: string
    name?: string
    email: string
    role: string
  }
}

export default function AdminChat() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [filter, setFilter] = useState('ACTIVE')
  const [priorityFilter, setPriorityFilter] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchChatRooms()
  }, [session, status, router, filter, priorityFilter])

  const fetchChatRooms = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        status: filter,
        ...(priorityFilter && { priority: priorityFilter })
      })
      
      const response = await fetch(`/api/admin/chat?${params}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/signin')
          return
        }
        if (response.status === 403) {
          alert('ليس لديك صلاحية للوصول إلى لوحة الإدارة. يجب أن تكون مديراً.')
          return
        }
        throw new Error('Failed to fetch chat rooms')
      }

      const data = await response.json()
      setChatRooms(data.chatRooms)
    } catch (error) {
      console.error('Error fetching chat rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (roomId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?roomId=${roomId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room)
    fetchMessages(room.id)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedRoom || sending) return

    setSending(true)
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          message: newMessage,
          messageType: 'TEXT'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const newMsg = await response.json()
      setMessages(prev => [...prev, newMsg])
      setNewMessage('')
      
      // Refresh chat rooms to update last message
      fetchChatRooms()
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleRoomAction = async (roomId: string, action: string, priority?: string) => {
    try {
      const response = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          action,
          ...(priority && { priority })
        })
      })

      if (!response.ok) {
        throw new Error('Failed to perform action')
      }

      // Refresh chat rooms
      fetchChatRooms()
      
      // If we closed the selected room, clear selection
      if (action === 'close' && selectedRoom?.id === roomId) {
        setSelectedRoom(null)
        setMessages([])
      }
    } catch (error) {
      console.error('Error performing action:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-100'
      case 'HIGH': return 'text-orange-600 bg-orange-100'
      case 'NORMAL': return 'text-blue-600 bg-blue-100'
      case 'LOW': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100'
      case 'CLOSED': return 'text-gray-600 bg-gray-100'
      case 'ARCHIVED': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white" dir="rtl">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link href="/admin-dashboard" className="text-blue-400 hover:text-blue-300">
                ← العودة للوحة الإدارة
              </Link>
              <h1 className="text-3xl font-bold">إدارة الدردشة</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          
          {/* Chat Rooms List */}
          <div className="lg:col-span-1 bg-gray-800 rounded-lg p-4 flex flex-col">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-4">غرف الدردشة</h2>
              
              {/* Filters */}
              <div className="space-y-2 mb-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                >
                  <option value="ACTIVE">نشطة</option>
                  <option value="CLOSED">مغلقة</option>
                  <option value="ARCHIVED">مؤرشفة</option>
                </select>
                
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                >
                  <option value="">جميع الأولويات</option>
                  <option value="URGENT">عاجل</option>
                  <option value="HIGH">عالي</option>
                  <option value="NORMAL">عادي</option>
                  <option value="LOW">منخفض</option>
                </select>
              </div>
            </div>

            {/* Rooms List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {chatRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => handleRoomSelect(room)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedRoom?.id === room.id
                      ? 'bg-blue-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">
                        {room.user.name || room.user.email}
                      </h3>
                      <p className="text-xs text-gray-300">{room.user.email}</p>
                      {room.subject && (
                        <p className="text-xs text-gray-400 mt-1">{room.subject}</p>
                      )}
                    </div>
                    <div className="flex space-x-1 space-x-reverse">
                      <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(room.priority)}`}>
                        {room.priority}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(room.status)}`}>
                        {room.status}
                      </span>
                    </div>
                  </div>
                  
                  {room.messages[0] && (
                    <p className="text-xs text-gray-400 truncate">
                      {room.messages[0].message}
                    </p>
                  )}
                  
                  {room._count.messages > 0 && (
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-blue-400">
                        {room._count.messages} رسالة جديدة
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(room.lastMessageAt || room.createdAt).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2 space-x-reverse mt-2">
                    {!room.admin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRoomAction(room.id, 'assign')
                        }}
                        className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
                      >
                        تعيين
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRoomAction(room.id, 'close')
                      }}
                      className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg flex flex-col">
            {selectedRoom ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">
                        {selectedRoom.user.name || selectedRoom.user.email}
                      </h3>
                      <p className="text-sm text-gray-400">{selectedRoom.user.email}</p>
                      {selectedRoom.user.phone && (
                        <p className="text-sm text-gray-400">{selectedRoom.user.phone}</p>
                      )}
                    </div>
                    <div className="flex space-x-2 space-x-reverse">
                      <select
                        value={selectedRoom.priority}
                        onChange={(e) => handleRoomAction(selectedRoom.id, 'setPriority', e.target.value)}
                        className="bg-gray-700 text-white rounded px-2 py-1 text-sm"
                      >
                        <option value="LOW">منخفض</option>
                        <option value="NORMAL">عادي</option>
                        <option value="HIGH">عالي</option>
                        <option value="URGENT">عاجل</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender.role === 'ADMIN' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender.role === 'ADMIN'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-100'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.createdAt).toLocaleString('ar-SA')}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                  <div className="flex space-x-2 space-x-reverse">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="اكتب رسالتك..."
                      className="flex-1 bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded text-sm"
                    >
                      {sending ? 'جاري الإرسال...' : 'إرسال'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <p>اختر غرفة دردشة لعرض الرسائل</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
