'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { usePermissions } from '@/hooks/usePermissions'
import { 
  Package, 
  Search, 
  Filter,
  Eye,
  Building2,
  Truck,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  IndianRupee,
  Crown,
  Zap,
  X,
  MapPin,
  Phone,
  RefreshCw,
  Download,
  Loader2,
  XCircle,
  Edit,
  Ban,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'
import { useAdminOrders, useLogisticsPartners } from '@/hooks/useAdmin'
import toast from 'react-hot-toast'
import OrderQRCode from '@/components/OrderQRCode'

interface Order {
  _id: string
  orderNumber: string
  customer: {
    _id: string
    name: string
    phone: string
    email: string
    isVIP: boolean
  }
  branch?: {
    _id: string
    name: string
    code: string
  }
  logisticsPartner?: {
    _id: string
    companyName: string
  }
  status: string
  pricing: {
    total: number
    subtotal?: number
    deliveryCharge?: number
    discount?: number
  }
  deliveryDetails?: {
    distance?: number
    deliveryCharge?: number
    isFallbackPricing?: boolean
    calculatedAt?: string
  }
  isExpress: boolean
  createdAt: string
  pickupDate: string
  estimatedDeliveryDate?: string
  items: any[]
  // Service type fields for self drop/pickup
  serviceType?: string
  pickupType?: 'self' | 'logistics'
  deliveryType?: 'self' | 'logistics'
  selectedBranch?: {
    _id: string
    name: string
  }
  pickupAddress: {
    addressLine1: string
    city: string
    pincode: string
    phone: string
  }
  deliveryAddress: {
    addressLine1: string
    city: string
    pincode: string
    phone: string
  }
}

export default function AdminOrdersPage() {
  const { canView, canUpdate, canAssign, canCancel, hasPermission } = usePermissions('orders')
  const canExportReports = hasPermission('reports', 'export')
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get initial page from URL
  const initialPage = parseInt(searchParams.get('page') || '1', 10)
  
  const [filters, setFilters] = useState({
    page: initialPage,
    limit: 8,
    status: searchParams.get('status') || '',
    search: searchParams.get('search') || '',
    isExpress: undefined as boolean | undefined
  })
  const [goToPage, setGoToPage] = useState('')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [logisticsType, setLogisticsType] = useState<'pickup' | 'delivery'>('pickup')
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState<string>('')
  const [selectedAssignee, setSelectedAssignee] = useState('')
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  
  // View Order Modal
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  
  // Menu Dropdown
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const { orders, pagination, loading, error, assignToLogistics, updateStatus, refetch } = useAdminOrders(filters)
  const { partners } = useLogisticsPartners()

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 }
    setFilters(newFilters)
    updateURL(newFilters)
  }

  const updateURL = (newFilters: typeof filters) => {
    const params = new URLSearchParams()
    if (newFilters.page > 1) params.set('page', newFilters.page.toString())
    if (newFilters.status) params.set('status', newFilters.status)
    if (newFilters.search) params.set('search', newFilters.search)
    const queryString = params.toString()
    router.push(queryString ? `?${queryString}` : '/admin/orders', { scroll: false })
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.pages) return
    const newFilters = { ...filters, page }
    setFilters(newFilters)
    updateURL(newFilters)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault()
    const page = parseInt(goToPage, 10)
    if (page >= 1 && page <= pagination.pages) {
      handlePageChange(page)
      setGoToPage('')
    }
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const current = pagination.current
    const total = pagination.pages
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      if (current > 3) pages.push('...')
      
      const start = Math.max(2, current - 1)
      const end = Math.min(total - 1, current + 1)
      
      for (let i = start; i <= end; i++) pages.push(i)
      
      if (current < total - 2) pages.push('...')
      pages.push(total)
    }
    return pages
  }

  const handleAssignLogistics = (orderId: string, type: 'pickup' | 'delivery') => {
    setSelectedOrderForAssign(orderId)
    setLogisticsType(type)
    setSelectedAssignee('')
    setShowAssignModal(true)
    setOpenMenuId(null)
  }

  const handleAssignSubmit = async () => {
    if (!selectedAssignee) return
    setLoadingAction('assign')
    try {
      await assignToLogistics(selectedOrderForAssign, selectedAssignee, logisticsType)
      toast.success(`Logistics partner assigned for ${logisticsType} successfully!`)
      setShowAssignModal(false)
    } catch (error: any) {
      toast.error(error.message || `Failed to assign logistics partner`)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setShowViewModal(true)
    setOpenMenuId(null)
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setLoadingAction(`status-${orderId}`)
    try {
      await updateStatus(orderId, newStatus)
      
      // Show detailed status message with completed and remaining stages
      const statusMessage = getStatusProgressMessage(newStatus)
      toast.success(
        (t) => (
          <div className="flex flex-col gap-1">
            <div className="font-semibold">✅ {getStatusText(newStatus)}</div>
            <div className="text-xs text-gray-600">{statusMessage.completed}</div>
            {statusMessage.remaining && (
              <div className="text-xs text-amber-600">⏳ {statusMessage.remaining}</div>
            )}
          </div>
        ),
        { duration: 4000 }
      )
      setOpenMenuId(null)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status')
    } finally {
      setLoadingAction(null)
    }
  }

  const getStatusProgressMessage = (status: string) => {
    const allStages = [
      { key: 'placed', label: 'Order Placed' },
      { key: 'in_process', label: 'Processing' },
      { key: 'ready', label: 'Ready for Delivery' },
      { key: 'out_for_delivery', label: 'Out for Delivery' },
      { key: 'delivered', label: 'Delivered' }
    ]
    
    const currentIndex = allStages.findIndex(s => s.key === status)
    
    if (status === 'cancelled') {
      return {
        completed: 'Order has been cancelled',
        remaining: null
      }
    }
    
    if (currentIndex === -1) {
      return {
        completed: 'Status updated',
        remaining: null
      }
    }
    
    const completedStages = allStages.slice(0, currentIndex + 1).map(s => s.label)
    const remainingStages = allStages.slice(currentIndex + 1).map(s => s.label)
    
    return {
      completed: `Done: ${completedStages.join(' → ')}`,
      remaining: remainingStages.length > 0 ? `Next: ${remainingStages.join(' → ')}` : null
    }
  }

  const handleExport = () => {
    toast.success('Export started!')
    const headers = ['Order ID', 'Customer', 'Status', 'Amount', 'Date', 'Express', 'Branch']
    const csvData = orders.map(o => [
      o.orderNumber,
      o.customer?.name || 'N/A',
      getStatusText(o.status),
      o.pricing?.total || 0,
      new Date(o.createdAt).toLocaleDateString('en-IN'),
      o.isExpress ? 'Yes' : 'No',
      o.branch?.name || 'Not Assigned'
    ])
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'placed': return Clock
      case 'assigned_to_branch': return Building2
      case 'assigned_to_logistics_pickup': return Truck
      case 'picked': return Package
      case 'in_process': return RefreshCw
      case 'ready': return CheckCircle
      case 'assigned_to_logistics_delivery': return Truck
      case 'out_for_delivery': return Truck
      case 'delivered': return CheckCircle
      case 'cancelled': return XCircle
      default: return Package
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'assigned_to_branch': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'assigned_to_logistics_pickup': return 'text-indigo-600 bg-indigo-50 border-indigo-200'
      case 'picked': return 'text-cyan-600 bg-cyan-50 border-cyan-200'
      case 'in_process': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'ready': return 'text-teal-600 bg-teal-50 border-teal-200'
      case 'assigned_to_logistics_delivery': return 'text-violet-600 bg-violet-50 border-violet-200'
      case 'out_for_delivery': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'delivered': return 'text-green-600 bg-green-50 border-green-200'
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'placed': return 'Order Placed'
      case 'assigned_to_branch': return 'At Branch'
      case 'assigned_to_logistics_pickup': return 'Pickup Scheduled'
      case 'picked': return 'Picked Up'
      case 'in_process': return 'Processing'
      case 'ready': return 'Ready'
      case 'assigned_to_logistics_delivery': return 'Delivery Scheduled'
      case 'out_for_delivery': return 'Out for Delivery'
      case 'delivered': return 'Delivered'
      case 'cancelled': return 'Cancelled'
      default: return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const getPriorityColor = (order: any) => {
    if (order.isExpress) return 'border-l-red-500'
    if (order.customer?.isVIP) return 'border-l-yellow-500'
    return 'border-l-blue-500'
  }

  const getNextStatuses = (currentStatus: string, order?: Order) => {
    // Check if order uses self pickup or self delivery
    const isSelfPickup = order?.pickupType === 'self'
    const isSelfDelivery = order?.deliveryType === 'self'
    
    // Status flow based on service type
    const statusFlow: Record<string, string[]> = {
      // For self pickup: skip logistics pickup statuses, go directly to in_process
      'placed': isSelfPickup ? ['in_process', 'cancelled'] : ['in_process', 'cancelled'],
      'assigned_to_branch': ['in_process', 'cancelled'],
      'assigned_to_logistics_pickup': ['picked', 'cancelled'],
      'picked': ['in_process', 'cancelled'],
      'in_process': ['ready', 'cancelled'],
      // For self delivery: skip logistics delivery, go directly to delivered
      'ready': isSelfDelivery ? ['delivered', 'cancelled'] : ['out_for_delivery', 'cancelled'],
      'assigned_to_logistics_delivery': ['out_for_delivery', 'cancelled'],
      'out_for_delivery': ['delivered', 'cancelled'],
    }
    return statusFlow[currentStatus] || []
  }

  if (loading && orders.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
          <p className="text-gray-600">Manage orders and assign logistics partners for pickup/delivery</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {canExportReports && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or phone..."
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
              <option value="">All Status</option>
              <option value="placed">Pending</option>
              <option value="assigned_to_branch">Assigned</option>
              <option value="in_process">In Progress</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filters.isExpress === undefined ? '' : filters.isExpress.toString()}
              onChange={(e) => handleFilterChange('isExpress', e.target.value === '' ? undefined : e.target.value === 'true')}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Orders</option>
              <option value="true">Express Only</option>
              <option value="false">Regular Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative">
        {/* Loading overlay for page changes */}
        {loading && orders.length > 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-xl">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="text-sm text-gray-600">Loading...</span>
            </div>
          </div>
        )}
        
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Orders {pagination.total > 0 ? `(${pagination.total})` : ''}</h2>
        </div>
        
        {error && (
          <div className="p-6 bg-red-50 border-b border-red-200">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">Error loading orders: {error}</span>
            </div>
          </div>
        )}
        
        <div className="divide-y divide-gray-200">
          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
              <p className="text-gray-600">No orders match your current filters.</p>
            </div>
          ) : (
            orders.map((order) => {
              const StatusIcon = getStatusIcon(order.status)
              const nextStatuses = getNextStatuses(order.status, order)
              return (
                <div key={order._id} className={`p-6 hover:bg-gray-50 transition-colors border-l-4 ${getPriorityColor(order)}`}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          {/* Barcode */}
                          <OrderQRCode 
                            orderNumber={order.orderNumber}
                            orderId={order._id}
                            barcode={order.orderNumber}
                            size="small"
                            mode="barcode-only"
                          />
                          
                          <h3 className="text-lg font-semibold text-gray-800">{order.orderNumber}</h3>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {getStatusText(order.status)}
                          </span>
                          {order.isExpress && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <Zap className="w-3 h-3 mr-1" />Express
                            </span>
                          )}
                          {order.customer?.isVIP && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Crown className="w-3 h-3 mr-1" />VIP
                            </span>
                          )}
                          {order.pickupType === 'self' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                              Self Drop
                            </span>
                          )}
                          {order.deliveryType === 'self' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                              Self Pickup
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                          <div className="flex items-center"><User className="w-4 h-4 mr-1" />{order.customer?.name}</div>
                          <div className="flex items-center"><Package className="w-4 h-4 mr-1" />{order.items?.length || 0} items</div>
                          <div className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
                          <div className="flex items-center"><IndianRupee className="w-4 h-4 mr-1" />{order.pricing?.total?.toLocaleString()}</div>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-500">
                          <div>📍 {order.pickupAddress?.addressLine1}, {order.pickupAddress?.city}</div>
                          {order.branch && <div className="mt-1">🏢 {order.branch.name}</div>}
                          {order.logisticsPartner && <div className="mt-1">🚚 {order.logisticsPartner.companyName}</div>}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                      <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                        <Eye className="w-4 h-4 mr-1" />View
                      </Button>
                      
                      {/* Assign Logistics for Pickup - only when order uses logistics pickup (not self drop) */}
                      {order.status === 'placed' && canAssign && order.pickupType !== 'self' && (
                        <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white" onClick={() => handleAssignLogistics(order._id, 'pickup')}>
                          <Truck className="w-4 h-4 mr-1" />Assign Pickup
                        </Button>
                      )}
                      
                      {/* Assign Logistics for Delivery - only when order uses logistics delivery (not self pickup) */}
                      {order.status === 'ready' && canAssign && order.deliveryType !== 'self' && (
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => handleAssignLogistics(order._id, 'delivery')}>
                          <Truck className="w-4 h-4 mr-1" />Assign Delivery
                        </Button>
                      )}
                      
                      {/* Status Change Dropdown */}
                      {nextStatuses.length > 0 && canUpdate && (
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleUpdateStatus(order._id, e.target.value)
                            }
                          }}
                          disabled={loadingAction === `status-${order._id}`}
                          className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">Change Status</option>
                          {nextStatuses.map(status => (
                            <option key={status} value={status}>
                              {getStatusText(status)}
                            </option>
                          ))}
                        </select>
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
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              Showing {((pagination.current - 1) * pagination.limit) + 1} to {Math.min(pagination.current * pagination.limit, pagination.total)} of {pagination.total} orders
            </div>
            
            <div className="flex items-center gap-2">
              {/* First Page */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(1)} 
                disabled={pagination.current === 1}
                className="hidden sm:flex"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              
              {/* Previous */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(pagination.current - 1)} 
                disabled={pagination.current === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
                  ) : (
                    <Button
                      key={page}
                      variant={pagination.current === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page as number)}
                      className={`min-w-[36px] ${pagination.current === page ? 'bg-blue-600 text-white' : ''}`}
                    >
                      {page}
                    </Button>
                  )
                ))}
              </div>
              
              {/* Next */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(pagination.current + 1)} 
                disabled={pagination.current === pagination.pages}
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              {/* Last Page */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(pagination.pages)} 
                disabled={pagination.current === pagination.pages}
                className="hidden sm:flex"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
              
              {/* Go to Page - only show when more than 10 pages */}
              {pagination.pages > 10 && (
                <form onSubmit={handleGoToPage} className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
                  <input
                    type="number"
                    min="1"
                    max={pagination.pages}
                    value={goToPage}
                    onChange={(e) => setGoToPage(e.target.value)}
                    placeholder="#"
                    className="w-14 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                  />
                  <Button type="submit" variant="outline" size="sm" disabled={!goToPage}>
                    Go
                  </Button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* View Order Modal */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Order Details</h3>
                <p className="text-sm text-gray-500">{selectedOrder.orderNumber}</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status & Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusText(selectedOrder.status)}
                </span>
                {selectedOrder.isExpress && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <Zap className="w-4 h-4 mr-1" />Express
                  </span>
                )}
                {selectedOrder.customer?.isVIP && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    <Crown className="w-4 h-4 mr-1" />VIP Customer
                  </span>
                )}
                {selectedOrder.pickupType === 'self' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-100 text-cyan-800">
                    Self Drop
                  </span>
                )}
                {selectedOrder.deliveryType === 'self' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
                    Self Pickup
                  </span>
                )}
              </div>

              {/* Status Timeline */}
              {selectedOrder.status !== 'cancelled' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Order Progress</h4>
                  <div className="flex items-center justify-between">
                    {[
                      { key: 'placed', label: 'Placed', icon: Clock },
                      { key: 'in_process', label: 'Processing', icon: RefreshCw },
                      { key: 'ready', label: 'Ready', icon: CheckCircle },
                      { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
                      { key: 'delivered', label: 'Delivered', icon: CheckCircle }
                    ].map((stage, index, arr) => {
                      const stageIndex = arr.findIndex(s => s.key === selectedOrder.status)
                      const isCompleted = index <= stageIndex
                      const isCurrent = index === stageIndex
                      const StageIcon = stage.icon
                      
                      return (
                        <div key={stage.key} className="flex flex-col items-center flex-1">
                          <div className="flex items-center w-full">
                            {index > 0 && (
                              <div className={`flex-1 h-1 ${index <= stageIndex ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            )}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isCompleted 
                                ? isCurrent 
                                  ? 'bg-blue-500 text-white ring-4 ring-blue-200' 
                                  : 'bg-green-500 text-white'
                                : 'bg-gray-300 text-gray-500'
                            }`}>
                              <StageIcon className="w-4 h-4" />
                            </div>
                            {index < arr.length - 1 && (
                              <div className={`flex-1 h-1 ${index < stageIndex ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            )}
                          </div>
                          <span className={`text-xs mt-2 text-center ${isCurrent ? 'font-semibold text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                            {stage.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {selectedOrder.status === 'cancelled' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <XCircle className="w-5 h-5" />
                    <span className="font-semibold">Order Cancelled</span>
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Customer Information</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /><span className="font-medium">{selectedOrder.customer?.name}</span></div>
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /><span>{selectedOrder.customer?.phone}</span></div>
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /><span>Ordered on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}</span></div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Pickup Address</h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-blue-500 mt-1" />
                      <div>
                        <p>{selectedOrder.pickupAddress?.addressLine1}</p>
                        <p className="text-sm text-gray-600">{selectedOrder.pickupAddress?.city} - {selectedOrder.pickupAddress?.pincode}</p>
                        <p className="text-sm text-gray-600 mt-1">📞 {selectedOrder.pickupAddress?.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Delivery Address</h4>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-green-500 mt-1" />
                      <div>
                        <p>{selectedOrder.deliveryAddress?.addressLine1}</p>
                        <p className="text-sm text-gray-600">{selectedOrder.deliveryAddress?.city} - {selectedOrder.deliveryAddress?.pincode}</p>
                        <p className="text-sm text-gray-600 mt-1">📞 {selectedOrder.deliveryAddress?.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignment Info */}
              {(selectedOrder.branch || selectedOrder.logisticsPartner) && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Assignment</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {selectedOrder.branch && (
                      <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-gray-400" /><span>Branch: <strong>{selectedOrder.branch.name}</strong> ({selectedOrder.branch.code})</span></div>
                    )}
                    {selectedOrder.logisticsPartner && (
                      <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-gray-400" /><span>Logistics: <strong>{selectedOrder.logisticsPartner.companyName}</strong></span></div>
                    )}
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Order Summary</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between py-2"><span className="text-gray-600">Items</span><span>{selectedOrder.items?.length || 0} items</span></div>
                  {selectedOrder.pricing?.subtotal && <div className="flex justify-between py-2"><span className="text-gray-600">Subtotal</span><span>₹{selectedOrder.pricing.subtotal.toLocaleString()}</span></div>}
                  
                  {/* Delivery Details with Distance */}
                  {(selectedOrder.deliveryDetails?.distance || selectedOrder.pricing?.deliveryCharge) && (
                    <div className="py-2 border-t border-gray-200 mt-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Delivery</span>
                          {selectedOrder.deliveryDetails?.distance && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              {selectedOrder.deliveryDetails.distance} km
                            </span>
                          )}
                        </div>
                        <span>
                          {(selectedOrder.deliveryDetails?.deliveryCharge || selectedOrder.pricing?.deliveryCharge) === 0 
                            ? <span className="text-green-600 font-medium">FREE</span>
                            : `₹${selectedOrder.deliveryDetails?.deliveryCharge || selectedOrder.pricing?.deliveryCharge}`
                          }
                        </span>
                      </div>
                      {selectedOrder.deliveryDetails?.isFallbackPricing && (
                        <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Flat rate applied (distance unavailable)
                        </div>
                      )}
                    </div>
                  )}
                  
                  {selectedOrder.pricing?.discount && <div className="flex justify-between py-2 text-green-600"><span>Discount</span><span>-₹{selectedOrder.pricing.discount}</span></div>}
                  <div className="flex justify-between py-2 border-t border-gray-200 font-bold text-lg"><span>Total</span><span>₹{selectedOrder.pricing?.total?.toLocaleString()}</span></div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              {/* Assign Logistics for Pickup - only when order uses logistics pickup */}
              {selectedOrder.status === 'placed' && canAssign && selectedOrder.pickupType !== 'self' && (
                <Button className="bg-purple-500 hover:bg-purple-600 text-white" onClick={() => { handleAssignLogistics(selectedOrder._id, 'pickup'); setShowViewModal(false) }}>
                  <Truck className="w-4 h-4 mr-2" />Assign Pickup Partner
                </Button>
              )}
              
              {/* Assign Logistics for Delivery - only when order uses logistics delivery */}
              {selectedOrder.status === 'ready' && canAssign && selectedOrder.deliveryType !== 'self' && (
                <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={() => { handleAssignLogistics(selectedOrder._id, 'delivery'); setShowViewModal(false) }}>
                  <Truck className="w-4 h-4 mr-2" />Assign Delivery Partner
                </Button>
              )}
              <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal - Logistics Partner Only */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">
              Assign Logistics Partner for {logisticsType === 'pickup' ? 'Pickup' : 'Delivery'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {logisticsType === 'pickup' 
                ? 'Select a logistics partner to pick up items from customer' 
                : 'Select a logistics partner to deliver items to customer'}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Logistics Partner
                </label>
                <select 
                  value={selectedAssignee} 
                  onChange={(e) => setSelectedAssignee(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Choose a partner...</option>
                  {partners.map((partner) => (
                    <option key={partner._id} value={partner._id}>
                      {partner.companyName}
                    </option>
                  ))}
                </select>
                {partners.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No logistics partners available. Please add partners first.</p>
                )}
              </div>
              <div className="flex gap-3">
                <Button 
                  className="flex-1 text-white bg-green-900 hover:bg-green-950"
                  onClick={handleAssignSubmit} 
                  disabled={!selectedAssignee || loadingAction === 'assign'}
                >
                  {loadingAction === 'assign' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Assign
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowAssignModal(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
