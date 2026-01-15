import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  icon?: string;
  severity?: 'info' | 'success' | 'warning' | 'error';
  data?: {
    orderId?: string;
    link?: string;
    [key: string]: any;
  };
  isRead: boolean;
  createdAt: string;
}

export function useNotifications() {
  const { token } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async (page = 1, limit = 20) => {
    if (!token) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/notifications?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch unread count only
  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setUnreadCount(data.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [token]);

  // Mark as read
  const markAsRead = useCallback(async (notificationIds: string[]) => {
    if (!token) return;
    
    try {
      await fetch(`${API_URL}/notifications/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ notificationIds })
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          notificationIds.includes(n._id) ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, [token]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!token) return;
    
    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [token]);

  // Setup SSE connection for real-time notifications
  useEffect(() => {
    if (!token) return;

    // Create EventSource for SSE
    const eventSource = new EventSource(`${API_URL}/notifications/stream`, {
      // Note: EventSource doesn't support custom headers natively
      // We'll need to pass token as query param or use a different approach
    });

    // For now, use polling as fallback since EventSource doesn't support auth headers
    // We'll implement a custom SSE with fetch later if needed
    
    // Initial fetch
    fetchNotifications();
    fetchUnreadCount();

    // Poll every 30 seconds as backup
    const pollInterval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => {
      clearInterval(pollInterval);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [token, fetchNotifications, fetchUnreadCount]);

  // Add new notification (called from SSE)
  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    addNotification
  };
}
