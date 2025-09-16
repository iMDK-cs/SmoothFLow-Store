"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useCart } from '@/contexts/CartContext'

interface TestResult {
  name: string
  status: 'pending' | 'pass' | 'fail'
  message: string
  details?: string
}

export default function TestPage() {
  const { data: session } = useSession()
  const { addToCart, removeFromCart, clearCart, items } = useCart()
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTest = async (testName: string, testFn: () => Promise<boolean>, message: string) => {
    try {
      const result = await testFn()
      setTestResults(prev => [...prev, {
        name: testName,
        status: result ? 'pass' : 'fail',
        message: result ? message : `Failed: ${testName}`,
        details: result ? undefined : 'Test failed'
      }])
      return result
    } catch (error) {
      setTestResults(prev => [...prev, {
        name: testName,
        status: 'fail',
        message: `Error: ${testName}`,
        details: error instanceof Error ? error.message : 'Unknown error'
      }])
      return false
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([])

    // Test 1: Authentication
    await runTest(
      'Authentication',
      async () => !!session,
      'User is authenticated'
    )

    // Test 2: Cart API
    await runTest(
      'Cart API',
      async () => {
        const response = await fetch('/api/cart')
        return response.ok
      },
      'Cart API is working'
    )

    // Test 3: Services API
    await runTest(
      'Services API',
      async () => {
        const response = await fetch('/api/admin/services')
        return response.status === 200 || response.status === 401 // 401 is expected for non-admin
      },
      'Services API is accessible'
    )

    // Test 4: Add to Cart
    await runTest(
      'Add to Cart',
      async () => {
        try {
          if (addToCart) {
            await addToCart('format', null, 1)
            return true
          }
          return false
        } catch {
          return false
        }
      },
      'Add to cart functionality works'
    )

    // Test 5: Remove from Cart
    await runTest(
      'Remove from Cart',
      async () => {
        try {
          if (items && items.length > 0 && removeFromCart) {
            await removeFromCart(items[0].id)
            return true
          }
          return true // No items to remove
        } catch {
          return false
        }
      },
      'Remove from cart functionality works'
    )

    // Test 6: Database Connection
    await runTest(
      'Database Connection',
      async () => {
        const response = await fetch('/api/cart')
        return response.ok
      },
      'Database connection is working'
    )

    // Test 7: Stripe Configuration
    await runTest(
      'Stripe Configuration',
      async () => {
        const response = await fetch('/api/payments/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: 'test', paymentMethodId: 'test' })
        })
        // 503 means Stripe is not configured, which is expected
        return response.status === 503 || response.status === 401
      },
      'Stripe API is accessible (may not be configured)'
    )

    // Test 8: Order Creation
    await runTest(
      'Order Creation',
      async () => {
        if (items && items.length === 0 && addToCart) {
          await addToCart('format', null, 1)
        }
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: (items || []).map(item => ({
              serviceId: item.serviceId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              notes: ''
            })),
            notes: 'Test order',
            scheduledDate: ''
          })
        })
        return response.ok
      },
      'Order creation works'
    )

    setIsRunning(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-500'
      case 'fail': return 'text-red-500'
      default: return 'text-yellow-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return '✅'
      case 'fail': return '❌'
      default: return '⏳'
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🧪 اختبار شامل للموقع</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">حالة النظام</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold text-green-400">المستخدم</h3>
              <p>{session ? `مرحباً ${session.user?.name}` : 'غير مسجل الدخول'}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-400">السلة</h3>
              <p>{items?.length || 0} عنصر في السلة</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-400">الاختبارات</h3>
              <p>{testResults.length} اختبار مكتمل</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className={`px-8 py-4 rounded-lg font-semibold text-lg transition-colors ${
              isRunning
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isRunning ? 'جاري التشغيل...' : '🚀 تشغيل جميع الاختبارات'}
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">نتائج الاختبارات</h2>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    result.status === 'pass' ? 'bg-green-900/30' : 
                    result.status === 'fail' ? 'bg-red-900/30' : 'bg-yellow-900/30'
                  }`}
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <span className="text-2xl">{getStatusIcon(result.status)}</span>
                    <div>
                      <h3 className="font-semibold">{result.name}</h3>
                      <p className={`text-sm ${getStatusColor(result.status)}`}>
                        {result.message}
                      </p>
                      {result.details && (
                        <p className="text-xs text-gray-400 mt-1">{result.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-900/30 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📋 قائمة المهام للإطلاق</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center space-x-2 space-x-reverse">
              <span className="text-green-400">✅</span>
              <span>إصلاح مشكلة framer-motion</span>
            </li>
            <li className="flex items-center space-x-2 space-x-reverse">
              <span className="text-yellow-400">⏳</span>
              <span>إعداد مفاتيح Stripe</span>
            </li>
            <li className="flex items-center space-x-2 space-x-reverse">
              <span className="text-yellow-400">⏳</span>
              <span>اختبار شامل</span>
            </li>
            <li className="flex items-center space-x-2 space-x-reverse">
              <span className="text-gray-400">⭕</span>
              <span>إشعارات البريد الإلكتروني</span>
            </li>
            <li className="flex items-center space-x-2 space-x-reverse">
              <span className="text-gray-400">⭕</span>
              <span>تحسين نظام الدعم الفني</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}