'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/Pagination'
import { 
  Ticket, 
  Search, 
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Mail,
  AlertTriangle,
  RefreshCw,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import { useAdminTickets } from '@/hooks/useAdminTickets'
import toast from 'react-hot-toast'

const ITEMS_PER_PAGE = 10

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'escalated', label: 'Escalated' },
  { value: 'closed', label: 'Closed' }
]

const priorityOptions = [
  { value: '', label: 'All Priority' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
]

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'quality', label: 'Quality Issue' },
  { value: 'delay', label: 'Delay' },
  { value: 'missing_item', label: 'Missing Item' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'payment', label: 'Payment' },
  { value: 'other', label: 'Other' }
]

export default function AdminTicketsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    status: '',
    priority: '',
    category: '',
    search: ''
  })
  const [showResolveModal, setShowResolveModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<string>('')
  const [resolution, setResolution] = useState('')

  const { 
    tickets, 
    pagination, 
    loading, 
    error, 
    takeTicket, 
    updateStatus, 
    resolveTicket,
    refetch 
  } = useAdminTickets(filters)

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleTakeTicket = async (ticketId: string) => {
    try {
      await takeTicket(ticketId)
      toast.success('Ticket assigned to you!')
    } catch (error: any) {
      toast.error(`Failed: ${error.message}`)
    }
  }

  const handleResolve = async () => {
    if (!resolution.trim()) {
      toast.error('Please enter a resolution')
      return
    }
    try {
      await resolveTicket(selectedTicket, resolution)
      setShowResolveModal(false)
      setResolution('')
      toast.success('Ticket resolved successfully!')
    } catch (error: any) {
      toast.error(`Failed: ${error.message}`)
    }
  }

  const handleCloseTicket = async (ticketId: string) => {
    try {
      await updateStatus(ticketId, 'closed')
      toast.success('Ticket closed!')
    } catch (error: any) {
      toast.error(`Failed: ${error.message}`)
    }
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-600'
      case 'high': return 'border-l-orange-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-gray-300'
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return AlertCircle
      case 'in_progress': return Clock
      case 'resolved': return CheckCircle
      case 'escalated': return AlertTriangle
      case 'closed': return XCircle
      default: return Ticket
    }
  }

  if (loading && (!Array.isArray(tickets) || tickets.length === 0)) {
    return (
      <div className="space-y-6 mt-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Support Tickets</h1>
          <p className="text-gray-600">Manage customer support requests</p>
        </div>
        <Button variant="outline" onClick={refetch}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-800">{pagination.total}</p>
            </div>
            <Ticket className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open</p>
              <p className="text-2xl font-bold text-red-600">
                {Array.isArray(tickets) ? tickets.filter(t => t.status === 'open').length : 0}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {Array.isArray(tickets) ? tickets.filter(t => t.status === 'in_progress').length : 0}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">
                {Array.isArray(tickets) ? tickets.filter(t => t.status === 'resolved').length : 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ticket number, title..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Tickets List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Tickets ({pagination.total})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {!Array.isArray(tickets) || tickets.length === 0 ? (
            <div className="p-12 text-center">
              <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Tickets Found</h3>
              <p className="text-gray-600">No tickets match your filters.</p>
            </div>
          ) : (
            tickets.map((ticket) => {
              const StatusIcon = getStatusIcon(ticket.status)
              return (
                <div key={ticket._id} className={`p-6 hover:bg-gray-50 transition-colors border-l-4 ${getPriorityColor(ticket.priority)}`}>
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Ticket className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-800">{ticket.ticketNumber}</h3>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {ticket.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(ticket.priority)}`}>
                            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                          </span>
                          {ticket.sla?.isOverdue && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Overdue
                            </span>
                          )}
                        </div>
                        
                        <h4 className="text-md font-medium text-gray-800 mb-2">{ticket.title}</h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {ticket.raisedBy?.name || 'Unknown'}
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {ticket.raisedBy?.email || 'N/A'}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
                          </div>
                          {ticket.relatedOrder && (
                            <div className="flex items-center">
                              <Ticket className="w-4 h-4 mr-1" />
                              Order: {ticket.relatedOrder.orderNumber}
                            </div>
                          )}
                        </div>
                        
                        {ticket.assignedTo && (
                          <div className="mt-2 text-sm text-blue-600">
                            Assigned to: {ticket.assignedTo.name}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link href={`/admin/tickets/${ticket._id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      
                      {ticket.status === 'open' && (
                        <Button 
                          size="sm" 
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={() => handleTakeTicket(ticket._id)}
                        >
                          Take & Work
                        </Button>
                      )}
                      
                      {ticket.status === 'in_progress' && (
                        <Button 
                          size="sm" 
                          className="bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => {
                            setSelectedTicket(ticket._id)
                            setShowResolveModal(true)
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Resolve
                        </Button>
                      )}
                      
                      {ticket.status === 'resolved' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCloseTicket(ticket._id)}
                        >
                          Close
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {pagination.total > ITEMS_PER_PAGE && (
          <Pagination
            current={pagination.current}
            pages={pagination.pages}
            total={pagination.total}
            limit={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
            itemName="tickets"
          />
        )}
      </div>

      {/* Resolve Modal */}
      {showResolveModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 flex items-center justify-center" style={{ zIndex: 999999 }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    setShowResolveModal(false)
                    setResolution('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
