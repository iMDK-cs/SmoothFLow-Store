"use client"

import { useState, useCallback } from 'react'
import { useCart } from '@/contexts/CartContext'

interface OptimizedAddToCartButtonProps {
  serviceId: string
  optionId?: string
  quantity?: number
  className?: string
  children?: React.ReactNode
  disabled?: boolean
}

export default function OptimizedAddToCartButton({
  serviceId,
  optionId,
  quantity = 1,
  className = '',
  children,
  disabled = false
}: OptimizedAddToCartButtonProps) {
  const { addToCart, loading } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  const handleAddToCart = useCallback(async () => {
    if (isAdding || loading || disabled) return
    
    setIsAdding(true)
    setRetryCount(0)
    
    try {
      await addToCart(serviceId, optionId, quantity)
    } catch (error) {
      console.error('Add to cart failed:', error)
      
      // Retry logic for network errors
      if (retryCount < maxRetries && error instanceof Error && error.message.includes('fetch')) {
        setRetryCount(prev => prev + 1)
        setTimeout(() => {
          handleAddToCart()
        }, 1000 * retryCount) // Exponential backoff
      }
    } finally {
      setIsAdding(false)
    }
  }, [serviceId, optionId, quantity, addToCart, loading, disabled, retryCount])

  const isLoading = isAdding || loading

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || isLoading}
      className={`
        relative overflow-hidden
        transition-all duration-200
        ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105'}
        ${className}
      `}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      )}
      
      <div className="relative flex items-center justify-center gap-2">
        {isLoading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        
        {children || (
          <span>
            {isLoading ? 'جاري الإضافة...' : 'أضف للسلة'}
          </span>
        )}
      </div>
      
      {retryCount > 0 && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
      )}
    </button>
  )
}