"use client";

import React, { useState, useEffect } from 'react';

interface MoyasarPaymentProps {
  paymentId: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

const MoyasarPayment: React.FC<MoyasarPaymentProps> = ({
  paymentId,
  onSuccess,
  onError,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for Moyasar payment messages
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://moyasar.com") {
        return;
      }

      const data = event.data;
      if (data.type === 'payment_success') {
        onSuccess(data.payment_id);
      } else if (data.type === 'payment_error') {
        onError(data.message || 'Payment failed');
      } else if (data.type === 'payment_cancelled') {
        onCancel();
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onSuccess, onError, onCancel]);

  const paymentUrl = `https://moyasar.com/pay/${paymentId}`;

  return (
    <div className="w-full h-[600px] bg-gray-800 rounded-lg overflow-hidden">
      {isLoading && (
        <div className="flex items-center justify-center h-full text-white">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
          جاري تحميل بوابة الدفع...
        </div>
      )}
      {error && <p className="text-red-400 text-center mt-4">{error}</p>}
      <iframe
        src={paymentUrl}
        className="w-full h-full border-0"
        onLoad={() => setIsLoading(false)}
        onError={() => setError('فشل في تحميل بوابة الدفع')}
        title="Moyasar Payment"
      ></iframe>
    </div>
  );
};

export default MoyasarPayment;