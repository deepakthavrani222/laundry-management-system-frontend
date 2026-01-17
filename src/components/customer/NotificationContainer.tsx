'use client';

import { useState, useEffect } from 'react';
import NotificationToast from './NotificationToast';
import { useNotifications } from '@/hooks/useNotifications';

interface ToastNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  icon: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  data: any;
  createdAt: string;
}

export default function NotificationContainer() {
  const { notifications } = useNotifications();
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    // Show only the latest notification as toast
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      
      // Check if this notification is already shown
      const alreadyShown = toasts.some(t => t._id === latestNotification._id);
      
      if (!alreadyShown) {
        setToasts(prev => [latestNotification, ...prev].slice(0, 3)); // Max 3 toasts
      }
    }
  }, [notifications]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t._id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <NotificationToast
          key={toast._id}
          notification={toast}
          onClose={() => removeToast(toast._id)}
          duration={5000}
        />
      ))}
    </div>
  );
}
