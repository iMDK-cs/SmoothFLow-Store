"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Service {
  id: string
  title: string
  description: string
  basePrice: number
  category: string
  image?: string
  icon?: string
  color?: string
  popular: boolean
  active: boolean
  available: boolean
  stock?: number
  createdAt: string
  updatedAt: string
  options: ServiceOption[]
  _count: {
    orderItems: number
  }
}

interface ServiceOption {
  id: string
  title: string
  description: string
  price: number
  active: boolean
}

interface UploadStats {
  total: number
  created: number
  updated: number
  errors: number
}

export default function AdminServicesManager() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [syncLoading, setSyncLoading] = useState(false)
  const [uploadStats, setUploadStats] = useState<UploadStats | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchServices()
  }, [session, status, router])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/services')
      
      if (!response.ok) {
        if (response.status === 403) {
          setError('ليس لديك صلاحية للوصول إلى إدارة الخدمات')
          return
        }
        throw new Error('Failed to fetch services')
      }

      const data = await response.json()
      setServices(data.services || [])
    } catch (error) {
      console.error('Error fetching services:', error)
      setError('حدث خطأ أثناء تحميل الخدمات')
    } finally {
      setLoading(false)
    }
  }

  const syncServices = async () => {
    try {
      setSyncLoading(true)
      setError('')
      
      const response = await fetch('/api/admin/services/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to sync services')
      }

      const data = await response.json()
      setUploadStats(data.stats)
      
      // Refresh services list
      await fetchServices()
      
    } catch (error) {
      console.error('Error syncing services:', error)
      setError('حدث خطأ أثناء مزامنة الخدمات')
    } finally {
      setSyncLoading(false)
    }
  }

  const toggleServiceStatus = async (serviceId: string, field: 'active' | 'available' | 'popular') => {
    try {
      const response = await fetch(`/api/admin/services/${serviceId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ field })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update service')
      }

      // Update local state
      setServices(services.map(service => 
        service.id === serviceId 
          ? { ...service, [field]: !service[field] }
          : service
      ))
    } catch (error) {
      console.error('Error updating service:', error)
      setError('حدث خطأ أثناء تحديث الخدمة')
    }
  }

  const categories = ['all', 'assembly', 'maintenance', 'software', 'network', 'overclocking']
  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory)

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white text-xl font-medium">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-8xl mb-6">⚠️</div>
          <h1 className="text-white text-3xl font-bold mb-4">خطأ في الوصول</h1>
          <p className="text-gray-300 text-lg mb-6">{error}</p>
          <Link
            href="/admin-dashboard"
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-4 rounded-lg transition-colors text-lg font-medium"
          >
            العودة للوحة الإدارة
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
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
                إدارة الخدمات المتقدمة
              </h1>
              <p className="text-cyan-200 text-sm">مزامنة وإدارة خدمات الموقع</p>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link
                href="/admin-dashboard"
                className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                🏠 العودة للوحة الإدارة
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Actions Section */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-600 shadow-lg mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <span className="text-2xl mr-3">🔄</span>
            مزامنة الخدمات
          </h2>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={syncServices}
              disabled={syncLoading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:transform-none"
            >
              {syncLoading ? '🔄 جاري المزامنة...' : '📥 مزامنة الخدمات من الكود'}
            </button>
            
            <button
              onClick={fetchServices}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🔄 تحديث القائمة
            </button>
          </div>

          {uploadStats && (
            <div className="bg-gradient-to-r from-green-900 to-emerald-900 p-4 rounded-lg border border-green-600">
              <h3 className="text-green-300 font-bold mb-2">✅ نتائج المزامنة:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-300">{uploadStats.total}</div>
                  <div className="text-green-200">إجمالي</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-300">{uploadStats.created}</div>
                  <div className="text-blue-200">جديد</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-300">{uploadStats.updated}</div>
                  <div className="text-yellow-200">محدث</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-300">{uploadStats.errors}</div>
                  <div className="text-red-200">أخطاء</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                    : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                }`}
              >
                {category === 'all' ? 'جميع الفئات' : 
                 category === 'assembly' ? 'التجميع' :
                 category === 'maintenance' ? 'الصيانة' :
                 category === 'software' ? 'البرمجيات' :
                 category === 'network' ? 'الشبكات' :
                 category === 'overclocking' ? 'رفع الأداء' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div key={service.id} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-600 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <span className="text-2xl">{service.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{service.title}</h3>
                    <p className="text-sm text-gray-400">{service.category}</p>
                  </div>
                </div>
                {service.popular && (
                  <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">⭐ شائع</span>
                )}
              </div>

              <p className="text-gray-300 text-sm mb-4 line-clamp-2">{service.description}</p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-cyan-300">{service.basePrice} ريال</span>
                <div className="text-sm text-gray-400">
                  <div>📦 {service._count.orderItems} طلب</div>
                </div>
              </div>

              {service.options && service.options.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-cyan-300 mb-2">الخيارات:</h4>
                  {service.options.map(option => (
                    <div key={option.id} className="text-xs text-gray-400 mb-1">
                      • {option.title}: +{option.price} ريال
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => toggleServiceStatus(service.id, 'active')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    service.active 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  {service.active ? '✅ نشط' : '❌ غير نشط'}
                </button>
                
                <button
                  onClick={() => toggleServiceStatus(service.id, 'available')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    service.available 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  {service.available ? '✅ متوفر' : '❌ غير متوفر'}
                </button>
                
                <button
                  onClick={() => toggleServiceStatus(service.id, 'popular')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    service.popular 
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  {service.popular ? '⭐ شائع' : '⭐ عادي'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl text-gray-300 mb-2">لا توجد خدمات</h3>
            <p className="text-gray-400">
              {selectedCategory === 'all' 
                ? 'لا توجد خدمات في قاعدة البيانات' 
                : `لا توجد خدمات في فئة ${selectedCategory}`}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}