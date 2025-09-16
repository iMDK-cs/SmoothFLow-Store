"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

export default function AdminSetup() {
  const [isLogin, setIsLogin] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  // Update page title based on current mode
  useEffect(() => {
    document.title = isLogin ? 'تسجيل الدخول للإدارة - SmoothFlow' : 'إعداد حساب الإدارة - SmoothFlow'
  }, [isLogin])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      setLoading(false)
      return
    }

    try {
      if (isLogin) {
        // Handle login
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false
        })

        if (result?.error) {
          setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
        } else {
          setSuccess(true)
          setTimeout(() => {
            router.push('/admin-dashboard')
          }, 2000)
        }
      } else {
        // Handle signup
        const response = await fetch('/api/admin/create-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'حدث خطأ أثناء إنشاء حساب الإدارة')
        }

        setSuccess(true)
        setTimeout(() => {
          router.push('/admin-dashboard')
        }, 2000)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-white text-2xl font-bold mb-2">
            {isLogin ? 'تم تسجيل الدخول بنجاح!' : 'تم إنشاء حساب الإدارة بنجاح!'}
          </h1>
          <p className="text-gray-400">جاري التوجه إلى لوحة التحكم...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            {isLogin ? 'تسجيل الدخول للإدارة' : 'إعداد حساب الإدارة'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {isLogin ? 'قم بتسجيل الدخول للوصول إلى لوحة التحكم' : 'قم بإنشاء حساب إدارة للوصول إلى لوحة التحكم'}
          </p>
        </div>

        {/* Toggle between Login and Signup */}
        <div className="flex bg-gray-800 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              isLogin
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              !isLogin
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            إنشاء حساب
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                  الاسم الكامل
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="أدخل بريدك الإلكتروني"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                كلمة المرور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="أدخل كلمة المرور"
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                  تأكيد كلمة المرور
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required={!isLogin}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="أكد كلمة المرور"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? (isLogin ? 'جاري تسجيل الدخول...' : 'جاري الإنشاء...') 
                : (isLogin ? 'تسجيل الدخول' : 'إنشاء حساب الإدارة')
              }
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-sky-400 hover:text-sky-300 text-sm"
            >
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}