'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import {
  ArrowLeft, Send, Clock, CheckCircle, AlertCircle, Package, Star, MessageCircle,
  Headphones, Sparkles, Home, ShoppingBag, HelpCircle, MapPin, User, LogOut, Menu, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface TenantInfo {
  name: string
  slug: string
  tenancyId: string
  branding?: { logo?: { url?: string } }
}

interface Message {
  _id: string
  sender: { _id: string; name: string; role: string }
  message: string
  timestamp: string
}

interface Ticket {
  _id: string
  ticketNumber: string
  title: string
  description: string
  category: string
  status: string
  priority: string
  createdAt: string
  messages: Message[]
  relatedOrder?: { _id: string; orderNumber: string; status: string; totalAmount: number }
  assignedTo?: { name: string }
  resolution?: string
  feedback?: { rating: number; comment: string }
}

const sidebarNavigation = [
  { name: 'Dashboard', href: 'dashboard', icon: Home, current: false },
  { name: 'My Orders', href: 'orders', icon: ShoppingBag, current: false },
  { name: 'Support', href: 'support', icon: HelpCircle, current: true },
  { name: 'Addresses', href: 'addresses', icon: MapPin, current: false },
  { name: 'Profile', href: 'profile', icon: User, current: false },
]

export default function TenantTicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tenant = params.tenant as string
  const ticketId = params.id as string
  const { user, token, isAuthenticated, logout } = useAuthStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null)
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

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
    const fetchTicket = async () => {
      if (!token) return
      try {
        setLoading(true)
        const response = await fetch(`${API_URL}/customer/tickets/${ticketId}`, { headers: { 'Authorization': `Bearer ${token}` } })
        const data = await response.json()
        if (data.success) setTicket(data.data.ticket)
        else setError(data.message || 'Failed to load ticket')
      } catch (err) { setError('Failed to load ticket') }
      finally { setLoading(false) }
    }
    fetchTicket()
  }, [token, ticketId])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [ticket?.messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !token) return
    setSending(true)
    try {
      const response = await fetch(`${API_URL}/customer/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: newMessage })
      })
      const data = await response.json()
      if (data.success) {
        setNewMessage('')
        // Refetch ticket
        const ticketRes = await fetch(`${API_URL}/customer/tickets/${ticketId}`, { headers: { 'Authorization': `Bearer ${token}` } })
        const ticketData = await ticketRes.json()
        if (ticketData.success) setTicket(ticketData.data.ticket)
      }
    } catch (err) { toast.error('Failed to send message') }
    finally { setSending(false) }
  }

  const handleSubmitFeedback = async () => {
    if (feedbackRating === 0 || !token) return
    setSubmittingFeedback(true)
    try {
      const response = await fetch(`${API_URL}/customer/tickets/${ticketId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ rating: feedbackRating, comment: feedbackComment })
      })
      const data = await response.json()
      if (data.success) {
        setShowFeedback(false)
        const ticketRes = await fetch(`${API_URL}/customer/tickets/${ticketId}`, { headers: { 'Authorization': `Bearer ${token}` } })
        const ticketData = await ticketRes.json()
        if (ticketData.success) setTicket(ticketData.data.ticket)
      }
    } catch (err) { toast.error('Failed to submit feedback') }
    finally { setSubmittingFeedback(false) }
  }

  const handleLogout = () => { logout(); router.push(`/auth/login?redirect=${encodeURIComponent(`/${tenant}/support/${ticketId}`)}`) }

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'resolved': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (!isAuthenticated) return null


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error || 'Ticket not found'}</p>
          <Link href={`/${tenant}/support`}>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />Back to Support
            </Button>
          </Link>
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
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-lg lg:text-xl font-bold text-gray-800">{ticket.ticketNumber}</h1>
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                  {ticket.status === 'open' ? <Clock className="w-3 h-3" /> : ticket.status === 'resolved' ? <CheckCircle className="w-3 h-3" /> : <MessageCircle className="w-3 h-3" />}
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate">{ticket.title}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col" style={{ height: '500px' }}>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {ticket.messages?.map((msg, i) => {
                  const isCustomer = msg.sender?.role === 'customer' || msg.sender?._id === user?._id
                  return (
                    <div key={msg._id || i} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isCustomer ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-white border border-gray-200 text-gray-800 shadow-sm'}`}>
                        {!isCustomer && (
                          <div className="flex items-center gap-2 mb-1">
                            <Headphones className="w-3 h-3 text-teal-600" />
                            <span className="text-xs font-medium text-teal-600">Support</span>
                          </div>
                        )}
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${isCustomer ? 'text-teal-100' : 'text-gray-400'}`}>{formatTime(msg.timestamp)}</p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {ticket.status !== 'resolved' && ticket.status !== 'closed' ? (
                <div className="p-4 bg-white border-t border-gray-100">
                  <div className="flex gap-2">
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..." disabled={sending}
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim() || sending}
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-4">
                      {sending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-green-50 border-t border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Ticket resolved</span>
                    </div>
                    {!ticket.feedback && (
                      <Button onClick={() => setShowFeedback(true)} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        <Star className="w-4 h-4 mr-1" />Rate
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Info */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="text-gray-800 capitalize">{ticket.category?.replace('_', ' ')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Created</span><span className="text-gray-800">{new Date(ticket.createdAt).toLocaleDateString('en-IN')}</span></div>
                  {ticket.assignedTo && <div className="flex justify-between"><span className="text-gray-500">Agent</span><span className="text-gray-800">{ticket.assignedTo.name}</span></div>}
                </div>
              </div>

              {ticket.relatedOrder && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Related Order</h3>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2"><Package className="w-4 h-4 text-teal-600" /><span className="font-medium text-gray-800">{ticket.relatedOrder.orderNumber}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Amount</span><span className="text-gray-800">₹{ticket.relatedOrder.totalAmount}</span></div>
                  </div>
                </div>
              )}

              {ticket.feedback && (
                <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
                  <h3 className="font-semibold text-amber-800 mb-2">Your Feedback</h3>
                  <div className="flex items-center gap-1 mb-2">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`w-5 h-5 ${s <= ticket.feedback!.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />)}
                  </div>
                  {ticket.feedback.comment && <p className="text-sm text-amber-700">{ticket.feedback.comment}</p>}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Rate Your Experience</h3>
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setFeedbackRating(s)} className="p-1 transition-transform hover:scale-110">
                  <Star className={`w-10 h-10 ${s <= feedbackRating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <textarea value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="Any comments? (optional)" rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none mb-4" />
            <div className="flex gap-3">
              <Button onClick={handleSubmitFeedback} disabled={feedbackRating === 0 || submittingFeedback}
                className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                {submittingFeedback ? 'Submitting...' : 'Submit'}
              </Button>
              <Button variant="outline" onClick={() => setShowFeedback(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
