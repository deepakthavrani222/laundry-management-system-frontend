'use client'

import { useState, useEffect, useRef } from 'react'
import { useSuperAdminStore } from '@/store/superAdminStore'
import { superAdminApi } from '@/lib/superAdminApi'
import { 
  Bell, 
  Search, 
  Settings, 
  User, 
  LogOut, 
  Shield, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Package,
  DollarSign,
  MessageSquare,
  Clock,
  Menu
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Notification {
  _id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  data?: any
}

interface SuperAdminHeaderProps {
  onMenuClick?: () => void
  sidebarCollapsed?: boolean
}

export default function SuperAdminHeader({ onMenuClick, sidebarCollapsed = false }: SuperAdminHeaderProps) {
  const { admin, logout } = useSuperAdminStore()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const fetchUnreadCount = async () => {
    try {
      const response = await superAdminApi.getNotificationUnreadCount()
      if (response.success) {
        setUnreadCount(response.data.unreadCount || 0)
      }
    } catch (error) {
      console.log('Could not fetch unread count')
    }
  }

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await superAdminApi.getNotifications({ limit: 10 })
      if (response.success) {
        setNotifications(response.data.notifications || [])
        setUnreadCount(response.data.unreadCount || 0)
      }
    } catch (error) {
      console.log('Could not fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications()
    }
  }, [showNotifications])

  // Auto mark as read when dropdown opens and notifications are loaded
  useEffect(() => {
    if (showNotifications && notifications.length > 0) {
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id)
      if (unreadIds.length > 0) {
        // Small delay to let user see the notifications first
        const timer = setTimeout(() => {
          handleMarkAsRead(unreadIds)
        }, 1500)
        return () => clearTimeout(timer)
      }
    }
  }, [showNotifications, notifications])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAsRead = async (notificationIds: string[]) => {
    try {
      await superAdminApi.markNotificationsAsRead(notificationIds)
      setNotifications(prev => 
        prev.map(n => notificationIds.includes(n._id) ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
    } catch (error) {
      console.log('Could not mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await superAdminApi.markAllNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  const handleLogout = async () => {
    try {
      await superAdminApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      logout()
      window.location.href = '/superadmin/auth/login'
    }
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ORDER_PLACED':
      case 'ORDER_ASSIGNED':
        return <Package className="w-4 h-4 text-blue-600" />
      case 'REFUND_REQUEST':
        return <DollarSign className="w-4 h-4 text-orange-600" />
      case 'NEW_COMPLAINT':
        return <MessageSquare className="w-4 h-4 text-red-600" />
      case 'security':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <Bell className="w-4 h-4 text-purple-600" />
    }
  }

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'ORDER_PLACED':
      case 'ORDER_ASSIGNED':
        return 'bg-blue-100'
      case 'REFUND_REQUEST':
        return 'bg-orange-100'
      case 'NEW_COMPLAINT':
      case 'security':
        return 'bg-red-100'
      default:
        return 'bg-purple-100'
    }
  }

  return (
    <header className={`bg-white h-16 fixed top-0 right-0 z-50 border-b border-gray-200 transition-all duration-300 left-0 ${sidebarCollapsed ? 'lg:left-16' : 'lg:left-64'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 mr-2"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
          
          {/* Search */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, customers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            
            {/* Refresh Button */}
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCw className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-purple-600 font-medium">{unreadCount} new</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                      <div className="text-center py-8 px-4">
                        <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-gray-500 text-sm">Loading...</p>
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          onClick={() => {
                            if (!notification.isRead) {
                              handleMarkAsRead([notification._id])
                            }
                          }}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            !notification.isRead ? 'bg-purple-50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getNotificationBg(notification.type)}`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {formatTime(notification.createdAt)}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2" />
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 px-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Bell className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">No notifications yet</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-gray-200">
                    <Link
                      href="/superadmin/notifications"
                      onClick={() => setShowNotifications(false)}
                      className="block w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      View All Notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {admin?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{admin?.name}</p>
                  <p className="text-xs text-gray-500">Super Admin</p>
                </div>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{admin?.name}</p>
                    <p className="text-xs text-gray-500">{admin?.email}</p>
                  </div>
                  
                  <div className="py-2">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <User className="w-4 h-4 mr-3" />
                      Profile Settings
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Shield className="w-4 h-4 mr-3" />
                      Security Settings
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Settings className="w-4 h-4 mr-3" />
                      Preferences
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-200 py-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
