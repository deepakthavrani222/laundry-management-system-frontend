'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useTenancyTheme } from '@/contexts/TenancyThemeContext'
import {
  Bell,
  Plus,
  Menu,
  Package,
  CheckCircle,
  Truck,
  Clock,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Home,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

interface Notification {
  _id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

interface CustomerHeaderProps {
  onMenuClick?: () => void
  sidebarCollapsed?: boolean
}

export default function CustomerHeader({ onMenuClick, sidebarCollapsed = false }: CustomerHeaderProps) {
  const { user, _hasHydrated, logout } = useAuthStore()
  const { theme } = useTenancyTheme()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const notifDropdownRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get('/customer/notifications/unread-count')
        if (response.data.success) {
          setUnreadCount(response.data.data.unreadCount || 0)
        }
      } catch (error) {
        console.log('Could not fetch notification count')
      }
    }

    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown when clicking outside
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

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await api.get('/customer/notifications?limit=5')
      if (response.data.success) {
        setNotifications(response.data.data.notifications || [])
      }
    } catch (error) {
      console.log('Could not fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleBellClick = () => {
    setShowNotifDropdown(!showNotifDropdown)
    setShowUserDropdown(false)
    if (!showNotifDropdown) {
      fetchNotifications()
    }
  }

  const handleUserClick = () => {
    setShowUserDropdown(!showUserDropdown)
    setShowNotifDropdown(false)
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  const markAsRead = async (id: string) => {
    try {
      await api.put('/customer/notifications/mark-read', { notificationIds: [id] })
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.log('Could not mark as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/customer/notifications/mark-all-read')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.log('Could not mark all as read')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_placed': return <Package className="w-4 h-4 text-blue-500" />
      case 'order_picked': return <Truck className="w-4 h-4 text-amber-500" />
      case 'order_delivered': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'order_ready': return <CheckCircle className="w-4 h-4 text-purple-500" />
      default: return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const formatTime = (date: string) => {
    const now = new Date()
    const notifDate = new Date(date)
    const diffMs = now.getTime() - notifDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return notifDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  return (
    <header className={`bg-white border-b border-gray-200 fixed top-0 right-0 z-30 transition-all duration-300 ${sidebarCollapsed ? 'left-0 lg:left-16' : 'left-0 lg:left-64'}`}>
      <div className="flex items-center h-16 px-3 sm:px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => {
            if (onMenuClick) onMenuClick()
          }}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 mr-2"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right Side */}
        <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
          {/* New Order Button */}
          <Link href="/customer/orders/new">
            <Button 
              className="text-white shadow-lg text-xs sm:text-sm px-2 sm:px-4"
              style={{ 
                background: `linear-gradient(to right, ${theme?.primaryColor || '#14b8a6'}, ${theme?.accentColor || '#06b6d4'})`,
              }}
            >
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">New Order</span>
            </Button>
          </Link>

          {/* Notifications */}
          <div className="relative" ref={notifDropdownRef}>
            <button 
              onClick={handleBellClick}
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
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {notifications.map((notif) => (
                        <div 
                          key={notif._id}
                          onClick={() => !notif.isRead && markAsRead(notif._id)}
                          className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notif.isRead ? 'bg-teal-50/50' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              {getNotificationIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>
                                {notif.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(notif.createdAt)}
                              </p>
                            </div>
                            {!notif.isRead && (
                              <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-2"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar with Dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={handleUserClick}
              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div 
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(to right, ${theme?.primaryColor || '#14b8a6'}, ${theme?.accentColor || '#06b6d4'})`,
                }}
              >
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500">Customer</p>
              </div>
              <ChevronDown className={`hidden md:block w-4 h-4 text-gray-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* User Dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                {/* User Info */}
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
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

                {/* Menu Items */}
                <div className="py-2">
                  <Link 
                    href="/customer/profile" 
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    My Profile
                  </Link>
                  <Link 
                    href="/customer/orders" 
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Package className="w-4 h-4 text-gray-400" />
                    My Orders
                  </Link>
                  <Link 
                    href="/customer/addresses" 
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    Addresses
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

                {/* Logout */}
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
