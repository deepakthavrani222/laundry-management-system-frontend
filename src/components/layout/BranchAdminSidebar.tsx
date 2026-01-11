'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  ShoppingBag,
  Package,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
  Ticket,
  BarChart3,
  Settings,
  HelpCircle,
  QrCode,
  Truck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect, createContext, useContext } from 'react'
import { useAuthStore } from '@/store/authStore'

// Navigation items for Branch Admin (limited compared to Tenancy Admin)
const navigation = [
  { name: 'Dashboard', href: '/branch-admin/dashboard', icon: Home, permission: null },
  { name: 'Orders', href: '/branch-admin/orders', icon: ShoppingBag, permission: { module: 'orders', action: 'view' } },
  { name: 'Barcode Scanner', href: '/branch-admin/scanner', icon: QrCode, permission: { module: 'orders', action: 'view' } },
  { name: 'Inventory', href: '/branch-admin/inventory', icon: Package, permission: { module: 'inventory', action: 'view' } },
  { name: 'Services', href: '/branch-admin/services', icon: Sparkles, permission: { module: 'services', action: 'view' } },
  { name: 'Logistics', href: '/branch-admin/logistics', icon: Truck, permission: { module: 'logistics', action: 'view' } },
  { name: 'Support Tickets', href: '/branch-admin/tickets', icon: Ticket, permission: { module: 'tickets', action: 'view' } },
  { name: 'Reports', href: '/branch-admin/reports', icon: BarChart3, permission: { module: 'analytics', action: 'view' } },
  { name: 'Settings', href: '/branch-admin/settings', icon: Settings, permission: { module: 'settings', action: 'view' } },
  { name: 'Help', href: '/branch-admin/support', icon: HelpCircle, permission: null },
]

// Helper to check if user has permission
const hasPermission = (user: any, permission: { module: string; action: string } | null) => {
  if (!permission) return true
  if (!user?.permissions) return false
  return user.permissions[permission.module]?.[permission.action] === true
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

export const useBranchAdminSidebar = () => useContext(SidebarContext)

export function BranchAdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('branch-admin-sidebar-collapsed')
    if (saved) {
      setIsCollapsed(JSON.parse(saved))
    }
  }, [])

  const handleSetCollapsed = (value: boolean) => {
    setIsCollapsed(value)
    localStorage.setItem('branch-admin-sidebar-collapsed', JSON.stringify(value))
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed: handleSetCollapsed, mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function BranchAdminSidebar() {
  const pathname = usePathname()
  const { isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen } = useBranchAdminSidebar()
  const { user, logout } = useAuthStore()

  const toggleCollapse = () => setIsCollapsed(!isCollapsed)
  const closeMobile = () => setMobileOpen(false)

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  // Sidebar content component
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const showText = isMobile || !isCollapsed

    return (
      <>
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {showText && (
            <Link href="/branch-admin/dashboard" className="flex items-center space-x-3" onClick={closeMobile}>
              <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Branch Admin</h1>
              </div>
            </Link>
          )}
          {isMobile ? (
            <button onClick={closeMobile} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
          ) : (
            <button onClick={toggleCollapse} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              {isCollapsed ? <ChevronRight className="w-5 h-5 text-gray-500" /> : <ChevronLeft className="w-5 h-5 text-gray-500" />}
            </button>
          )}
        </div>

        {/* User Info */}
        {showText && user && (
          <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-cyan-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user.name?.charAt(0)?.toUpperCase() || 'B'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name || 'Branch Admin'}</p>
                <p className="text-xs text-gray-500 truncate">{user.email || ''}</p>
                <p className="text-xs text-teal-600 font-medium">Branch Admin</p>
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
                  onClick={closeMobile}
                  title={!showText ? item.name : undefined}
                  className={cn(
                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/30'
                      : 'text-gray-700 hover:bg-teal-50'
                  )}
                >
                  <Icon
                    className={cn(
                      'flex-shrink-0 w-5 h-5',
                      showText ? 'mr-3' : 'mx-auto',
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-teal-500'
                    )}
                  />
                  {showText && <span className="truncate">{item.name}</span>}
                </Link>
              )
            })}
        </nav>

        {/* Version Info */}
        {showText && (
          <div className="flex-shrink-0 px-4 py-2 border-t border-gray-200">
            <div className="text-xs text-gray-400 text-center">v2.1.0</div>
          </div>
        )}

        {/* Logout */}
        <div className="flex-shrink-0 border-t border-gray-200 p-2">
          <button
            onClick={handleLogout}
            className={cn(
              'group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors',
              showText ? '' : 'justify-center'
            )}
          >
            <LogOut className={cn('flex-shrink-0 w-5 h-5 text-gray-400 group-hover:text-red-500', showText ? 'mr-3' : '')} />
            {showText && 'Sign Out'}
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-white shadow-xl transition-transform duration-300 flex flex-col w-64 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent isMobile={true} />
      </div>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-white shadow-xl transition-all duration-300 flex-col hidden lg:flex',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent isMobile={false} />
      </div>
    </>
  )
}
