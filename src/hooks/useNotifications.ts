import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  icon?: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  data?: any;
  createdAt: string;
  isRead: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  isReconnecting: boolean;
  connectionError: string | null;
  markAsRead: (notificationId: string) => void;
  markMultipleAsRead: (notificationIds: string[]) => void;
  markAllAsRead: () => void;
  fetchNotifications: () => Promise<void>;
  playNotificationSound: (severity: string) => void;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Preload notification sounds
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = {
        success: new Audio('/sounds/success.mp3'),
        error: new Audio('/sounds/error.mp3'),
        warning: new Audio('/sounds/warning.mp3'),
        info: new Audio('/sounds/notification.mp3'),
      };
      
      // Set volume
      Object.values(audioRef.current).forEach(audio => {
        audio.volume = 0.5;
      });
    }
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback((severity: string) => {
    try {
      const audio = audioRef.current[severity] || audioRef.current.info;
      audio.currentTime = 0;
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (error) {
      console.log('Sound playback error:', error);
    }
  }, []);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data.notifications || []);
        setUnreadCount(data.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  // Initialize Socket.IO connection
  const initializeSocket = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, skipping socket connection');
      return;
    }

    // Clean up existing connection
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    console.log('🔌 Initializing WebSocket connection...');

    // Create socket connection with auto-reconnection
    const socket = io(API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
      transports: ['websocket', 'polling'], // Fallback to polling if WebSocket fails
    });

    socketRef.current = socket;

    // Connection successful
    socket.on('connect', () => {
      console.log('✅ WebSocket connected:', socket.id);
      setIsConnected(true);
      setIsReconnecting(false);
      setConnectionError(null);
      
      // Request unread count on connect
      socket.emit('getUnreadCount');
    });

    // Connection error
    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
      setIsConnected(false);
      setConnectionError(error.message);
    });

    // Reconnection attempt
    socket.io.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Reconnection attempt ${attempt}...`);
      setIsReconnecting(true);
      setConnectionError('Reconnecting...');
    });

    // Reconnection successful
    socket.io.on('reconnect', (attempt) => {
      console.log(`✅ Reconnected after ${attempt} attempts`);
      setIsReconnecting(false);
      setConnectionError(null);
      
      // Fetch latest notifications after reconnection
      fetchNotifications();
    });

    // Reconnection failed
    socket.io.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed');
      setIsReconnecting(false);
      setConnectionError('Connection failed. Please refresh the page.');
    });

    // Disconnected
    socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, manually reconnect
        socket.connect();
      }
    });

    // New notification received
    socket.on('notification', (notification: Notification) => {
      console.log('📬 New notification:', notification);
      
      // Add to notifications list
      setNotifications(prev => [notification, ...prev]);
      
      // Update unread count
      if (!notification.isRead) {
        setUnreadCount(prev => prev + 1);
      }
      
      // Play sound
      playNotificationSound(notification.severity);
      
      // Show browser notification if permitted
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png',
          badge: '/badge.png',
          tag: notification._id,
        });
      }
      
      // Vibrate on mobile
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    });

    // Unread count update
    socket.on('unreadCount', ({ count }) => {
      setUnreadCount(count);
    });

    // Notification marked as read
    socket.on('notificationMarkedRead', ({ notificationId }) => {
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    });

    // Multiple notifications marked as read
    socket.on('notificationsMarkedRead', ({ notificationIds }) => {
      setNotifications(prev =>
        prev.map(n => notificationIds.includes(n._id) ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
    });

    // Error from server
    socket.on('error', ({ message }) => {
      console.error('Server error:', message);
    });

    return socket;
  }, [fetchNotifications, playNotificationSound]);

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

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    // Fetch initial notifications
    fetchNotifications();
    
    // Initialize socket connection
    const socket = initializeSocket();

    // Request browser notification permission
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [initializeSocket, fetchNotifications]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network online, reconnecting...');
      if (socketRef.current && !socketRef.current.connected) {
        socketRef.current.connect();
      }
    };

    const handleOffline = () => {
      console.log('📡 Network offline');
      setConnectionError('No internet connection');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    isReconnecting,
    connectionError,
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    fetchNotifications,
    playNotificationSound,
  };
}
