'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/Pagination'
import { usePermissions } from '@/hooks/usePermissions'
import { 
  DollarSign, 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
  User,
  Calendar,
  Package,
  ArrowUpRight,
  CreditCard,
  X
} from 'lucide-react'
import { useAdminRefunds } from '@/hooks/useAdmin'
import toast from 'react-hot-toast'

const ITEMS_PER_PAGE = 8

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'requested', label: 'Requested' },
  { value: 'approved', label: 'Approved' },
  { value: 'processed', label: 'Processed' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' }
]

export default function AdminRefundsPage() {
  const { canRefund, hasPermission } = usePermissions('orders')
  const canApprove = hasPermission('financial', 'approve')
  const [filters, setFilters] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    status: '',
    isEscalated: undefined as boolean | undefined,
    search: ''
  })
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showEscalateModal, setShowEscalateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedRefund, setSelectedRefund] = useState<any>(null)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [escalationReason, setEscalationReason] = useState('')

  const { 
    refunds, 
    pagination, 
    loading, 
    error, 
    approveRefund, 
    rejectRefund, 
    escalateRefund,
    processRefund 
  } = useAdminRefunds(filters)

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleApprove = async () => {
    try {
      await approveRefund(selectedRefund._id, approvalNotes)
      setShowApproveModal(false)
      setApprovalNotes('')
      toast.success('Refund approved successfully!')
    } catch (error: any) {
      toast.error(`Failed to approve: ${error.message}`)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason) return
    try {
      await rejectRefund(selectedRefund._id, rejectionReason)
      setShowRejectModal(false)
      setRejectionReason('')
      toast.success('Refund rejected successfully!')
    } catch (error: any) {
      toast.error(`Failed to reject: ${error.message}`)
    }
  }

  const handleEscalate = async () => {
    if (!escalationReason) return
    try {
      await escalateRefund(selectedRefund._id, escalationReason)
      setShowEscalateModal(false)
      setEscalationReason('')
      toast.success('Refund escalated to Center Admin successfully!')
    } catch (error: any) {
      toast.error(`Failed to escalate: ${error.message}`)
    }
  }

  const handleProcess = async (refundId: string) => {
    try {
      await processRefund(refundId)
      toast.success('Refund processed successfully!')
    } catch (error: any) {
      toast.error(`Failed to process: ${error.message}`)
    }
  }

  const handleViewRefund = (refund: any) => {
    setSelectedRefund(refund)
    setShowViewModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'approved': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'processed': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'completed': return 'text-green-600 bg-green-50 border-green-200'
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'requested': return Clock
      case 'approved': return CheckCircle
      case 'processed': return CreditCard
      case 'completed': return CheckCircle
      case 'rejected': return XCircle
      default: return DollarSign
    }
  }

  if (loading && refunds.length === 0) {
    return (
      <div className="space-y-6 mt-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-20 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-800">Refund Management</h1>
          <p className="text-gray-600">Process and manage customer refund requests</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
          <p className="text-sm text-yellow-800">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            Admin refund limit: ₹500
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-blue-100">Total Refunds</p>
            <p className="text-3xl font-bold">{pagination.total}</p>
          </div>
        </div>
        
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-amber-100">Pending</p>
            <p className="text-3xl font-bold">{refunds.filter(r => r.status === 'requested').length}</p>
          </div>
        </div>
        
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-purple-100">Approved</p>
            <p className="text-3xl font-bold">{refunds.filter(r => r.status === 'approved').length}</p>
          </div>
        </div>
        
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-emerald-100">Processed</p>
            <p className="text-3xl font-bold">{refunds.filter(r => r.status === 'processed' || r.status === 'completed').length}</p>
          </div>
        </div>
        
        <div className="relative overflow-hidden bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-xl shadow-red-500/25 hover:shadow-red-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <ArrowUpRight className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-red-100">Escalated</p>
            <p className="text-3xl font-bold">{refunds.filter(r => r.isEscalated).length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by refund number or reason..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
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
              value={filters.isEscalated === undefined ? '' : filters.isEscalated.toString()}
              onChange={(e) => handleFilterChange('isEscalated', e.target.value === '' ? undefined : e.target.value === 'true')}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Refunds</option>
              <option value="true">Escalated Only</option>
              <option value="false">Not Escalated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Refunds List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Refund Requests ({pagination.total})
          </h2>
        </div>
        
        {error && (
          <div className="p-6 bg-red-50 border-b border-red-200">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">Error loading refunds: {error}</span>
            </div>
          </div>
        )}
        
        <div className="divide-y divide-gray-200">
          {refunds.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Refunds Found</h3>
              <p className="text-gray-600">No refund requests match your current filters.</p>
            </div>
          ) : (
            refunds.map((refund) => {
              const StatusIcon = getStatusIcon(refund.status)
              const isOverLimit = refund.amount > 500
              return (
                <div key={refund._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-800">{refund.refundNumber}</h3>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(refund.status)}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                          </span>
                          {refund.isEscalated && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <ArrowUpRight className="w-3 h-3 mr-1" />
                              Escalated
                            </span>
                          )}
                          {isOverLimit && refund.status === 'requested' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Over Limit
                            </span>
                          )}
                        </div>
                        
                        <div className="text-2xl font-bold text-gray-900 mb-2">
                          ₹{refund.amount.toLocaleString()}
                          <span className="text-sm font-normal text-gray-500 ml-2">
                            ({refund.type})
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{refund.reason}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {refund.customer?.name}
                          </div>
                          <div className="flex items-center">
                            <Package className="w-4 h-4 mr-1" />
                            {refund.order?.orderNumber}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(refund.createdAt).toLocaleDateString('en-IN')}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            Order: ₹{refund.order?.pricing?.total?.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewRefund(refund)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      
                      {refund.status === 'requested' && !refund.isEscalated && canRefund && (
                        <>
                          {!isOverLimit ? (
                            <Button 
                              size="sm" 
                              className="bg-green-500 hover:bg-green-600 text-white"
                              onClick={() => {
                                setSelectedRefund(refund)
                                setShowApproveModal(true)
                              }}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              className="bg-orange-500 hover:bg-orange-600 text-white"
                              onClick={() => {
                                setSelectedRefund(refund)
                                setShowEscalateModal(true)
                              }}
                            >
                              <ArrowUpRight className="w-4 h-4 mr-1" />
                              Escalate
                            </Button>
                          )}
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => {
                              setSelectedRefund(refund)
                              setShowRejectModal(true)
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {refund.status === 'approved' && canApprove && (
                        <Button 
                          size="sm" 
                          className="bg-purple-500 hover:bg-purple-600 text-white"
                          onClick={() => handleProcess(refund._id)}
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          Process
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
        {pagination.pages > 1 && (
          <Pagination
            current={pagination.current}
            pages={pagination.pages}
            total={pagination.total}
            limit={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
            itemName="refunds"
          />
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 flex items-center justify-center" style={{ zIndex: 999999 }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Approve Refund</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Add any notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  onClick={handleApprove}
                >
                  Approve
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowApproveModal(false)
                    setApprovalNotes('')
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

      {/* Reject Modal */}
      {showRejectModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 flex items-center justify-center" style={{ zIndex: 999999 }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reject Refund</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  onClick={handleReject}
                  disabled={!rejectionReason}
                >
                  Reject
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowRejectModal(false)
                    setRejectionReason('')
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

      {/* Escalate Modal */}
      {showEscalateModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 flex items-center justify-center" style={{ zIndex: 999999 }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Escalate to Center Admin</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                This refund exceeds your approval limit of ₹500. It will be escalated to Center Admin for approval.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escalation Reason *
                </label>
                <textarea
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  placeholder="Enter reason for escalation..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={handleEscalate}
                  disabled={!escalationReason}
                >
                  Escalate
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowEscalateModal(false)
                    setEscalationReason('')
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

      {/* View Refund Modal */}
      {showViewModal && selectedRefund && typeof window !== 'undefined' && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 flex items-center justify-center" style={{ zIndex: 999999 }}>
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Refund Details</h3>
              <button
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedRefund(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Refund Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Refund Number</p>
                  <p className="font-semibold">{selectedRefund.refundNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedRefund.status)}`}>
                    {selectedRefund.status.charAt(0).toUpperCase() + selectedRefund.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-xl font-bold text-green-600">₹{selectedRefund.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{selectedRefund.type}</p>
                </div>
              </div>

              {/* Reason */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Reason</p>
                <p className="bg-gray-50 p-3 rounded-lg">{selectedRefund.reason}</p>
              </div>

              {/* Customer Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="ml-2 font-medium">{selectedRefund.customer?.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <span className="ml-2 font-medium">{selectedRefund.customer?.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <span className="ml-2 font-medium">{selectedRefund.customer?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2 flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Order Information
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Order Number:</span>
                    <span className="ml-2 font-medium">{selectedRefund.order?.orderNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Order Total:</span>
                    <span className="ml-2 font-medium">₹{selectedRefund.order?.pricing?.total?.toLocaleString() || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Timeline
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Requested:</span>
                    <span>{new Date(selectedRefund.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                  {selectedRefund.approvedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Approved:</span>
                      <span>{new Date(selectedRefund.approvedAt).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {selectedRefund.processedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Processed:</span>
                      <span>{new Date(selectedRefund.processedAt).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Escalation Info */}
              {selectedRefund.isEscalated && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2 flex items-center">
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Escalation Details
                  </h4>
                  <p className="text-sm">{selectedRefund.escalationReason || 'Escalated to Center Admin'}</p>
                </div>
              )}

              {/* Notes */}
              {selectedRefund.notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="bg-gray-50 p-3 rounded-lg text-sm">{selectedRefund.notes}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedRefund(null)
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
