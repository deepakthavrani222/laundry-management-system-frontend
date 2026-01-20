'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Send,
  Paperclip,
  Flag,
  UserCheck,
  Settings
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api } from '@/lib/api'
import Link from 'next/link'

interface TicketDetail {
  _id: string
  ticketNumber: string
  title: string
  description: string
  status: string
  priority: string
  category: string
  raisedBy: {
    name: string
    email: string
    phone?: string
  }
  assignedTo?: {
    name: string
    email: string
  }
  relatedOrder?: {
    orderNumber: string
    status: string
  }
  messages: Array<{
    _id: string
    sender: {
      name: string
      role: string
      email: string
    }
    message: string
    timestamp: string
    isInternal: boolean
  }>
  createdAt: string
  updatedAt: string
  resolution?: string
  sla: {
    responseTime: number
    resolutionTime: number
    firstResponseAt?: string
    isOverdue: boolean
  }
}

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.ticketId as string
  
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [sending, setSending] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (ticketId) {
      fetchTicketDetail()
    }
  }, [ticketId])

  const fetchTicketDetail = async () => {
    try {
      setError(null)
      const apiUrl = `/support/tickets/${ticketId}`
      console.log('🔍 Fetching ticket detail for ID:', ticketId)
      console.log('🌐 API URL:', apiUrl)
      console.log('🔗 Full URL will be:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}${apiUrl}`)
      
      const response = await api.get(apiUrl)
      console.log('📊 Ticket detail API response:', response.data)
      
      if (response.data.success) {
        const ticketData = response.data.data.ticket
        console.log('🎫 Ticket loaded successfully with', ticketData.messages?.length || 0, 'messages')
        setTicket(ticketData)
      } else {
        setError('Ticket not found')
      }
    } catch (error: any) {
      console.error('❌ Error fetching ticket:', error)
      console.error('Response:', error.response?.data)
      console.error('Status:', error.response?.status)
      console.error('Full error:', error)
      setError(error.response?.data?.message || 'Failed to load ticket')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return
    
    setSending(true)
    try {
      const response = await api.post(`/support/tickets/${ticketId}/messages`, {
        message: newMessage,
        isInternal
      })
      
      if (response.data.success) {
        setNewMessage('')
        fetchTicketDetail() // Refresh to show new message
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true)
    try {
      const response = await api.put(`/support/tickets/${ticketId}/status`, {
        status: newStatus,
        resolution: newStatus === 'resolved' ? 'Issue resolved by support team' : undefined
      })
      
      if (response.data.success) {
        fetchTicketDetail() // Refresh to show updated status
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleAssignToSelf = async () => {
    setUpdating(true)
    try {
      const response = await api.post(`/support/tickets/${ticketId}/assign`)
      
      if (response.data.success) {
        fetchTicketDetail() // Refresh to show assignment
      }
    } catch (error) {
      console.error('Error assigning ticket:', error)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Ticket Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Ticket</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => router.back()}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{ticket.ticketNumber}</h1>
            <p className="text-gray-600">{ticket.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={`${getStatusColor(ticket.status)}`}>
            {ticket.status.replace('_', ' ')}
          </Badge>
          <Badge className={`${getPriorityColor(ticket.priority)}`}>
            {ticket.priority}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{ticket.description}</p>
              </div>
              
              {ticket.relatedOrder && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Related Order</h4>
                  <p className="text-gray-600">
                    Order #{ticket.relatedOrder.orderNumber} - {ticket.relatedOrder.status}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Messages ({(ticket.messages || []).length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {ticket.messages && ticket.messages.length > 0 ? (
                  ticket.messages.map((message, index) => (
                    <div key={message._id || `msg-${index}`} className={`p-4 rounded-lg ${
                      message.isInternal ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{message.sender?.name || 'Unknown User'}</span>
                          <Badge variant="outline" className="text-xs">
                            {message.sender?.role || 'user'}
                          </Badge>
                          {message.isInternal && (
                            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                              Internal
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-700">{message.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No messages yet</p>
                    <p className="text-sm">Be the first to respond to this ticket</p>
                  </div>
                )}
              </div>

              {/* New Message */}
              <div className="border-t pt-4">
                <div className="space-y-4">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="internal"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="internal" className="text-sm text-gray-600">
                        Internal message (not visible to customer)
                      </label>
                    </div>
                    <Button onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
                      <Send className="w-4 h-4 mr-2" />
                      {sending ? 'Sending...' : 'Send Message'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Customer</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="font-medium">{ticket.raisedBy.name}</p>
                <p className="text-sm text-gray-600">{ticket.raisedBy.email}</p>
                {ticket.raisedBy.phone && (
                  <p className="text-sm text-gray-600">{ticket.raisedBy.phone}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5" />
                <span>Assignment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.assignedTo ? (
                <div>
                  <p className="font-medium">{ticket.assignedTo.name}</p>
                  <p className="text-sm text-gray-600">{ticket.assignedTo.email}</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">Unassigned</p>
                  <Button 
                    onClick={handleAssignToSelf} 
                    disabled={updating}
                    className="w-full"
                  >
                    {updating ? 'Assigning...' : 'Assign to Me'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Update Status
                </label>
                <Select 
                  value={ticket.status} 
                  onValueChange={handleStatusUpdate}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Created:</strong> {formatTime(ticket.createdAt)}</p>
                  <p><strong>Updated:</strong> {formatTime(ticket.updatedAt)}</p>
                  <p><strong>Category:</strong> {ticket.category}</p>
                  {ticket.sla.isOverdue && (
                    <p className="text-red-600 font-medium">⚠️ Overdue</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}