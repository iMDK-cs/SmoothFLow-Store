'use client'

import React from 'react'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: 'primary' | 'secondary' | 'white'
  text?: string
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'primary',
  text,
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-t-transparent border-current ${sizeClasses[size]} ${colorClasses[color]}`}>
        <span className="sr-only">جاري التحميل...</span>
      </div>
      {text && (
        <p className={`mt-2 text-sm ${colorClasses[color]}`}>
          {text}
        </p>
      )}
    </div>
  )
}

// Skeleton loading component for content placeholders
interface SkeletonProps {
  className?: string
  width?: string
  height?: string
  rounded?: boolean
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded = false
}) => {
  return (
    <div 
      className={`bg-gray-200 animate-pulse ${width} ${height} ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
    />
  )
}

// Full page loading component
export const PageLoader: React.FC<{ text?: string }> = ({ text = 'جاري تحميل الصفحة...' }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner size="large" color="primary" />
        <p className="mt-4 text-lg text-gray-600">{text}</p>
      </div>
    </div>
  )
}

// Button loading state
interface LoadingButtonProps {
  loading: boolean
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button'
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`relative inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading && (
        <LoadingSpinner size="small" color="white" className="mr-2" />
      )}
      <span className={loading ? 'opacity-75' : ''}>{children}</span>
    </button>
  )
}

// Card skeleton for service/product cards
export const ServiceCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Skeleton height="h-48" className="w-full" />
      <div className="p-4 space-y-3">
        <Skeleton height="h-6" width="w-3/4" />
        <Skeleton height="h-4" width="w-full" />
        <Skeleton height="h-4" width="w-2/3" />
        <div className="flex justify-between items-center mt-4">
          <Skeleton height="h-6" width="w-20" />
          <Skeleton height="h-8" width="w-24" rounded />
        </div>
      </div>
    </div>
  )
}

// List skeleton for orders/items
export const ListItemSkeleton: React.FC = () => {
  return (
    <div className="flex items-center space-x-4 p-4 border-b">
      <Skeleton width="w-12" height="h-12" rounded />
      <div className="flex-1 space-y-2">
        <Skeleton height="h-4" width="w-3/4" />
        <Skeleton height="h-3" width="w-1/2" />
      </div>
      <Skeleton height="h-6" width="w-16" />
    </div>
  )
}