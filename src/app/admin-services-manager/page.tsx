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
  availabilityStatus: string
  stock?: number
  availabilityUpdatedAt?: string
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
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [bulkAvailabilityStatus, setBulkAvailabilityStatus] = useState<string>('available')
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

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

  const updateServiceAvailability = async (serviceId: string, available: boolean, availabilityStatus: string) => {
    try {
      const response = await fetch(`/api/admin/services?serviceId=${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ available, availabilityStatus })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update service availability')
      }

      // Update local state
      setServices(services.map(service => 
        service.id === serviceId 
          ? { 
              ...service, 
              available, 
              availabilityStatus,
              availabilityUpdatedAt: new Date().toISOString()
            }
          : service
      ))
    } catch (error) {
      console.error('Error updating service availability:', error)
      setError('حدث خطأ أثناء تحديث توفر الخدمة')
    }
  }

  const updateServicePrice = async (serviceId: string, basePrice: number) => {
    try {
      const response = await fetch(`/api/admin/services?serviceId=${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ basePrice })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update service price')
      }

      // Update local state
      setServices(services.map(service => 
        service.id === serviceId 
          ? { ...service, basePrice }
          : service
      ))
    } catch (error) {
      console.error('Error updating service price:', error)
      setError('حدث خطأ أثناء تحديث سعر الخدمة')
    }
  }

  const handleBulkAvailabilityUpdate = async () => {
    if (selectedServices.length === 0) return

    try {
      const available = bulkAvailabilityStatus === 'available'
      const response = await fetch('/api/admin/services/bulk-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          serviceIds: selectedServices, 
          available,
          availabilityStatus: bulkAvailabilityStatus
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update services availability')
      }

      // Update local state
      setServices(services.map(service => 
        selectedServices.includes(service.id)
          ? { 
              ...service, 
              available,
              availabilityStatus: bulkAvailabilityStatus,
              availabilityUpdatedAt: new Date().toISOString()
            }
          : service
      ))

      setSelectedServices([])
    } catch (error) {
      console.error('Error updating bulk availability:', error)
      setError('حدث خطأ أثناء تحديث توفر الخدمات')
    }
  }

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleSelectAll = () => {
    if (selectedServices.length === filteredServices.length) {
      setSelectedServices([])
    } else {
      setSelectedServices(filteredServices.map(service => service.id))
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

        {/* Bulk Management Section */}
        {selectedServices.length > 0 && (
          <div className="bg-gradient-to-br from-blue-800 to-cyan-800 rounded-xl p-6 border border-blue-600 shadow-lg mb-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="text-2xl mr-3">⚡</span>
              إدارة جماعية ({selectedServices.length} خدمة مختارة)
            </h3>
            
            <div className="flex flex-wrap gap-4">
              <select
                value={bulkAvailabilityStatus}
                onChange={(e) => setBulkAvailabilityStatus(e.target.value)}
                className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-cyan-400 focus:outline-none"
              >
                <option value="available">متوفر</option>
                <option value="out_of_stock">غير متوفر</option>
                <option value="discontinued">متوقف</option>
                <option value="coming_soon">قريباً</option>
              </select>
              
              <button
                onClick={handleBulkAvailabilityUpdate}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                ✅ تحديث الحالة
              </button>
              
              <button
                onClick={() => setSelectedServices([])}
                className="bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                ❌ إلغاء التحديد
              </button>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3 mb-4">
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
          
          {/* Select All Button */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleSelectAll}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {selectedServices.length === filteredServices.length ? '❌ إلغاء تحديد الكل' : '✅ تحديد الكل'}
            </button>
            
            <span className="text-gray-300 text-sm">
              {selectedServices.length} من {filteredServices.length} مختار
            </span>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div key={service.id} className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300 ${
              selectedServices.includes(service.id) 
                ? 'border-cyan-400 ring-2 ring-cyan-400/50' 
                : 'border-slate-600'
            } ${!service.available ? 'opacity-75' : ''}`}>
              
              {/* Selection Checkbox */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.id)}
                    onChange={() => handleServiceSelect(service.id)}
                    className="w-4 h-4 text-cyan-600 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500 focus:ring-2"
                  />
                  <span className="text-2xl">{service.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{service.title}</h3>
                    <p className="text-sm text-gray-400">{service.category}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {service.popular && (
                    <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">⭐ شائع</span>
                  )}
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    service.availabilityStatus === 'available' ? 'bg-green-600 text-white' :
                    service.availabilityStatus === 'out_of_stock' ? 'bg-red-600 text-white' :
                    service.availabilityStatus === 'discontinued' ? 'bg-gray-600 text-white' :
                    service.availabilityStatus === 'coming_soon' ? 'bg-blue-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {service.availabilityStatus === 'available' ? '✅ متوفر' :
                     service.availabilityStatus === 'out_of_stock' ? '❌ غير متوفر' :
                     service.availabilityStatus === 'discontinued' ? '⛔ متوقف' :
                     service.availabilityStatus === 'coming_soon' ? '⏳ قريباً' :
                     '❓ غير محدد'}
                  </span>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4 line-clamp-2">{service.description}</p>

              {/* Price Section with Edit */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="text-2xl font-bold text-cyan-300">{service.basePrice} ريال</span>
                  <button
                    onClick={() => {
                      setEditingService(service)
                      setShowEditModal(true)
                    }}
                    className="text-xs bg-slate-600 hover:bg-slate-700 text-white px-2 py-1 rounded transition-colors"
                  >
                    ✏️ تعديل
                  </button>
                </div>
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

              {/* Availability Management */}
              <div className="mb-4">
                <h4 className="text-sm font-bold text-cyan-300 mb-2">حالة التوفر:</h4>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={service.availabilityStatus}
                    onChange={(e) => updateServiceAvailability(service.id, e.target.value === 'available', e.target.value)}
                    className="bg-slate-700 text-white px-2 py-1 rounded text-xs border border-slate-600 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="available">متوفر</option>
                    <option value="out_of_stock">غير متوفر</option>
                    <option value="discontinued">متوقف</option>
                    <option value="coming_soon">قريباً</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
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

              {/* Last Updated Info */}
              {service.availabilityUpdatedAt && (
                <div className="mt-3 text-xs text-gray-500">
                  آخر تحديث: {new Date(service.availabilityUpdatedAt).toLocaleDateString('ar-SA')}
                </div>
              )}
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

      {/* Edit Service Modal */}
      {showEditModal && editingService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 w-full max-w-md border border-slate-600 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="text-2xl mr-3">✏️</span>
              تعديل الخدمة
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  اسم الخدمة
                </label>
                <input
                  type="text"
                  value={editingService.title}
                  disabled
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-cyan-400 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  السعر الأساسي (ريال)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingService.basePrice}
                  onChange={(e) => setEditingService({
                    ...editingService,
                    basePrice: parseFloat(e.target.value) || 0
                  })}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-cyan-400 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  حالة التوفر
                </label>
                <select
                  value={editingService.availabilityStatus}
                  onChange={(e) => setEditingService({
                    ...editingService,
                    availabilityStatus: e.target.value,
                    available: e.target.value === 'available'
                  })}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="available">متوفر</option>
                  <option value="out_of_stock">غير متوفر</option>
                  <option value="discontinued">متوقف</option>
                  <option value="coming_soon">قريباً</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 space-x-reverse mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={async () => {
                  await updateServicePrice(editingService.id, editingService.basePrice)
                  await updateServiceAvailability(editingService.id, editingService.available, editingService.availabilityStatus)
                  setShowEditModal(false)
                }}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}