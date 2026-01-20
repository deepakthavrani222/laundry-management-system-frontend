'use client'

import React from 'react'
import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import toast from 'react-hot-toast'
import { useAuthStore, UserRole } from '@/store/authStore'
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Shield, 
  Package, 
  CreditCard,
  User,
  Settings,
  Star,
  TrendingUp
} from 'lucide-react'

interface Notification {
  _id: string
  type: string
  title: string
  message: string
  icon: string
  severity: 'info' | 'success' | 'warning' | 'error'
  data?: any
  createdAt: string
  isRead: boolean
}

interface NotificationToast {
  id: string
  title: string
  message: string
  icon: React.ReactNode
  severity: 'info' | 'success' | 'warning' | 'error'
  action?: {
    label: string
    onClick: () => void
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const getAuthToken = () => {
  try {
    const data = localStorage.getItem('laundry-auth')
    if (data) {
      const parsed = JSON.parse(data)
      return parsed.state?.token || parsed.token
    }
  } catch {}
  return localStorage.getItem('token')
}

const getNotificationIcon = (iconName: string, severity: string) => {
  const iconProps = { className: "w-5 h-5" }
  
  switch (iconName) {
    case 'shield-check':
    case 'shield':
      return <Shield {...iconProps} className={`w-5 h-5 ${severity === 'success' ? 'text-green-500' : 'text-blue-500'}`} />
    case 'package':
    case 'package-plus':
    case 'package-check':
      return <Package {...iconProps} className={`w-5 h-5 ${severity === 'success' ? 'text-green-500' : 'text-blue-500'}`} />
    case 'credit-card':
      return <CreditCard {...iconProps} className={`w-5 h-5 ${severity === 'error' ? 'text-red-500' : 'text-green-500'}`} />
    case 'user-check':
    case 'user-plus':
      return <User {...iconProps} className="w-5 h-5 text-blue-500" />
    case 'settings':
      return <Settings {...iconProps} className="w-5 h-5 text-gray-500" />
    case 'star':
      return <Star {...iconProps} className="w-5 h-5 text-yellow-500" />
    case 'trending-up':
      return <TrendingUp {...iconProps} className="w-5 h-5 text-green-500" />
    case 'check-circle':
      return <CheckCircle {...iconProps} className="w-5 h-5 text-green-500" />
    case 'alert-triangle':
      return <AlertTriangle {...iconProps} className="w-5 h-5 text-yellow-500" />
    case 'x-circle':
      return <XCircle {...iconProps} className="w-5 h-5 text-red-500" />
    default:
      return <Bell {...iconProps} className="w-5 h-5 text-blue-500" />
  }
}

const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case 'success':
      return 'bg-green-50 border-green-200 text-green-800'
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    case 'error':
      return 'bg-red-50 border-red-200 text-red-800'
    default:
      return 'bg-blue-50 border-blue-200 text-blue-800'
  }
}

export const useRealTimeNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastPollRef = useRef<string>(new Date().toISOString())
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)

  // Polling fallback for serverless environments
  const startPolling = () => {
    if (pollingIntervalRef.current) return

    console.log('🔄 Starting notification polling (serverless fallback)')
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const token = getAuthToken()
        if (!token) return

        const response = await fetch(`${API_URL}/notifications/poll?since=${lastPollRef.current}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include'
        })
        
        const data = await response.json()
        
        if (data.success && data.data.hasNew) {
          console.log('📬 New notifications via polling:', data.data.notifications.length)
          
          // Add new notifications
          data.data.notifications.forEach((notification: Notification) => {
            setNotifications(prev => [notification, ...prev])
            showToastNotification(notification)
          })
          
          // Update unread count
          setUnreadCount(data.data.unreadCount)
          
          // Update last poll timestamp
          lastPollRef.current = data.data.timestamp
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 10000) // Poll every 10 seconds
  }

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
      console.log('⏹️ Stopped notification polling')
    }
  }

  // Initialize WebSocket connection
  useEffect(() => {
    const token = getAuthToken()
    if (!token) return

    // Create socket connection
    const socket = io(API_URL.replace('/api', ''), {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('🔗 Connected to notification server')
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from notification server')
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.log('❌ WebSocket connection error:', error.message)
      setIsConnected(false)
      
      // Start polling fallback if WebSocket fails
      if (!pollingIntervalRef.current) {
        console.log('🔄 Starting polling fallback for notifications')
        startPolling()
      }
    })

    // Listen for new notifications
    socket.on('notification', (notification: Notification) => {
      console.log('🔔 New notification received:', notification)
      
      // Add to notifications list
      setNotifications(prev => [notification, ...prev])
      setUnreadCount(prev => prev + 1)
      
      // Show toast notification
      showToastNotification(notification)
    })

    // Listen for permission updates
    socket.on('permissionsUpdated', (data: any) => {
      console.log('🔄 Permissions updated:', data)
      
      // Update user permissions in auth store directly
      if (data.permissions) {
        const { updateUser } = useAuthStore.getState()
        updateUser({ permissions: data.permissions })
        
        toast.success('Your permissions have been updated', {
          icon: '🔄',
          duration: 4000
        })
        
        console.log('✅ Permissions updated in store without reload')
      }
    })

    // Listen for role changes
    socket.on('roleChanged', (data: any) => {
      console.log('👤 Role changed:', data)
      
      // Update user role in auth store directly
      if (data.newRole) {
        const { updateUser } = useAuthStore.getState()
        updateUser({ role: data.newRole as UserRole })
        
        toast.success(`Your role has been updated to ${data.newRole}`, {
          icon: '👤',
          duration: 5000
        })
        
        console.log('✅ Role updated in store without reload')
      }
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [])

  // Fetch initial notifications and start fallback if needed
  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
    
    // Start polling fallback after 5 seconds if WebSocket hasn't connected
    const fallbackTimer = setTimeout(() => {
      if (!isConnected && !pollingIntervalRef.current) {
        console.log('🔄 WebSocket not connected, starting polling fallback')
        startPolling()
      }
    }, 5000)
    
    return () => clearTimeout(fallbackTimer)
  }, [isConnected])

  const fetchNotifications = async () => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/notifications?limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      })
      const data = await response.json()
      if (data.success) {
        setNotifications(data.data.notifications || [])
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      })
      const data = await response.json()
      if (data.success) {
        setUnreadCount(data.data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const token = getAuthToken()
      await fetch(`${API_URL}/notifications/mark-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ notificationIds })
      })
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notificationIds.includes(notif._id) 
            ? { ...notif, isRead: true }
            : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = getAuthToken()
      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      })
      
      // Update local state
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const showToastNotification = (notification: Notification) => {
    const icon = getNotificationIcon(notification.icon, notification.severity)
    
    const toastOptions = {
      duration: notification.severity === 'error' ? 6000 : 4000,
      style: {
        background: '#fff',
        color: '#333',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        maxWidth: '400px'
      }
    }

    // Custom toast component
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {icon}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {notification.title}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {notification.message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    ), toastOptions)
  }

  return {
    notifications,
    unreadCount,
    isConnected,
    showNotificationPanel,
    setShowNotificationPanel,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    fetchUnreadCount
  }
}