"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Service } from '@/types/service'
import { useCart } from '@/contexts/CartContext'

interface ServiceCardProps {
  service: Service
  className?: string
}

export default function ServiceCard({ 
  service, 
  className = ""
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
              loading="lazy"
              priority={false}
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
                  loading="lazy"
                  priority={false}
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

          {/* Add to Cart Button */}
          <button 
            className={`w-full py-3 rounded-lg font-bold transition-all duration-300 transform text-sm relative overflow-hidden ${
              (service.available === false || service.active === false)
                ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 cursor-not-allowed border border-gray-500/50 shadow-inner' 
                : `sky-blue-gradient text-white ${
                    'shadow-md hover:shadow-lg group-hover:shadow-sky-500/30'
                  }`
            } ${isAdding ? 'animate-pulse' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={isAdding || service.available === false || service.active === false}
            onClick={handleAddToCart}
            aria-label={(service.available === false || service.active === false) ? `${service.title} غير متوفر` : `إضافة ${service.title} إلى السلة`}
          >
            {/* Animated background effect - only for available items */}
            {service.available !== false && (
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-sky-600/20 animate-pulse-slow"></div>
            )}
            
            <span className="flex items-center justify-center relative z-10">
              {(service.available === false || service.active === false) ? (
                <>
                  <span className="text-lg mr-2 animate-pulse">❌</span>
                  <span className="font-bold text-gray-200">غير متوفر حالياً</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-bold" style={{
                    filter: 'contrast(1.2) brightness(1.1)',
                    textShadow: '0 0 3px rgba(255, 255, 255, 0.7)'
                  }}>
                    {isAdding ? 'جاري الإضافة...' : 'إضافة للسلة'}
                  </span>
                  {isAdding ? (
                    <div className="w-3 h-3 mr-1 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l1.5-1.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  )}
                </>
              )}
            </span>
          </button>
        </div>
      </Link>
    </div>
  )
}