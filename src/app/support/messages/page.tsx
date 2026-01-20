'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  MessageSquare, 
  Send, 
  Search, 
  Filter, 
  User, 
  Clock, 
  CheckCircle,
  Phone,
  Mail,
  MoreVertical,
  Paperclip,
  Smile,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/lib/api'

interface Message {
  _id: string
  sender: {
    _id: string
    name: string
    email: string
    role: string
  }
  message: string
  timestamp: string
  isInternal: boolean
}

interface Conversation {
  _id: string
  ticketNumber: string
  title: string
  customer: {
    _id: string
    name: string
    email: string
    phone?: string
    avatar?: string
  }
  status: string
  priority: string
  messages: Message[]
  lastMessage: {
    content: string
    timestamp: string
    sender: string
  }
  unreadCount: number
  assignedTo?: {
    name: string
    email: string
  }
}

export default function SupportMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [isInternal, setIsInternal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isMobileView, setIsMobileView] = useState(false)

  useEffect(() => {
    fetchConversations()
    const handleResize = () => setIsMobileView(window.innerWidth < 1024)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await api.get('/support/tickets')
      
      if (response.data.success) {
        const tickets = response.data.data?.data || response.data.data || []
        
        // Transform tickets into conversations
        const conversationData = await Promise.all(
          tickets.map(async (ticket: any) => {
            // Get full ticket details with messages
            const detailResponse = await api.get(`/support/tickets/${ticket._id}`)
            const fullTicket = detailResponse.data.data.ticket
            
            const lastMessage = fullTicket.messages?.length > 0 
              ? fullTicket.messages[fullTicket.messages.length - 1]
              : null

            return {
              _id: ticket._id,
              ticketNumber: ticket.ticketNumber || `TKT-${ticket._id.slice(-6)}`,
              title: ticket.title,
              customer: {
                _id: ticket.raisedBy?._id || '',
                name: ticket.raisedBy?.name || 'Unknown Customer',
                email: ticket.raisedBy?.email || '',
                phone: ticket.raisedBy?.phone || '',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(ticket.raisedBy?.name || 'U')}&background=3b82f6&color=fff`
              },
              status: ticket.status,
              priority: ticket.priority,
              messages: fullTicket.messages || [],
              lastMessage: lastMessage ? {
                content: lastMessage.message,
                timestamp: lastMessage.timestamp,
                sender: lastMessage.sender?.name || 'Unknown'
              } : {
                content: 'No messages yet',
                timestamp: ticket.createdAt,
                sender: 'System'
              },
              unreadCount: ticket.assignedTo ? 0 : 1,
              assignedTo: ticket.assignedTo
            }
          })
        )
        
        setConversations(conversationData.sort((a, b) => 
          new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
        ))
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return

    try {
      setSending(true)
      await api.post(`/support/tickets/${selectedConversation._id}/messages`, {
        message: newMessage,
        isInternal
      })
      
      // Refresh the selected conversation
      const response = await api.get(`/support/tickets/${selectedConversation._id}`)
      if (response.data.success) {
        const updatedTicket = response.data.data.ticket
        setSelectedConversation(prev => prev ? {
          ...prev,
          messages: updatedTicket.messages || [],
          status: updatedTicket.status
        } : null)
        
        // Update conversations list
        setConversations(prev => prev.map(conv => 
          conv._id === selectedConversation._id 
            ? {
                ...conv,
                messages: updatedTicket.messages || [],
                lastMessage: {
                  content: newMessage,
                  timestamp: new Date().toISOString(),
                  sender: 'You'
                },
                unreadCount: 0
              }
            : conv
        ))
      }
      
      setNewMessage('')
      setIsInternal(false)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const assignToSelf = async (conversationId: string) => {
    try {
      await api.post(`/support/tickets/${conversationId}/assign`)
      
      // Update conversations
      setConversations(prev => prev.map(conv => 
        conv._id === conversationId 
          ? { ...conv, unreadCount: 0, assignedTo: { name: 'You', email: '' } }
          : conv
      ))
      
      if (selectedConversation?._id === conversationId) {
        setSelectedConversation(prev => prev ? {
          ...prev,
          assignedTo: { name: 'You', email: '' }
        } : null)
      }
    } catch (error) {
      console.error('Error assigning ticket:', error)
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (isMobileView && selectedConversation) {
    // Mobile view - show only chat when conversation is selected
    return (
      <div className="h-screen flex flex-col bg-white">
        {/* Mobile Chat Header */}
        <div className="flex items-center p-4 border-b bg-white">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedConversation(null)}
            className="mr-3"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <img
            src={selectedConversation.customer.avatar}
            alt={selectedConversation.customer.name}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{selectedConversation.customer.name}</h3>
            <p className="text-sm text-gray-500">{selectedConversation.ticketNumber}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(selectedConversation.status)} size="sm">
              {selectedConversation.status}
            </Badge>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedConversation.messages.map((message, index) => (
            <div
              key={message._id || index}
              className={`flex ${message.sender.role === 'support' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender.role === 'support'
                  ? message.isInternal 
                    ? 'bg-purple-500 text-white'
                    : 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {message.isInternal && (
                  <div className="text-xs opacity-75 mb-1">Internal Note</div>
                )}
                <p className="text-sm">{message.message}</p>
                <p className="text-xs opacity-75 mt-1">
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="resize-none pr-12"
                rows={1}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center mt-2">
            <label className="flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="mr-2"
              />
              Internal note
            </label>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Conversations Sidebar */}
      <div className={`${isMobileView ? 'w-full' : 'w-80'} bg-white border-r flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold text-gray-900 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
            Messages
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {conversations.filter(c => c.unreadCount > 0).length} unread conversations
          </p>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <MessageSquare className="w-8 h-8 animate-pulse text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center">
              <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">No conversations found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation._id}
                  onClick={() => {
                    setSelectedConversation(conversation)
                    if (conversation.unreadCount > 0) {
                      assignToSelf(conversation._id)
                    }
                  }}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?._id === conversation._id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <img
                        src={conversation.customer.avatar}
                        alt={conversation.customer.name}
                        className="w-12 h-12 rounded-full"
                      />
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-medium text-sm truncate ${
                          conversation.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {conversation.customer.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessage.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{conversation.ticketNumber}</p>
                      <p className="text-sm text-gray-600 truncate mb-2">
                        {conversation.lastMessage.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-1">
                          <Badge className={getStatusColor(conversation.status)} size="sm">
                            {conversation.status}
                          </Badge>
                          <Badge className={getPriorityColor(conversation.priority)} size="sm">
                            {conversation.priority}
                          </Badge>
                        </div>
                        {!conversation.assignedTo && (
                          <span className="text-xs text-orange-600 font-medium">Unassigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {!isMobileView && (
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedConversation.customer.avatar}
                    alt={selectedConversation.customer.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedConversation.customer.name}</h3>
                    <p className="text-sm text-gray-500">{selectedConversation.ticketNumber} • {selectedConversation.title}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(selectedConversation.status)}>
                    {selectedConversation.status}
                  </Badge>
                  <Badge className={getPriorityColor(selectedConversation.priority)}>
                    {selectedConversation.priority}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages.map((message, index) => (
                  <div
                    key={message._id || index}
                    className={`flex ${message.sender.role === 'support' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender.role === 'support'
                        ? message.isInternal 
                          ? 'bg-purple-500 text-white'
                          : 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {message.isInternal && (
                        <div className="text-xs opacity-75 mb-1">Internal Note</div>
                      )}
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {message.sender.name} • {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="resize-none"
                      rows={3}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <label className="flex items-center text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                          className="mr-2"
                        />
                        Internal note (not visible to customer)
                      </label>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Paperclip className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Smile className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="mb-8"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {sending ? 'Sending...' : 'Send'}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">
                  Choose a conversation from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}