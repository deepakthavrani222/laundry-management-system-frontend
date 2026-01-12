'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import {
  Bell,
  Menu,
  Clock,
  User,
  Settings,
  LogOut,
  ChevronDown,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  Home,
  Package,
  DollarSign,
  MessageSquare,
} from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface Notification {
  _id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  data?: {
    orderId?: string
    ticketId?: string
  }
}

interface AdminHeaderProps {
  onMenuClick?: () => void
  sidebarCollapsed?: boolean
}

export default function AdminHeader({ onMenuClick, sidebarCollapsed = false }: AdminHeaderProps) {
  const { user, logout } = useAuthStore()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const notifDropdownRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/notifications?limit=10')
      if (response.data.success) {
        setNotifications(response.data.data.notifications || [])
        setUnreadCount(response.data.data.unreadCount || 0)
      }
    } catch (error) {
      console.log('Could not fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/admin/notifications/unread-count')
      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount || 0)
      }
    } catch (error) {
      console.log('Could not fetch unread count')
    }
  }

  useEffect(() => {
    fetchUnreadCount()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (showNotifDropdown) {
      fetchNotifications()
    }
  }, [showNotifDropdown])

  const handleMarkAsRead = async (notificationIds: string[]) => {
    try {
      await api.put('/admin/notifications/mark-read', { notificationIds })
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
      await api.put('/admin/notifications/mark-all-read')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false)
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    window.location.href = '/'
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

  return (
    <header className={cn(
      "bg-white border-b border-gray-200 fixed top-0 right-0 z-40 transition-all duration-300",
      sidebarCollapsed ? "left-0 lg:left-16" : "left-0 lg:left-64"
    )}>
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown)
                setShowUserDropdown(false)
              }}
              className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-600 font-medium">{unreadCount} new</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-8 px-4">
                      <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
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
                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.isRead ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            notification.type === 'ORDER_PLACED' ? 'bg-blue-100' :
                            notification.type === 'REFUND_REQUEST' ? 'bg-orange-100' :
                            notification.type === 'NEW_COMPLAINT' ? 'bg-red-100' :
                            'bg-gray-100'
                          }`}>
                            {notification.type === 'ORDER_PLACED' ? (
                              <Package className={`w-5 h-5 text-blue-600`} />
                            ) : notification.type === 'REFUND_REQUEST' ? (
                              <DollarSign className={`w-5 h-5 text-orange-600`} />
                            ) : notification.type === 'NEW_COMPLAINT' ? (
                              <MessageSquare className={`w-5 h-5 text-red-600`} />
                            ) : (
                              <Bell className={`w-5 h-5 text-gray-600`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
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

                <div className="p-3 border-t border-gray-100 bg-gray-50">
                  <Link
                    href="/admin/notifications"
                    onClick={() => setShowNotifDropdown(false)}
                    className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar with Dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => {
                setShowUserDropdown(!showUserDropdown)
                setShowNotifDropdown(false)
              }}
              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
              <ChevronDown
                className={`hidden md:block w-4 h-4 text-gray-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {/* User Dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg font-medium">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <Link
                    href="/admin/settings"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    My Profile
                  </Link>
                  <Link
                    href="/admin/settings"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    Settings
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Home className="w-4 h-4 text-gray-400" />
                    Back to Home
                  </Link>
                </div>

                <div className="border-t border-gray-100 py-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
