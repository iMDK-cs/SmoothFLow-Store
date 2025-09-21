"use client"

import { useState, useEffect, use, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import FileUpload from '@/components/FileUpload'
import { useOrderNotifications } from '@/components/EnhancedNotification'

export default function Payment({ params }: { params: Promise<{ orderId: string }> }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [order, setOrder] = useState<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    items: Array<{
      id: string;
      service: { title: string };
      quantity: number;
      unitPrice: number;
    }>;
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'moyasar' | 'bank_transfer'>('moyasar')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [fileError, setFileError] = useState('')
  const [moyasarData, setMoyasarData] = useState<{
    paymentId: string;
    paymentUrl: string;
  } | null>(null)
  const { notifyReceiptUploaded, notifyError } = useOrderNotifications()
  
  // Unwrap the params Promise
  const resolvedParams = use(params)
  const orderId = resolvedParams.orderId

  const fetchOrder = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (!response.ok) {
        throw new Error('Order not found')
      }
      const data = await response.json()
      setOrder(data.order)
    } catch (err) {
      console.error('Failed to load order:', err)
      setError('Failed to load order')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
    fetchOrder()
  }, [session, orderId, router, fetchOrder])

  const handleMoyasarPayment = async () => {
    setProcessing(true)
    setError('')

    try {
      const response = await fetch('/api/payments/moyasar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed')
      }

      setMoyasarData(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }


  const handleBankTransferPayment = async () => {
    if (!selectedFile) {
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
      formData.append('orderId', orderId)

      const uploadResponse = await fetch('/api/upload/receipt', {
        method: 'POST',
        body: formData,
      })

      const uploadData = await uploadResponse.json()

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || 'فشل في رفع الملف')
      }

      // Then update the order with bank transfer details
      const orderResponse = await fetch(`/api/orders/${orderId}/bank-transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiptPath: uploadData.filePath,
          fileData: uploadData.fileData, // Send complete file data
        }),
      })

      const orderData = await orderResponse.json()

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'فشل في تحديث الطلب')
      }

      // Show success notification
      notifyReceiptUploaded(order?.orderNumber || orderId)
      
      // Redirect to order tracking page
      router.push(`/orders/${orderId}?bank_transfer=true`)
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
            onClick={() => router.push('/')}
            className="text-blue-400 hover:text-blue-300"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">الطلب غير موجود</h2>
          <button
            onClick={() => router.push('/')}
            className="text-blue-400 hover:text-blue-300"
          >
            العودة للصفحة الرئيسية
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
              <p className="text-gray-300">رقم الطلب: <span className="text-white font-medium">{order.orderNumber}</span></p>
              <p className="text-gray-300">المجموع: <span className="text-white font-medium">{order.totalAmount.toFixed(2)} ريال</span></p>
              <p className="text-gray-300">الحالة: <span className="text-yellow-400">{order.status}</span></p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">اختر طريقة الدفع</h2>
            
            {/* Payment Method Selection */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('moyasar')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    paymentMethod === 'moyasar'
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-gray-600 bg-gray-700/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">💳</div>
                    <p className="text-white font-medium">Moyasar</p>
                    <p className="text-gray-400 text-sm">بطاقات + Apple Pay</p>
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

            {/* Moyasar Payment Iframe */}
            {paymentMethod === 'moyasar' && moyasarData && (
              <div className="mb-6">
                <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">الدفع الآمن عبر Moyasar</h3>
                  <p className="text-gray-300 text-sm">
                    بيانات البطاقة محفوظة بأمان عند Moyasar. لن يتم حفظ أي بيانات حساسة على خوادمنا.
                  </p>
                </div>
                <div className="w-full h-[600px] bg-gray-800 rounded-lg overflow-hidden">
                  <iframe
                    src={moyasarData.paymentUrl}
                    className="w-full h-full border-0"
                    title="Moyasar Payment"
                    onLoad={() => console.log('Moyasar iframe loaded')}
                    onError={() => setError('فشل في تحميل بوابة الدفع')}
                  ></iframe>
                </div>
              </div>
            )}

            {/* Bank Transfer Details */}
            {paymentMethod === 'bank_transfer' && (
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
                    <span className="text-white font-bold text-lg">{order.totalAmount.toFixed(2)} ريال</span>
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
            )}

            {/* File Upload for Bank Transfer */}
            {paymentMethod === 'bank_transfer' && (
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
            )}

            {/* Payment Button */}
            <div className="space-y-4">
              {paymentMethod === 'moyasar' && !moyasarData ? (
                <button
                  onClick={handleMoyasarPayment}
                  disabled={processing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {processing ? 'جاري تحضير الدفع...' : 'الدفع عبر Moyasar'}
                </button>
              ) : paymentMethod === 'bank_transfer' ? (
                <button
                  onClick={handleBankTransferPayment}
                  disabled={processing || !selectedFile}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {processing ? 'جاري المعالجة...' : 'إرسال إيصال التحويل'}
                </button>
              ) : null}
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