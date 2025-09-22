'use client'

import React, { useState, useEffect } from 'react'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { ErrorMessage } from './ui/ErrorBoundary'

interface OrderTrackingStep {
  id: string
  status: string
  title: string
  description?: string
  notes?: string
  timestamp: string
  adminId?: string
  completed: boolean
}

interface OrderTrackingProps {
  orderId: string
  orderNumber: string
  currentStatus: string
}

const statusSteps = [
  {
    status: 'RECEIVED',
    title: 'تم استلام الطلب',
    description: 'تم استلام طلبك وهو قيد المراجعة',
    icon: '📝'
  },
  {
    status: 'CONFIRMED',
    title: 'تم تأكيد الطلب',
    description: 'تم تأكيد طلبك وسيتم البدء في العمل عليه قريباً',
    icon: '✅'
  },
  {
    status: 'IN_PROGRESS',
    title: 'قيد التنفيذ',
    description: 'جاري العمل على طلبك من قبل فريق الفنيين',
    icon: '🔧'
  },
  {
    status: 'TESTING',
    title: 'مرحلة الاختبار',
    description: 'جاري اختبار الخدمة للتأكد من جودة العمل',
    icon: '🧪'
  },
  {
    status: 'COMPLETED',
    title: 'تم الانتهاء',
    description: 'تم الانتهاء من العمل على طلبك',
    icon: '🎉'
  },
  {
    status: 'DELIVERED',
    title: 'تم التسليم',
    description: 'تم تسليم طلبك بنجاح',
    icon: '📦'
  }
]

export const OrderTracking: React.FC<OrderTrackingProps> = ({
  orderId,
  orderNumber,
  currentStatus
}) => {
  const [trackingData, setTrackingData] = useState<OrderTrackingStep[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTrackingData()
  }, [orderId])

  const fetchTrackingData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/orders/${orderId}/tracking`)
      if (!response.ok) {
        throw new Error('فشل في تحميل بيانات تتبع الطلب')
      }
      
      const data = await response.json()
      setTrackingData(data.tracking || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex(step => step.status === currentStatus)
  }

  const isStepCompleted = (stepIndex: number) => {
    const currentStepIndex = getCurrentStepIndex()
    return stepIndex <= currentStepIndex
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          تتبع الطلب #{orderNumber}
        </h3>
        <LoadingSpinner text="جاري تحميل بيانات التتبع..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          تتبع الطلب #{orderNumber}
        </h3>
        <ErrorMessage error={error} />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        تتبع الطلب #{orderNumber}
      </h3>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">تقدم الطلب</span>
          <span className="text-sm font-medium text-blue-600">
            {Math.round(((getCurrentStepIndex() + 1) / statusSteps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((getCurrentStepIndex() + 1) / statusSteps.length) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {statusSteps.map((step, index) => {
          const isCompleted = isStepCompleted(index)
          const isCurrent = step.status === currentStatus
          const trackingStep = trackingData.find(t => t.status === step.status)

          return (
            <div key={step.status} className="flex items-start space-x-4 rtl:space-x-reverse">
              {/* Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                isCompleted
                  ? 'bg-green-100 text-green-600 border-2 border-green-200'
                  : isCurrent
                  ? 'bg-blue-100 text-blue-600 border-2 border-blue-200 animate-pulse'
                  : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
              }`}>
                {isCompleted ? '✓' : step.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-medium ${
                    isCompleted
                      ? 'text-green-600'
                      : isCurrent
                      ? 'text-blue-600'
                      : 'text-gray-500'
                  }`}>
                    {step.title}
                  </h4>
                  {trackingStep && (
                    <time className="text-xs text-gray-500">
                      {formatDate(trackingStep.timestamp)}
                    </time>
                  )}
                </div>
                
                <p className={`mt-1 text-sm ${
                  isCompleted || isCurrent ? 'text-gray-700' : 'text-gray-500'
                }`}>
                  {trackingStep?.description || step.description}
                </p>

                {trackingStep?.notes && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                    <strong>ملاحظة:</strong> {trackingStep.notes}
                  </div>
                )}
              </div>

              {/* Connection line */}
              {index < statusSteps.length - 1 && (
                <div className={`absolute right-5 mt-10 w-0.5 h-6 ${
                  isCompleted ? 'bg-green-200' : 'bg-gray-200'
                }`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Additional info */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">رقم الطلب:</span>
            <span className="ml-2 font-medium">#{orderNumber}</span>
          </div>
          <div>
            <span className="text-gray-600">الحالة الحالية:</span>
            <span className="ml-2 font-medium text-blue-600">
              {statusSteps.find(s => s.status === currentStatus)?.title || currentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Refresh button */}
      <div className="mt-6 text-center">
        <button
          onClick={fetchTrackingData}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <LoadingSpinner size="small" className="mr-2" />
              جاري التحديث...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              تحديث الحالة
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default OrderTracking