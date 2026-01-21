import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

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
  
  // Get auth store methods
  const { updateUser } = useAuthStore();

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
        
        // Handle different notification types
        if (notification.type === 'permission_update') {
          // For permission updates, just refresh the current page
          console.log('🔄 Permission notification clicked, refreshing page...');
          window.location.reload();
        } else if (notification.data?.link) {
          // For other notifications, navigate to the link
          window.location.href = notification.data.link;
        }
        // If no link and not permission update, just focus the window
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
      
      // Show slide notification for important notifications
      if (typeof window !== 'undefined' && (window as any).__addSlideNotification) {
        console.log('📢 Admin: Calling __addSlideNotification for regular notification:', notification.title);
        
        // Map notification severity to slide notification type
        const slideType = notification.severity === 'error' ? 'error' :
                         notification.severity === 'warning' ? 'warning' :
                         notification.severity === 'success' ? 'success' : 'info';
        
        (window as any).__addSlideNotification({
          title: notification.title,
          message: notification.message,
          type: slideType,
          duration: 5000,
          actionText: notification.data?.link ? 'View Details' : undefined,
          onAction: notification.data?.link ? () => {
            window.location.href = notification.data.link;
          } : undefined
        });
        
        console.log('✅ Admin: Slide notification sent successfully');
      } else {
        console.log('⚠️ Admin: __addSlideNotification not available for regular notification');
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

    // Permission sync events
    socket.on('permissionsUpdated', (data) => {
      console.log('🔄 Admin: Permissions updated via WebSocket:', data);
      
      // Prevent duplicate notifications
      const existingPermissionNotification = notifications.find(n => 
        n.type === 'permission_update' && 
        Date.now() - new Date(n.createdAt).getTime() < 5000 // Within last 5 seconds
      );
      
      if (existingPermissionNotification) {
        console.log('⚠️ Admin: Duplicate permission notification prevented');
        return;
      }
      
      // Show slide notification instead of toast
      if (typeof window !== 'undefined' && (window as any).__addSlideNotification) {
        console.log('📢 Admin: Calling __addSlideNotification for permission update');
        
        (window as any).__addSlideNotification({
          title: 'Permissions Updated',
          message: 'Your access has been updated by an administrator',
          type: 'permission_update',
          duration: 5000,
          actionText: 'Refresh Now',
          onAction: () => {
            console.log('🔄 Admin: User clicked refresh from slide notification');
            window.location.reload();
          }
        });
        
        console.log('✅ Admin: Permission slide notification sent successfully');
      } else {
        console.log('⚠️ Admin: __addSlideNotification not available for permission update');
      }
      
      // Show notification to user (for notification center)
      const permissionNotification: Notification = {
        _id: `perm-${Date.now()}`,
        title: 'Permissions Updated',
        message: data.message || 'Your access has been updated by an administrator',
        type: 'permission_update',
        severity: 'info',
        isRead: false,
        createdAt: new Date().toISOString(),
        data: data
      };
      
      // Add to notifications list
      setNotifications(prev => [permissionNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show browser notification
      showBrowserNotification(permissionNotification);
      
      // Handle permission refresh (prevent multiple refreshes)
      if (typeof window !== 'undefined') {
        // Check if refresh is already in progress
        if ((window as any).__permissionRefreshInProgress) {
          console.log('⚠️ Permission refresh already in progress, skipping');
          return;
        }
        
        // Mark refresh as in progress
        (window as any).__permissionRefreshInProgress = true;
        
        // Emit custom event for permission refresh
        window.dispatchEvent(new CustomEvent('permissionsUpdated', { detail: data }));
        
        // Try to refresh permissions without page reload first
        const refreshPermissions = async () => {
          try {
            console.log('🔄 Attempting to refresh permissions without page reload...');
            
            const response = await fetch('/api/auth/profile', {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const profileData = await response.json();
              if (profileData.success && profileData.data) {
                console.log('✅ Successfully refreshed permissions from server');
                
                // Update Zustand store
                updateUser({
                  permissions: profileData.data.permissions,
                  features: profileData.data.features,
                  tenancy: profileData.data.tenancy
                });
                
                // Also update localStorage directly
                const authData = localStorage.getItem('laundry-auth');
                if (authData) {
                  const parsed = JSON.parse(authData);
                  if (parsed.state?.user) {
                    parsed.state.user.permissions = profileData.data.permissions;
                    parsed.state.user.features = profileData.data.features;
                    parsed.state.user.tenancy = profileData.data.tenancy;
                    localStorage.setItem('laundry-auth', JSON.stringify(parsed));
                    console.log('📦 Updated localStorage with fresh permissions');
                  }
                }
                
                // Force re-render by dispatching storage event
                window.dispatchEvent(new Event('storage'));
                
                console.log('✅ Permissions updated successfully - sidebar will re-render');
                
                // Clear the refresh flag
                (window as any).__permissionRefreshInProgress = false;
                return;
              }
            }
            
            throw new Error(`Profile API failed with status: ${response.status}`);
          } catch (error) {
            console.log('⚠️ Permission refresh failed, falling back to page reload:', error);
            
            // Fallback to page refresh after 3 seconds
            setTimeout(() => {
              console.log('🔄 Auto-refreshing page for permission updates...');
              window.location.reload();
            }, 3000);
          }
        };
        
        // Call the refresh function
        refreshPermissions();
        
        // Clear the flag after timeout as backup
        setTimeout(() => {
          (window as any).__permissionRefreshInProgress = false;
        }, 10000);
      }
    });

    // Tenancy update events for real-time updates
    socket.on('tenancyFeaturesUpdated', (data) => {
      console.log('🔄 Admin: Tenancy features updated via WebSocket:', data);
      
      // Show slide notification
      if (typeof window !== 'undefined' && (window as any).__addSlideNotification) {
        console.log('📢 Admin: Calling __addSlideNotification for tenancy features');
        
        (window as any).__addSlideNotification({
          title: 'Features Updated',
          message: `Your tenancy features have been updated`,
          type: 'system_alert',
          duration: 4000,
          actionText: 'Got it!',
          onAction: () => {
            console.log('✅ Admin: User acknowledged feature update');
          }
        });
        
        console.log('✅ Admin: Tenancy features slide notification sent successfully');
      } else {
        console.log('⚠️ Admin: __addSlideNotification not available for tenancy features');
      }
      
      // Auto-refresh user data to get updated features
      if (typeof window !== 'undefined') {
        console.log('🔄 Admin: Auto-refreshing user data for updated features...');
        
        // Dispatch custom event for components to refresh
        window.dispatchEvent(new CustomEvent('tenancyFeaturesUpdated', { detail: data }));
        
        // Try to refresh user data without page reload first
        const refreshUserData = async () => {
          try {
            const response = await fetch('/api/auth/profile', {
              credentials: 'include'
            });
            
            if (response.ok) {
              const profileData = await response.json();
              if (profileData.success) {
                console.log('🔄 Admin: Successfully refreshed user profile data');
                console.log('📊 New profile data:', {
                  permissions: Object.keys(profileData.data.permissions || {}),
                  features: Object.keys(profileData.data.features || {}),
                  tenancyId: profileData.data.tenancy?._id
                });
                
                // Update Zustand store with new data (this will trigger re-renders)
                const { updateUser } = useAuthStore.getState();
                updateUser({
                  features: profileData.data.features,
                  permissions: profileData.data.permissions,
                  tenancy: profileData.data.tenancy
                });
                
                // Also update localStorage directly for immediate access
                const authData = localStorage.getItem('laundry-auth');
                if (authData) {
                  const parsed = JSON.parse(authData);
                  if (parsed.state && parsed.state.user) {
                    parsed.state.user.features = profileData.data.features;
                    parsed.state.user.permissions = profileData.data.permissions;
                    parsed.state.user.tenancy = profileData.data.tenancy;
                    localStorage.setItem('laundry-auth', JSON.stringify(parsed));
                    console.log('✅ Admin: Updated localStorage with new data');
                  }
                }
                
                // Force re-render by dispatching storage event
                window.dispatchEvent(new Event('storage'));
                
                console.log('✅ Admin: Updated Zustand store with new data - sidebar will re-render automatically');
              } else {
                console.log('⚠️ Admin: Profile refresh failed, will auto-refresh page');
                // Fallback to page refresh after 3 seconds
                setTimeout(() => {
                  console.log('🔄 Admin: Auto-refreshing page for feature updates...');
                  window.location.reload();
                }, 3000);
              }
            } else {
              console.log('⚠️ Admin: Profile API failed, will auto-refresh page');
              // Fallback to page refresh after 3 seconds
              setTimeout(() => {
                console.log('🔄 Admin: Auto-refreshing page for feature updates...');
                window.location.reload();
              }, 3000);
            }
          } catch (error) {
            console.error('❌ Admin: Error refreshing profile, will auto-refresh page:', error);
            // Fallback to page refresh after 3 seconds
            setTimeout(() => {
              console.log('🔄 Admin: Auto-refreshing page for feature updates...');
              window.location.reload();
            }, 3000);
          }
        };
        
        // Call the async function
        refreshUserData();
      }
      
      // Also add to notification center
      const tenancyNotification: Notification = {
        _id: `tenancy-features-${Date.now()}`,
        title: 'Tenancy Features Updated',
        message: `Features updated for your tenancy by SuperAdmin`,
        type: 'system_alert',
        severity: 'info',
        isRead: false,
        createdAt: new Date().toISOString(),
        data: data
      };
      
      setNotifications(prev => [tenancyNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      showBrowserNotification(tenancyNotification);
    });

    socket.on('tenancyPermissionsUpdated', (data) => {
      console.log('🔄 Admin: Tenancy permissions updated via WebSocket:', data);
      
      // Show slide notification
      if (typeof window !== 'undefined' && (window as any).__addSlideNotification) {
        console.log('📢 Admin: Calling __addSlideNotification for tenancy permissions');
        
        (window as any).__addSlideNotification({
          title: 'Permissions Updated',
          message: `Your access permissions have been updated`,
          type: 'permission_update',
          duration: 5000,
          actionText: 'Refresh Now',
          onAction: () => {
            console.log('✅ Admin: User clicked refresh from tenancy permission notification');
            window.location.reload();
          }
        });
        
        console.log('✅ Admin: Tenancy permissions slide notification sent successfully');
      } else {
        console.log('⚠️ Admin: __addSlideNotification not available for tenancy permissions');
      }
      
      // Try to refresh user data without page reload first
      if (typeof window !== 'undefined') {
        console.log('🔄 Admin: Auto-refreshing user data for updated permissions...');
        
        // Dispatch custom event for components to refresh
        window.dispatchEvent(new CustomEvent('tenancyPermissionsUpdated', { detail: data }));
        
        const refreshUserData = async () => {
          try {
            console.log('🔄 Attempting to refresh tenancy permissions from server...');
            
            const response = await fetch('/api/auth/profile', {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const profileData = await response.json();
              if (profileData.success) {
                console.log('🔄 Admin: Successfully refreshed user profile data for permissions');
                console.log('📊 New profile data:', {
                  permissions: Object.keys(profileData.data.permissions || {}),
                  features: Object.keys(profileData.data.features || {}),
                  tenancyId: profileData.data.tenancy?._id
                });
                
                // Update Zustand store with new data (this will trigger re-renders)
                updateUser({
                  permissions: profileData.data.permissions,
                  features: profileData.data.features,
                  tenancy: profileData.data.tenancy
                });
                
                // Also update localStorage directly for immediate access
                const authData = localStorage.getItem('laundry-auth');
                if (authData) {
                  const parsed = JSON.parse(authData);
                  if (parsed.state && parsed.state.user) {
                    parsed.state.user.permissions = profileData.data.permissions;
                    parsed.state.user.features = profileData.data.features;
                    parsed.state.user.tenancy = profileData.data.tenancy;
                    localStorage.setItem('laundry-auth', JSON.stringify(parsed));
                    console.log('✅ Admin: Updated localStorage with new permissions and features');
                  }
                }
                
                // Force re-render by dispatching storage event
                window.dispatchEvent(new Event('storage'));
                
                console.log('✅ Admin: Updated Zustand store with new permissions - sidebar will re-render automatically');
              } else {
                throw new Error('Profile API returned success: false');
              }
            } else {
              throw new Error(`Profile API failed with status: ${response.status}`);
            }
          } catch (error) {
            console.error('❌ Admin: Error refreshing profile, will auto-refresh page:', error);
            // Fallback to page refresh after 3 seconds
            setTimeout(() => {
              console.log('🔄 Admin: Auto-refreshing page for permission updates...');
              window.location.reload();
            }, 3000);
          }
        };
        
        // Call the async function
        refreshUserData();
      }
      
      // Also add to notification center
      const permissionNotification: Notification = {
        _id: `tenancy-permissions-${Date.now()}`,
        title: 'Your Permissions Updated',
        message: `Your access permissions have been updated by SuperAdmin`,
        type: 'permission_update',
        severity: 'info',
        isRead: false,
        createdAt: new Date().toISOString(),
        data: data
      };
      
      setNotifications(prev => [permissionNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      showBrowserNotification(permissionNotification);
    });

    socketRef.current = socket;
  }, [getToken, playSound, showBrowserNotification, updateUser]);

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
  }, [connect, disconnect, fetchNotifications, requestNotificationPermission, getToken, updateUser]);

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
