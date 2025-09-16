"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  serviceId: string
  orderId?: string
  onReviewSubmitted: () => void
}

export default function ReviewModal({ 
  isOpen, 
  onClose, 
  serviceId, 
  orderId, 
  onReviewSubmitted 
}: ReviewModalProps) {
  const { data: session } = useSession()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || rating === 0) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId,
          orderId,
          rating,
          comment: comment.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit review')
      }

      onReviewSubmitted()
      onClose()
      setRating(0)
      setComment('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6" dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">تقييم الخدمة</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              التقييم
            </label>
            <div className="flex space-x-reverse space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-2xl focus:outline-none"
                >
                  <span className={star <= rating ? 'text-yellow-400' : 'text-gray-400'}>
                    ★
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">
              التعليق (اختياري)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="شاركنا تجربتك مع هذه الخدمة..."
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          <div className="flex space-x-reverse space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال التقييم'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}