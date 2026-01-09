'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams, useRouter, usePathname } from 'next/navigation'
import { 
  Package, Calendar, ArrowLeft, MapPin, Phone, Clock, CheckCircle, 
  Truck, Sparkles, User, HelpCircle, Home, LogOut, Menu, X, ShoppingBag,
  CreditCard, FileText, Star, Users2, Wallet, Gift, ChevronLeft, ChevronRight,
  AlertCircle, Loader2, RotateCcw, Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import BarcodeDisplay from '@/components/BarcodeDisplay'
import toast from 'react-hot-toast'

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

const statusConfig: Record<string, { label: string; color: string; icon: any; description: string }> = {
  placed: { label: 'Order Placed', color: 'blue', icon: CheckCircle, description: 'Your order has been placed successfully' },
  assigned_to_branch: { label: 'Assigned to Branch', color: 'indigo', icon: Package, description: 'Order assigned to processing facility' },
  assigned_to_logistics_pickup: { label: 'Pickup Scheduled', color: 'purple', icon: Truck, description: 'Pickup has been scheduled' },
  picked: { label: 'Picked Up', color: 'yellow', icon: Package, description: 'Items have been collected' },
  in_process: { label: 'In Process', color: 'orange', icon: Clock, description: 'Items are being processed' },
  ready: { label: 'Ready for Delivery', color: 'cyan', icon: CheckCircle, description: 'Items are ready for delivery' },
  assigned_to_logistics_delivery: { label: 'Out for Delivery', color: 'green', icon: Truck, description: 'Items are out for delivery' },
  out_for_delivery: { label: 'Out for Delivery', color: 'green', icon: Truck, description: 'Items are out for delivery' },
  delivered: { label: 'Delivered', color: 'emerald', icon: CheckCircle, description: 'Order has been delivered successfully' },
  cancelled: { label: 'Cancelled', color: 'red', icon: X, description: 'Order has been cancelled' }
}


export default function TenantOrderDetail() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const tenant = params.tenant as string
  const orderId = params.id as string
  const { user, token, isAuthenticated, logout } = useAuthStore()
  
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null)
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')
  const [submittingRating, setSubmittingRating] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  const sidebarNavigation = useMemo(() => getSidebarNavigation(tenant, pathname), [tenant, pathname])

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
        if (data.success) {
          setTenantInfo({ name: data.data.name, slug: data.data.slug, tenancyId: data.data.tenancyId, branding: data.data.branding })
        }
      } catch (error) { console.error('Failed to fetch tenant info:', error) }
    }
    fetchTenantInfo()
  }, [tenant])

  useEffect(() => {
    const fetchOrder = async () => {
      if (!token) return
      try {
        setLoading(true)
        const response = await fetch(`${API_URL}/customer/orders/${orderId}`, { headers: { 'Authorization': `Bearer ${token}` } })
        const data = await response.json()
        if (data.success) setOrder(data.data.order || data.data)
      } catch (error) { console.error('Failed to fetch order:', error) }
      finally { setLoading(false) }
    }
    fetchOrder()
  }, [token, orderId])

  const handleLogout = () => {
    logout()
    router.push(`/auth/login?redirect=${encodeURIComponent(`/${tenant}/orders/${orderId}`)}`)
  }

  const canCancelOrder = () => {
    if (!order) return false
    return ['placed', 'assigned_to_branch', 'assigned_to_logistics_pickup'].includes(order.status)
  }

  const canRateOrder = () => order?.status === 'delivered' && !order.rating

  const handleCancelOrder = async () => {
    try {
      setCancelling(true)
      const response = await fetch(`${API_URL}/customer/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason })
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Order cancelled successfully')
        setShowCancelModal(false)
        setOrder({ ...order, status: 'cancelled' })
      } else { toast.error(data.message || 'Failed to cancel order') }
    } catch (err: any) { toast.error('Failed to cancel order') }
    finally { setCancelling(false) }
  }

  const handleRateOrder = async () => {
    try {
      setSubmittingRating(true)
      const response = await fetch(`${API_URL}/customer/orders/${orderId}/rate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback })
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Thank you for your feedback!')
        setShowRatingModal(false)
        setOrder({ ...order, rating: { score: rating, feedback, ratedAt: new Date().toISOString() } })
      } else { toast.error(data.message || 'Failed to submit rating') }
    } catch (err: any) { toast.error('Failed to submit rating') }
    finally { setSubmittingRating(false) }
  }

  const getStatusLabel = (status: string) => statusConfig[status]?.label || status
  const getStatusColor = (status: string) => statusConfig[status]?.color || 'gray'
  const StatusIcon = statusConfig[order?.status]?.icon || Clock

  if (!isAuthenticated) return null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Order not found</h2>
          <Link href={`/${tenant}/orders`}>
            <Button className="bg-teal-500 hover:bg-teal-600">Back to Orders</Button>
          </Link>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
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
                    <h1 className="font-bold text-gray-800">{tenantInfo?.name || 'Order'}</h1>
                    <p className="text-xs text-gray-500">Customer Portal</p>
                  </div>
                </Link>
              )}
              {sidebarCollapsed && (
                <Link href={`/${tenant}`} className="mx-auto">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </Link>
              )}
              <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
              <button className="hidden lg:flex p-1.5 hover:bg-gray-100 rounded-lg" onClick={toggleSidebarCollapse}>
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

          <nav className={`flex-1 ${sidebarCollapsed ? 'p-2' : 'p-4'} space-y-1 overflow-y-auto`}>
            {sidebarNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                title={sidebarCollapsed ? item.name : undefined}
                className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-xl transition-all ${
                  item.current ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${item.current ? 'text-white' : 'text-gray-400'}`} />
                {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            ))}
          </nav>

          <div className={`${sidebarCollapsed ? 'p-2' : 'p-4'} border-t border-gray-100 space-y-2`}>
            <Link href={`/${tenant}`} className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 text-gray-600 hover:bg-gray-100 rounded-xl`}>
              <ArrowLeft className="w-5 h-5 text-gray-400" />
              {!sidebarCollapsed && <span className="font-medium">Back to Store</span>}
            </Link>
            <button onClick={handleLogout} className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 text-red-600 hover:bg-red-50 rounded-xl`}>
              <LogOut className="w-5 h-5" />
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
              <Link href={`/${tenant}/orders`}>
                <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Order #{order.orderNumber}</h1>
                <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canCancelOrder() && (
                <Button variant="outline" size="sm" onClick={() => setShowCancelModal(true)} className="border-red-300 text-red-600 hover:bg-red-50">
                  <X className="w-4 h-4 mr-1" />Cancel
                </Button>
              )}
              {canRateOrder() && (
                <Button size="sm" onClick={() => setShowRatingModal(true)} className="bg-teal-500 hover:bg-teal-600 text-white">
                  <Star className="w-4 h-4 mr-1" />Rate
                </Button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto mt-16">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Status */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Status</h2>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${getStatusColor(order.status)}-100`}>
                      <StatusIcon className={`w-6 h-6 text-${getStatusColor(order.status)}-600`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{getStatusLabel(order.status)}</h3>
                      <p className="text-gray-600">{statusConfig[order.status]?.description}</p>
                    </div>
                  </div>
                  {order.statusHistory && order.statusHistory.length > 0 && (
                    <div className="space-y-3 border-t pt-4">
                      <h4 className="font-medium text-gray-800">Timeline</h4>
                      {order.statusHistory.map((status: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-800">{getStatusLabel(status.status)}</span>
                              <span className="text-sm text-gray-500">{new Date(status.updatedAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h2>
                  <div className="space-y-4">
                    {order.items?.map((item: any, index: number) => {
                      const rawName = item.itemType || item.name || 'Item'
                      const words = rawName.split(' ')
                      const cleanWords = words.filter((word: string) => {
                        const hasLetters = /[a-zA-Z]/.test(word)
                        const hasNumbers = /\d/.test(word)
                        return !(hasLetters && hasNumbers)
                      })
                      const cleanItemName = cleanWords.length > 0 
                        ? cleanWords.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
                        : rawName.replace(/_/g, ' ')
                      
                      return (
                        <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{cleanItemName}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <span>Service: {(item.service || '').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
                              <span>Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-800">₹{item.totalPrice}</p>
                            <p className="text-sm text-gray-500">₹{item.unitPrice} each</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Addresses */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Addresses</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {order.pickupAddress && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-3 flex items-center"><Home className="w-4 h-4 mr-2" />Pickup Address</h4>
                        <div className="text-gray-600">
                          <p className="font-medium">{order.pickupAddress?.name || 'N/A'}</p>
                          <p>{order.pickupAddress?.addressLine1 || ''}</p>
                          <p>{order.pickupAddress?.city || ''}{order.pickupAddress?.pincode ? `, ${order.pickupAddress.pincode}` : ''}</p>
                          {order.pickupAddress?.phone && <p className="flex items-center mt-2"><Phone className="w-4 h-4 mr-1" />{order.pickupAddress.phone}</p>}
                        </div>
                      </div>
                    )}
                    {order.deliveryAddress && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-3 flex items-center"><Truck className="w-4 h-4 mr-2" />Delivery Address</h4>
                        <div className="text-gray-600">
                          <p className="font-medium">{order.deliveryAddress?.name || 'N/A'}</p>
                          <p>{order.deliveryAddress?.addressLine1 || ''}</p>
                          <p>{order.deliveryAddress?.city || ''}{order.deliveryAddress?.pincode ? `, ${order.deliveryAddress.pincode}` : ''}</p>
                          {order.deliveryAddress?.phone && <p className="flex items-center mt-2"><Phone className="w-4 h-4 mr-1" />{order.deliveryAddress.phone}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rating Display */}
                {order.rating && (
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Rating</h2>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-5 h-5 ${star <= order.rating.score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      ))}
                      <span className="ml-2 font-medium text-gray-800">{order.rating.score}/5</span>
                    </div>
                    {order.rating.feedback && <p className="text-gray-600 mt-3">{order.rating.feedback}</p>}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items Subtotal</span>
                      <span className="font-medium">₹{order.pricing?.subtotal || 0}</span>
                    </div>
                    {order.isExpress && order.pricing?.expressCharge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Express Service</span>
                        <span className="font-medium">+ ₹{order.pricing.expressCharge}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Charge</span>
                      {order.pricing?.deliveryCharge > 0 ? (
                        <span className="font-medium">+ ₹{order.pricing.deliveryCharge}</span>
                      ) : (
                        <span className="font-medium text-green-600">FREE</span>
                      )}
                    </div>
                    {order.pricing?.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span className="flex items-center gap-1"><Tag className="w-3 h-3" />Discount</span>
                        <span className="font-medium">- ₹{order.pricing.discount}</span>
                      </div>
                    )}
                    {order.pricing?.tax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">GST (18%)</span>
                        <span className="font-medium">+ ₹{order.pricing.tax}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-3 mt-2 border-t-2 border-gray-200">
                      <span className="text-base font-bold text-gray-800">Total</span>
                      <span className="text-lg font-bold text-teal-600">₹{order.pricing?.total || order.totalAmount || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID</span>
                      <span className="font-medium">{order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pickup Date</span>
                      <span className="font-medium">{new Date(order.pickupDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Slot</span>
                      <span className="font-medium">{order.pickupTimeSlot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment</span>
                      <span className="font-medium">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status</span>
                      <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                        {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Barcode */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Order Barcode</h3>
                  <div className="flex justify-center">
                    <BarcodeDisplay orderNumber={order.orderNumber} width={200} height={70} showOrderDetails={false} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Rate Your Experience</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">How was your experience?</label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className="focus:outline-none">
                    <Star className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Feedback (Optional)</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us about your experience..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={3}
              />
            </div>
            <div className="flex space-x-3">
              <Button onClick={handleRateOrder} disabled={submittingRating} className="flex-1 bg-teal-500 hover:bg-teal-600 text-white">
                {submittingRating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : 'Submit Rating'}
              </Button>
              <Button variant="outline" onClick={() => setShowRatingModal(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Cancel Order</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to cancel this order?</p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please let us know why..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
              />
            </div>
            <div className="flex space-x-3">
              <Button onClick={handleCancelOrder} disabled={cancelling} className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                {cancelling ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Cancelling...</> : 'Cancel Order'}
              </Button>
              <Button variant="outline" onClick={() => setShowCancelModal(false)} className="flex-1">Keep Order</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
