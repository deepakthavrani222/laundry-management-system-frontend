'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Send, AlertCircle, CheckCircle, Sparkles, Home, ShoppingBag, HelpCircle, MapPin, User, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface TenantInfo {
  name: string
  slug: string
  tenancyId: string
  branding?: { logo?: { url?: string } }
}

interface Category { id: string; name: string }
interface Order { _id: string; orderNumber: string; status: string; totalAmount: number; createdAt: string }

const sidebarNavigation = [
  { name: 'Dashboard', href: 'dashboard', icon: Home, current: false },
  { name: 'My Orders', href: 'orders', icon: ShoppingBag, current: false },
  { name: 'Support', href: 'support', icon: HelpCircle, current: true },
  { name: 'Addresses', href: 'addresses', icon: MapPin, current: false },
  { name: 'Profile', href: 'profile', icon: User, current: false },
]

export default function TenantNewTicketPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tenant = params.tenant as string
  const categoryParam = searchParams.get('category')
  
  const { user, token, isAuthenticated, logout } = useAuthStore()
  
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: categoryParam || '',
    relatedOrderId: '',
  })

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
      } catch (error) {
        console.error('Failed to fetch tenant info:', error)
      }
    }
    fetchTenantInfo()
  }, [tenant])

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !tenantInfo?.tenancyId) return
      setLoadingData(true)
      try {
        const [catRes, ordersRes] = await Promise.all([
          fetch(`${API_URL}/customer/tickets/categories`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_URL}/customer/orders?tenancyId=${tenantInfo.tenancyId}&limit=20`, { headers: { 'Authorization': `Bearer ${token}` } })
        ])
        const catData = await catRes.json()
        const ordersData = await ordersRes.json()
        if (catData.success) setCategories(catData.data.categories || [])
        if (ordersData.success) setOrders(ordersData.data.data || [])
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoadingData(false)
      }
    }
    if (tenantInfo?.tenancyId) fetchData()
  }, [token, tenantInfo?.tenancyId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.title || !formData.description || !formData.category) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_URL}/customer/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, tenancyId: tenantInfo?.tenancyId })
      })
      const data = await response.json()
      if (data.success) {
        setSuccess(true)
        setTimeout(() => router.push(`/${tenant}/support/${data.data.ticket._id}`), 1500)
      } else {
        setError(data.message || 'Failed to create ticket')
      }
    } catch (err: any) {
      setError('Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => { logout(); router.push(`/auth/login?redirect=${encodeURIComponent(`/${tenant}/support/new`)}`) }

  if (!isAuthenticated) return null

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Ticket Created!</h2>
          <p className="text-gray-600">Redirecting to your ticket...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

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
                  <h1 className="font-bold text-gray-800">{tenantInfo?.name || 'Support'}</h1>
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
              return (
                <Link key={item.name} href={href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${item.current ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => setSidebarOpen(false)}>
                  <item.icon className={`w-5 h-5 ${item.current ? 'text-white' : 'text-gray-400'}`} />
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
          <div className="flex items-center gap-4 px-4 lg:px-8 py-4">
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <Link href={`/${tenant}/support`} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Create Support Ticket</h1>
              <p className="text-sm text-gray-500">Tell us about your issue</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {loadingData ? (
                  <div className="col-span-full text-center py-4 text-gray-500">Loading...</div>
                ) : (
                  categories.map((cat) => (
                    <button key={cat.id} type="button" onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${formData.category === cat.id ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                      {cat.name}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Related Order (Optional)</label>
              <select value={formData.relatedOrderId} onChange={(e) => setFormData({ ...formData, relatedOrderId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm">
                <option value="">Select an order (optional)</option>
                {orders.map((order) => (
                  <option key={order._id} value={order._id}>
                    {order.orderNumber} - ₹{order.totalAmount} ({new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject <span className="text-red-500">*</span></label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief description of your issue" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" maxLength={100} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Please provide details about your issue..." rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none" />
            </div>

            <div className="flex gap-3 pt-4">
              <Link href={`/${tenant}/support`} className="flex-1">
                <Button type="button" variant="outline" className="w-full">Cancel</Button>
              </Link>
              <Button type="submit" disabled={loading || !formData.title || !formData.description || !formData.category}
                className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
                {loading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Creating...</>) : (<><Send className="w-4 h-4 mr-2" />Submit Ticket</>)}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
