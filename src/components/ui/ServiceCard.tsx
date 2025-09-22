"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Service } from '@/types/service'
import { useCart } from '@/contexts/CartContext'

interface ServiceCardProps {
  service: Service
  className?: string
  showAddToCart?: boolean
}

export default function ServiceCard({ 
  service, 
  className = "", 
  showAddToCart = true 
}: ServiceCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const { addToCart } = useCart()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isAdding) return
    
    setIsAdding(true)
    try {
      await addToCart(service.id)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const getPrice = () => {
    if (service.options && service.options.length > 0) {
      const minPrice = Math.min(...service.options.map(opt => opt.price))
      const maxPrice = Math.max(...service.options.map(opt => opt.price))
      return minPrice === maxPrice ? `${minPrice} ريال` : `من ${minPrice} ريال`
    }
    return `${service.basePrice} ريال`
  }

  return (
    <div className={`group modern-card hover-lift ${className}`}>
      <Link href={`/service/${service.id}`} className="block">
        {/* Service Image */}
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          {service.image ? (
            <Image
              src={service.image}
              alt={service.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-500 to-blue-600">
              {service.icon ? (
                <Image
                  src={service.icon}
                  alt={service.title}
                  width={64}
                  height={64}
                  className="text-white"
                />
              ) : (
                <div className="text-4xl text-white">🔧</div>
              )}
            </div>
          )}
          
          {/* Popular Badge */}
          {service.popular && (
            <div className="absolute top-3 right-3">
              <span className="rounded-full bg-sky-500 px-2 py-1 text-xs font-semibold text-white">
                شائع
              </span>
            </div>
          )}
          
          {/* Stock Badge */}
          {service.stock !== null && service.stock !== undefined && service.stock <= 5 && (
            <div className="absolute top-3 left-3">
              <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
                {service.stock === 0 ? 'نفد المخزون' : `باقي ${service.stock}`}
              </span>
            </div>
          )}
        </div>

        {/* Service Content */}
        <div className="p-4">
          <h3 className="mb-2 text-lg font-semibold text-white line-clamp-2">
            {service.title}
          </h3>
          
          <p className="mb-3 text-sm text-gray-300 line-clamp-2">
            {service.description}
          </p>
          
          <div className="mb-3 flex items-center justify-between">
            <span className="text-lg font-bold text-sky-400">
              {getPrice()}
            </span>
            
            {service.options && service.options.length > 0 && (
              <span className="text-xs text-gray-400">
                {service.options.length} خيار
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Link
              href={`/service/${service.id}`}
              className="flex-1 rounded-lg bg-sky-600 px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-sky-700"
            >
              عرض التفاصيل
            </Link>
            
            {showAddToCart && service.available && (service.stock === null || service.stock === undefined || service.stock > 0) && (
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdding ? 'جاري الإضافة...' : 'إضافة للسلة'}
              </button>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}