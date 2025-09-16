"use client"

import { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export default function Notification({
  message,
  type,
  duration = 5000,
  onClose,
  position = 'top-right'
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Show notification with animation
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-hide after duration
    const hideTimer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 300);
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-600 to-emerald-600',
          border: 'border-green-500',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          iconBg: 'bg-green-500'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-600 to-rose-600',
          border: 'border-red-500',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          iconBg: 'bg-red-500'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-600 to-orange-600',
          border: 'border-yellow-500',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          iconBg: 'bg-yellow-500'
        };
      case 'info':
      default:
        return {
          bg: 'bg-gradient-to-r from-sky-600 to-blue-600',
          border: 'border-sky-500',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          iconBg: 'bg-sky-500'
        };
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`fixed z-50 max-w-sm w-full transform transition-all duration-300 ${
        getPositionStyles()
      } ${
        isVisible && !isLeaving 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-2 opacity-0 scale-95'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div
        className={`${styles.bg} ${styles.border} border rounded-xl shadow-2xl backdrop-blur-sm overflow-hidden`}
      >
        {/* Progress bar */}
        <div className="relative h-1 bg-black/20">
          <div 
            className="h-full bg-white/30 transition-all ease-linear"
            style={{
              width: isLeaving ? '0%' : '100%',
              transitionDuration: isLeaving ? '300ms' : `${duration}ms`
            }}
          />
        </div>

        <div className="p-4">
          <div className="flex items-start space-x-reverse space-x-3">
            {/* Icon */}
            <div className={`${styles.iconBg} rounded-full p-1.5 flex-shrink-0 shadow-lg`}>
              <div className="text-white">
                {styles.icon}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium leading-relaxed">
                {message}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              aria-label="إغلاق الإشعار"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 animate-shimmer pointer-events-none" />
      </div>
    </div>
  );
}