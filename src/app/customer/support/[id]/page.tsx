'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import {
  ArrowLeft,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Star,
  MessageCircle,
  User,
  Headphones,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Message {
  _id: string
  sender: {
    _id: string
    name: string
    role: string
  }
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
  updatedAt: string
  messages: Message[]
  relatedOrder?: {
    _id: string
    orderNumber: string
    status: string
    totalAmount: number
  }
  assignedTo?: {
    name: string
  }
  resolution?: string
  feedback?: {
    rating: number
    comment: string
  }
}

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const ticketId = params.id as string
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  useEffect(() => {
    fetchTicket()
  }, [ticketId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ticket?.messages])

  const fetchTicket = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/customer/tickets/${ticketId}`)
      if (response.data.success) {
        setTicket(response.data.data.ticket)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load ticket')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return
    setSending(true)
    try {
      const response = await api.post(`/customer/tickets/${ticketId}/messages`, {
        message: newMessage
      })
      if (response.data.success) {
        setNewMessage('')
        fetchTicket()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleSubmitFeedback = async () => {
    if (feedbackRating === 0) {
      toast.error('Please select a rating')
      return
    }
    setSubmittingFeedback(true)
    try {
      const response = await api.post(`/customer/tickets/${ticketId}/feedback`, {
        rating: feedbackRating,
        comment: feedbackComment
      })
      if (response.data.success) {
        setShowFeedback(false)
        fetchTicket()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback')
    } finally {
      setSubmittingFeedback(false)
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
      case 'open': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'resolved': return 'text-green-600 bg-green-50 border-green-200'
      case 'closed': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4" />
      case 'in_progress': return <MessageCircle className="w-4 h-4" />
      case 'resolved': return <CheckCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading ticket...</p>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-red-600">{error || 'Ticket not found'}</p>
            </div>
          </div>
          <Link href="/customer/support">
            <Button className="mt-4 bg-red-600 hover:bg-red-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Support
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/customer/support">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-800">{ticket.ticketNumber}</h1>
              <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                {getStatusIcon(ticket.status)}
                {ticket.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">{ticket.title}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col" style={{ height: '500px' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {ticket.messages?.map((msg, index) => {
              const isCustomer = msg.sender?.role === 'customer' || msg.sender?._id === user?._id
              return (
                <div key={msg._id || index} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    isCustomer
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                  }`}>
                    {!isCustomer && (
                      <div className="flex items-center gap-2 mb-1">
                        <Headphones className="w-3 h-3 text-teal-600" />
                        <span className="text-xs font-medium text-teal-600">Support</span>
                      </div>
                    )}
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-xs mt-1 ${isCustomer ? 'text-teal-100' : 'text-gray-400'}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          {ticket.status !== 'resolved' && ticket.status !== 'closed' ? (
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  disabled={sending}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-4"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-green-50 border-t border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">This ticket has been resolved</span>
                </div>
                {!ticket.feedback && (
                  <Button
                    onClick={() => setShowFeedback(true)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Rate Support
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Ticket Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Ticket Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Category</span>
                <span className="text-gray-800 capitalize">{ticket.category?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-800">{new Date(ticket.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
              {ticket.assignedTo && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Agent</span>
                  <span className="text-gray-800">{ticket.assignedTo.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Related Order */}
          {ticket.relatedOrder && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Related Order</h3>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-teal-600" />
                  <span className="font-medium text-gray-800">{ticket.relatedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className="text-gray-800 capitalize">{ticket.relatedOrder.status?.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Amount</span>
                  <span className="text-gray-800">₹{ticket.relatedOrder.totalAmount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Resolution */}
          {ticket.resolution && (
            <div className="bg-green-50 rounded-2xl border border-green-200 p-4">
              <h3 className="font-semibold text-green-800 mb-2">Resolution</h3>
              <p className="text-sm text-green-700">{ticket.resolution}</p>
            </div>
          )}

          {/* Feedback */}
          {ticket.feedback && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
              <h3 className="font-semibold text-amber-800 mb-2">Your Feedback</h3>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= ticket.feedback!.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              {ticket.feedback.comment && (
                <p className="text-sm text-amber-700">{ticket.feedback.comment}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Rate Your Experience</h3>
            <p className="text-gray-500 text-sm mb-4">How was your support experience?</p>
            
            {/* Star Rating */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFeedbackRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${star <= feedbackRating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>

            {/* Comment */}
            <textarea
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="Any additional comments? (optional)"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none mb-4"
            />

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleSubmitFeedback}
                disabled={feedbackRating === 0 || submittingFeedback}
                className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFeedback(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
