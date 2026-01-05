'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { 
  Package, Calendar, ArrowLeft, MapPin, Phone, Clock, CheckCircle, 
  Truck, Sparkles, User, HelpCircle, Home, LogOut, Menu, X, ShoppingBag,
  CreditCard, FileText
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

const statusSteps = [
  { key: 'placed', label: 'Order Placed', icon: FileText },
  { key: 'picked', label: 'Picked Up', icon: Truck },
  { key: 'in_process', label: 'Processing', icon: Clock },
  { key: 'ready', label: 'Ready', icon: CheckCircle },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Package },
]

export default function TenantOrderDetail() {
  const params = useParams()
  const router = useRouter()
  const tenant = params.tenant as string
  const orderId = params.id as string
  const { user, token, isAuthenticated, logout } = useAuthStore()
  
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null)
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
    const fetchOrder = async () => {
      if (!token) return
      
      try {
        setLoading(true)
        const response = await fetch(`${API_URL}/customer/orders/${orderId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success) {
          // API returns data.data.order
          setOrder(data.data.order || data.data)
        }
      } catch (error) {
        console.error('Failed to fetch order:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrder()
  }, [token, orderId])

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

  const getCurrentStepIndex = () => {
    if (!order) return -1
    if (order.status === 'cancelled') return -1
    return statusSteps.findIndex(s => s.key === order.status)
  }

  const handleLogout = () => {
    logout()
    router.push(`/${tenant}`)
  }

  if (!isAuthenticated) return null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Order not found</h2>
          <Link href={`/${tenant}/orders`}>
            <Button className="bg-teal-500 hover:bg-teal-600">Back to Orders</Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentStep = getCurrentStepIndex()

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
                  <h1 className="font-bold text-gray-800">{tenantInfo?.name || 'Order'}</h1>
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
              <Link href={`/${tenant}/orders`} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Order #{order.orderNumber}</h1>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${getStatusColor(order.status || '')}`}>
              {(order.status || 'unknown').replace(/_/g, ' ')}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto">
          {/* Status Timeline */}
          {order.status !== 'cancelled' && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-6">Order Progress</h3>
              <div className="flex items-center justify-between">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStep
                  const isCurrent = index === currentStep
                  return (
                    <div key={step.key} className="flex flex-col items-center flex-1">
                      <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCompleted 
                          ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg' 
                          : 'bg-gray-100 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-teal-100' : ''}`}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      <p className={`text-xs mt-2 text-center ${isCompleted ? 'text-teal-600 font-semibold' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      {index < statusSteps.length - 1 && (
                        <div className={`absolute h-1 w-full top-5 left-1/2 -z-10 ${
                          index < currentStep ? 'bg-teal-500' : 'bg-gray-200'
                        }`} style={{ width: 'calc(100% - 2.5rem)', marginLeft: '1.25rem' }} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Items */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-500" />
                Order Items
              </h3>
              <div className="space-y-3">
                {order.items?.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-800">{item.name || item.serviceName}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-800">₹{item.price || item.amount}</p>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">No items</p>
                )}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-teal-500" />
                Payment Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{order.pricing?.subtotal || order.totalAmount || 0}</span>
                </div>
                {order.pricing?.deliveryCharge > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span>₹{order.pricing.deliveryCharge}</span>
                  </div>
                )}
                {order.pricing?.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.pricing.discount}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-teal-600">₹{order.totalAmount || order.pricing?.total || 0}</span>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium text-gray-800 capitalize">{order.paymentMethod || 'Cash on Delivery'}</p>
                </div>
              </div>
            </div>

            {/* Pickup Address */}
            {order.pickupAddress && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-500" />
                  Pickup Address
                </h3>
                <div className="space-y-2">
                  <p className="font-medium text-gray-800">{order.pickupAddress.label || 'Address'}</p>
                  <p className="text-gray-600">{order.pickupAddress.address || order.pickupAddress.fullAddress}</p>
                  {order.pickupAddress.phone && (
                    <p className="text-gray-500 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {order.pickupAddress.phone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Address */}
            {order.deliveryAddress && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-teal-500" />
                  Delivery Address
                </h3>
                <div className="space-y-2">
                  <p className="font-medium text-gray-800">{order.deliveryAddress.label || 'Address'}</p>
                  <p className="text-gray-600">{order.deliveryAddress.address || order.deliveryAddress.fullAddress}</p>
                  {order.deliveryAddress.phone && (
                    <p className="text-gray-500 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {order.deliveryAddress.phone}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Schedule Info */}
          {(order.pickupDate || order.deliveryDate) && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-500" />
                Schedule
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {order.pickupDate && (
                  <div className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Pickup</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(order.pickupDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                    {order.pickupSlot && <p className="text-sm text-teal-600">{order.pickupSlot}</p>}
                  </div>
                )}
                {order.deliveryDate && (
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Delivery</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(order.deliveryDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                    {order.deliverySlot && <p className="text-sm text-purple-600">{order.deliverySlot}</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Need Help */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-6 shadow-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg mb-1">Need help with this order?</h3>
                <p className="text-white/80">Our support team is here to assist you</p>
              </div>
              <Link href="/customer/support">
                <Button className="bg-white text-teal-600 hover:bg-teal-50">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
