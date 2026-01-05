'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  Headphones, Plus, Clock, CheckCircle, AlertCircle, ChevronRight, RefreshCw,
  MessageCircle, Ticket, Phone, Mail, HelpCircle, ChevronDown, Package, Truck,
  CreditCard, ShieldCheck, Sparkles, User, Home, LogOut, Menu, X, MapPin,
  ArrowLeft, ShoppingBag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface TenantInfo {
  name: string
  slug: string
  tenancyId: string
  branding?: { logo?: { url?: string } }
  contact?: { phone?: string; email?: string; whatsapp?: string }
}

interface TicketItem {
  _id: string
  ticketNumber: string
  title: string
  category: string
  status: string
  priority: string
  createdAt: string
  relatedOrder?: { orderNumber: string; status: string }
}

const sidebarNavigation = [
  { name: 'Dashboard', href: 'dashboard', icon: Home, current: false },
  { name: 'My Orders', href: 'orders', icon: ShoppingBag, current: false },
  { name: 'Support', href: 'support', icon: HelpCircle, current: true },
  { name: 'Addresses', href: 'addresses', icon: MapPin, current: false },
  { name: 'Profile', href: 'profile', icon: User, current: false },
]

const faqs = [
  { question: 'How long does laundry service take?', answer: 'Standard service takes 24-48 hours. Express service is available for same-day delivery.' },
  { question: 'What if my clothes are damaged?', answer: 'Please raise a ticket immediately and we will compensate appropriately.' },
  { question: 'How can I track my order?', answer: 'You can track your order from the Orders section in your dashboard.' },
  { question: 'Can I cancel my order?', answer: 'Yes, you can cancel before pickup. Once picked up, cancellation may not be possible.' },
]

export default function TenantSupportPage() {
  const params = useParams()
  const router = useRouter()
  const tenant = params.tenant as string
  const { user, token, isAuthenticated, logout } = useAuthStore()

  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null)
  const [tickets, setTickets] = useState<TicketItem[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  useEffect(() => {
    if (!isAuthenticated) router.push(`/${tenant}`)
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
            branding: data.data.branding,
            contact: data.data.contact
          })
        }
      } catch (error) {
        console.error('Failed to fetch tenant info:', error)
      }
    }
    fetchTenantInfo()
  }, [tenant])

  useEffect(() => {
    const fetchTickets = async () => {
      if (!token || !tenantInfo?.tenancyId) return
      try {
        setLoading(true)
        const params = new URLSearchParams()
        params.append('tenancyId', tenantInfo.tenancyId)
        if (statusFilter) params.append('status', statusFilter)
        
        const response = await fetch(`${API_URL}/customer/tickets?${params}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success) {
          setTickets(data.data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch tickets:', error)
      } finally {
        setLoading(false)
      }
    }
    if (tenantInfo?.tenancyId) fetchTickets()
  }, [token, tenantInfo?.tenancyId, statusFilter])

  const handleLogout = () => { logout(); router.push(`/auth/login?redirect=${encodeURIComponent(`/${tenant}/support`)}`) }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4 text-amber-500" />
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />
      default: return <Ticket className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-amber-700 bg-amber-100'
      case 'in_progress': return 'text-blue-700 bg-blue-100'
      case 'resolved': return 'text-green-700 bg-green-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length

  if (!isAuthenticated) return null


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
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Support</h1>
                <p className="text-sm text-gray-500">Get help from {tenantInfo?.name}</p>
              </div>
            </div>
            <Link href={`/${tenant}/support/new`}>
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">New Ticket</span>
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Tickets', value: tickets.length, icon: Ticket, color: 'bg-teal-100 text-teal-600' },
              { label: 'Open', value: openTickets, icon: Clock, color: 'bg-amber-100 text-amber-600' },
              { label: 'Resolved', value: resolvedTickets, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
              { label: 'Avg Response', value: '24h', icon: MessageCircle, color: 'bg-blue-100 text-blue-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Help */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Help</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { category: 'quality', icon: ShieldCheck, label: 'Quality Issue', desc: 'Report problems', color: 'from-red-50 to-rose-50 border-red-100', iconColor: 'bg-red-100 text-red-600' },
                { category: 'delay', icon: Truck, label: 'Delivery Delay', desc: 'Track delays', color: 'from-amber-50 to-yellow-50 border-amber-100', iconColor: 'bg-amber-100 text-amber-600' },
                { category: 'missing_item', icon: Package, label: 'Missing Item', desc: 'Report missing', color: 'from-blue-50 to-indigo-50 border-blue-100', iconColor: 'bg-blue-100 text-blue-600' },
                { category: 'payment', icon: CreditCard, label: 'Payment Issue', desc: 'Billing & refunds', color: 'from-green-50 to-emerald-50 border-green-100', iconColor: 'bg-green-100 text-green-600' },
              ].map((item, i) => (
                <Link key={i} href={`/${tenant}/support/new?category=${item.category}`} className="group">
                  <div className={`p-4 bg-gradient-to-br ${item.color} rounded-xl border hover:shadow-md transition-all`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${item.iconColor}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-medium text-gray-800 text-sm">{item.label}</h3>
                    <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Tickets List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="font-semibold text-gray-800">Your Tickets</h2>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                  {['', 'open', 'in_progress', 'resolved'].map((status) => (
                    <button key={status} onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${statusFilter === status ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
                      {status === '' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Loading tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-800 mb-2">No tickets yet</h3>
                <p className="text-gray-500 text-sm mb-4">Create a ticket if you need help</p>
                <Link href={`/${tenant}/support/new`}>
                  <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                    <Plus className="w-4 h-4 mr-2" />Create Ticket
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {tickets.map((ticket) => (
                  <Link key={ticket._id} href={`/${tenant}/support/${ticket._id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center">
                          {getStatusIcon(ticket.status)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">{ticket.ticketNumber}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)}`}>
                              {ticket.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-1">{ticket.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">{ticket.category.replace(/_/g, ' ')}</span>
                            <span className="text-xs text-gray-300">•</span>
                            <span className="text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                  <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors">
                    <span className="font-medium text-gray-800">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedFaq === i && <div className="px-4 pb-4"><p className="text-gray-600 text-sm">{faq.answer}</p></div>}
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Call Us</h3>
                  <p className="text-teal-600 font-medium">{tenantInfo?.contact?.phone || '+91 1800-123-4567'}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Email Us</h3>
                  <p className="text-blue-600 font-medium">{tenantInfo?.contact?.email || 'support@laundry.com'}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
