'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import {
  Menu,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Home,
  Shield,
  Search,
} from 'lucide-react'
import Link from 'next/link'
import NotificationBell from '@/components/NotificationBell'
import { Input } from '@/components/ui/input'

interface SupportHeaderProps {
  onMenuClick?: () => void
  sidebarCollapsed?: boolean
}

export default function SupportHeader({ onMenuClick, sidebarCollapsed = false }: SupportHeaderProps) {
  const { user, logout } = useAuthStore()
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const userDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

        {/* Search */}
        <div className="hidden md:flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search tickets..."
              className="pl-10 w-64"
            />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Real-time Notifications */}
          <NotificationBell />

          {/* User Avatar with Dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase() || 'S'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800">{user?.name || 'Support Agent'}</p>
                <p className="text-xs text-gray-500">Support Agent</p>
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
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg font-medium">
                        {user?.name?.charAt(0).toUpperCase() || 'S'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{user?.name || 'Support Agent'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Shield className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-blue-600">Support Agent</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <Link
                    href="/support/settings"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    My Profile
                  </Link>
                  <Link
                    href="/support/settings"
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