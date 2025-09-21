"use client";

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  service: {
    title: string;
  };
  option?: {
    title: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  bankTransferStatus: string | null;
  bankTransferReceipt: string | null;
  adminNotes: string | null;
  adminApprovedAt: string | null;
  notes: string | null;
  scheduledDate: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export default function OrderDetails({ params }: { params: Promise<{ orderId: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Unwrap the params Promise
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchOrder();
  }, [session, status, router, orderId, fetchOrder]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Order not found');
      }
      const data = await response.json();
      setOrder(data.order);
    } catch (error) {
      setError('Failed to load order');
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">في الانتظار</span>;
      case 'PENDING_ADMIN_APPROVAL':
        return <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">في انتظار موافقة الإدارة</span>;
      case 'CONFIRMED':
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">مؤكد</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">ملغي</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">مكتمل</span>;
      default:
        return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm">{status}</span>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">في الانتظار</span>;
      case 'PAID':
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">مدفوع</span>;
      case 'FAILED':
        return <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">فشل</span>;
      default:
        return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm">{status}</span>;
    }
  };

  const getBankTransferStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    switch (status) {
      case 'PENDING_ADMIN_APPROVAL':
        return <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">في انتظار موافقة الإدارة</span>;
      case 'APPROVED':
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">موافق عليه</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">مرفوض</span>;
      default:
        return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm">{status}</span>;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">تسجيل الدخول مطلوب</h2>
          <Link href="/auth/signin" className="text-blue-400 hover:text-blue-300">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">الطلب غير موجود</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Link href="/orders" className="text-blue-400 hover:text-blue-300">
            العودة لطلباتي
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">تفاصيل الطلب</h1>
            <Link
              href="/orders"
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              العودة لطلباتي
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Info */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">معلومات الطلب</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">رقم الطلب</label>
                    <p className="text-white font-mono">{order.orderNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">تاريخ الطلب</label>
                    <p className="text-white">{new Date(order.createdAt).toLocaleDateString('ar-SA')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">حالة الطلب</label>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">حالة الدفع</label>
                    <div>{getPaymentStatusBadge(order.paymentStatus)}</div>
                  </div>
                  {order.paymentMethod === 'bank_transfer' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">حالة التحويل البنكي</label>
                      <div>{getBankTransferStatusBadge(order.bankTransferStatus)}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">تفاصيل الطلب</h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{item.service.title}</h3>
                        {item.option && (
                          <p className="text-gray-400 text-sm">{item.option.title}</p>
                        )}
                        <p className="text-gray-400 text-sm">الكمية: {item.quantity}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-white font-semibold">
                          {item.totalPrice.toFixed(2)} ريال
                        </p>
                        <p className="text-gray-400 text-sm">
                          {item.unitPrice.toFixed(2)} ريال × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bank Transfer Info */}
              {order.paymentMethod === 'bank_transfer' && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">معلومات التحويل البنكي</h2>
                  
                  {order.bankTransferReceipt && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">إيصال التحويل</label>
                      <a
                        href={order.bankTransferReceipt}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        عرض الإيصال
                      </a>
                    </div>
                  )}

                  {order.adminNotes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">ملاحظات الإدارة</label>
                      <p className="text-white bg-gray-700 p-3 rounded-lg">{order.adminNotes}</p>
                    </div>
                  )}

                  {order.adminApprovedAt && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-300 mb-1">تاريخ المراجعة</label>
                      <p className="text-white">{new Date(order.adminApprovedAt).toLocaleDateString('ar-SA')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Additional Notes */}
              {order.notes && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">ملاحظات إضافية</h2>
                  <p className="text-white">{order.notes}</p>
                </div>
              )}

              {/* Scheduled Date */}
              {order.scheduledDate && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">موعد الخدمة</h2>
                  <p className="text-white">{new Date(order.scheduledDate).toLocaleDateString('ar-SA')}</p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">ملخص الطلب</h2>
                
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-300">{item.service.title}</span>
                      <span className="text-white">{item.totalPrice.toFixed(2)} ريال</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-white">المجموع</span>
                    <span className="text-lg font-semibold text-white">
                      {order.totalAmount.toFixed(2)} ريال
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">طريقة الدفع</h2>
                <div className="text-center">
                  {order.paymentMethod === 'bank_transfer' ? (
                    <div>
                      <div className="text-4xl mb-2">🏦</div>
                      <p className="text-white font-medium">حوالة بنكية</p>
                      <p className="text-gray-400 text-sm">يتطلب موافقة الإدارة</p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-2">💳</div>
                      <p className="text-white font-medium">البطاقة الائتمانية</p>
                      <p className="text-gray-400 text-sm">دفع فوري</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}