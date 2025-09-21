"use client";

import React, { useState, useEffect } from 'react';

interface PaymobPaymentProps {
  paymentKey: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

const PaymobPayment: React.FC<PaymobPaymentProps> = ({
  paymentKey,
  onSuccess,
  onError,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for Paymob iframe messages
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://accept.paymob.com') {
        return;
      }

      const data = event.data;
      
      if (data.type === 'success') {
        setIsLoading(false);
        onSuccess(data.transaction_id);
      } else if (data.type === 'error') {
        setIsLoading(false);
        setError(data.message || 'حدث خطأ أثناء المعالجة');
        onError(data.message || 'حدث خطأ أثناء المعالجة');
      } else if (data.type === 'cancel') {
        setIsLoading(false);
        onCancel();
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onSuccess, onError, onCancel]);

  const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/3?payment_token=${paymentKey}`;

  return (
    <div className="w-full h-full min-h-[600px] relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-10">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700">جاري تحميل صفحة الدفع...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-red-900 bg-opacity-75 flex items-center justify-center z-10">
          <div className="bg-white rounded-lg p-6 text-center max-w-md">
            <div className="text-red-500 text-4xl mb-4">❌</div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                window.location.reload();
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}

      <iframe
        src={iframeUrl}
        className="w-full h-full border-0 rounded-lg"
        title="Paymob Payment"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError('فشل في تحميل صفحة الدفع');
          setIsLoading(false);
        }}
      />
    </div>
  );
};

export default PaymobPayment;