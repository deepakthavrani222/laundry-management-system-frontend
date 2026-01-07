'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/Pagination'
import { formatOrderNumber } from '@/utils/orderUtils'
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Eye,
  RotateCcw,
  Star,
  Calendar,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react'
import { useOrders } from '@/hooks/useOrders'

const ITEMS_PER_PAGE = 8

const statusConfig: Record<string, { color: string; icon: any; text: string }> = {
  placed: { color: 'text-blue-600 bg-blue-50', icon: Package, text: 'Placed' },
  assigned_to_branch: { color: 'text-indigo-600 bg-indigo-50', icon: Package, text: 'Assigned' },
  assigned_to_logistics_pickup: { color: 'text-cyan-600 bg-cyan-50', icon: Truck, text: 'Pickup Scheduled' },
  picked: { color: 'text-yellow-600 bg-yellow-50', icon: Truck, text: 'Picked Up' },
  in_process: { color: 'text-orange-600 bg-orange-50', icon: Clock, text: 'In Progress' },
  ready: { color: 'text-purple-600 bg-purple-50', icon: CheckCircle, text: 'Ready' },
  assigned_to_logistics_delivery: { color: 'text-teal-600 bg-teal-50', icon: Truck, text: 'Out for Delivery' },
  out_for_delivery: { color: 'text-teal-600 bg-teal-50', icon: Truck, text: 'Out for Delivery' },
  delivered: { color: 'text-green-600 bg-green-50', icon: CheckCircle, text: 'Delivered' },
  cancelled: { color: 'text-red-600 bg-red-50', icon: AlertCircle, text: 'Cancelled' },
}

export default function OrdersPage() {
  const searchParams = useSearchParams()
  const { orders, loading, fetchOrders } = useOrders()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Read search query from URL on mount
  useEffect(() => {
    const searchFromUrl = searchParams.get('search')
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl)
    }
  }, [searchParams])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order._id?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status]
    return config ? config.icon : Package
  }

  const getStatusColor = (status: string) => {
    const config = statusConfig[status]
    return config ? config.color : 'text-gray-600 bg-gray-50'
  }

  const getStatusText = (status: string) => {
    const config = statusConfig[status]
    return config ? config.text : status
  }

  const canCancel = (status: string) => {
    return ['placed', 'assigned_to_branch', 'assigned_to_logistics_pickup'].includes(status)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
            <p className="text-gray-600">Track and manage your laundry orders</p>
          </div>
          <Link href="/customer/orders/new">
            <Button className="bg-teal-500 hover:bg-teal-600 text-white">
              <Plus className="w-5 h-5 mr-2" />
              New Order
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              <option value="placed">Placed</option>
              <option value="picked">Picked Up</option>
              <option value="in_process">In Progress</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Start by creating your first order'
              }
            </p>
            <Link href="/customer/orders/new">
              <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                <Plus className="w-5 h-5 mr-2" />
                Create Order
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedOrders.map((order) => {
              const StatusIcon = getStatusIcon(order.status)
              return (
                <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800">{formatOrderNumber(order.orderNumber)}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center">
                            <Package className="w-4 h-4 mr-1" />
                            {order.items?.length || 0} items
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-gray-800">
                        ₹{order.pricing?.total || 0}
                      </span>
                      <div className="flex gap-2">
                        <Link href={`/customer/orders/${order._id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        {order.status === 'delivered' && !order.rating?.score && (
                          <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white">
                            <Star className="w-4 h-4 mr-1" />
                            Rate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {/* Pagination */}
            {filteredOrders.length > ITEMS_PER_PAGE && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <Pagination
                  current={currentPage}
                  pages={totalPages}
                  total={filteredOrders.length}
                  limit={ITEMS_PER_PAGE}
                  onPageChange={handlePageChange}
                  itemName="orders"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
