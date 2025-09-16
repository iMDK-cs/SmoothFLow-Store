"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'

interface BookingCalendarProps {
  serviceId: string
  onBookingConfirmed: (booking: any) => void
}

export default function BookingCalendar({ serviceId, onBookingConfirmed }: BookingCalendarProps) {
  const { data: session } = useSession()
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || !selectedDate || !selectedTime) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId,
          date: selectedDate,
          time: selectedTime,
          notes: notes.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create booking')
      }

      const booking = await response.json()
      onBookingConfirmed(booking)
      
      // Reset form
      setSelectedDate('')
      setSelectedTime('')
      setNotes('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 mb-4">يجب تسجيل الدخول لحجز موعد</p>
        <a href="/auth/signin" className="text-blue-400 hover:text-blue-300">
          تسجيل الدخول
        </a>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">حجز موعد</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
            التاريخ
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            الوقت
          </label>
          <div className="grid grid-cols-2 gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => setSelectedTime(time)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedTime === time
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
            ملاحظات إضافية (اختياري)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="أي ملاحظات خاصة بالموعد..."
            dir="rtl"
          />
        </div>

        {error && (
          <div className="text-red-400 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedDate || !selectedTime}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? 'جاري الحجز...' : 'تأكيد الحجز'}
        </button>
      </form>
    </div>
  )
}