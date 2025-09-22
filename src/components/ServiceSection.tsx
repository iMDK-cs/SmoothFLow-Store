"use client"

import { useState, useEffect } from 'react'
import ServiceCard from './ui/ServiceCard'
import { Service } from '@/types/service'

interface ServiceSectionProps {
  title: string
  description?: string
  category?: string
  featured?: boolean
  limit?: number
  className?: string
}

export default function ServiceSection({
  title,
  description,
  category,
  featured,
  limit = 6,
  className = ""
}: ServiceSectionProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const params = new URLSearchParams()
        if (category) params.append('category', category)
        if (featured) params.append('featured', 'true')
        if (limit) params.append('limit', limit.toString())
        
        const response = await fetch(`/api/services?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('فشل في جلب الخدمات')
        }
        
        const data = await response.json()
        
        if (data.success) {
          setServices(data.data.services)
        } else {
          throw new Error(data.error || 'خطأ في جلب البيانات')
        }
      } catch (err) {
        console.error('Error fetching services:', err)
        setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [category, featured, limit])

  if (loading) {
    return (
      <section className={`py-12 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">{title}</h2>
            {description && (
              <p className="text-lg text-gray-300">{description}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: limit }).map((_, index) => (
              <div key={index} className="modern-card animate-pulse-slow">
                <div className="h-48 w-full bg-gray-700 rounded-t-lg"></div>
                <div className="p-4">
                  <div className="mb-2 h-6 w-3/4 bg-gray-700 rounded"></div>
                  <div className="mb-3 h-4 w-full bg-gray-700 rounded"></div>
                  <div className="mb-3 h-4 w-2/3 bg-gray-700 rounded"></div>
                  <div className="h-10 w-full bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className={`py-12 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">{title}</h2>
            {description && (
              <p className="text-lg text-gray-300">{description}</p>
            )}
          </div>
          
          <div className="text-center">
            <div className="mb-4 text-6xl">⚠️</div>
            <h3 className="mb-2 text-xl font-semibold text-red-400">خطأ في تحميل الخدمات</h3>
            <p className="text-gray-300">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-sky-600 px-6 py-2 text-white hover:bg-sky-700"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (services.length === 0) {
    return (
      <section className={`py-12 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white">{title}</h2>
            {description && (
              <p className="text-lg text-gray-300">{description}</p>
            )}
          </div>
          
          <div className="text-center">
            <div className="mb-4 text-6xl">🔍</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-400">لا توجد خدمات متاحة</h3>
            <p className="text-gray-500">لم يتم العثور على خدمات في هذه الفئة</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">{title}</h2>
          {description && (
            <p className="text-lg text-gray-300">{description}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              className="animate-fadeInUp"
            />
          ))}
        </div>
        
        {services.length >= limit && (
          <div className="mt-8 text-center">
            <a
              href="/services"
              className="inline-flex items-center rounded-lg bg-sky-600 px-6 py-3 text-white transition-colors hover:bg-sky-700"
            >
              عرض جميع الخدمات
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </section>
  )
}