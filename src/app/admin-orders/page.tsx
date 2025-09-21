"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminFileViewer from '@/components/AdminFileViewer'

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  paymentStatus: string
  paymentMethod?: string
  notes?: string
  scheduledDate?: string
  createdAt: string
  user: {
    name: string | null
    email: string
  }
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    totalPrice: number
    service: {
      title: string
    }
    option?: {
      title: string
    }
  }>
}

export default function AdminOrders() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchOrders()
  }, [session, status, router])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/orders')
      
      if (!response.ok) {
        if (response.status === 403) {
          setError('ليس لديك صلاحية للوصول إلى هذه الصفحة')
          return
        }
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data.orders)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('حدث خطأ أثناء تحميل الطلبات')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(orderId)
      const response = await fetch('/api/admin/orders/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          status: newStatus
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      await fetchOrders()
    } catch (error) {
      console.error('Error updating order:', error)
      setError('حدث خطأ أثناء تحديث الطلب')
    } finally {
      setUpdating(null)
    }
  }

  const deleteOrder = async (orderId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return

    try {
      setUpdating(orderId)
      const response = await fetch('/api/admin/orders/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId })
      })

      if (!response.ok) {
        throw new Error('Failed to delete order')
      }

      await fetchOrders()
    } catch (error) {
      console.error('Error deleting order:', error)
      setError('حدث خطأ أثناء حذف الطلب')
    } finally {
      setUpdating(null)
    }
  }

  const handleApproval = (order: Order, action: 'approve' | 'reject') => {
    setSelectedOrder(order)
    setApprovalAction(action)
    setAdminNotes('')
    setShowApprovalModal(true)
  }

  const submitApproval = async () => {
    if (!selectedOrder || !approvalAction) return

    setUpdating(selectedOrder.id)
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: approvalAction,
          adminNotes: adminNotes
        })
      })

      if (response.ok) {
        // Refresh orders
        fetchOrders()
        setShowApprovalModal(false)
        setSelectedOrder(null)
        setApprovalAction(null)
        setAdminNotes('')
        alert(approvalAction === 'approve' ? 'تم قبول الطلب بنجاح' : 'تم رفض الطلب')
      } else {
        const error = await response.json()
        alert(error.error || 'فشل في تحديث حالة الطلب')
      }
    } catch (error) {
      console.error('Approval error:', error)
      alert('حدث خطأ أثناء تحديث حالة الطلب')
    } finally {
      setUpdating(null)
    }
  }

  const downloadReceipt = (notes: string) => {
    try {
      // First try to extract from the new format with complete Base64 data
      let base64Data = null;
      let fileType = 'application/pdf';
      let fileName = `receipt_${selectedOrder?.orderNumber}.pdf`;
      
      // Try new format first (Base64: complete data)
      const base64Match = notes.match(/Base64: ([A-Za-z0-9+/=]+)/);
      if (base64Match) {
        base64Data = base64Match[1];
        
        // Extract file type from notes
        const typeMatch = notes.match(/Type: ([^\\n]+)/);
        if (typeMatch) fileType = typeMatch[1];
        
        // Extract file name from notes
        const nameMatch = notes.match(/File: ([^\\n]+)/);
        if (nameMatch) fileName = nameMatch[1];
      } else {
        // Try old format (base64: truncated data)
        const oldBase64Match = notes.match(/base64:([A-Za-z0-9+/=]+)/);
        if (oldBase64Match) {
          base64Data = oldBase64Match[1];
        }
      }
      
      if (base64Data) {
        // Clean the base64 data (remove any non-base64 characters)
        const cleanBase64 = base64Data.replace(/[^A-Za-z0-9+/=]/g, '');
        
        // Check if the base64 data is valid
        if (cleanBase64.length < 100) {
          alert('بيانات الملف مقطوعة أو تالفة. يرجى إعادة رفع الملف.');
          return;
        }
        
        const byteCharacters = atob(cleanBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: fileType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert('لم يتم العثور على بيانات الملف');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('حدث خطأ أثناء تحميل الملف');
    }
  }

  const extractFileInfo = (notes: string) => {
    try {
      // Extract file information from notes
      const base64Match = notes.match(/Base64: ([A-Za-z0-9+/=]+)/);
      const typeMatch = notes.match(/Type: ([^\n]+)/);
      const nameMatch = notes.match(/File: ([^\n]+)/);
      const sizeMatch = notes.match(/Size: (\d+) bytes/);
      const uploadedMatch = notes.match(/uploadedAt: ([^\n]+)/);

      if (!base64Match) return null;

      return {
        hasFile: true,
        fileName: nameMatch ? nameMatch[1] : 'receipt.pdf',
        fileType: typeMatch ? typeMatch[1] : 'application/pdf',
        fileSize: sizeMatch ? parseInt(sizeMatch[1]) : undefined,
        uploadedAt: uploadedMatch ? uploadedMatch[1] : undefined
      };
    } catch (error) {
      console.error('Error extracting file info:', error);
      return null;
    }
  }

  const cleanNotesDisplay = (notes: string) => {
    if (!notes) return '';
    
    // Split notes by lines
    const lines = notes.split('\n');
    const cleanLines = [];
    
    for (const line of lines) {
      // Skip lines that contain technical file data
      if (line.includes('File:') || 
          line.includes('Type:') || 
          line.includes('Size:') || 
          line.includes('Base64:') ||
          line.includes('base64:') ||
          line.includes('uploadedAt:')) {
        continue;
      }
      
      // Skip empty lines
      if (line.trim() === '') continue;
      
      cleanLines.push(line);
    }
    
    return cleanLines.join('\n');
  }

  const viewReceipt = (notes: string) => {
    try {
      // First try to extract from the new format with complete Base64 data
      let base64Data = null;
      let fileType = 'application/pdf';
      
      // Try new format first (Base64: complete data)
      const base64Match = notes.match(/Base64: ([A-Za-z0-9+/=]+)/);
      if (base64Match) {
        base64Data = base64Match[1];
        
        // Extract file type from notes
        const typeMatch = notes.match(/Type: ([^\\n]+)/);
        if (typeMatch) fileType = typeMatch[1];
      } else {
        // Try old format (base64: truncated data)
        const oldBase64Match = notes.match(/base64:([A-Za-z0-9+/=]+)/);
        if (oldBase64Match) {
          base64Data = oldBase64Match[1];
        }
      }
      
      if (base64Data) {
        // Clean the base64 data (remove any non-base64 characters)
        const cleanBase64 = base64Data.replace(/[^A-Za-z0-9+/=]/g, '');
        
        // Check if the base64 data is valid
        if (cleanBase64.length < 100) {
          alert('بيانات الملف مقطوعة أو تالفة. يرجى إعادة رفع الملف.');
          return;
        }
        
        const byteCharacters = atob(cleanBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: fileType });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        alert('لم يتم العثور على بيانات الملف');
      }
    } catch (error) {
      console.error('Error viewing file:', error);
      alert('حدث خطأ أثناء عرض الملف');
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500'
      case 'PENDING_ADMIN_APPROVAL': return 'bg-orange-500'
      case 'CONFIRMED': return 'bg-blue-500'
      case 'IN_PROGRESS': return 'bg-purple-500'
      case 'COMPLETED': return 'bg-green-500'
      case 'CANCELLED': return 'bg-red-500'
      case 'REFUNDED': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'معلق'
      case 'PENDING_ADMIN_APPROVAL': return 'في انتظار موافقة الإدارة'
      case 'CONFIRMED': return 'مؤكد'
      case 'IN_PROGRESS': return 'قيد التنفيذ'
      case 'COMPLETED': return 'مكتمل'
      case 'CANCELLED': return 'ملغي'
      case 'REFUNDED': return 'مسترد'
      default: return status
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-white text-2xl font-bold mb-2">خطأ في الوصول</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            href="/"
            className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link href="/admin-dashboard" className="text-2xl font-bold text-sky-400">
                ← العودة للوحة التحكم
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-300">إدارة الطلبات</span>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <span className="text-gray-300">مرحباً، {session?.user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6">جميع الطلبات</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="pb-3 text-gray-400">رقم الطلب</th>
                  <th className="pb-3 text-gray-400">العميل</th>
                  <th className="pb-3 text-gray-400">المبلغ</th>
                  <th className="pb-3 text-gray-400">الحالة</th>
                  <th className="pb-3 text-gray-400">التاريخ</th>
                  <th className="pb-3 text-gray-400">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-700">
                    <td className="py-3 text-white font-medium">{order.orderNumber}</td>
                    <td className="py-3 text-gray-300">
                      <div>
                        <p className="font-medium">{order.user.name || 'غير محدد'}</p>
                        <p className="text-sm text-gray-400">{order.user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 text-white font-bold">{order.totalAmount.toFixed(2)} ريال</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-US')}
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-2 space-x-reverse">
                        <button
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowModal(true)
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                        >
                          عرض التفاصيل
                        </button>
                        
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                            disabled={updating === order.id}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                          >
                            {updating === order.id ? 'جاري...' : 'قبول'}
                          </button>
                        )}

                        {order.status === 'PENDING_ADMIN_APPROVAL' && (
                          <>
                            <button
                              onClick={() => handleApproval(order, 'approve')}
                              disabled={updating === order.id}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                            >
                              {updating === order.id ? 'جاري...' : 'قبول'}
                            </button>
                            <button
                              onClick={() => handleApproval(order, 'reject')}
                              disabled={updating === order.id}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                            >
                              {updating === order.id ? 'جاري...' : 'رفض'}
                            </button>
                          </>
                        )}
                        
                        {order.status === 'CONFIRMED' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'IN_PROGRESS')}
                            disabled={updating === order.id}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                          >
                            {updating === order.id ? 'جاري...' : 'بدء التنفيذ'}
                          </button>
                        )}
                        
                        {order.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                            disabled={updating === order.id}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                          >
                            {updating === order.id ? 'جاري...' : 'إكمال'}
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteOrder(order.id)}
                          disabled={updating === order.id}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                        >
                          {updating === order.id ? 'جاري...' : 'حذف'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Approval Modal */}
        {showApprovalModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                  {approvalAction === 'approve' ? 'قبول الطلب' : 'رفض الطلب'}
                </h3>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-gray-300 mb-2">رقم الطلب: {selectedOrder.orderNumber}</p>
                  <p className="text-gray-300 mb-2">المبلغ: {selectedOrder.totalAmount.toFixed(2)} ريال</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ملاحظات الإدارة (اختياري)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    rows={3}
                    placeholder="أضف ملاحظات حول قرار الموافقة أو الرفض..."
                  />
                </div>

                <div className="flex space-x-3 space-x-reverse">
                  <button
                    onClick={submitApproval}
                    disabled={updating === selectedOrder.id}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                      approvalAction === 'approve'
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    } disabled:opacity-50`}
                  >
                    {updating === selectedOrder.id ? 'جاري...' : (approvalAction === 'approve' ? 'قبول' : 'رفض')}
                  </button>
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    className="flex-1 py-2 px-4 rounded-lg font-medium bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">تفاصيل الطلب</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">رقم الطلب</p>
                    <p className="text-white font-medium">{selectedOrder.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">المبلغ الإجمالي</p>
                    <p className="text-white font-bold">{selectedOrder.totalAmount.toFixed(2)} ريال</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">الحالة</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">تاريخ الطلب</p>
                    <p className="text-white">{new Date(selectedOrder.createdAt).toLocaleDateString('en-US')}</p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-2">العميل</p>
                  <div className="bg-gray-700 p-3 rounded">
                    <p className="text-white font-medium">{selectedOrder.user.name || 'غير محدد'}</p>
                    <p className="text-gray-300 text-sm">{selectedOrder.user.email}</p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-2">الخدمات المطلوبة</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="bg-gray-700 p-3 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-medium">{item.service.title}</p>
                            {item.option && (
                              <p className="text-gray-300 text-sm">{item.option.title}</p>
                            )}
                            <p className="text-gray-400 text-sm">الكمية: {item.quantity}</p>
                          </div>
                          <div className="text-left">
                            <p className="text-white font-bold">{item.totalPrice.toFixed(2)} ريال</p>
                            <p className="text-gray-400 text-sm">السعر: {item.unitPrice.toFixed(2)} ريال</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">ملاحظات</p>
                    <p className="text-white bg-gray-700 p-3 rounded text-sm max-h-32 overflow-y-auto">
                      {cleanNotesDisplay(selectedOrder.notes || '') || 'لا توجد ملاحظات'}
                    </p>
                    
                    {/* Bank Transfer Receipt */}
                    {selectedOrder.paymentMethod === 'bank_transfer' && (selectedOrder.notes.includes('Base64:') || selectedOrder.notes.includes('base64:')) && (
                      <div className="mt-4">
                        {(() => {
                          const fileInfo = extractFileInfo(selectedOrder.notes!);
                          return fileInfo ? (
                            <AdminFileViewer
                              orderId={selectedOrder.id}
                              fileName={fileInfo.fileName}
                              fileType={fileInfo.fileType}
                              fileSize={fileInfo.fileSize}
                              uploadedAt={fileInfo.uploadedAt}
                            />
                          ) : (
                            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                              <p className="text-gray-300 text-sm">لا يمكن عرض الملف - بيانات تالفة</p>
                              <div className="flex space-x-2 space-x-reverse mt-3">
                                <button
                                  onClick={() => viewReceipt(selectedOrder.notes!)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                                >
                                  محاولة عرض
                                </button>
                                <button
                                  onClick={() => downloadReceipt(selectedOrder.notes!)}
                                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
                                >
                                  محاولة تحميل
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}