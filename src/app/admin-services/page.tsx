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
  options: Array<{
    id: string
    title: string
    description: string
    price: number
    active: boolean
  }>
}

export default function AdminServices() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  // const [showModal, setShowModal] = useState(false) // Removed unused variables
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [editingPrice, setEditingPrice] = useState(false)
  const [newPrice, setNewPrice] = useState('')
  const [discount, setDiscount] = useState('')
  const [editingStock, setEditingStock] = useState(false)
  const [newStock, setNewStock] = useState('')

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
          setError('ليس لديك صلاحية للوصول إلى هذه الصفحة')
          return
        }
        throw new Error('Failed to fetch services')
      }

      const data = await response.json()
      setServices(data.services)
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          basePrice: newPrice
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update service price')
      }

      await fetchServices()
      setEditingPrice(false)
      setNewPrice('')
    } catch (error) {
      console.error('Error updating service price:', error)
      setError('حدث خطأ أثناء تحديث السعر')
    } finally {
      setUpdating(null)
    }
  }

  const updateServiceStock = async (serviceId: string, newStock: number) => {
    try {
      setUpdating(serviceId)
      const response = await fetch(`/api/admin/services?serviceId=${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stock: newStock
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update service stock')
      }

      await fetchServices()
      setEditingStock(false)
      setNewStock('')
    } catch (error) {
      console.error('Error updating service stock:', error)
      setError('حدث خطأ أثناء تحديث الكمية')
    } finally {
      setUpdating(null)
    }
  }

  const toggleServiceAvailability = async (serviceId: string, available: boolean) => {
    try {
      setUpdating(serviceId)
      const response = await fetch(`/api/admin/services?serviceId=${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          available
        })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle service availability')
      }

      await fetchServices()
    } catch (error) {
      console.error('Error toggling service availability:', error)
      setError('حدث خطأ أثناء تحديث حالة التوفر')
    } finally {
      setUpdating(null)
    }
  }

  const toggleServiceStatus = async (serviceId: string, active: boolean) => {
    try {
      setUpdating(serviceId)
      const response = await fetch('/api/admin/services/toggle-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serviceId,
          active
        })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle service status')
      }

      await fetchServices()
    } catch (error) {
      console.error('Error toggling service status:', error)
      setError('حدث خطأ أثناء تحديث حالة الخدمة')
    } finally {
      setUpdating(null)
    }
  }

  const deleteService = async (serviceId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return

    try {
      setUpdating(serviceId)
      const response = await fetch('/api/admin/services/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ serviceId })
      })

      if (!response.ok) {
        throw new Error('Failed to delete service')
      }

      await fetchServices()
    } catch (error) {
      console.error('Error deleting service:', error)
      setError('حدث خطأ أثناء حذف الخدمة')
    } finally {
      setUpdating(null)
    }
  }

  const applyDiscount = async (serviceId: string, discountPercent: number) => {
    try {
      setUpdating(serviceId)
      const service = services.find(s => s.id === serviceId)
      if (!service) return

      const discountedPrice = service.basePrice * (1 - discountPercent / 100)
      
      const response = await fetch('/api/admin/services/update-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serviceId,
          basePrice: discountedPrice
        })
      })

      if (!response.ok) {
        throw new Error('Failed to apply discount')
      }

      await fetchServices()
      setDiscount('')
    } catch (error) {
      console.error('Error applying discount:', error)
      setError('حدث خطأ أثناء تطبيق الخصم')
    } finally {
      setUpdating(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
          <Link
            href="/"
            className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link href="/admin-dashboard" className="text-2xl font-bold text-sky-400">
                ← العودة للوحة التحكم
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-300">إدارة الخدمات والأسعار</span>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <span className="text-gray-300">مرحباً، {session?.user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6">جميع الخدمات</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div className="flex justify-between items-start mb-3">
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

                <p className="text-gray-300 text-sm mb-3 line-clamp-2">{service.description}</p>
                
                <div className="mb-3">
                  <p className="text-gray-400 text-sm">الفئة</p>
                  <p className="text-white">{service.category}</p>
                </div>

                <div className="mb-4">
                  <p className="text-gray-400 text-sm">السعر الأساسي</p>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {editingPrice && selectedService?.id === service.id ? (
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="number"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          className="bg-gray-600 text-white px-2 py-1 rounded text-sm w-20"
                          placeholder="السعر"
                        />
                        <button
                          onClick={() => updateServicePrice(service.id, parseFloat(newPrice))}
                          disabled={updating === service.id}
                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
                        >
                          حفظ
                        </button>
                        <button
                          onClick={() => {
                            setEditingPrice(false)
                            setNewPrice('')
                          }}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <p className="text-white font-bold text-lg">{service.basePrice.toFixed(2)} ريال</p>
                        <button
                          onClick={() => {
                            setSelectedService(service)
                            setNewPrice(service.basePrice.toString())
                            setEditingPrice(true)
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                        >
                          تعديل
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stock Management */}
                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-2">الكمية المتوفرة</p>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {editingStock && selectedService?.id === service.id ? (
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="number"
                          value={newStock}
                          onChange={(e) => setNewStock(e.target.value)}
                          className="bg-gray-600 text-white px-2 py-1 rounded text-sm w-20"
                          placeholder="الكمية"
                          min="0"
                        />
                        <button
                          onClick={() => updateServiceStock(service.id, parseInt(newStock) || 0)}
                          disabled={updating === service.id}
                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
                        >
                          حفظ
                        </button>
                        <button
                          onClick={() => {
                            setEditingStock(false)
                            setNewStock('')
                          }}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <p className="text-white font-medium">
                          {service.stock !== null ? service.stock : 'غير محدود'}
                        </p>
                        <button
                          onClick={() => {
                            setSelectedService(service)
                            setNewStock(service.stock?.toString() || '')
                            setEditingStock(true)
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                        >
                          تعديل
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Availability Toggle */}
                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-2">حالة التوفر</p>
                  <button
                    onClick={() => toggleServiceAvailability(service.id, !service.available)}
                    disabled={updating === service.id}
                    className={`px-3 py-1 rounded text-xs disabled:opacity-50 ${
                      service.available 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {updating === service.id ? 'جاري...' : (service.available ? 'إخفاء' : 'إظهار')}
                  </button>
                </div>

                {/* Discount Section */}
                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-2">خصم</p>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="bg-gray-600 text-white px-2 py-1 rounded text-sm w-16"
                      placeholder="%"
                      min="0"
                      max="100"
                    />
                    <button
                      onClick={() => applyDiscount(service.id, parseFloat(discount))}
                      disabled={updating === service.id || !discount}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
                    >
                      تطبيق
                    </button>
                  </div>
                </div>

                {/* Service Options */}
                {service.options.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gray-400 text-sm mb-2">الخيارات</p>
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
                    onClick={() => toggleServiceStatus(service.id, !service.active)}
                    disabled={updating === service.id}
                    className={`px-3 py-1 rounded text-xs disabled:opacity-50 ${
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
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}