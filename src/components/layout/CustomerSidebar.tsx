'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useTenancyTheme } from '@/contexts/TenancyThemeContext'
import { useTenant } from '@/contexts/TenantContext'
import { 
  LayoutDashboard,
  ShoppingBag,
  MapPin,
  User,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  Home,
  Menu,
  X,
  Headphones,
  Star,
  Users2,
  Wallet,
  Gift
} from 'lucide-react'

const baseNavigation = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'My Orders', path: '/orders', icon: ShoppingBag },
  { name: 'New Order', path: '/orders/new', icon: Plus },
  { name: 'Loyalty', path: '/loyalty', icon: Star },
  { name: 'Referrals', path: '/referrals', icon: Users2 },
  { name: 'Wallet', path: '/wallet', icon: Wallet },
  { name: 'Offers', path: '/offers', icon: Gift },
  { name: 'Addresses', path: '/addresses', icon: MapPin },
  { name: 'Support', path: '/support', icon: Headphones },
  { name: 'Profile', path: '/profile', icon: User },
]

interface CustomerSidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export default function CustomerSidebar({ 
  mobileOpen, 
  onMobileClose,
  collapsed = false,
  onCollapsedChange
}: CustomerSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { theme } = useTenancyTheme()
  const { tenant, isTenantPage } = useTenant()

  // Generate navigation with tenant-aware URLs
  const navigation = useMemo(() => {
    return baseNavigation.map(item => ({
      ...item,
      href: isTenantPage && tenant?.slug 
        ? `/${tenant.slug}${item.path}`
        : `/customer${item.path}`
    }))
  }, [isTenantPage, tenant?.slug])

  const handleLogout = () => {
    logout()
    if (isTenantPage && tenant?.slug) {
      window.location.href = `/${tenant.slug}`
    } else {
      window.location.href = '/'
    }
  }

  const handleNavClick = () => {
    if (onMobileClose) {
      onMobileClose()
    }
  }

  const toggleCollapsed = () => {
    if (onCollapsedChange) {
      onCollapsedChange(!collapsed)
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-xl transition-all duration-300 flex flex-col
        ${collapsed ? 'w-16' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      
      {/* Mobile Close Button */}
      {mobileOpen && (
        <button
          onClick={onMobileClose}
          className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg z-50"
        >
          <X className="w-5 h-5" />
        </button>
      )}
      
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!collapsed && (
          <Link href="/" className="flex items-center space-x-3">
            {theme?.logo ? (
              <img src={theme.logo} alt={theme.name} className="w-8 h-8 object-contain rounded-lg" />
            ) : (
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(to right, ${theme?.primaryColor || '#14b8a6'}, ${theme?.accentColor || '#06b6d4'})`,
                }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-gray-900">{theme?.name || 'LaundryPro'}</h1>
            </div>
          </Link>
        )}
        
        {/* Only show collapse button on desktop */}
        <button
          onClick={toggleCollapsed}
          className="hidden lg:block p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* User Info */}
      {!collapsed && user && (
        <div 
          className="flex-shrink-0 p-4 border-b border-gray-200"
          style={{ 
            background: `linear-gradient(to right, ${theme?.primaryColor || '#14b8a6'}15, ${theme?.accentColor || '#06b6d4'}15)`,
          }}
        >
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ 
                background: `linear-gradient(to right, ${theme?.primaryColor || '#14b8a6'}, ${theme?.accentColor || '#06b6d4'})`,
              }}
            >
              <span className="text-white font-medium text-sm">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email || ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto min-h-0">
        {navigation.map((item) => {
          // Exact match for specific routes, or starts with for parent routes (but not for /customer/orders when on /customer/orders/new)
          const isExactMatch = pathname === item.href
          const isParentMatch = item.href !== '/customer/orders' && pathname.startsWith(item.href + '/')
          const isActive = isExactMatch || isParentMatch
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleNavClick}
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                isActive
                  ? 'text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              style={isActive ? { 
                background: `linear-gradient(to right, ${theme?.primaryColor || '#14b8a6'}, ${theme?.accentColor || '#06b6d4'})`,
              } : undefined}
            >
              <Icon className={`flex-shrink-0 w-5 h-5 ${
                collapsed ? 'mx-auto' : 'mr-3'
              } ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {!collapsed && item.name}
            </Link>
          )
        })}
      </nav>

      {/* Version Info */}
      {!collapsed && (
        <div className="flex-shrink-0 px-4 py-2 border-t border-gray-200">
          <div className="text-xs text-gray-400 text-center">
            v2.1.0
          </div>
        </div>
      )}

      {/* Back to Home & Logout */}
      <div className="flex-shrink-0 border-t border-gray-200 p-2 space-y-1">
        <Link
          href={isTenantPage && tenant?.slug ? `/${tenant.slug}` : '/'}
          onClick={handleNavClick}
          className={`group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-100 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <Home className={`flex-shrink-0 w-5 h-5 ${collapsed ? '' : 'mr-3'} text-gray-400 group-hover:text-teal-500`} />
          {!collapsed && 'Back to Home'}
        </Link>
        <button
          onClick={handleLogout}
          className={`group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className={`flex-shrink-0 w-5 h-5 ${collapsed ? '' : 'mr-3'} text-gray-400 group-hover:text-red-500`} />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </div>
    </>
  )
}
