'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSuperAdminStore } from '@/store/superAdminStore'
import { 
  LayoutDashboard,
  Building2,
  Users,
  UserCircle,
  ShoppingBag,
  DollarSign,
  BarChart3,
  Settings,
  Shield,
  AlertTriangle,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Crown,
  Tag,
  Truck,
  Package,
  Sparkles,
  X
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/superadmin/dashboard', icon: LayoutDashboard, permission: 'analytics' },
  { name: 'Branches', href: '/superadmin/branches', icon: Building2, permission: 'branches' },
  { name: 'Logistics Partners', href: '/superadmin/logistics', icon: Truck, permission: 'branches' },
  { name: 'Admins', href: '/superadmin/admins', icon: Shield, permission: 'users' },
  { name: 'Users', href: '/superadmin/users', icon: Users, permission: 'users' },
  { name: 'Customers', href: '/superadmin/customers', icon: UserCircle, permission: 'users' },
  { name: 'Orders', href: '/superadmin/orders', icon: ShoppingBag, permission: 'orders' },
  { name: 'Services', href: '/superadmin/services', icon: Sparkles, permission: 'settings' },
  { name: 'Financial', href: '/superadmin/financial', icon: DollarSign, permission: 'finances' },
  { name: 'Analytics & Growth', href: '/superadmin/analytics', icon: BarChart3, permission: 'analytics' },
  { name: 'Pricing & Policy', href: '/superadmin/pricing', icon: Tag, permission: 'settings' },
  { name: 'Risk & Escalation', href: '/superadmin/risk', icon: AlertTriangle, permission: 'settings' },
  { name: 'Audit Logs', href: '/superadmin/audit', icon: FileText, permission: 'settings' },
  { name: 'Settings', href: '/superadmin/settings', icon: Settings, permission: 'settings' }
]

interface SuperAdminSidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function SuperAdminSidebar({ mobileOpen = false, onMobileClose }: SuperAdminSidebarProps) {
  const pathname = usePathname()
  const { admin, logout, sidebarCollapsed, setSidebarCollapsed } = useSuperAdminStore()

  const handleLogout = () => {
    logout()
    window.location.href = '/superadmin/auth/login'
  }

  const hasPermission = (permission: string) => {
    return admin?.permissions[permission as keyof typeof admin.permissions] || false
  }

  // On mobile: always show full width (w-64), on desktop: respect sidebarCollapsed
  const sidebarWidth = sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'

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
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-xl transition-all duration-300 flex flex-col w-64 ${sidebarWidth} ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {/* Logo - always show on mobile, conditionally on desktop */}
          <div className={`flex items-center space-x-3 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Super Admin</h1>
              <p className="text-xs text-gray-500">LaundryLobby</p>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex items-center">
            {/* Mobile close button */}
            <button
              onClick={onMobileClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            
            {/* Desktop collapse toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors hidden lg:block"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Admin Info - always show on mobile, conditionally on desktop */}
        {admin && (
          <div className={`flex-shrink-0 p-4 border-b border-gray-200 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {admin.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{admin.name}</p>
                <p className="text-xs text-gray-500 truncate">{admin.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto min-h-0">
          {navigation.map((item) => {
            if (!hasPermission(item.permission)) return null
            
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onMobileClose}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className={`flex-shrink-0 w-5 h-5 mr-3 ${sidebarCollapsed ? 'lg:mx-auto lg:mr-0' : ''} ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`} />
                {/* Always show text on mobile, conditionally on desktop */}
                <span className={sidebarCollapsed ? 'lg:hidden' : ''}>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-2">
          <button
            onClick={handleLogout}
            className={`group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors ${sidebarCollapsed ? 'lg:justify-center' : ''}`}
          >
            <LogOut className={`flex-shrink-0 w-5 h-5 mr-3 ${sidebarCollapsed ? 'lg:mr-0' : ''} text-gray-400 group-hover:text-red-500`} />
            <span className={sidebarCollapsed ? 'lg:hidden' : ''}>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  )
}
