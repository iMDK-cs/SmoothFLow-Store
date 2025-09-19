"use client"

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
// Removed getUserFromSession import - using session data directly

export default function UserProfile() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
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
    if (session?.user) {
      // Get role from session data directly (no Prisma call needed)
      setUserRole((session.user as { role?: string })?.role || null);
    }
  }, [session])

  if (!session) {
    return (
      <div className="flex items-center space-x-reverse space-x-2">
        <Link
          href="/auth/signin"
          className="px-4 py-2 text-gray-300 hover:text-white transition-colors font-medium"
        >
          تسجيل الدخول
        </Link>
        <Link
          href="/auth/signup"
          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors font-medium shadow-lg shadow-sky-500/25"
        >
          إنشاء حساب
        </Link>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-reverse space-x-3 p-2 rounded-lg hover:bg-sky-900/30 border border-sky-500/20 hover:border-sky-400/40 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-sky-500/25">
          {session.user?.name ? getInitials(session.user.name) : 'U'}
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-white font-medium text-sm">{session.user?.name}</p>
          <p className="text-gray-400 text-xs">{session.user?.email}</p>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-700">
            <p className="text-white font-medium">{session.user?.name}</p>
            <p className="text-gray-400 text-sm">{session.user?.email}</p>
          </div>
          
          <div className="py-2">
            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              الملف الشخصي
            </Link>
            
            <Link
              href="/orders"
              className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              طلباتي
            </Link>
            
            <Link
              href="/bookings"
              className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              حجوزاتي
            </Link>
            
            {userRole === 'ADMIN' && (
              <Link
                href="/admin-dashboard"
                className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0l1.83 7.5a1.5 1.5 0 01-1.441 1.933H9.936a1.5 1.5 0 01-1.441-1.933l1.83-7.5zM18 8.25a3 3 0 00-3 3v.75a3 3 0 003 3h.75a3 3 0 003-3v-.75a3 3 0 00-3-3h-.75z" />
                </svg>
                لوحة التحكم
              </Link>
            )}
          </div>
          
          <div className="border-t border-gray-700 pt-2">
            <button
              onClick={() => {
                signOut()
                setIsOpen(false)
              }}
              className="flex items-center w-full px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              تسجيل الخروج
            </button>
          </div>
        </div>
      )}
    </div>
  )
}