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
  Package,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  LogOut,
  Ticket,
  Palette,
  QrCode,
  Tag,
  Percent,
  Gift,
  Star,
  Users2,
  Target,
  MapPin,
  Image,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect, createContext, useContext } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useAdminDashboard } from '@/hooks/useAdmin'

// Navigation items with permission requirements
const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Home, permission: null }, // Always visible
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag, permission: { module: 'orders', action: 'view' } },
  { name: 'Barcode Scanner', href: '/admin/scanner', icon: QrCode, permission: { module: 'orders', action: 'view' } },
  { name: 'Customers', href: '/admin/customers', icon: Users, permission: { module: 'customers', action: 'view' } },
  { name: 'Inventory', href: '/admin/inventory', icon: Package, permission: { module: 'inventory', action: 'view' } },
  { name: 'Services', href: '/admin/services', icon: Sparkles, permission: { module: 'services', action: 'view' } },
  { name: 'Branches', href: '/admin/branches', icon: MapPin, permission: null },
  { name: 'Branch Admins', href: '/admin/branch-admins', icon: Users, permission: null },
  { 
    name: 'Programs', 
    icon: Gift, 
    permission: { module: 'coupons', action: 'view' },
    isExpandable: true,
    subItems: [
      { name: 'Campaigns', href: '/admin/campaigns', icon: Target, permission: { module: 'coupons', action: 'view' } },
      { name: 'Banners', href: '/admin/banners', icon: Image, permission: { module: 'coupons', action: 'view' } },
      { name: 'Coupons', href: '/admin/coupons', icon: Tag, permission: { module: 'coupons', action: 'view' } },
      { name: 'Discounts', href: '/admin/discounts', icon: Percent, permission: { module: 'coupons', action: 'view' } },
      { name: 'Referrals', href: '/admin/referrals', icon: Users2, permission: { module: 'coupons', action: 'view' } },
      { name: 'Loyalty', href: '/admin/loyalty', icon: Star, permission: { module: 'coupons', action: 'view' } },
    ]
  },
  { name: 'Logistics', href: '/admin/logistics', icon: Truck, permission: { module: 'logistics', action: 'view' } },
  { name: 'Support Tickets', href: '/admin/tickets', icon: Ticket, permission: { module: 'tickets', action: 'view' } },
  { name: 'Refunds', href: '/admin/refunds', icon: RefreshCw, permission: { module: 'orders', action: 'cancel' } },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard, permission: { module: 'performance', action: 'view' } },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, permission: { module: 'performance', action: 'view' } },
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
  console.log(`🔐 Permission check: ${permission.module}.${permission.action} = ${hasIt}`, user.permissions)
  return hasIt
}

// Context for sidebar state
interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (value: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (value: boolean) => void
  expandedItems: string[]
  toggleExpanded: (itemName: string) => void
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  setIsCollapsed: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
  expandedItems: [],
  toggleExpanded: () => {},
})

export const useAdminSidebar = () => useContext(SidebarContext)

