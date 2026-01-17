'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import NotificationToast from './NotificationToast';
import { useNotificationsWebSocket } from '@/hooks/useNotificationsWebSocket';

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
  const { notifications } = useNotificationsWebSocket();
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const shownNotificationsRef = useRef<Set<string>>(new Set());
  const lastNotificationIdRef = useRef<string | null>(null);
  const componentMountTimeRef = useRef<Date>(new Date());

  useEffect(() => {
    // console.log('🔄 Notifications changed:', notifications.length, 'notifications');
    
    // Show only the latest notification as toast
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      
      // Check if notification is recent (created in last 30 seconds)
      const notificationTime = new Date(latestNotification.createdAt);
      const now = new Date();
      const timeDiff = (now.getTime() - notificationTime.getTime()) / 1000; // seconds
      
      // console.log('⏰ Notification age:', timeDiff, 'seconds');
      
      // Only show if:
      // 1. It's a NEW notification (different from last one)
      // 2. It's recent (less than 30 seconds old)
      // 3. It was created after component mounted (prevents showing old notifications on refresh)
      const isRecent = timeDiff < 30;
      const isAfterMount = notificationTime > componentMountTimeRef.current;
      const isNew = latestNotification._id !== lastNotificationIdRef.current;
      
      // console.log('📝 Notification check:', {
      //   id: latestNotification._id,
      //   title: latestNotification.title,
      //   isNew,
      //   isRecent,
      //   isAfterMount,
      //   createdAt: latestNotification.createdAt
      // });
      
      if (isNew && isRecent && isAfterMount) {
        // Update last notification ID
        lastNotificationIdRef.current = latestNotification._id;
        
        // Check if already shown
        if (!shownNotificationsRef.current.has(latestNotification._id)) {
          // console.log('🎉 Showing toast for:', latestNotification.title);
          
          // Mark as shown
          shownNotificationsRef.current.add(latestNotification._id);
          
          // Add to toasts
          setToasts(prev => {
            // console.log('📥 Adding to toasts. Previous count:', prev.length);
            // Remove duplicates and keep max 3
            const filtered = prev.filter(t => t._id !== latestNotification._id);
            const newToasts = [latestNotification, ...filtered].slice(0, 3);
            // console.log('📤 New toasts count:', newToasts.length);
            return newToasts;
          });
        }
      }
    }
  }, [notifications]);

  const removeToast = useCallback((id: string) => {
    // console.log('🗑️ Removing toast:', id);
    setToasts(prev => prev.filter(t => t._id !== id));
  }, []);

  // console.log('📊 Toasts to display:', toasts.length);

  return (
    <div className="fixed top-20 right-4 z-[9999] space-y-2 pointer-events-none">
      {/* {toasts.length > 0 && console.log('🎨 Rendering toasts:', toasts.map(t => t.title))} */}
      {toasts.map(toast => (
        <div key={toast._id} className="pointer-events-auto">
          <NotificationToast
            notification={toast}
            onClose={() => removeToast(toast._id)}
            duration={5000}
          />
        </div>
      ))}
    </div>
  );
}
