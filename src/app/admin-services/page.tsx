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
  createdAt: string
  updatedAt: string
  options: Array<{
    id: string
    title: string
    description: string
    price: number
    active: boolean
  }>
}

interface Notification {
  message: string
  type: 'success' | 'error' | 'info'
}

export default function AdminServices() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [notification, setNotification] = useState<Notification | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterAvailability, setFilterAvailability] = useState('all')

  // New service form state
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    basePrice: 0,
    category: '',
    image: '',
    icon: '',
    available: true,
    stock: null as number | null
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchServices()
  }, [session, status, router])

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/services')
      
      if (!response.ok) {
        if (response.status === 403) {
          setError('ليس لديك صلاحية للوصول إلى هذه الصفحة')
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

  const updateServicePrice = async (serviceId: string, newPrice: number) => {
    try {
      setUpdating(serviceId)
      const response = await fetch(`/api/admin/services?serviceId=${serviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ basePrice: newPrice })
      })

      if (!response.ok) {
        throw new Error('Failed to update service price')
      }

      // Optimistic update
      setServices(services.map(service => 
        service.id === serviceId 
          ? { ...service, basePrice: newPrice }
          : service
      ))
      
      showNotification('تم تحديث السعر بنجاح', 'success')
    } catch (error) {
      console.error('Error updating service price:', error)
      showNotification('حدث خطأ أثناء تحديث السعر', 'error')
    } finally {
      setUpdating(null)
    }
  }

  const toggleServiceAvailability = async (serviceId: string) => {
    try {
      setUpdating(serviceId)
      const service = services.find(s => s.id === serviceId)
      if (!service) return

      const response = await fetch(`/api/admin/services?serviceId=${serviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          available: !service.available,
          availabilityStatus: !service.available ? 'available' : 'out_of_stock'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle service availability')
      }

      // Optimistic update
      setServices(services.map(s => 
        s.id === serviceId 
          ? { 
              ...s, 
              available: !s.available,
              availabilityStatus: !s.available ? 'available' : 'out_of_stock'
            }
          : s
      ))
      
      showNotification(
        `تم ${!service.available ? 'إظهار' : 'إخفاء'} الخدمة بنجاح`, 
        'success'
      )
    } catch (error) {
      console.error('Error toggling service availability:', error)
      showNotification('حدث خطأ أثناء تحديث حالة التوفر', 'error')
    } finally {
      setUpdating(null)
    }
  }

  const toggleServiceStatus = async (serviceId: string) => {
    try {
      setUpdating(serviceId)
      const service = services.find(s => s.id === serviceId)
      if (!service) return

      const newActiveStatus = !service.active
      const newAvailableStatus = newActiveStatus

      const response = await fetch('/api/admin/services/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          serviceId, 
          active: newActiveStatus,
          available: newAvailableStatus,
          availabilityStatus: newAvailableStatus ? 'available' : 'out_of_stock'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle service status')
      }

      // Optimistic update
      setServices(services.map(s => 
        s.id === serviceId 
          ? { 
              ...s, 
              active: newActiveStatus,
              available: newAvailableStatus,
              availabilityStatus: newAvailableStatus ? 'available' : 'out_of_stock'
            }
          : s
      ))
      
      showNotification(
        `تم ${newActiveStatus ? 'تفعيل' : 'إلغاء تفعيل'} الخدمة بنجاح`, 
        'success'
      )
    } catch (error) {
      console.error('Error toggling service status:', error)
      showNotification('حدث خطأ أثناء تحديث حالة الخدمة', 'error')
    } finally {
      setUpdating(null)
    }
  }

  const deleteService = async (serviceId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟ لا يمكن التراجع عن هذا الإجراء.')) return

    try {
      setUpdating(serviceId)
      const response = await fetch('/api/admin/services/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete service')
      }

      // Optimistic update
      setServices(services.filter(s => s.id !== serviceId))
      showNotification('تم حذف الخدمة بنجاح', 'success')
    } catch (error) {
      console.error('Error deleting service:', error)
      showNotification(
        error instanceof Error ? error.message : 'حدث خطأ أثناء حذف الخدمة', 
        'error'
      )
    } finally {
      setUpdating(null)
    }
  }

  const addNewService = async () => {
    try {
      // Validate required fields
      if (!newService.title || !newService.description || !newService.category || newService.basePrice <= 0) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error')
        return
      }

      setUpdating('new')
      const response = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create service')
      }

      const data = await response.json()
      setServices([data.service, ...services])
      setShowAddModal(false)
      setNewService({
        title: '',
        description: '',
        basePrice: 0,
        category: '',
        image: '',
        icon: '',
        available: true,
        stock: null
      })
      showNotification('تم إضافة الخدمة بنجاح', 'success')
    } catch (error) {
      console.error('Error creating service:', error)
      showNotification(
        error instanceof Error ? error.message : 'حدث خطأ أثناء إضافة الخدمة', 
        'error'
      )
    } finally {
      setUpdating(null)
    }
  }

  // Filter services
  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory
    const matchesAvailability = filterAvailability === 'all' || 
                               (filterAvailability === 'available' && service.available) ||
                               (filterAvailability === 'unavailable' && !service.available)
    
    return matchesSearch && matchesCategory && matchesAvailability
  })

  const categories = [...new Set(services.map(s => s.category))]

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-white text-2xl font-bold mb-2">خطأ في الوصول</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors">
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-600' :
          notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        } text-white`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link href="/admin-dashboard" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
                ← العودة للوحة التحكم
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-300">إدارة الخدمات</span>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                + إضافة خدمة جديدة
              </button>
              <span className="text-gray-300">مرحباً، {session?.user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">البحث</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن خدمة..."
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">الفئة</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">جميع الفئات</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">حالة التوفر</label>
              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">جميع الحالات</option>
                <option value="available">متوفر</option>
                <option value="unavailable">غير متوفر</option>
              </select>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div key={service.id} className={`bg-gray-800 rounded-lg p-6 border transition-colors ${
              !service.available ? 'border-red-500/50 bg-gray-800/50' : 'border-gray-700'
            }`}>
              {/* Service Header */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-white">{service.title}</h3>
                <div className="flex space-x-2 space-x-reverse">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    service.active ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {service.active ? 'نشط' : 'غير نشط'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    service.available ? 'bg-blue-500' : 'bg-gray-500'
                  }`}>
                    {service.available ? 'متوفر' : 'غير متوفر'}
                  </span>
                  {service.popular && (
                    <span className="px-2 py-1 rounded-full text-xs bg-yellow-500">
                      شائع
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4 line-clamp-2">{service.description}</p>
              
              <div className="mb-4">
                <p className="text-gray-400 text-sm">الفئة: {service.category}</p>
              </div>

              {/* Price Section */}
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">السعر الأساسي</p>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <p className="text-white font-bold text-lg">{service.basePrice.toFixed(2)} ريال</p>
                  <button
                    onClick={() => {
                      const newPrice = prompt('أدخل السعر الجديد:', service.basePrice.toString())
                      if (newPrice && !isNaN(parseFloat(newPrice))) {
                        updateServicePrice(service.id, parseFloat(newPrice))
                      }
                    }}
                    disabled={updating === service.id}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs disabled:opacity-50 transition-colors"
                  >
                    {updating === service.id ? 'جاري...' : 'تعديل'}
                  </button>
                </div>
              </div>

              {/* Stock Section */}
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">الكمية المتوفرة</p>
                <p className="text-white font-medium">
                  {service.stock !== null ? service.stock : 'غير محدود'}
                </p>
              </div>

              {/* Service Options */}
              {service.options.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-2">الخيارات ({service.options.length})</p>
                  <div className="space-y-1">
                    {service.options.slice(0, 2).map((option) => (
                      <div key={option.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">{option.title}</span>
                        <span className="text-white font-medium">{option.price.toFixed(2)} ريال</span>
                      </div>
                    ))}
                    {service.options.length > 2 && (
                      <p className="text-gray-400 text-xs">+{service.options.length - 2} خيارات أخرى</p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2 space-x-reverse">
                <button
                  onClick={() => toggleServiceAvailability(service.id)}
                  disabled={updating === service.id}
                  className={`px-3 py-1 rounded text-xs disabled:opacity-50 transition-colors ${
                    service.available 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {updating === service.id ? 'جاري...' : (service.available ? 'إخفاء' : 'إظهار')}
                </button>
                
                <button
                  onClick={() => toggleServiceStatus(service.id)}
                  disabled={updating === service.id}
                  className={`px-3 py-1 rounded text-xs disabled:opacity-50 transition-colors ${
                    service.active 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {updating === service.id ? 'جاري...' : (service.active ? 'إلغاء التفعيل' : 'تفعيل')}
                </button>
                
                <button
                  onClick={() => deleteService(service.id)}
                  disabled={updating === service.id}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50 transition-colors"
                >
                  حذف
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
              {searchTerm || filterCategory !== 'all' || filterAvailability !== 'all'
                ? 'لا توجد خدمات تطابق معايير البحث'
                : 'لم يتم إضافة أي خدمات بعد'}
            </p>
          </div>
        )}
      </main>

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">إضافة خدمة جديدة</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">اسم الخدمة</label>
                <input
                  type="text"
                  value={newService.title}
                  onChange={(e) => setNewService({...newService, title: e.target.value})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="أدخل اسم الخدمة"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">الوصف</label>
                <textarea
                  value={newService.description}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  rows={3}
                  placeholder="أدخل وصف الخدمة"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">السعر (ريال)</label>
                <input
                  type="number"
                  value={newService.basePrice}
                  onChange={(e) => setNewService({...newService, basePrice: parseFloat(e.target.value) || 0})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">الفئة</label>
                <select
                  value={newService.category}
                  onChange={(e) => setNewService({...newService, category: e.target.value})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">اختر الفئة</option>
                  <option value="assembly">التجميع</option>
                  <option value="maintenance">الصيانة</option>
                  <option value="software">البرمجيات</option>
                  <option value="network">الشبكات</option>
                  <option value="overclocking">رفع الأداء</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">رابط الصورة</label>
                <input
                  type="url"
                  value={newService.image}
                  onChange={(e) => setNewService({...newService, image: e.target.value})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">الأيقونة (Emoji)</label>
                <input
                  type="text"
                  value={newService.icon}
                  onChange={(e) => setNewService({...newService, icon: e.target.value})}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="🖥️"
                  maxLength={2}
                />
                <p className="text-xs text-gray-400 mt-1">استخدم emoji واحد أو رمز</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">الكمية المتوفرة</label>
                <input
                  type="number"
                  value={newService.stock || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setNewService({...newService, stock: value ? parseInt(value) || null : null})
                  }}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="اترك فارغ للكمية غير المحدودة"
                  min="0"
                />
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <input
                  type="checkbox"
                  id="available"
                  checked={newService.available}
                  onChange={(e) => setNewService({...newService, available: e.target.checked})}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="available" className="text-gray-300">متوفر للعملاء</label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 space-x-reverse mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={addNewService}
                disabled={updating === 'new' || !newService.title || !newService.description || !newService.category || newService.basePrice <= 0}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating === 'new' ? 'جاري الإضافة...' : 'إضافة الخدمة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}