export function AdminSidebarProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(['Programs']) // Programs expanded by default

  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed')
    if (saved) {
      setIsCollapsed(JSON.parse(saved))
    }
    
    const savedExpanded = localStorage.getItem('admin-sidebar-expanded')
    if (savedExpanded) {
      setExpandedItems(JSON.parse(savedExpanded))
    }
  }, [])

  const handleSetCollapsed = (value: boolean) => {
    setIsCollapsed(value)
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(value))
  }

  const toggleExpanded = (itemName: string) => {
    const newExpanded = expandedItems.includes(itemName)
      ? expandedItems.filter(item => item !== itemName)
      : [...expandedItems, itemName]
    
    setExpandedItems(newExpanded)
    localStorage.setItem('admin-sidebar-expanded', JSON.stringify(newExpanded))
  }

  return (
    <SidebarContext.Provider
      value={{ 
        isCollapsed, 
        setIsCollapsed: handleSetCollapsed, 
        mobileOpen, 
        setMobileOpen,
        expandedItems,
        toggleExpanded
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()
  const { isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen, expandedItems, toggleExpanded } = useAdminSidebar()
  const { user, logout } = useAuthStore()
  const { metrics, loading: metricsLoading } = useAdminDashboard()

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  const closeMobile = () => {
    setMobileOpen(false)
  }

  // Check if any sub-item is active
  const isParentActive = (item: any) => {
    if (item.href) {
      return pathname === item.href || pathname.startsWith(item.href + '/')
    }
    if (item.subItems) {
      return item.subItems.some((subItem: any) => 
        pathname === subItem.href || pathname.startsWith(subItem.href + '/')
      )
    }
    return false
  }

  const renderNavItem = (item: any, isMobile = false) => {
    const isActive = isParentActive(item)
    const Icon = item.icon
    const isExpanded = expandedItems.includes(item.name)
    const showText = isMobile || !isCollapsed

    if (item.isExpandable && item.subItems) {
      return (
        <div key={item.name}>
          {/* Parent Item */}
          <button
            onClick={() => toggleExpanded(item.name)}
            className={cn(
              'group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all',
              isActive
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-700 hover:bg-blue-50'
            )}
          >
            <Icon
              className={cn(
                'flex-shrink-0 w-5 h-5',
                showText ? 'mr-3' : 'mx-auto',
                isActive
                  ? 'text-white'
                  : 'text-gray-400 group-hover:text-blue-500'
              )}
            />
            {showText && (
              <>
                <span className="truncate flex-1 text-left">{item.name}</span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </>
            )}
          </button>

          {/* Sub Items */}
          {showText && isExpanded && (
            <div className="ml-6 mt-1 space-y-1">
              {item.subItems
                .filter((subItem: any) => hasPermission(user, subItem.permission))
                .map((subItem: any) => {
                const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/')
                const SubIcon = subItem.icon

                return (
                  <Link
                    key={subItem.name}
                    href={subItem.href}
                    onClick={closeMobile}
                    className={cn(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all',
                      isSubActive
                        ? 'bg-blue-100 text-blue-700 border-l-2 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <SubIcon
                      className={cn(
                        'flex-shrink-0 w-4 h-4 mr-3',
                        isSubActive
                          ? 'text-blue-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      )}
                    />
                    <span className="truncate">{subItem.name}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    // Regular navigation item
    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={closeMobile}
        title={!showText ? item.name : undefined}
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
            showText ? 'mr-3' : 'mx-auto',
            isActive
              ? 'text-white'
              : 'text-gray-400 group-hover:text-blue-500'
          )}
        />
        {showText && <span className="truncate">{item.name}</span>}
      </Link>
    )
  }

  // Sidebar content component to avoid duplication
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {(isMobile || !isCollapsed) && (
          <Link href="/admin/dashboard" className="flex items-center space-x-3" onClick={closeMobile}>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">LaundryPro</h1>
            </div>
          </Link>
        )}

        {isMobile ? (
          <button
            onClick={closeMobile}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
        ) : (
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
        )}
      </div>

      {/* User Info */}
      {(isMobile || !isCollapsed) && user && (
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
          .map(item => renderNavItem(item, isMobile))}
      </nav>

      {/* Quick Stats - Only show when expanded */}
      {(isMobile || !isCollapsed) && (
        <div className="flex-shrink-0 px-4 pb-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">
              Today&apos;s Overview
            </h3>
            {metricsLoading ? (
              <div className="space-y-2 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Loading...</span>
                  <div className="w-6 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>New Orders</span>
                  <span className="font-medium text-blue-600">
                    {metrics?.todayOrders || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pending</span>
                  <span className="font-medium text-orange-600">
                    {metrics?.pendingOrders || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Completed</span>
                  <span className="font-medium text-green-600">
                    {metrics?.completedTodayOrders || 0}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Version Info */}
      {(isMobile || !isCollapsed) && (
        <div className="flex-shrink-0 px-4 py-2 border-t border-gray-200">
          <div className="text-xs text-gray-400 text-center">
            v2.1.0
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="flex-shrink-0 border-t border-gray-200 p-2">
        <button
          onClick={handleLogout}
          className={cn(
            'group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors',
            (isMobile || !isCollapsed) ? '' : 'justify-center'
          )}
        >
          <LogOut
            className={cn(
              'flex-shrink-0 w-5 h-5 text-gray-400 group-hover:text-red-500',
              (isMobile || !isCollapsed) ? 'mr-3' : ''
            )}
          />
          {(isMobile || !isCollapsed) && 'Sign Out'}
        </button>
      </div>
    </>
  )

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
