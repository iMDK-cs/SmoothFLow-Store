'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Review {
  id: string;
  serviceName: string;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
}

export default function ReviewsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchReviews();
    }
  }, [status, router]);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews');
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${
          index < rating ? 'text-yellow-400' : 'text-gray-400'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
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
              <h1 className="text-3xl font-bold text-white">تقيماتي</h1>
              <p className="text-gray-400 mt-2">مراجعة التقييمات والآراء</p>
            </div>
            <Link
              href="/profile"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              العودة للملف الشخصي
            </Link>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">لا توجد تقييمات حالياً</div>
              <Link
                href="/"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                تصفح الخدمات
              </Link>
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {review.serviceName}
                    </h3>
                    <div className="flex items-center mb-2">
                      <div className="flex space-x-1">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-gray-400 text-sm mr-2">
                        ({review.rating}/5)
                      </span>
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {new Date(review.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-300 leading-relaxed">
                    {review.comment}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-gray-400 text-sm">
                    بواسطة: {review.userName}
                  </p>
                  <div className="flex space-x-2">
                    <button className="text-blue-400 hover:text-blue-300 text-sm">
                      تعديل
                    </button>
                    <button className="text-red-400 hover:text-red-300 text-sm">
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Review Button */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            إضافة تقييم جديد
          </Link>
        </div>
      </div>
    </div>
  );
}