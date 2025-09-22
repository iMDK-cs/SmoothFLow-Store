'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { ErrorMessage, SuccessMessage } from './ui/ErrorBoundary'
import { useSession } from 'next-auth/react'

interface Review {
  id: string
  userId: string
  serviceId: string
  orderId?: string
  rating: number
  comment?: string
  images: string[]
  helpful: number
  verified: boolean
  createdAt: string
  user: {
    name: string
  }
}

interface ReviewSystemProps {
  serviceId: string
  serviceName: string
  allowReview?: boolean
  orderId?: string
}

export const ReviewSystem: React.FC<ReviewSystemProps> = ({
  serviceId,
  serviceName,
  allowReview = false,
  orderId
}) => {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  // Review form state
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewImages, setReviewImages] = useState<File[]>([])

  useEffect(() => {
    fetchReviews()
  }, [serviceId, fetchReviews])

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/services/${serviceId}/reviews`)
      if (!response.ok) {
        throw new Error('فشل في تحميل التقييمات')
      }
      
      const data = await response.json()
      setReviews(data.reviews || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }, [serviceId])

  const submitReview = async () => {
    if (!session?.user) {
      setError('يجب تسجيل الدخول لكتابة تقييم')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const formData = new FormData()
      formData.append('serviceId', serviceId)
      formData.append('rating', rating.toString())
      formData.append('comment', comment)
      if (orderId) formData.append('orderId', orderId)

      // Add images
      reviewImages.forEach((image, index) => {
        formData.append(`image_${index}`, image)
      })

      const response = await fetch('/api/reviews', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'فشل في إرسال التقييم')
      }

      setSuccess('تم إرسال تقييمك بنجاح!')
      setShowReviewForm(false)
      setRating(5)
      setComment('')
      setReviewImages([])
      fetchReviews() // Refresh reviews
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
    } finally {
      setSubmitting(false)
    }
  }

  const markHelpful = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST'
      })

      if (response.ok) {
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { ...review, helpful: review.helpful + 1 }
            : review
        ))
      }
    } catch (err) {
      console.error('Failed to mark review as helpful:', err)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
    )
    
    if (validFiles.length !== files.length) {
      setError('بعض الملفات غير صالحة. يجب أن تكون صور بحجم أقل من 5 ميجابايت')
    }
    
    setReviewImages(prev => [...prev, ...validFiles].slice(0, 5)) // Max 5 images
  }

  const removeImage = (index: number) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index))
  }

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1 rtl:space-x-reverse">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRate?.(star)}
            disabled={!interactive}
            className={`text-xl ${
              star <= rating
                ? 'text-yellow-400'
                : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-300 cursor-pointer' : 'cursor-default'}`}
          >
            ★
          </button>
        ))}
      </div>
    )
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  }

  const getRatingDistribution = () => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++
    })
    return distribution
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString))
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          تقييمات {serviceName}
        </h3>

        {/* Rating Summary */}
        {reviews.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {getAverageRating().toFixed(1)}
                </div>
                <div className="mt-1">
                  {renderStars(Math.round(getAverageRating()))}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  من {reviews.length} تقييم
                </div>
              </div>

              <div className="flex-1 ml-8">
                {Object.entries(getRatingDistribution()).reverse().map(([rating, count]) => (
                  <div key={rating} className="flex items-center mb-1">
                    <span className="text-sm text-gray-600 w-8">{rating}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : '0%'
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Review Button */}
        {allowReview && session?.user && (
          <div className="mb-6">
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              إضافة تقييم
            </button>
          </div>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-4">اكتب تقييمك</h4>
            
            {error && <ErrorMessage error={error} className="mb-4" onDismiss={() => setError(null)} />}
            {success && <SuccessMessage message={success} className="mb-4" onDismiss={() => setSuccess(null)} />}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التقييم
                </label>
                {renderStars(rating, true, setRating)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التعليق (اختياري)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="شارك تجربتك مع هذه الخدمة..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صور (اختياري - حتى 5 صور)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
                
                {reviewImages.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {reviewImages.map((image, index) => (
                      <div key={index} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-16 h-16 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-3 rtl:space-x-reverse">
                <button
                  onClick={submitReview}
                  disabled={submitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="small" color="white" className="mr-2" />
                      جاري الإرسال...
                    </>
                  ) : (
                    'إرسال التقييم'
                  )}
                </button>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reviews List */}
      {loading ? (
        <LoadingSpinner text="جاري تحميل التقييمات..." />
      ) : error && reviews.length === 0 ? (
        <ErrorMessage error={error} />
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>لا توجد تقييمات بعد</p>
          {allowReview && (
            <p className="mt-2">كن أول من يقيم هذه الخدمة!</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {review.user.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {review.user.name}
                      {review.verified && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          مشتري موثق
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>

              {review.comment && (
                <p className="text-gray-700 mb-3">{review.comment}</p>
              )}

              {review.images.length > 0 && (
                <div className="flex space-x-2 rtl:space-x-reverse mb-3">
                  {review.images.map((image, index) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={index}
                      src={image}
                      alt={`Review image ${index + 1}`}
                      className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80"
                      onClick={() => window.open(image, '_blank')}
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  onClick={() => markHelpful(review.id)}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1 rtl:space-x-reverse"
                >
                  <span>مفيد ({review.helpful})</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ReviewSystem