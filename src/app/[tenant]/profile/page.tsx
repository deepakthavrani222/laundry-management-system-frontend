'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  User, Mail, Phone, Edit2, Save, Loader2, Shield, CreditCard,
  Sparkles, HelpCircle, ShoppingBag, MapPin, ArrowLeft, LogOut, Menu, X, Home, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface TenantInfo {
  name: string
  slug: string
  tenancyId: string
  branding?: { logo?: { url?: string } }
}

const sidebarNavigation = [
  { name: 'Dashboard', href: 'dashboard', icon: Home, current: false },
  { name: 'My Orders', href: 'orders', icon: ShoppingBag, current: false },
  { name: 'Support', href: 'support', icon: HelpCircle, current: false },
  { name: 'Addresses', href: 'addresses', icon: MapPin, current: false },
  { name: 'Profile', href: 'profile', icon: User, current: true },
]

export default function TenantProfilePage() {
  const params = useParams()
  const router = useRouter()
  const tenant = params.tenant as string
  const { user, token, isAuthenticated, logout, updateUser } = useAuthStore()
  
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ name: user?.name || '', phone: user?.phone || '' })

  useEffect(() => {
    const saved = localStorage.getItem('tenant-sidebar-collapsed')
    if (saved) setSidebarCollapsed(JSON.parse(saved))
  }, [])

  const toggleSidebarCollapse = () => {
    const newValue = !sidebarCollapsed
    setSidebarCollapsed(newValue)
    localStorage.setItem('tenant-sidebar-collapsed', JSON.stringify(newValue))
  }

  useEffect(() => {
    if (!isAuthenticated) router.push(`/${tenant}`)
  }, [isAuthenticated, tenant, router])

  useEffect(() => {
    const fetchTenantInfo = async () => {
      try {
        const response = await fetch(`${API_URL}/public/tenancy/branding/${tenant}`)
        const data = await response.json()
        if (data.success) setTenantInfo({ name: data.data.name, slug: data.data.slug, tenancyId: data.data.tenancyId, branding: data.data.branding })
      } catch (error) { console.error('Failed to fetch tenant info:', error) }
    }
    fetchTenantInfo()
  }, [tenant])

  useEffect(() => {
    if (user) setFormData({ name: user.name || '', phone: user.phone || '' })
  }, [user])

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (data.success) {
        updateUser(data.data.user)
        toast.success('Profile updated')
        setEditing(false)
      } else {
        toast.error(data.message || 'Failed to update')
      }
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => { logout(); router.push(`/auth/login?redirect=${encodeURIComponent(`/${tenant}/profile`)}`) }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${sidebarCollapsed ? 'w-20' : 'w-72'}`}>
        <div className="flex flex-col h-full overflow-hidden">
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
                    <h1 className="font-bold text-gray-800">{tenantInfo?.name || 'Profile'}</h1>
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
              <button className="hidden lg:flex p-1.5 hover:bg-gray-100 rounded-lg transition-colors" onClick={toggleSidebarCollapse} title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                {sidebarCollapsed ? <ChevronRight className="w-5 h-5 text-gray-500" /> : <ChevronLeft className="w-5 h-5 text-gray-500" />}
              </button>
            </div>
          </div>

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

          <nav className={`flex-1 ${sidebarCollapsed ? 'p-2' : 'p-4'} space-y-1 overflow-y-auto`}>
            {sidebarNavigation.map((item) => (
              <Link key={item.name} href={`/${tenant}/${item.href}`} title={sidebarCollapsed ? item.name : undefined}
                className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-xl transition-all ${item.current ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={() => setSidebarOpen(false)}>
                <item.icon className={`w-5 h-5 flex-shrink-0 ${item.current ? 'text-white' : 'text-gray-400'}`} />
                {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            ))}
          </nav>

          <div className={`${sidebarCollapsed ? 'p-2' : 'p-4'} border-t border-gray-100 space-y-2`}>
            <Link href={`/${tenant}`} title={sidebarCollapsed ? 'Back to Store' : undefined} className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-all`}>
              <ArrowLeft className="w-5 h-5 text-gray-400 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Back to Store</span>}
            </Link>
            <button onClick={handleLogout} title={sidebarCollapsed ? 'Logout' : undefined} className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all`}>
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <header className={`bg-white border-b border-gray-200 fixed top-0 right-0 z-30 transition-all duration-300 ${sidebarCollapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-72'}`}>
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-800">My Profile</h1>
                <p className="text-sm text-gray-500">Manage your account settings</p>
              </div>
            </div>
            {!editing && (
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" />Edit
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto mt-16">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{user?.name}</h2>
                  <p className="text-gray-500">{user?.email}</p>
                </div>
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={user?.email || ''} disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                      {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save</>}
                    </Button>
                    <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <div><p className="text-xs text-gray-500">Full Name</p><p className="font-medium text-gray-800">{user?.name}</p></div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <div><p className="text-xs text-gray-500">Email</p><p className="font-medium text-gray-800">{user?.email}</p></div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div><p className="text-xs text-gray-500">Phone</p><p className="font-medium text-gray-800">{user?.phone || 'Not provided'}</p></div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link href={`/${tenant}/addresses`} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-3"><MapPin className="w-5 h-5 text-teal-600" /></div>
                  <div><p className="font-medium text-gray-800">Manage Addresses</p><p className="text-sm text-gray-500">Add or edit your saved addresses</p></div>
                </Link>
                <Link href={`/${tenant}/orders`} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3"><CreditCard className="w-5 h-5 text-blue-600" /></div>
                  <div><p className="font-medium text-gray-800">Order History</p><p className="text-sm text-gray-500">View all your past orders</p></div>
                </Link>
                <Link href={`/${tenant}/support`} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3"><Shield className="w-5 h-5 text-purple-600" /></div>
                  <div><p className="font-medium text-gray-800">Help & Support</p><p className="text-sm text-gray-500">Get help with your orders</p></div>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
