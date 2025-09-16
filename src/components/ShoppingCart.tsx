"use client"

import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
// import { Trash2 } from 'lucide-react' // Removed - using SVG instead

export default function ShoppingCart() {
  const [isOpen, setIsOpen] = useState(false)
  const { state, removeFromCart, clearCart, getTotalPrice, getItemCount } = useCart()
  const { data: session } = useSession()

  if (!session) {
    return (
      <Link
        href="/auth/signin"
        className="relative p-2 text-gray-300 hover:text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l1.5-1.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
        <span className="sr-only">سلة التسوق</span>
      </Link>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l1.5-1.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
        {getItemCount() > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {getItemCount()}
          </span>
        )}
        <span className="sr-only">سلة التسوق</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">سلة التسوق</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {state.cart?.items && state.cart.items.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-3">
                  <button
                    onClick={() => clearCart()}
                    className="flex items-center space-x-1 space-x-reverse text-red-400 hover:text-red-300 text-xs bg-gray-700 px-2 py-1 rounded"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3,6 5,6 21,6"></polyline>
                      <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    <span>حذف جميع المحتويات</span>
                  </button>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {state.cart.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-white">{item.service.title}</h4>
                        {item.option && (
                          <p className="text-xs text-gray-400">{item.option.title}</p>
                        )}
                        <p className="text-xs text-gray-400">الكمية: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">
                          {((item.option ? item.option.price : item.service.basePrice) * item.quantity).toFixed(2)} ريال
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-400 hover:text-red-300 text-xs"
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
                    <span className="text-lg font-semibold text-white">
                      {getTotalPrice().toFixed(2)} ريال
                    </span>
                  </div>
                  <Link
                    href="/checkout"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-center block"
                    onClick={() => setIsOpen(false)}
                  >
                    المتابعة للدفع
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l1.5-1.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                <p className="text-gray-400">سلة التسوق فارغة</p>
                <Link
                  href="/"
                  className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
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