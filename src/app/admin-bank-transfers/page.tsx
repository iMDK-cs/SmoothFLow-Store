"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BankTransferOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  bankTransferStatus: string;
  bankTransferReceipt: string;
  adminNotes: string | null;
  adminApprovedAt: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
    phone: string | null;
  };
  items: Array<{
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
  }>;
}

export default function AdminBankTransfers() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<BankTransferOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<BankTransferOrder | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
      router.push('/auth/signin');
      return;
    }

    fetchBankTransferOrders();
  }, [session, status, router]);

  const fetchBankTransferOrders = async () => {
    try {
      const response = await fetch('/api/admin/bank-transfers');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminNotes: adminNotes,
          action: 'approve',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve order');
      }

      // Refresh orders
      await fetchBankTransferOrders();
      setShowModal(false);
      setSelectedOrder(null);
      setAdminNotes('');
    } catch (error) {
      setError('Failed to approve order');
      console.error('Error approving order:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminNotes: adminNotes,
          action: 'reject',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject order');
      }

      // Refresh orders
      await fetchBankTransferOrders();
      setShowModal(false);
      setSelectedOrder(null);
      setAdminNotes('');
    } catch (error) {
      setError('Failed to reject order');
      console.error('Error rejecting order:', error);
    } finally {
      setProcessing(false);
    }
  };

  const openModal = (order: BankTransferOrder) => {
    setSelectedOrder(order);
    setAdminNotes(order.adminNotes || '');
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_ADMIN_APPROVAL':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">في انتظار الموافقة</span>;
      case 'APPROVED':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">موافق عليه</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">مرفوض</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">{status}</span>;
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

  if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">غير مصرح</h2>
          <Link href="/auth/signin" className="text-blue-400 hover:text-blue-300">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">طلبات التحويل البنكي</h1>
            <Link
              href="/admin-dashboard"
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              العودة للوحة الإدارة
            </Link>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      رقم الطلب
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      العميل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      المبلغ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      تاريخ الطلب
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div>
                          <div className="font-medium">{order.user.name}</div>
                          <div className="text-gray-400">{order.user.email}</div>
                          {order.user.phone && (
                            <div className="text-gray-400">{order.user.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">
                        {order.totalAmount.toFixed(2)} ريال
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.bankTransferStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(order.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2 space-x-reverse">
                          <button
                            onClick={() => openModal(order)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            مراجعة
                          </button>
                          {order.bankTransferReceipt && (
                            <a
                              href={order.bankTransferReceipt}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:text-green-300"
                            >
                              عرض الإيصال
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">لا توجد طلبات تحويل بنكي</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              مراجعة طلب التحويل البنكي - {selectedOrder.orderNumber}
            </h2>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">العميل</label>
                  <p className="text-white">{selectedOrder.user.name}</p>
                  <p className="text-gray-400 text-sm">{selectedOrder.user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">المبلغ</label>
                  <p className="text-white font-semibold">{selectedOrder.totalAmount.toFixed(2)} ريال</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">تفاصيل الطلب</label>
                <div className="bg-gray-700 rounded-lg p-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-600 last:border-b-0">
                      <div>
                        <p className="text-white">{item.service.title}</p>
                        {item.option && (
                          <p className="text-gray-400 text-sm">{item.option.title}</p>
                        )}
                        <p className="text-gray-400 text-sm">الكمية: {item.quantity}</p>
                      </div>
                      <p className="text-white font-semibold">{item.totalPrice.toFixed(2)} ريال</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.bankTransferReceipt && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">إيصال التحويل</label>
                  <a
                    href={selectedOrder.bankTransferReceipt}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    عرض الإيصال
                  </a>
                </div>
              )}

              <div>
                <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-300 mb-1">
                  ملاحظات الإدارة
                </label>
                <textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="أضف ملاحظات حول الموافقة أو الرفض..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 space-x-reverse">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleRejectOrder(selectedOrder.id)}
                disabled={processing}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {processing ? 'جاري المعالجة...' : 'رفض'}
              </button>
              <button
                onClick={() => handleApproveOrder(selectedOrder.id)}
                disabled={processing}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {processing ? 'جاري المعالجة...' : 'موافقة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}