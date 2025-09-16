'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Booking {
  id: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  price: number;
  createdAt: string;
}

export default function BookingsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchBookings();
    }
  }, [status, router]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500';
      case 'CONFIRMED':
        return 'bg-blue-500';
      case 'COMPLETED':
        return 'bg-green-500';
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'في الانتظار';
      case 'CONFIRMED':
        return 'مؤكد';
      case 'COMPLETED':
        return 'مكتمل';
      case 'CANCELLED':
        return 'ملغي';
      default:
        return status;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">حجوزاتي</h1>
              <p className="text-gray-400 mt-2">إدارة المواعيد المحجوزة</p>
            </div>
            <Link
              href="/profile"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              العودة للملف الشخصي
            </Link>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">لا توجد حجوزات حالياً</div>
              <Link
                href="/"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                تصفح الخدمات
              </Link>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    {booking.serviceName}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {getStatusText(booking.status)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">التاريخ</p>
                    <p className="text-white">{new Date(booking.date).toLocaleDateString('ar-SA')}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">الوقت</p>
                    <p className="text-white">{booking.time}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">السعر</p>
                    <p className="text-white font-semibold">{booking.price} ريال</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-gray-400 text-sm">
                    تاريخ الحجز: {new Date(booking.createdAt).toLocaleDateString('ar-SA')}
                  </p>
                  {booking.status === 'PENDING' && (
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                      إلغاء الحجز
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}