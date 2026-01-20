'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Ticket,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  User,
  BarChart3,
  Settings,
  HelpCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect, createContext, useContext } from 'react'
import { useAuthStore } from '@/store/authStore'

// Navigation items for support users
const navigation = [
  { name: 'Dashboard', href: '/support/dashboard', icon: Home },
  { name: 'My Tickets', href: '/support/tickets', icon: Ticket },
  { name: 'Unassigned Tickets', href: '/support/tickets/unassigned', icon: AlertTriangle },
  { name: 'Messages', href: '/support/messages', icon: MessageSquare },
  { name: 'Knowledge Base', href: '/support/knowledge-base', icon: HelpCircle },
  { name: 'Performance', href: '/support/performance', icon: BarChart3 },
  { name: 'Settings', href: '/support/settings', icon: Settings },
]

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

export const useSupportSidebar = () => useContext(SidebarContext)

export function SupportSidebarProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

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
      value={{ 
        isCollapsed, 
        setIsCollapsed: handleSetCollapsed, 
        mobileOpen, 
        setMobileOpen
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function SupportSidebar() {
  const pathname = usePathname()
  const { isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen } = useSupportSidebar()
  const { user, logout } = useAuthStore()

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

  const renderNavItem = (item: any, isMobile = false) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    const Icon = item.icon
    const showText = isMobile || !isCollapsed

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
          <Link href="/support/dashboard" className="flex items-center space-x-3" onClick={closeMobile}>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Support Portal</h1>
              <p className="text-xs text-gray-500">LaundryLobby</p>
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
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.name?.charAt(0)?.toUpperCase() || 'S'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name || 'Support Agent'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email || ''}</p>
              <p className="text-xs text-blue-600 font-medium">Support Agent</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto min-h-0">
        {navigation.map(item => renderNavItem(item, isMobile))}
      </nav>

      {/* Quick Stats - Only show when expanded */}
      {(isMobile || !isCollapsed) && (
        <div className="flex-shrink-0 px-4 pb-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">
              Today&apos;s Stats
            </h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Assigned Tickets</span>
                <span className="font-medium text-blue-600">0</span>
              </div>
              <div className="flex justify-between">
                <span>Resolved Today</span>
                <span className="font-medium text-green-600">0</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Response Time</span>
                <span className="font-medium text-orange-600">-</span>
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