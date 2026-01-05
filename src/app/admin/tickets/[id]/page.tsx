'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAdminTicketDetail } from '@/hooks/useAdminTickets'
import { useAuthStore } from '@/store/authStore'
import { 
  ArrowLeft,
  Ticket,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Send,
  Package,
  RefreshCw,
  Clock,
  MessageCircle,
  Headphones
} from 'lucide-react'
import Link from 'next/link'

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string
  const { user } = useAuthStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { ticket, loading, error, addMessage, resolve, refetch } = useAdminTicketDetail(ticketId)
  
  const [newMessage, setNewMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [resolution, setResolution] = useState('')
  const [showResolveForm, setShowResolveForm] = useState(false)
  const [sending, setSending] = useState(false)
  const [taking, setTaking] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ticket?.messages])

  const handleTakeTicket = async () => {
    setTaking(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/support/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'in_progress' })
      })
      if (!response.ok) throw new Error('Failed to take ticket')
      await refetch()
      alert('Ticket assigned to you!')
    } catch (err: any) {
      alert(`Failed: ${err.message}`)
    } finally {
      setTaking(false)
    }
  }

  const handleCloseTicket = async () => {
    if (!confirm('Are you sure you want to close this ticket?')) return
    setClosing(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/support/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'closed' })
      })
      if (!response.ok) throw new Error('Failed to close ticket')
      await refetch()
      alert('Ticket closed!')
    } catch (err: any) {
      alert(`Failed: ${err.message}`)
    } finally {
      setClosing(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return
    
    setSending(true)
    try {
      await addMessage(newMessage, isInternal)
      setNewMessage('')
    } catch (err: any) {
      alert(`Failed: ${err.message}`)
    } finally {
      setSending(false)
    }
  }

  const handleResolve = async () => {
    if (!resolution.trim()) {
      alert('Please enter resolution')
      return
    }
    
    try {
      await resolve(resolution)
      setShowResolveForm(false)
      setResolution('')
      alert('Ticket resolved!')
    } catch (err: any) {
      alert(`Failed: ${err.message}`)
    }
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-600 bg-red-50 border-red-200'
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'resolved': return 'text-green-600 bg-green-50 border-green-200'
      case 'escalated': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'closed': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />
      case 'in_progress': return <Clock className="w-4 h-4" />
      case 'resolved': return <CheckCircle className="w-4 h-4" />
      case 'escalated': return <AlertTriangle className="w-4 h-4" />
      default: return <Ticket className="w-4 h-4" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center mt-16">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading ticket...</p>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="space-y-6 mt-16">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h3 className="font-semibold text-red-800">Error Loading Ticket</h3>
              <p className="text-red-600">{error || 'Ticket not found'}</p>
            </div>
          </div>
          <Button onClick={() => router.back()} className="mt-4" variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/tickets">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">{ticket.ticketNumber}</h1>
              <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                {getStatusIcon(ticket.status)}
                {ticket.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(ticket.priority)}`}>
                {ticket.priority?.charAt(0).toUpperCase() + ticket.priority?.slice(1)}
              </span>
            </div>
            <p className="text-gray-600">{ticket.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          {ticket.status === 'open' && (
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleTakeTicket}
              disabled={taking}
            >
              {taking ? 'Taking...' : 'Take & Start Working'}
            </Button>
          )}
          {ticket.status === 'in_progress' && (
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => setShowResolveForm(true)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Resolve
            </Button>
          )}
          {ticket.status === 'resolved' && (
            <Button 
              variant="outline"
              onClick={handleCloseTicket}
              disabled={closing}
            >
              {closing ? 'Closing...' : 'Close Ticket'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col" style={{ height: '600px' }}>
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{ticket.raisedBy?.name || 'Customer'}</p>
                <p className="text-xs text-gray-500">{ticket.raisedBy?.email}</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {/* Initial Description */}
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-3 h-3 text-gray-500" />
                  <span className="text-xs font-medium text-gray-500">Customer</span>
                </div>
                <p className="text-sm text-gray-800">{ticket.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(ticket.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Messages */}
            {ticket.messages?.map((msg, index) => {
              const isAdmin = msg.sender?.role !== 'customer'
              return (
                <div key={msg._id || index} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.isInternal 
                      ? 'bg-yellow-50 border-2 border-yellow-300 border-dashed'
                      : isAdmin
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'bg-white border border-gray-200 shadow-sm'
                  }`}>
                    {!isAdmin && (
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-3 h-3 text-gray-500" />
                        <span className="text-xs font-medium text-gray-500">Customer</span>
                      </div>
                    )}
                    {isAdmin && !msg.isInternal && (
                      <div className="flex items-center gap-2 mb-1">
                        <Headphones className="w-3 h-3 text-blue-200" />
                        <span className="text-xs font-medium text-blue-200">Support</span>
                      </div>
                    )}
                    {msg.isInternal && (
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-3 h-3 text-yellow-600" />
                        <span className="text-xs font-medium text-yellow-700">Internal Note</span>
                      </div>
                    )}
                    <p className={`text-sm ${msg.isInternal ? 'text-yellow-800' : ''}`}>{msg.message}</p>
                    <p className={`text-xs mt-1 ${
                      msg.isInternal ? 'text-yellow-600' : isAdmin ? 'text-blue-200' : 'text-gray-400'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })}

            {/* Resolution */}
            {ticket.resolution && (
              <div className="flex justify-center">
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 max-w-[90%]">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Resolved</span>
                  </div>
                  <p className="text-sm text-green-700">{ticket.resolution}</p>
                  {ticket.resolvedBy && (
                    <p className="text-xs text-green-600 mt-2">
                      by {ticket.resolvedBy.name} • {new Date(ticket.resolvedAt!).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          {ticket.status !== 'closed' && (
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder={isInternal ? "Type internal note..." : "Type your reply..."}
                    disabled={sending}
                    className={`flex-1 px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                      isInternal 
                        ? 'border-yellow-300 bg-yellow-50 focus:ring-yellow-500' 
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4"
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className={isInternal ? 'text-yellow-700 font-medium' : ''}>
                    Internal note (customer won't see this)
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Closed Status */}
          {ticket.status === 'closed' && (
            <div className="p-4 bg-gray-100 border-t border-gray-200">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">This ticket is closed</span>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Customer
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {ticket.raisedBy?.name?.charAt(0)?.toUpperCase() || 'C'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{ticket.raisedBy?.name}</p>
                  <p className="text-xs text-gray-500">Customer</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <Mail className="w-4 h-4 text-gray-400" />
                {ticket.raisedBy?.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                {ticket.raisedBy?.phone || 'N/A'}
              </div>
            </div>
          </div>

          {/* Related Order */}
          {ticket.relatedOrder && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Related Order
              </h3>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="font-medium text-blue-800">{ticket.relatedOrder.orderNumber}</p>
                <p className="text-sm text-blue-600 capitalize mt-1">
                  Status: {ticket.relatedOrder.status?.replace('_', ' ')}
                </p>
                <Link href={`/admin/orders?search=${ticket.relatedOrder.orderNumber}`}>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    View Order
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Ticket Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Ticket className="w-4 h-4 mr-2" />
              Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Category</span>
                <span className="font-medium text-gray-800 capitalize">
                  {ticket.category?.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Created</span>
                <span className="font-medium text-gray-800">
                  {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
              {ticket.assignedTo && (
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Assigned To</span>
                  <span className="font-medium text-gray-800">{ticket.assignedTo.name}</span>
                </div>
              )}
              {ticket.sla?.isOverdue && (
                <div className="flex items-center gap-2 py-2 px-3 bg-red-50 rounded-lg mt-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-700">SLA Overdue</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resolve Modal */}
      {showResolveForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Resolve Ticket</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution *
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Describe how the issue was resolved..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  onClick={handleResolve}
                  disabled={!resolution.trim()}
                >
                  Resolve
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowResolveForm(false)
                    setResolution('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
