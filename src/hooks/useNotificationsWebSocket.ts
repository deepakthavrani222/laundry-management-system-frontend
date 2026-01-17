import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Properly handle API URL - remove /api if present for socket, keep for API calls
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = BASE_URL.replace('/api', '');
const API_BASE_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  icon: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  data: {
    orderId?: string;
    ticketId?: string;
    link?: string;
    amount?: number;
    points?: number;
    [key: string]: any;
  };
  isRead: boolean;
  createdAt: string;
}

interface NotificationSound {
  [key: string]: string;
}

const NOTIFICATION_SOUNDS: NotificationSound = {
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  info: '/sounds/notification.mp3',
  warning: '/sounds/warning.mp3',
};

export const useNotificationsWebSocket = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get auth token
  const getToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Try zustand persist format first
      const authData = localStorage.getItem('laundry-auth');
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          const token = parsed.state?.token || parsed.token;
          if (token) return token;
        } catch (e) {
          console.error('Error parsing auth data:', e);
        }
      }
      // Fallback to direct token
      return localStorage.getItem('token');
    }
    return null;
  }, []);

  // Play notification sound
  const playSound = useCallback((severity: string) => {
    try {
      const soundUrl = NOTIFICATION_SOUNDS[severity] || NOTIFICATION_SOUNDS.info;
      if (audioRef.current) {
        audioRef.current.src = soundUrl;
        audioRef.current.play().catch(err => console.log('Sound play failed:', err));
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, []);

  // Show browser notification
  const showBrowserNotification = useCallback((notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotif = new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
        badge: '/badge.png',
        tag: notification._id,
        requireInteraction: notification.severity === 'error',
      });

      browserNotif.onclick = () => {
        window.focus();
        if (notification.data.link) {
          window.location.href = notification.data.link;
        }
      };
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    const token = getToken();
    if (!token) {
      console.log('⚠️ No token found, cannot connect WebSocket');
      return;
    }
    if (socketRef.current?.connected) {
      console.log('✅ WebSocket already connected');
      return;
    }

    console.log('🔌 Connecting to WebSocket:', SOCKET_URL);

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket connected successfully!');
      setIsConnected(true);
      
      // Expose socket globally for permission sync
      if (typeof window !== 'undefined') {
        (window as any).__notificationSocket = socket;
        console.log('🌐 Socket exposed for permission sync');
      }
      
      // Request unread count on connect
      socket.emit('getUnreadCount');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
    });

    socket.on('connected', (data) => {
      console.log('✅ Server confirmed connection:', data);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('notification', (notification: Notification) => {
      // console.log('📬 New notification:', notification);
      
      // Add to notifications list
      setNotifications(prev => [notification, ...prev]);
      
      // Update unread count
      if (!notification.isRead) {
        setUnreadCount(prev => prev + 1);
      }
      
      // Play sound
      playSound(notification.severity);
      
      // Show browser notification
      showBrowserNotification(notification);
      
      // Vibrate on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    });

    socket.on('unreadCount', ({ count }) => {
      setUnreadCount(count);
    });

    socket.on('notificationMarkedRead', ({ notificationId }) => {
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    });

    socket.on('notificationsMarkedRead', ({ notificationIds }) => {
      setNotifications(prev =>
        prev.map(n => notificationIds.includes(n._id) ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socketRef.current = socket;
  }, [getToken, playSound, showBrowserNotification]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('markNotificationRead', { notificationId });
    }
  }, []);

  // Mark multiple notifications as read
  const markMultipleAsRead = useCallback((notificationIds: string[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('markMultipleAsRead', { notificationIds });
    }
  }, []);

  // Join a room (for order tracking, etc.)
  const joinRoom = useCallback((room: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('joinRoom', { room });
    }
  }, []);

  // Leave a room
  const leaveRoom = useCallback((room: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leaveRoom', { room });
    }
  }, []);

  // Fetch notifications from API (initial load)
  const fetchNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) {
      console.log('⏭️ No token, skipping notification fetch');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/notifications?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // console.log('✅ Fetched notifications:', data.data.notifications?.length || 0);
        setNotifications(data.data.notifications || []);
        setUnreadCount(data.data.unreadCount || 0);
      } else if (response.status === 401) {
        console.log('⚠️ Token invalid, skipping notification fetch');
        // Don't show error - let auth guard handle it
      } else {
        console.error('❌ Failed to fetch notifications:', response.status);
      }
    } catch (error) {
      // Silent fail - don't spam console
      // console.error('❌ Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // Initialize
  useEffect(() => {
    const token = getToken();
    
    // Only initialize if token exists
    if (!token) {
      console.log('⏭️ No token, skipping WebSocket initialization');
      return;
    }
    
    // Create audio element
    audioRef.current = new Audio();
    
    // Request notification permission
    requestNotificationPermission();
    
    // Connect to WebSocket
    connect();
    
    // Fetch initial notifications
    fetchNotifications();

    // Cleanup
    return () => {
      disconnect();
    };
  }, [connect, disconnect, fetchNotifications, requestNotificationPermission, getToken]);

  return {
    notifications,
    unreadCount,
    isConnected,
    loading,
    markAsRead,
    markMultipleAsRead,
    joinRoom,
    leaveRoom,
    refetch: fetchNotifications,
  };
};
