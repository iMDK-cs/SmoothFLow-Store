"use client";

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration (default 5 seconds)
    const duration = notification.duration || 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

const NotificationItem = ({ notification, onRemove }: { notification: Notification; onRemove: () => void }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      case 'warning':
        return 'bg-yellow-600';
      case 'info':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-green-500';
      case 'error':
        return 'border-red-500';
      case 'warning':
        return 'border-yellow-500';
      case 'info':
        return 'border-blue-500';
      default:
        return 'border-gray-500';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getBgColor()} border-l-4 ${getBorderColor()}
        text-white p-4 rounded-lg shadow-lg
        cursor-pointer hover:shadow-xl
      `}
      onClick={onRemove}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          <span className="text-lg">{getIcon()}</span>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
          <p className="text-sm opacity-90 leading-relaxed">{notification.message}</p>
          {notification.action && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                notification.action?.onClick();
              }}
              className="mt-2 text-xs underline hover:no-underline"
            >
              {notification.action.label}
            </button>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="flex-shrink-0 ml-2 text-white/70 hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Convenience functions for common notifications
export const useOrderNotifications = () => {
  const { addNotification } = useNotification();

  const notifyOrderCreated = (orderNumber: string) => {
    addNotification({
      type: 'success',
      title: 'تم إنشاء الطلب بنجاح!',
      message: `طلبك رقم ${orderNumber} تم إنشاؤه بنجاح. سيتم إرسال رسالة تأكيد إلى بريدك الإلكتروني.`,
      duration: 8000,
      action: {
        label: 'تتبع الطلب',
        onClick: () => window.open(`/orders/${orderNumber}`, '_blank'),
      },
    });
  };

  const notifyReceiptUploaded = (orderNumber: string) => {
    addNotification({
      type: 'info',
      title: 'تم رفع الإيصال!',
      message: `تم رفع إيصال التحويل البنكي لطلبك رقم ${orderNumber}. سيتم مراجعته من قبل الإدارة قريباً.`,
      duration: 8000,
      action: {
        label: 'تتبع الطلب',
        onClick: () => window.open(`/orders/${orderNumber}`, '_blank'),
      },
    });
  };

  const notifyOrderStatusChanged = (orderNumber: string, status: string) => {
    let type: 'success' | 'error' | 'info' | 'warning' = 'info';
    let title = 'تحديث حالة الطلب';
    let message = `تم تحديث حالة طلبك رقم ${orderNumber} إلى: ${status}`;

    switch (status) {
      case 'CONFIRMED':
      case 'APPROVED':
        type = 'success';
        title = 'تم تأكيد الطلب!';
        message = `طلبك رقم ${orderNumber} تم تأكيده بنجاح. سيتم البدء في تنفيذه قريباً.`;
        break;
      case 'CANCELLED':
      case 'REJECTED':
        type = 'error';
        title = 'تم رفض الطلب';
        message = `طلبك رقم ${orderNumber} تم رفضه. يرجى التواصل معنا للاستفسار.`;
        break;
    }

    addNotification({
      type,
      title,
      message,
      duration: 10000,
      action: {
        label: 'عرض التفاصيل',
        onClick: () => window.open(`/orders/${orderNumber}`, '_blank'),
      },
    });
  };

  const notifyError = (error: string) => {
    addNotification({
      type: 'error',
      title: 'حدث خطأ',
      message: error,
      duration: 6000,
    });
  };

  return {
    notifyOrderCreated,
    notifyReceiptUploaded,
    notifyOrderStatusChanged,
    notifyError,
  };
};