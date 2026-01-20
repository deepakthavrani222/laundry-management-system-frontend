'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Clock, User, Filter, Search, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'

interface Ticket {
  _id: string
  ticketNumber?: string
  title: string
  description?: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category?: string
  createdAt: string
  raisedBy?: {
    name: string
    email: string
  }
  customer?: {
    name: string
    email: string
  }
  tenancy?: {
    name: string
  }
}

export default function UnassignedTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  useEffect(() => {
    fetchUnassignedTickets()
  }, [])

  const fetchUnassignedTickets = async () => {
    try {
      setLoading(true)
      const response = await api.get('/support/tickets', {
        params: { assigned: 'unassigned' }
      })
      
      if (response.data.success) {
        // Handle paginated response structure
        const ticketsData = response.data.data?.data || response.data.data || []
        setTickets(Array.isArray(ticketsData) ? ticketsData : [])
      }
    } catch (error) {
      console.error('Error fetching unassigned tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const assignTicket = async (ticketId: string) => {
    try {
      const response = await api.post(`/support/tickets/${ticketId}/assign`)
      
      if (response.data.success) {
        // Remove ticket from unassigned list and refresh
        setTickets(prev => prev.filter(ticket => ticket._id !== ticketId))
        // Optionally refresh the entire list to get updated data
        fetchUnassignedTickets()
      }
    } catch (error) {
      console.error('Error assigning ticket:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ticket.customer?.name || ticket.raisedBy?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ticket.tenancy?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
    return matchesSearch && matchesPriority
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              Unassigned Tickets
            </h1>
            <p className="text-gray-600 mt-1">
              Tickets waiting to be assigned to support agents
            </p>
          </div>
          <Button onClick={fetchUnassignedTickets} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tickets, customers, or tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Unassigned</p>
              <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Urgent</p>
              <p className="text-2xl font-bold text-red-600">
                {tickets.filter(t => t.priority === 'urgent').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-orange-600">
                {tickets.filter(t => t.priority === 'high').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Waiting Time</p>
              <p className="text-2xl font-bold text-blue-600">2.5h</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading unassigned tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No unassigned tickets</h3>
            <p className="text-gray-600">
              {searchTerm || priorityFilter !== 'all' 
                ? 'No tickets match your current filters.' 
                : 'All tickets have been assigned to support agents.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTickets.map((ticket) => (
              <div key={ticket._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">{ticket.title}</h3>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                      {ticket.category && (
                        <Badge variant="outline">{ticket.category}</Badge>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {ticket.description || 'No description available'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{ticket.customer?.name || ticket.raisedBy?.name || 'Unknown Customer'}</span>
                      </div>
                      {ticket.tenancy?.name && (
                        <>
                          <div className="flex items-center gap-1">
                            <span>•</span>
                            <span>{ticket.tenancy.name}</span>
                          </div>
                        </>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Button
                      onClick={() => assignTicket(ticket._id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Assign to Me
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}