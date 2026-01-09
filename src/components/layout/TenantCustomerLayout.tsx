'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams, useRouter, usePathname } from 'next/navigation'
import { 
  Home, ShoppingBag, Star, Users2, Wallet, Gift, MapPin, User, 
  HelpCircle, LogOut, ChevronLeft, ChevronRight, Sparkles, 
  ArrowLeft, Menu, X
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface TenantInfo {
  name: string
  slug: string
  tenancyId: string
  branding?: {
    logo?: { url?: string }
    theme?: { primaryColor?: string }
  }
}

interface TenantCustomerLayoutProps {
  children: React.ReactNode
  tenantInfo?: TenantInfo | null
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Sidebar Navigation
const getSidebarNavigation = (tenantSlug: string, currentPath: string) => [
  { name: 'Dashboard', href: `/${tenantSlug}/dashboard`, icon: Home, current: currentPath === `/${tenantSlug}/dashboard` },
  { name: 'My Orders', href: `/${tenantSlug}/orders`, icon: ShoppingBag, current: currentPath.startsWith(`/${tenantSlug}/orders`) },
  { name: 'Loyalty', href: `/${tenantSlug}/loyalty`, icon: Star, current: currentPath === `/${tenantSlug}/loyalty` },
  { name: 'Referrals', href: `/${tenantSlug}/referrals`, icon: Users2, current: currentPath === `/${tenantSlug}/referrals` },
  { name: 'Wallet', href: `/${tenantSlug}/wallet`, icon: Wallet, current: currentPath === `/${tenantSlug}/wallet` },
  { name: 'Offers', href: `/${tenantSlug}/offers`, icon: Gift, current: currentPath === `/${tenantSlug}/offers` },
  { name: 'Support', href: `/${tenantSlug}/support`, icon: HelpCircle, current: currentPath.startsWith(`/${tenantSlug}/support`) },
  { name: 'Addresses', href: `/${tenantSlug}/addresses`, icon: MapPin, current: currentPath === `/${tenantSlug}/addresses` },
  { name: 'Profile', href: `/${tenantSlug}/profile`, icon: User, current: currentPath === `/${tenantSlug}/profile` },
]

export default function TenantCustomerLayout({ children, tenantInfo: propTenantInfo }: TenantCustomerLayoutProps) {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const tenant = params.tenant as string
  const { user, isAuthenticated, logout } = useAuthStore()
  
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(propTenantInfo || null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Load sidebar collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tenant-sidebar-collapsed')
    if (saved) {
      setSidebarCollapsed(JSON.parse(saved))
    }
  }, [])

  const toggleSidebarCollapse = () => {
    const newValue = !sidebarCollapsed
    setSidebarCollapsed(newValue)
    localStorage.setItem('tenant-sidebar-collapsed', JSON.stringify(newValue))
  }

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${tenant}`)
    }
  }, [isAuthenticated, tenant, router])

  // Fetch tenant info if not provided
  useEffect(() => {
    if (!tenantInfo) {
      const fetchTenantInfo = async () => {
        try {
          const response = await fetch(`${API_URL}/public/tenancy/branding/${tenant}`)
          const data = await response.json()
          if (data.success) {
            setTenantInfo({
              name: data.data.name,
              slug: data.data.slug,
              tenancyId: data.data.tenancyId,
              branding: data.data.branding
            })
          }
        } catch (error) {
          console.error('Failed to fetch tenant info:', error)
        }
      }
      fetchTenantInfo()
    }
  }, [tenant, tenantInfo])

  // Generate navigation with current path highlighting
  const sidebarNavigation = useMemo(() => getSidebarNavigation(tenant, pathname), [tenant, pathname])

  const handleLogout = () => {
    logout()
    router.push(`/auth/login?redirect=${encodeURIComponent(`/${tenant}/dashboard`)}`)
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${sidebarCollapsed ? 'w-20' : 'w-72'}`}>
        <div className="flex flex-col h-full overflow-hidden">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <Link href={`/${tenant}`} className="flex items-center gap-3">
                  {tenantInfo?.branding?.logo?.url ? (
                    <img src={tenantInfo.branding.logo.url} alt={tenantInfo.name} className="w-10 h-10 rounded-xl object-contain" />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div>
                    <h1 className="font-bold text-gray-800">{tenantInfo?.name || 'Dashboard'}</h1>
                    <p className="text-xs text-gray-500">Customer Portal</p>
                  </div>
                </Link>
              )}
              {sidebarCollapsed && (
                <Link href={`/${tenant}`} className="mx-auto">
                  {tenantInfo?.branding?.logo?.url ? (
                    <img src={tenantInfo.branding.logo.url} alt={tenantInfo.name} className="w-10 h-10 rounded-xl object-contain" />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  )}
                </Link>
              )}
              <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
              <button 
                className="hidden lg:flex p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={toggleSidebarCollapse}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? <ChevronRight className="w-5 h-5 text-gray-500" /> : <ChevronLeft className="w-5 h-5 text-gray-500" />}
              </button>
            </div>
          </div>

          {/* User Info */}
          {!sidebarCollapsed && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">{user?.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="p-2 border-b border-gray-100 flex justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className={`flex-1 ${sidebarCollapsed ? 'p-2' : 'p-4'} space-y-1 overflow-y-auto`}>
            {sidebarNavigation.map((item) => {
              const isActive = item.current
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={sidebarCollapsed ? item.name : undefined}
                  className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className={`${sidebarCollapsed ? 'p-2' : 'p-4'} border-t border-gray-100 space-y-2`}>
            <Link 
              href={`/${tenant}`} 
              title={sidebarCollapsed ? 'Back to Store' : undefined}
              className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-all`}
            >
              <ArrowLeft className="w-5 h-5 text-gray-400 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Back to Store</span>}
            </Link>
            <button 
              onClick={handleLogout} 
              title={sidebarCollapsed ? 'Logout' : undefined}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all`}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        {/* Header */}
        <header className={`bg-white border-b border-gray-200 fixed top-0 right-0 z-30 transition-all duration-300 ${sidebarCollapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-72'}`}>
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-800">{tenantInfo?.name || 'Dashboard'}</h1>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto mt-16">
          {children}
        </main>
      </div>
    </div>
  )
}
