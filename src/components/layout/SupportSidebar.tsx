'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Ticket,
  MessageCircle,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
  Headphones,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect, createContext, useContext } from 'react'
import { useAuthStore } from '@/store/authStore'

const navigation = [
  { name: 'Dashboard', href: '/support/dashboard', icon: Home },
  { name: 'Tickets', href: '/support/tickets', icon: Ticket },
  { name: 'Live Chat', href: '/support/chat', icon: MessageCircle },
  { name: 'Customers', href: '/support/customers', icon: Users },
  { name: 'Reports', href: '/support/reports', icon: BarChart3 },
  { name: 'Settings', href: '/support/settings', icon: Settings },
]

// Context for sidebar state
interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (value: boolean) => void
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  setIsCollapsed: () => {},
})

export const useSupportSidebar = () => useContext(SidebarContext)

export function SupportSidebarProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('support-sidebar-collapsed')
    if (saved) {
      setIsCollapsed(JSON.parse(saved))
    }
  }, [])

  const handleSetCollapsed = (value: boolean) => {
    setIsCollapsed(value)
    localStorage.setItem('support-sidebar-collapsed', JSON.stringify(value))
  }

  return (
    <SidebarContext.Provider
      value={{ isCollapsed, setIsCollapsed: handleSetCollapsed }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function SupportSidebar() {
  const pathname = usePathname()
  const { isCollapsed, setIsCollapsed } = useSupportSidebar()
  const { user, logout } = useAuthStore()

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <div
      className={cn(
        'fixed inset-y-0 left-0 z-50 bg-white shadow-xl transition-all duration-300 flex-col hidden lg:flex',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!isCollapsed && (
          <Link href="/support/dashboard" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">LaundryLobby</h1>
            </div>
          </Link>
        )}

        <button
          onClick={toggleCollapse}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.name?.charAt(0)?.toUpperCase() || 'S'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name || 'Support'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email || ''}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto min-h-0">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all',
                isActive
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-700 hover:bg-purple-50'
              )}
            >
              <Icon
                className={cn(
                  'flex-shrink-0 w-5 h-5',
                  isCollapsed ? 'mx-auto' : 'mr-3',
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 group-hover:text-purple-500'
                )}
              />
              {!isCollapsed && item.name}
            </Link>
          )
        })}
      </nav>

      {/* Support Stats - Only show when expanded */}
      {!isCollapsed && (
        <div className="flex-shrink-0 px-4 pb-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">
              Today&apos;s Tickets
            </h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Open</span>
                <span className="font-medium text-orange-600">8</span>
              </div>
              <div className="flex justify-between">
                <span>In Progress</span>
                <span className="font-medium text-blue-600">12</span>
              </div>
              <div className="flex justify-between">
                <span>Resolved</span>
                <span className="font-medium text-green-600">25</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="flex-shrink-0 border-t border-gray-200 p-2">
        <button
          onClick={handleLogout}
          className={cn(
            'group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors',
            isCollapsed ? 'justify-center' : ''
          )}
        >
          <LogOut
            className={cn(
              'flex-shrink-0 w-5 h-5 text-gray-400 group-hover:text-red-500',
              isCollapsed ? '' : 'mr-3'
            )}
          />
          {!isCollapsed && 'Sign Out'}
        </button>
      </div>
    </div>
  )
}
