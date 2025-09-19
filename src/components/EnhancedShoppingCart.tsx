"use client"

import { useState, useRef, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function EnhancedShoppingCart() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const { state, removeFromCart, updateQuantity, getTotalPrice, getItemCount, lastAddedItem } = useCart()
  const { data: session } = useSession()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (lastAddedItem) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 600)
    }
  }, [lastAddedItem])

  if (!session) {
    return (
      <Link
        href="/auth/signin"
        className="relative p-2 text-gray-300 hover:text-white transition-colors group"
      >
        <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l1.5-1.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
        <span className="sr-only">سلة التسوق</span>
      </Link>
    )
  }

  const itemCount = getItemCount()

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 text-gray-300 hover:text-sky-300 transition-all duration-200 group rounded-lg hover:bg-sky-900/30 border border-sky-500/20 hover:border-sky-400/40 ${
          isAnimating ? 'animate-pulse' : ''
        }`}
      >
        <svg 
          className={`w-6 h-6 group-hover:scale-110 transition-all duration-200 ${
            isOpen ? 'text-sky-400' : ''
          } ${isAnimating ? 'text-sky-400 scale-125' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l1.5-1.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
        
        {itemCount > 0 && (
          <span className={`absolute -top-1 -right-1 bg-gradient-to-r from-sky-400 to-sky-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg shadow-sky-500/25 ${
            isAnimating ? 'animate-ping scale-150' : 'animate-bounce'
          }`}>
            {itemCount}
          </span>
        )}
        
        <span className="sr-only">سلة التسوق</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-96 bg-gray-800/95 backdrop-blur-md rounded-lg shadow-2xl border border-gray-700 z-50 animate-in slide-in-from-top-2 duration-200 max-h-[80vh]">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l1.5-1.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                سلة التسوق
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {state.cart?.items && state.cart.items.length > 0 ? (
              <>
                {/* Clear All Button */}
                <div className="flex justify-between items-center mb-3">
                  <button
                    onClick={() => {
                      if (confirm('هل أنت متأكد من حذف جميع المحتويات من السلة؟')) {
                        state.cart?.items.forEach(item => removeFromCart(item.id))
                      }
                    }}
                    className="flex items-center space-x-1 space-x-reverse text-red-400 hover:text-red-300 text-xs bg-red-900/20 hover:bg-red-900/30 px-3 py-2 rounded-lg border border-red-500/30 hover:border-red-400/50 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>حذف جميع المحتويات</span>
                  </button>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-gray-400 text-xs">
                      {state.cart.items.length} عنصر
                    </span>
                    {state.cart.items.length > 10 && (
                      <span className="text-blue-400 text-xs bg-blue-900/20 px-2 py-1 rounded-full">
                        قابل للتمرير
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pr-2">
                  {state.cart.items.map((item, index) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors group">
                      <div className="flex-shrink-0 w-6 h-6 bg-sky-500/20 rounded-full flex items-center justify-center text-xs text-sky-400 font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors truncate">
                          {item.service.title}
                        </h4>
                        {item.option && (
                          <p className="text-xs text-gray-400 mt-1 truncate">{item.option.title}</p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <span className="text-xs text-gray-400">الكمية:</span>
                            <div className="flex items-center space-x-1 space-x-reverse">
                              <button
                                onClick={() => {
                                  if (item.quantity > 1) {
                                    updateQuantity(item.id, item.quantity - 1)
                                  } else {
                                    removeFromCart(item.id)
                                  }
                                }}
                                className="w-6 h-6 bg-gray-600 hover:bg-gray-500 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                                title="تقليل الكمية"
                              >
                                -
                              </button>
                              <span className="text-xs text-white font-medium px-2 min-w-[20px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 bg-sky-600 hover:bg-sky-500 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                                title="زيادة الكمية"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400">
                            {item.option ? item.option.price : item.service.basePrice} ريال
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium text-white">
                          {((item.option ? item.option.price : item.service.basePrice) * item.quantity).toFixed(2)} ريال
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-400 hover:text-red-300 text-xs transition-colors hover:bg-red-900/20 px-2 py-1 rounded mt-1"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-white">المجموع</span>
                    <span className="text-lg font-semibold text-blue-400">
                      {getTotalPrice().toFixed(2)} ريال
                    </span>
                  </div>
                  <Link
                    href="/checkout"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 text-center block transform hover:scale-105 shadow-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    المتابعة للدفع
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l1.5-1.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </div>
                <p className="text-gray-400 mb-2">سلة التسوق فارغة</p>
                <p className="text-gray-500 text-sm">أضف خدمات لتتمكن من المتابعة</p>
                <Link
                  href="/"
                  className="text-blue-400 hover:text-blue-300 text-sm mt-3 inline-block transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  تصفح الخدمات
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}