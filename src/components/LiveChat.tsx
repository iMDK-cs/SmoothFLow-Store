'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface Message {
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
  }
  admin?: {
    id: string
    name?: string
    email: string
  }
  messages: Message[]
  _count: {
    messages: number
  }
}

export default function LiveChat() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const initializeChat = useCallback(async () => {
    try {
      setLoading(true)
      
      // Get or create chat room
      const roomsResponse = await fetch('/api/chat/rooms')
      if (!roomsResponse.ok) {
        if (roomsResponse.status === 500) {
          // Database not available, use fallback mode
          throw new Error('Database not available')
        }
        throw new Error('Failed to fetch rooms')
      }
      
      const rooms = await roomsResponse.json()
      
      // Check if user has an active room
      let activeRoom = rooms.find((room: ChatRoom) => room.status === 'ACTIVE')
      
      if (!activeRoom) {
        // Create new room
        const createResponse = await fetch('/api/chat/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: 'دعم فني',
            priority: 'NORMAL'
          })
        })
        
        if (!createResponse.ok) {
          if (createResponse.status === 500) {
            throw new Error('Database not available')
          }
          throw new Error('Failed to create room')
        }
        
        const data = await createResponse.json()
        activeRoom = data.room
      }
      
      setCurrentRoom(activeRoom)
      
      // Load messages
      const messagesResponse = await fetch(`/api/chat/messages?roomId=${activeRoom.id}`)
      if (!messagesResponse.ok) {
        if (messagesResponse.status === 500) {
          throw new Error('Database not available')
        }
        throw new Error('Failed to fetch messages')
      }
      
      const messagesData = await messagesResponse.json()
      setMessages(messagesData)
      
    } catch (error) {
      console.error('Error initializing chat:', error)
      // Fallback to welcome message when database is not available
      setMessages([
        {
          id: '1',
          message: `مرحبا ${session?.user?.name || 'user'} كيف اقدر اساعدك`,
          messageType: 'TEXT',
          createdAt: new Date().toISOString(),
          sender: {
            id: 'admin',
            name: 'الدعم الفني',
            email: 'support@smoothflow.com',
            role: 'ADMIN'
          }
        },
        {
          id: '2',
          message: 'عذراً، النظام مؤقتاً غير متاح. يرجى المحاولة لاحقاً أو التواصل معنا عبر الواتساب.',
          messageType: 'TEXT',
          createdAt: new Date().toISOString(),
          sender: {
            id: 'system',
            name: 'النظام',
            email: 'system@smoothflow.com',
            role: 'ADMIN'
          }
        }
      ])
    } finally {
      setLoading(false)
    }
  }, [session?.user?.name])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && session) {
      initializeChat()
    }
  }, [isOpen, session, initializeChat])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !session || !currentRoom || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      message: newMessage,
      messageType: 'TEXT',
      createdAt: new Date().toISOString(),
      sender: {
        id: (session.user as { id?: string })?.id || Date.now().toString(),
        name: session.user?.name || '',
        email: session.user?.email || '',
        role: 'USER'
      }
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: currentRoom.id,
          message: newMessage,
          messageType: 'TEXT'
        })
      })

      if (!response.ok) {
        if (response.status === 500) {
          throw new Error('Database not available')
        }
        throw new Error('Failed to send message')
      }

      const sentMessage = await response.json()
      setMessages(prev => [...prev, sentMessage])
      
    } catch (error) {
      console.error('Error sending message:', error)
      // Show error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        message: 'عذراً، النظام مؤقتاً غير متاح. يرجى المحاولة لاحقاً أو التواصل معنا عبر الواتساب.',
        messageType: 'TEXT',
        createdAt: new Date().toISOString(),
        sender: {
          id: 'system',
          name: 'النظام',
          email: 'system@smoothflow.com',
          role: 'ADMIN'
        }
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  if (!session) return null

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 z-40 sky-blue-glow"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 w-80 h-96 bg-gray-800 rounded-lg shadow-xl z-50 flex flex-col" dir="rtl">
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-cyan-300 rounded-full mr-2 animate-pulse"></div>
              <span className="font-semibold">الدعم الفني</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-gray-400">جاري التحميل...</div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg ${
                        message.sender.role === 'USER'
                          ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white'
                          : 'bg-gray-700 text-gray-100'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.createdAt).toLocaleTimeString('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 text-gray-100 px-3 py-2 rounded-lg">
                      <div className="flex space-x-1 space-x-reverse">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
            <div className="flex space-x-reverse space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="اكتب رسالتك..."
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                dir="rtl"
                disabled={isTyping || loading}
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                disabled={isTyping || loading || !newMessage.trim()}
              >
                {isTyping ? 'جاري الإرسال...' : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}