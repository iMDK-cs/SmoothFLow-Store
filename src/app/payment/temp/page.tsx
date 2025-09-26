"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import FileUpload from '@/components/FileUpload'
import { useOrderNotifications } from '@/components/EnhancedNotification'
import { useCart } from '@/contexts/CartContext'

interface TempOrderData {
  items: Array<{
    serviceId: string
    optionId?: string
    quantity: number
    unitPrice: number
    totalPrice: number
    notes: string
  }>
  notes: string
  scheduledDate: string
  totalAmount: number
  orderNumber: string
}

export default function TempPayment() {
  const { data: session } = useSession()
  const router = useRouter()
  const { clearCart } = useCart()
  const [tempOrderData, setTempOrderData] = useState<TempOrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer'>('bank_transfer')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [fileError, setFileError] = useState('')
  const { notifyReceiptUploaded, notifyError } = useOrderNotifications()

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Load temporary order data from sessionStorage
    const storedData = sessionStorage.getItem('tempOrderData')
    if (!storedData) {
      router.push('/checkout')
      return
    }

    try {
      const orderData = JSON.parse(storedData)
      setTempOrderData(orderData)
    } catch (error) {
      console.error('Failed to parse temp order data:', error)
      router.push('/checkout')
      return
    } finally {
      setLoading(false)
    }
  }, [session, router])

  const handleCardPayment = () => {
    alert('خدمة الدفع بالبطاقة غير متوفرة حالياً. يرجى استخدام التحويل البنكي.')
  }

  const handleBankTransferPayment = async () => {
    if (!selectedFile || !tempOrderData) {
      setFileError('يرجى رفع إيصال التحويل البنكي')
      return
    }

    setProcessing(true)
    setError('')
    setFileError('')

    try {
      // First upload the file
      setUploadingFile(true)
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('tempOrder', 'true') // Flag to indicate this is a temp order

      const uploadResponse = await fetch('/api/upload/receipt', {
        method: 'POST',
        body: formData,
      })

      const uploadData = await uploadResponse.json()

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || 'فشل في رفع الملف')
      }

      // Create the actual order with payment details
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: tempOrderData.items,
          notes: tempOrderData.notes,
          scheduledDate: tempOrderData.scheduledDate,
          paymentMethod: 'bank_transfer',
          paymentStatus: 'PENDING',
          status: 'PENDING_ADMIN_APPROVAL',
          receiptPath: uploadData.filePath,
          fileData: uploadData.fileData,
        }),
      })

      const orderData = await orderResponse.json()

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'فشل في إنشاء الطلب')
      }

      // Clear temporary data
      sessionStorage.removeItem('tempOrderData')
      
      // Clear cart
      await clearCart()

      // Show success notification
      notifyReceiptUploaded(orderData.order.orderNumber)
      
      // Redirect to order tracking page
      router.push(`/orders/${orderData.order.id}?bank_transfer=true`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'فشل في إتمام الدفع'
      setError(errorMessage)
      notifyError(errorMessage)
    } finally {
      setProcessing(false)
      setUploadingFile(false)
    }
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setFileError('')
  }

  const handleFileRemove = () => {
    setSelectedFile(null)
    setFileError('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري تحميل تفاصيل الطلب...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">خطأ</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/checkout')}
            className="text-blue-400 hover:text-blue-300"
          >
            العودة لصفحة الدفع
          </button>
        </div>
      </div>
    )
  }

  if (!tempOrderData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">الطلب غير موجود</h2>
          <button
            onClick={() => router.push('/checkout')}
            className="text-blue-400 hover:text-blue-300"
          >
            العودة لصفحة الدفع
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">إتمام الدفع</h1>
          
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">تفاصيل الطلب</h2>
            <div className="space-y-2">
              <p className="text-gray-300">رقم الطلب المؤقت: <span className="text-white font-medium">{tempOrderData.orderNumber}</span></p>
              <p className="text-gray-300">المجموع: <span className="text-white font-medium">{tempOrderData.totalAmount.toFixed(2)} ريال</span></p>
              <p className="text-gray-300">عدد العناصر: <span className="text-white font-medium">{tempOrderData.items.length}</span></p>
              <p className="text-gray-300">الحالة: <span className="text-yellow-400">في انتظار الدفع</span></p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">اختر طريقة الدفع</h2>
            
            {/* Payment Method Selection */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-red-500 bg-red-500/20'
                      : 'border-gray-600 bg-gray-700/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">💳</div>
                    <p className="text-white font-medium">بطاقات + Apple Pay</p>
                    <p className="text-gray-400 text-sm">غير متوفر حالياً</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-gray-600 bg-gray-700/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🏦</div>
                    <p className="text-white font-medium">حوالة بنكية</p>
                    <p className="text-gray-400 text-sm">يتطلب موافقة</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Card Payment Info */}
            {paymentMethod === 'card' && (
              <div className="mb-6">
                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-semibold text-red-300 mb-2">خدمة الدفع بالبطاقة غير متوفرة</h3>
                  <p className="text-red-200 text-sm">
                    نعتذر، خدمة الدفع بالبطاقة غير متوفرة حالياً. يرجى استخدام التحويل البنكي لإتمام طلبك.
                  </p>
                </div>
              </div>
            )}

            {/* Bank Transfer Details */}
            <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">تفاصيل الحساب البنكي</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">اسم صاحب الحساب:</span>
                    <span className="text-white font-medium">محمد عبدالله صالح الدخيلي</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">IBAN:</span>
                    <span className="text-white font-mono">SA23 8000 0499 6080 1600 4598</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">رقم الحساب:</span>
                    <span className="text-white font-mono">499000010006086004598</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">المبلغ:</span>
                    <span className="text-white font-bold text-lg">{tempOrderData.totalAmount.toFixed(2)} ريال</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-900/30 rounded-lg">
                  <h4 className="text-blue-300 font-medium mb-2">خطوات الدفع:</h4>
                  <ol className="text-blue-200 text-sm space-y-1 list-decimal list-inside">
                    <li>قم بتحويل المبلغ إلى الحساب أعلاه</li>
                    <li>احفظ إيصال التحويل</li>
                    <li>ارفع إيصال التحويل أدناه</li>
                    <li>انتظر موافقة الإدارة</li>
                  </ol>
                </div>
              </div>

            {/* File Upload for Bank Transfer */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">رفع إيصال التحويل</h3>
              <FileUpload
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                selectedFile={selectedFile}
                loading={uploadingFile}
                error={fileError}
              />
            </div>

            {/* Payment Button */}
            <div className="space-y-4">
              {paymentMethod === 'card' ? (
                <button
                  onClick={handleCardPayment}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  خدمة غير متوفرة - جرب التحويل البنكي
                </button>
              ) : (
                <button
                  onClick={handleBankTransferPayment}
                  disabled={processing || !selectedFile}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {processing ? 'جاري المعالجة...' : 'إرسال إيصال التحويل'}
                </button>
              )}
            </div>

            {error && (
              <div className="mt-4 text-red-400 text-sm text-center">{error}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
