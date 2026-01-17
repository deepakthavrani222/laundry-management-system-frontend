'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { usePermissions } from '@/hooks/usePermissions'
import { 
  Users, 
  Search, 
  Filter,
  Eye,
  UserCheck,
  UserX,
  Crown,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  Loader2,
  X,
  ShoppingBag,
  IndianRupee,
  Clock,
  MapPin,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Gift,
  Wallet,
  Star,
  TrendingUp,
  Package,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react'
import { useAdminCustomers } from '@/hooks/useAdmin'
import toast from 'react-hot-toast'

interface Customer {
  _id: string
  name: string
  email: string
  phone: string
  isActive: boolean
  isVIP: boolean
  createdAt: string
  stats: {
    totalOrders: number
    totalSpent: number
  }
  addresses?: Array<{
    addressLine1: string
    city: string
    pincode: string
  }>
}

interface CustomerDetails extends Customer {
  orderStats: {
    total: number
    completed: number
    pending: number
    cancelled: number
    totalSpent: number
    lastOrderDate: string | null
  }
  recentOrders: Array<{
    _id: string
    orderNumber: string
    status: string
    total: number
    date: string
    serviceCount: number
  }>
  addresses: Array<{
    _id: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
    isDefault: boolean
  }>
  loyalty: {
    points: number
    tier: string
    programName: string
    pointsValue: number
  } | null
  referral: {
    code: string | null
    referredCount: number
    totalEarnings: number
  }
  wallet: {
    balance: number
  }
  favoriteServices: Array<{
    name: string
    orderCount: number
  }>
}

export default function AdminCustomersPage() {
  const { canUpdate, hasPermission } = usePermissions('customers')
  const canExportReports = hasPermission('reports', 'export')
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get initial page from URL
  const initialPage = parseInt(searchParams.get('page') || '1', 10)
  
  const [filters, setFilters] = useState({
    page: initialPage,
    limit: 8,
    search: searchParams.get('search') || '',
    isActive: undefined as boolean | undefined,
    isVIP: undefined as boolean | undefined
  })
  const [goToPage, setGoToPage] = useState('')
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const { customers, pagination, loading, error, toggleStatus, updateVIPStatus, refetch } = useAdminCustomers(filters)

  const updateURL = (newFilters: typeof filters) => {
    const params = new URLSearchParams()
    if (newFilters.page > 1) params.set('page', newFilters.page.toString())
    if (newFilters.search) params.set('search', newFilters.search)
    const queryString = params.toString()
    router.push(queryString ? `?${queryString}` : '/admin/customers', { scroll: false })
  }

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 }
    setFilters(newFilters)
    updateURL(newFilters)
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

  const handleToggleStatus = async (customerId: string, customerName: string, isActive: boolean) => {
    setLoadingAction(`status-${customerId}`)
    try {
      await toggleStatus(customerId)
      toast.success(`${customerName} has been ${isActive ? 'deactivated' : 'activated'} successfully!`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update customer status')
    } finally {
      setLoadingAction(null)
    }
  }

  const handleToggleVIP = async (customerId: string, customerName: string, currentVIPStatus: boolean) => {
    setLoadingAction(`vip-${customerId}`)
    try {
      await updateVIPStatus(customerId, !currentVIPStatus)
      toast.success(`${customerName} ${currentVIPStatus ? 'removed from' : 'added to'} VIP list!`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update VIP status')
    } finally {
      setLoadingAction(null)
    }
  }

  const handleViewProfile = async (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowProfileModal(true)
    setLoadingDetails(true)
    setCustomerDetails(null)
    
    try {
      // Use adminApi to fetch customer details (handles auth properly)
      const { adminApi } = await import('@/lib/adminApi')
      const response = await adminApi.getCustomerDetails(customer._id)
      setCustomerDetails(response.data.customer)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load customer details')
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleExport = () => {
    toast.success('Export started! File will download shortly.')
    // Create CSV data
    const headers = ['Name', 'Email', 'Phone', 'Status', 'VIP', 'Total Orders', 'Total Spent', 'Joined Date']
    const csvData = customers.map(c => [
      c.name,
      c.email,
      c.phone,
      c.isActive ? 'Active' : 'Inactive',
      c.isVIP ? 'Yes' : 'No',
      c.stats?.totalOrders || 0,
      c.stats?.totalSpent || 0,
      new Date(c.createdAt).toLocaleDateString('en-IN')
    ])
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading && customers.length === 0) {
    return (
      <div className="space-y-6 mt-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
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
          <h1 className="text-3xl font-bold text-gray-800">Customer Management</h1>
          <p className="text-gray-600">Manage customer accounts, VIP status, and view customer analytics</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-blue-100">Total Customers</p>
            <p className="text-3xl font-bold">{pagination.total}</p>
          </div>
        </div>
        
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-emerald-100">Active Customers</p>
            <p className="text-3xl font-bold">{customers.filter(c => c.isActive).length}</p>
          </div>
        </div>
        
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-amber-100">VIP Customers</p>
            <p className="text-3xl font-bold">{customers.filter(c => c.isVIP).length}</p>
          </div>
        </div>
        
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-purple-100">This Page</p>
            <p className="text-3xl font-bold">{customers.length}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filters.isActive === undefined ? '' : filters.isActive.toString()}
              onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <select
              value={filters.isVIP === undefined ? '' : filters.isVIP.toString()}
              onChange={(e) => handleFilterChange('isVIP', e.target.value === '' ? undefined : e.target.value === 'true')}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Customers</option>
              <option value="true">VIP Only</option>
              <option value="false">Regular Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative">
        {/* Loading overlay for page changes */}
        {loading && customers.length > 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-xl">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="text-sm text-gray-600">Loading...</span>
            </div>
          </div>
        )}
        
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Customers ({pagination.total})
          </h2>
        </div>
        
        {error && (
          <div className="p-6 bg-red-50 border-b border-red-200">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">Error loading customers: {error}</span>
            </div>
          </div>
        )}
        
        <div className="divide-y divide-gray-200">
          {customers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Customers Found</h3>
              <p className="text-gray-600">No customers match your current filters.</p>
            </div>
          ) : (
            customers.map((customer) => (
              <div key={customer._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold">
                        {(customer.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-800">{customer.name || 'Unknown'}</h3>
                        {customer.isVIP && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Crown className="w-3 h-3 mr-1" />
                            VIP
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          customer.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="flex items-center truncate">
                            <Mail className="w-4 h-4 mr-1 flex-shrink-0 text-gray-400" />
                            <span className="truncate">{customer.email}</span>
                          </span>
                          <span className="flex items-center">
                            <Phone className="w-4 h-4 mr-1 flex-shrink-0 text-gray-400" />
                            {customer.phone}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 flex-wrap text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                            Joined {new Date(customer.createdAt).toLocaleDateString('en-IN')}
                          </span>
                          <span>Orders: <strong className="text-gray-700">{customer.stats?.totalOrders || 0}</strong></span>
                          <span>Spent: <strong className="text-gray-700">₹{customer.stats?.totalSpent?.toLocaleString() || '0'}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewProfile(customer)}
                      className="whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Profile
                    </Button>
                    
                    {canUpdate && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className={`whitespace-nowrap ${customer.isActive ? "text-red-600 border-red-300 hover:bg-red-50" : "text-green-600 border-green-300 hover:bg-green-50"}`}
                        onClick={() => handleToggleStatus(customer._id, customer.name, customer.isActive)}
                        disabled={loadingAction === `status-${customer._id}`}
                      >
                        {loadingAction === `status-${customer._id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : customer.isActive ? (
                          <>
                            <UserX className="w-4 h-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    )}
                    
                    {canUpdate && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className={`whitespace-nowrap ${customer.isVIP ? "text-gray-600 border-gray-300 hover:bg-gray-50" : "text-yellow-600 border-yellow-300 hover:bg-yellow-50"}`}
                        onClick={() => handleToggleVIP(customer._id, customer.name, customer.isVIP)}
                        disabled={loadingAction === `vip-${customer._id}`}
                      >
                        {loadingAction === `vip-${customer._id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Crown className="w-4 h-4 mr-1" />
                            {customer.isVIP ? 'Remove VIP' : 'Make VIP'}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              Showing {((pagination.current - 1) * pagination.limit) + 1} to {Math.min(pagination.current * pagination.limit, pagination.total)} of {pagination.total} customers
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

      {/* View Profile Modal */}
      {showProfileModal && selectedCustomer && typeof window !== 'undefined' && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
          <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-semibold text-gray-800">Customer Profile</h3>
              <button 
                onClick={() => {
                  setShowProfileModal(false)
                  setCustomerDetails(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {(selectedCustomer.name || 'U').split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-2xl font-bold text-gray-800">{selectedCustomer.name || 'Unknown'}</h4>
                    {selectedCustomer.isVIP && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Crown className="w-3 h-3 mr-1" />
                        VIP
                      </span>
                    )}
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    selectedCustomer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedCustomer.isActive ? 'Active Account' : 'Inactive Account'}
                  </span>
                </div>
              </div>

              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <span className="ml-3 text-gray-600">Loading customer details...</span>
                </div>
              ) : customerDetails ? (
                <>
                  {/* Contact Information */}
                  <div>
                    <h5 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h5>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{customerDetails.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{customerDetails.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Member Since</p>
                          <p className="font-medium">{new Date(customerDetails.createdAt).toLocaleDateString('en-IN', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Statistics */}
                  <div>
                    <h5 className="text-lg font-semibold text-gray-800 mb-3">Order Statistics</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <ShoppingBag className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-600">{customerDetails.orderStats.total}</p>
                        <p className="text-sm text-gray-500">Total Orders</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-600">{customerDetails.orderStats.completed}</p>
                        <p className="text-sm text-gray-500">Completed</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4 text-center">
                        <Loader className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-yellow-600">{customerDetails.orderStats.pending}</p>
                        <p className="text-sm text-gray-500">Pending</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 text-center">
                        <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-red-600">{customerDetails.orderStats.cancelled}</p>
                        <p className="text-sm text-gray-500">Cancelled</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <IndianRupee className="w-5 h-5 text-purple-500" />
                          <p className="text-sm text-gray-500">Total Spent</p>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">₹{customerDetails.orderStats.totalSpent.toLocaleString()}</p>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-5 h-5 text-indigo-500" />
                          <p className="text-sm text-gray-500">Last Order</p>
                        </div>
                        <p className="text-lg font-bold text-indigo-600">
                          {customerDetails.orderStats.lastOrderDate 
                            ? new Date(customerDetails.orderStats.lastOrderDate).toLocaleDateString('en-IN')
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Loyalty & Wallet */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Loyalty Points */}
                    {customerDetails.loyalty && (
                      <div>
                        <h5 className="text-lg font-semibold text-gray-800 mb-3">Loyalty & Rewards</h5>
                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Star className="w-6 h-6 text-amber-500" />
                            <span className="font-semibold text-amber-900">{customerDetails.loyalty.programName}</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Points Balance</span>
                              <span className="text-2xl font-bold text-amber-600">{customerDetails.loyalty.points}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Tier</span>
                              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                                {customerDetails.loyalty.tier}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Points Value</span>
                              <span className="text-sm font-medium text-gray-800">₹{customerDetails.loyalty.pointsValue}/point</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Wallet Balance */}
                    <div>
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Wallet</h5>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Wallet className="w-6 h-6 text-green-500" />
                          <span className="font-semibold text-green-900">Wallet Balance</span>
                        </div>
                        <p className="text-3xl font-bold text-green-600">₹{customerDetails.wallet.balance.toLocaleString()}</p>
                        <p className="text-sm text-gray-600 mt-2">Available for orders</p>
                      </div>
                    </div>
                  </div>

                  {/* Referral Information */}
                  {customerDetails.referral.code && (
                    <div>
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Referral Program</h5>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Gift className="w-6 h-6 text-purple-500" />
                          <span className="font-semibold text-purple-900">Referral Stats</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Referral Code</p>
                            <p className="text-lg font-bold text-purple-600">{customerDetails.referral.code}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Referred Customers</p>
                            <p className="text-lg font-bold text-purple-600">{customerDetails.referral.referredCount}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Earnings</p>
                            <p className="text-lg font-bold text-purple-600">₹{customerDetails.referral.totalEarnings}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Orders */}
                  {customerDetails.recentOrders.length > 0 && (
                    <div>
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Recent Orders</h5>
                      <div className="space-y-3">
                        {customerDetails.recentOrders.map((order) => (
                          <div key={order._id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Package className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-800">#{order.orderNumber}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(order.date).toLocaleDateString('en-IN')} • {order.serviceCount} service(s)
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-800">₹{order.total.toLocaleString()}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Favorite Services */}
                  {customerDetails.favoriteServices.length > 0 && (
                    <div>
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Favorite Services</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {customerDetails.favoriteServices.map((service, index) => (
                          <div key={index} className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-blue-500" />
                              <span className="font-medium text-gray-800">{service.name}</span>
                            </div>
                            <span className="text-sm font-bold text-blue-600">{service.orderCount}x</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Saved Addresses */}
                  {customerDetails.addresses.length > 0 && (
                    <div>
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Saved Addresses</h5>
                      <div className="space-y-3">
                        {customerDetails.addresses.map((address) => (
                          <div key={address._id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-gray-800">{address.addressLine1}</p>
                                  {address.isDefault && (
                                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">Default</span>
                                  )}
                                </div>
                                {address.addressLine2 && (
                                  <p className="text-sm text-gray-600">{address.addressLine2}</p>
                                )}
                                <p className="text-sm text-gray-600">
                                  {address.city}, {address.state} - {address.pincode}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div>
                    <h5 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h5>
                    <div className="flex flex-wrap gap-3">
                      {canUpdate && (
                        <Button 
                          variant="outline"
                          className={selectedCustomer.isActive ? "text-red-600 border-red-600 hover:bg-red-50" : "text-green-600 border-green-600 hover:bg-green-50"}
                          onClick={() => {
                            handleToggleStatus(selectedCustomer._id, selectedCustomer.name, selectedCustomer.isActive)
                            setShowProfileModal(false)
                          }}
                        >
                          {selectedCustomer.isActive ? (
                            <>
                              <UserX className="w-4 h-4 mr-2" />
                              Deactivate Account
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Activate Account
                            </>
                          )}
                        </Button>
                      )}
                      
                      {canUpdate && (
                        <Button 
                          variant="outline"
                          className={selectedCustomer.isVIP ? "text-gray-600 border-gray-600 hover:bg-gray-50" : "text-yellow-600 border-yellow-600 hover:bg-yellow-50"}
                          onClick={() => {
                            handleToggleVIP(selectedCustomer._id, selectedCustomer.name, selectedCustomer.isVIP)
                            setShowProfileModal(false)
                          }}
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          {selectedCustomer.isVIP ? 'Remove VIP Status' : 'Make VIP Customer'}
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Failed to load customer details</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
              <Button variant="outline" onClick={() => {
                setShowProfileModal(false)
                setCustomerDetails(null)
              }}>
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
