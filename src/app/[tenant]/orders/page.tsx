'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams, useRouter, usePathname, useSearchParams } from 'next/navigation'
import { 
  ShoppingBag, Clock, CheckCircle, Package, Calendar, ArrowRight, 
  Sparkles, User, HelpCircle, ArrowLeft, Home, LogOut, Menu, X, MapPin,
  Filter, Search, ChevronRight, ChevronLeft, Star, Users2, Wallet, Gift,
  Truck, AlertCircle, Eye, RotateCcw, Plus, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/Pagination'
import { useAuthStore } from '@/store/authStore'
import { formatOrderNumber } from '@/utils/orderUtils'
import OrderQRCode from '@/components/OrderQRCode'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const ITEMS_PER_PAGE = 8

interface TenantInfo {
  name: string
  slug: string
  tenancyId: string
  branding?: {
    logo?: { url?: string }
    theme?: { primaryColor?: string }
  }
}

const statusConfig: Record<string, { color: string; icon: any; text: string }> = {
  placed: { color: 'text-blue-600 bg-blue-50', icon: Package, text: 'Placed' },
  assigned_to_branch: { color: 'text-indigo-600 bg-indigo-50', icon: Package, text: 'Assigned' },
  assigned_to_logistics_pickup: { color: 'text-cyan-600 bg-cyan-50', icon: Truck, text: 'Pickup Scheduled' },
  picked: { color: 'text-yellow-600 bg-yellow-50', icon: Truck, text: 'Picked Up' },
  in_process: { color: 'text-orange-600 bg-orange-50', icon: Clock, text: 'In Progress' },
  ready: { color: 'text-purple-600 bg-purple-50', icon: CheckCircle, text: 'Ready' },
  assigned_to_logistics_delivery: { color: 'text-teal-600 bg-teal-50', icon: Truck, text: 'Out for Delivery' },
  out_for_delivery: { color: 'text-teal-600 bg-teal-50', icon: Truck, text: 'Out for Delivery' },
  delivered: { color: 'text-green-600 bg-green-50', icon: CheckCircle, text: 'Delivered' },
  cancelled: { color: 'text-red-600 bg-red-50', icon: AlertCircle, text: 'Cancelled' },
}

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

export default function TenantOrders() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tenant = params.tenant as string
  const { user, token, isAuthenticated, logout } = useAuthStore()
  
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const sidebarNavigation = useMemo(() => getSidebarNavigation(tenant, pathname), [tenant, pathname])

  // Read search query from URL on mount
  useEffect(() => {
    const searchFromUrl = searchParams.get('search')
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl)
    }
  }, [searchParams])

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

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status]
    return config ? config.icon : Package
  }

  const getStatusColor = (status: string) => {
    const config = statusConfig[status]
    return config ? config.color : 'text-gray-600 bg-gray-50'
  }

  const getStatusText = (status: string) => {
    const config = statusConfig[status]
    return config ? config.text : status
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
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order._id?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!isAuthenticated) return null

  if (loading && !tenantInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

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
                    <h1 className="font-bold text-gray-800">{tenantInfo?.name || 'Orders'}</h1>
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

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <header className={`bg-white border-b border-gray-200 fixed top-0 right-0 z-30 transition-all duration-300 ${sidebarCollapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-72'}`}>
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-800">My Orders</h1>
                <p className="text-sm text-gray-500">Track and manage your laundry orders</p>
              </div>
            </div>
            <Button 
              className="bg-teal-500 hover:bg-teal-600 text-white"
              onClick={handleBookNow}
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">New Order</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto mt-16">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by order number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Status</option>
                  <option value="placed">Placed</option>
                  <option value="picked">Picked Up</option>
                  <option value="in_process">In Progress</option>
                  <option value="ready">Ready</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : `Start your laundry journey with ${tenantInfo?.name}!`
                  }
                </p>
                {orders.length === 0 && (
                  <Button 
                    className="bg-teal-500 hover:bg-teal-600 text-white"
                    onClick={handleBookNow}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Order
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedOrders.map((order) => {
                  const StatusIcon = getStatusIcon(order.status)
                  return (
                    <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                              {/* Barcode */}
                              <OrderQRCode 
                                orderNumber={order.orderNumber}
                                orderId={order._id}
                                barcode={order.orderNumber}
                                size="small"
                                mode="barcode-only"
                              />
                              
                              <h3 className="font-semibold text-gray-800">{formatOrderNumber(order.orderNumber)}</h3>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {getStatusText(order.status)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="flex items-center">
                                <Package className="w-4 h-4 mr-1" />
                                {order.items?.length || 0} items
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-gray-800">
                            ₹{order.totalAmount || order.pricing?.total || 0}
                          </span>
                          <div className="flex gap-2">
                            <Link href={`/${tenant}/orders/${order._id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            {order.status === 'delivered' && !order.rating?.score && (
                              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white">
                                <Star className="w-4 h-4 mr-1" />
                                Rate
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                {/* Pagination */}
                {filteredOrders.length > ITEMS_PER_PAGE && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <Pagination
                      current={currentPage}
                      pages={totalPages}
                      total={filteredOrders.length}
                      limit={ITEMS_PER_PAGE}
                      onPageChange={handlePageChange}
                      itemName="orders"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Stats Summary */}
            {orders.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-blue-600 bg-blue-100' },
                  { label: 'Active', value: orders.filter(o => ['placed', 'picked', 'in_process', 'ready', 'out_for_delivery'].includes(o.status)).length, icon: Clock, color: 'text-amber-600 bg-amber-100' },
                  { label: 'Completed', value: orders.filter(o => o.status === 'delivered').length, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-100' },
                  { label: 'Total Spent', value: `₹${orders.reduce((s, o) => s + (o.totalAmount || o.pricing?.total || 0), 0).toLocaleString()}`, icon: Package, color: 'text-purple-600 bg-purple-100' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
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
          </div>
        </main>
      </div>
    </div>
  )
}
