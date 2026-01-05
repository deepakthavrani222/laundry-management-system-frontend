'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { 
  ShoppingBag, Clock, CheckCircle, Package, Calendar, ArrowRight, 
  Sparkles, User, HelpCircle, ArrowLeft, Home, LogOut, Menu, X, MapPin,
  Filter, Search, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface TenantInfo {
  name: string
  slug: string
  tenancyId: string
  branding?: {
    logo?: { url?: string }
    theme?: { primaryColor?: string }
  }
}

const sidebarNavigation = [
  { name: 'Dashboard', href: 'dashboard', icon: Home, current: false },
  { name: 'My Orders', href: 'orders', icon: ShoppingBag, current: true },
  { name: 'Support', href: 'support', icon: HelpCircle, current: false },
  { name: 'Addresses', href: 'addresses', icon: MapPin, current: false },
  { name: 'Profile', href: 'profile', icon: User, current: false },
]

export default function TenantOrders() {
  const params = useParams()
  const router = useRouter()
  const tenant = params.tenant as string
  const { user, token, isAuthenticated, logout } = useAuthStore()
  
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${tenant}`)
    }
  }, [isAuthenticated, tenant, router])

  useEffect(() => {
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
  }, [tenant])

  useEffect(() => {
    const fetchTenantOrders = async () => {
      if (!token || !tenantInfo?.tenancyId) return
      
      try {
        setLoading(true)
        const response = await fetch(`${API_URL}/customer/orders?tenancyId=${tenantInfo.tenancyId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success) {
          // API returns data.data.data (array) not data.data.orders
          setOrders(data.data.data || data.data.orders || [])
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (tenantInfo?.tenancyId) {
      fetchTenantOrders()
    }
  }, [token, tenantInfo?.tenancyId])


  const getStatusColor = (s: string) => {
    const colors: Record<string, string> = { 
      delivered: 'bg-emerald-100 text-emerald-700', 
      placed: 'bg-amber-100 text-amber-700', 
      picked: 'bg-blue-100 text-blue-700', 
      in_process: 'bg-blue-100 text-blue-700', 
      ready: 'bg-purple-100 text-purple-700', 
      out_for_delivery: 'bg-purple-100 text-purple-700', 
      cancelled: 'bg-red-100 text-red-700' 
    }
    return colors[s] || 'bg-gray-100 text-gray-700'
  }

  const handleBookNow = () => {
    router.push(`/${tenant}?openBooking=true`)
  }

  const handleLogout = () => {
    logout()
    router.push(`/auth/login?redirect=${encodeURIComponent(`/${tenant}/orders`)}`)
  }

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesSearch = searchQuery === '' || 
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (!isAuthenticated) return null

  if (loading && !tenantInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <Link href={`/${tenant}`} className="flex items-center gap-3">
                {tenantInfo?.branding?.logo?.url ? (
                  <img src={tenantInfo.branding.logo.url} alt={tenantInfo.name} className="w-10 h-10 rounded-xl object-contain" />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="font-bold text-gray-800">{tenantInfo?.name || 'Orders'}</h1>
                  <p className="text-xs text-gray-500">Customer Portal</p>
                </div>
              </Link>
              <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

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

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarNavigation.map((item) => {
              const href = item.external ? item.href : `/${tenant}/${item.href}`
              const isActive = item.current
              return (
                <Link
                  key={item.name}
                  href={href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-gray-100 space-y-2">
            <Link href={`/${tenant}`} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
              <ArrowLeft className="w-5 h-5 text-gray-400" />
              <span className="font-medium">Back to Store</span>
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-800">My Orders</h1>
                <p className="text-sm text-gray-500">Orders at {tenantInfo?.name}</p>
              </div>
            </div>
            <Button 
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30"
              onClick={handleBookNow}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">New Order</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto">
          {/* Filters */}
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="placed">Placed</option>
                  <option value="picked">Picked</option>
                  <option value="in_process">In Process</option>
                  <option value="ready">Ready</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 text-teal-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {orders.length === 0 ? 'No orders yet' : 'No matching orders'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {orders.length === 0 
                    ? `Start your laundry journey with ${tenantInfo?.name}!`
                    : 'Try adjusting your filters'}
                </p>
                {orders.length === 0 && (
                  <Button 
                    className="bg-gradient-to-r from-teal-500 to-cyan-500"
                    onClick={handleBookNow}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />Book First Order
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <Link key={order._id} href={`/${tenant}/orders/${order._id}`}>
                    <div className="group p-5 hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-cyan-50/30 cursor-pointer transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Package className="w-6 h-6 text-teal-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-800">#{order.orderNumber}</span>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                              {order.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span>{order.items?.length || 0} items</span>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-gray-800">₹{order.totalAmount || order.pricing?.total || 0}</p>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Stats Summary */}
          {orders.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total', value: orders.length, icon: ShoppingBag, color: 'text-blue-600 bg-blue-100' },
                { label: 'Active', value: orders.filter(o => ['placed', 'picked', 'in_process', 'ready', 'out_for_delivery'].includes(o.status)).length, icon: Clock, color: 'text-amber-600 bg-amber-100' },
                { label: 'Completed', value: orders.filter(o => o.status === 'delivered').length, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-100' },
                { label: 'Total Spent', value: `₹${orders.reduce((s, o) => s + (o.totalAmount || o.pricing?.total || 0), 0).toLocaleString()}`, icon: Package, color: 'text-purple-600 bg-purple-100' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
