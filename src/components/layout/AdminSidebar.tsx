'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  ShoppingBag,
  Users,
  Building2,
  Truck,
  CreditCard,
  BarChart3,
  Settings,
  HelpCircle,
  RefreshCw,
  UserCheck,
  MessageSquare,
  Package,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
  Ticket,
  Palette,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect, createContext, useContext } from 'react'
import { useAuthStore } from '@/store/authStore'

// Navigation items with permission requirements
const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Home, permission: null }, // Always visible
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag, permission: { module: 'orders', action: 'view' } },
  { name: 'Customers', href: '/admin/customers', icon: Users, permission: { module: 'customers', action: 'view' } },
  { name: 'Inventory', href: '/admin/inventory', icon: Package, permission: { module: 'inventory', action: 'view' } },
  { name: 'Services', href: '/admin/services', icon: Sparkles, permission: { module: 'services', action: 'view' } },
  { name: 'Logistics', href: '/admin/logistics', icon: Truck, permission: { module: 'logistics', action: 'view' } },
  { name: 'Support Tickets', href: '/admin/tickets', icon: Ticket, permission: { module: 'tickets', action: 'view' } },
  { name: 'Complaints', href: '/admin/complaints', icon: MessageSquare, permission: { module: 'customers', action: 'view' } },
  { name: 'Refunds', href: '/admin/refunds', icon: RefreshCw, permission: { module: 'orders', action: 'cancel' } },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard, permission: { module: 'performance', action: 'view' } },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, permission: { module: 'performance', action: 'view' } },
  { name: 'Staff', href: '/admin/staff', icon: UserCheck, permission: { module: 'staff', action: 'view' } },
  { name: 'Branding', href: '/admin/branding', icon: Palette, permission: { module: 'settings', action: 'view' } },
  { name: 'Settings', href: '/admin/settings', icon: Settings, permission: { module: 'settings', action: 'view' } },
  { name: 'Help', href: '/admin/support', icon: HelpCircle, permission: null }, // Always visible
]

// Helper to check if user has permission
const hasPermission = (user: any, permission: { module: string; action: string } | null) => {
  if (!permission) return true // No permission required (Dashboard, Help)
  if (!user) {
    console.log('🔐 No user found')
    return false
  }
  
  // Check specific permissions from user's permissions object
  if (!user.permissions) {
    console.log('🔐 No permissions on user:', user.email)
    return false
  }
  
  const hasIt = user.permissions[permission.module]?.[permission.action] === true
  console.log(`🔐 Permission check: ${permission.module}.${permission.action} = ${hasIt}`)
  return hasIt
}

// Context for sidebar state
interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (value: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (value: boolean) => void
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  setIsCollapsed: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
})

export const useAdminSidebar = () => useContext(SidebarContext)

export function AdminSidebarProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed')
    if (saved) {
      setIsCollapsed(JSON.parse(saved))
    }
  }, [])

  const handleSetCollapsed = (value: boolean) => {
    setIsCollapsed(value)
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(value))
  }

  return (
    <SidebarContext.Provider
      value={{ isCollapsed, setIsCollapsed: handleSetCollapsed, mobileOpen, setMobileOpen }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()
  const { isCollapsed, setIsCollapsed } = useAdminSidebar()
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
          <Link href="/admin/dashboard" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">LaundryPro</h1>
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
        <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email || ''}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto min-h-0">
        {navigation
          .filter(item => hasPermission(user, item.permission))
          .map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all',
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-700 hover:bg-blue-50'
              )}
            >
              <Icon
                className={cn(
                  'flex-shrink-0 w-5 h-5',
                  isCollapsed ? 'mx-auto' : 'mr-3',
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 group-hover:text-blue-500'
                )}
              />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Quick Stats - Only show when expanded */}
      {!isCollapsed && (
        <div className="flex-shrink-0 px-4 pb-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">
              Today&apos;s Overview
            </h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>New Orders</span>
                <span className="font-medium text-blue-600">24</span>
              </div>
              <div className="flex justify-between">
                <span>Pending</span>
                <span className="font-medium text-orange-600">8</span>
              </div>
              <div className="flex justify-between">
                <span>Completed</span>
                <span className="font-medium text-green-600">16</span>
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
