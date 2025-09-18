"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { getUserFromSession } from '@/lib/auth'

interface Message {
  id: string
  text: string
  sender: 'user' | 'support'
  timestamp: Date
  isAdmin?: boolean
}

interface SupportTicket {
  id: string
  subject: string
  message: string
  priority: 'low' | 'medium' | 'high'
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  createdAt: string
}

export default function EnhancedSupportChat() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        setMessages([
          {
            id: '1',
            text: `مرحباً ${session?.user?.name || 'بك'}! كيف يمكنني مساعدتك اليوم؟`,
            sender: 'support',
            timestamp: new Date(),
          },
        ])
      }, 500)
    }
  }, [isOpen, messages.length, session?.user?.name])

  useEffect(() => {
    const checkUserAndFetchTickets = async () => {
      if (isOpen && session) {
        const user = await getUserFromSession(session);
        if (user?.id) {
          fetchTickets()
        }
      }
    };
    checkUserAndFetchTickets();
  }, [isOpen, session])

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/support')
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: input.trim(),
        sender: 'user',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, newMessage])
      setInput('')
      setIsLoading(true)

      // Simulate support response
      setTimeout(() => {
        const supportResponse: Message = {
          id: Date.now().toString() + '-support',
          text: 'شكراً لرسالتك. فريق الدعم الفني سيقوم بالرد عليك قريباً. يمكنك أيضاً إنشاء تذكرة دعم للحصول على مساعدة أسرع.',
          sender: 'support',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, supportResponse])
        setIsLoading(false)
      }, 1500)
    }
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) return

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketForm)
      })

      if (response.ok) {
        const data = await response.json()
        setTickets(prev => [data.ticket, ...prev])
        setTicketForm({ subject: '', message: '', priority: 'medium' })
        setShowTicketForm(false)
        
        // Add success message
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: `تم إنشاء تذكرة الدعم #${data.ticket.id} بنجاح!`,
          sender: 'support',
          timestamp: new Date(),
        }])
      }
    } catch (error) {
      console.error('Failed to create ticket:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'text-blue-500'
      case 'IN_PROGRESS': return 'text-yellow-500'
      case 'RESOLVED': return 'text-green-500'
      case 'CLOSED': return 'text-gray-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <>
      <button
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 z-50 group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="relative">
          <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
            {isOpen ? '✖️' : '💬'}
          </span>
          {!isOpen && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 h-[500px] bg-gray-800 rounded-lg shadow-xl flex flex-col z-50 border border-purple-500 overflow-hidden" dir="rtl">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-t-lg text-white">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">الدعم الفني المباشر</h3>
              <div className="flex space-x-2 space-x-reverse">
                <button
                  onClick={() => setShowTicketForm(!showTicketForm)}
                  className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
                >
                  🎫 تذكرة
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
                >
                  ✖️
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            {showTicketForm ? (
              /* Ticket Form */
              <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-700 hover:scrollbar-thumb-purple-400 transition-colors duration-200 scroll-smooth scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-shadow-lg">
                <h4 className="text-white font-semibold mb-4">إنشاء تذكرة دعم جديدة</h4>
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">الموضوع</label>
                    <input
                      type="text"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
                      placeholder="اكتب موضوع التذكرة..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">الأولوية</label>
                    <select
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                      className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
                    >
                      <option value="low">منخفضة</option>
                      <option value="medium">متوسطة</option>
                      <option value="high">عالية</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">الرسالة</label>
                    <textarea
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500 h-24 resize-none"
                      placeholder="اكتب تفاصيل المشكلة..."
                      required
                    />
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      type="submit"
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      إنشاء التذكرة
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTicketForm(false)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Chat Interface */
              <>
                {/* Tickets List */}
                {tickets.length > 0 && (
                  <div className="p-4 border-b border-gray-700">
                    <h4 className="text-white font-semibold mb-2">تذاكر الدعم</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-700 hover:scrollbar-thumb-purple-400 transition-colors duration-200 scroll-smooth scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-shadow-lg">
                      {tickets.slice(0, 3).map((ticket) => (
                        <div key={ticket.id} className="bg-gray-700 p-2 rounded text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-white truncate">{ticket.subject}</span>
                            <div className="flex space-x-2 space-x-reverse">
                              <span className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                                {ticket.priority === 'high' ? 'عالي' : ticket.priority === 'medium' ? 'متوسط' : 'منخفض'}
                              </span>
                              <span className={`text-xs ${getStatusColor(ticket.status)}`}>
                                {ticket.status === 'OPEN' ? 'مفتوح' : ticket.status === 'IN_PROGRESS' ? 'قيد المراجعة' : ticket.status === 'RESOLVED' ? 'محلول' : 'مغلق'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-700 hover:scrollbar-thumb-purple-400 transition-colors duration-200 scroll-smooth">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg shadow-md ${
                          msg.sender === 'user'
                            ? 'bg-purple-500 text-white rounded-br-none'
                            : 'bg-gray-700 text-white rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <span className="text-xs text-gray-300 block mt-1">
                          {msg.timestamp.toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-700 text-white p-3 rounded-lg rounded-bl-none">
                        <div className="flex space-x-1 space-x-reverse">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 flex">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-gray-700 text-white p-2 rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
                    placeholder="اكتب رسالتك..."
                    dir="rtl"
                  />
                  <button
                    type="submit"
                    className="ml-2 bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    إرسال
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}