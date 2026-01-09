'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  CheckCircle, 
  Clock, 
  Truck, 
  Package, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  CreditCard,
  Star,
  AlertCircle,
  ArrowLeft,
  Download,
  MessageCircle,
  RotateCcw,
  X,
  Loader2,
  Home,
  Gift,
  Tag,
  Wallet
} from 'lucide-react'
import { customerAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import QRCodeDisplay from '@/components/QRCodeDisplay'

interface OrderDetails {
  _id: string
  orderNumber: string
  status: string
  customer: any
  branch: any
  pickupAddress: any
  deliveryAddress: any
  pickupDate: string
  pickupTimeSlot: string
  estimatedDeliveryDate: string
  actualDeliveryDate?: string
  items: any[]
  pricing: any
  deliveryDetails?: {
    distance?: number
    deliveryCharge?: number
    isFallbackPricing?: boolean
    calculatedAt?: string
  }
  paymentMethod: string
  paymentStatus: string
  isExpress: boolean
  specialInstructions?: string
  rating?: {
    score: number
    feedback: string
    ratedAt: string
  }
  statusHistory: any[]
  createdAt: string
  updatedAt: string
}

const statusConfig = {
  placed: { 
    label: 'Order Placed', 
    color: 'blue', 
    icon: CheckCircle,
    description: 'Your order has been placed successfully'
  },
  assigned_to_branch: { 
    label: 'Assigned to Branch', 
    color: 'indigo', 
    icon: Package,
    description: 'Order assigned to processing facility'
  },
  assigned_to_logistics_pickup: { 
    label: 'Pickup Scheduled', 
    color: 'purple', 
    icon: Truck,
    description: 'Pickup has been scheduled'
  },
  picked: { 
    label: 'Picked Up', 
    color: 'yellow', 
    icon: Package,
    description: 'Items have been collected'
  },
  in_process: { 
    label: 'In Process', 
    color: 'orange', 
    icon: Clock,
    description: 'Items are being processed'
  },
  ready: { 
    label: 'Ready for Delivery', 
    color: 'cyan', 
    icon: CheckCircle,
    description: 'Items are ready for delivery'
  },
  assigned_to_logistics_delivery: { 
    label: 'Out for Delivery', 
    color: 'green', 
    icon: Truck,
    description: 'Items are out for delivery'
  },
  out_for_delivery: { 
    label: 'Out for Delivery', 
    color: 'green', 
    icon: Truck,
    description: 'Items are out for delivery'
  },
  delivered: { 
    label: 'Delivered', 
    color: 'emerald', 
    icon: CheckCircle,
    description: 'Order has been delivered successfully'
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'red', 
    icon: X,
    description: 'Order has been cancelled'
  }
}

export default function OrderDetailsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const orderId = params.orderId as string
  const isSuccess = searchParams.get('success') === 'true'

  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')
  const [submittingRating, setSubmittingRating] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await customerAPI.getOrder(orderId)
      setOrder(response.data.data.order)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching order details:', err)
      setError(err.response?.data?.message || 'Failed to fetch order details')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    try {
      setCancelling(true)
      await customerAPI.cancelOrder(orderId, cancelReason)
      toast.success('Order cancelled successfully')
      setShowCancelModal(false)
      fetchOrderDetails() // Refresh order details
    } catch (err: any) {
      console.error('Error cancelling order:', err)
      toast.error(err.response?.data?.message || 'Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  const handleRateOrder = async () => {
    try {
      setSubmittingRating(true)
      await customerAPI.rateOrder(orderId, rating, feedback)
      toast.success('Thank you for your feedback!')
      setShowRatingModal(false)
      fetchOrderDetails() // Refresh to show rating
    } catch (err: any) {
      console.error('Error rating order:', err)
      toast.error(err.response?.data?.message || 'Failed to submit rating')
    } finally {
      setSubmittingRating(false)
    }
  }

  const handleReorder = async () => {
    try {
      const response = await customerAPI.reorder(orderId)
      const reorderData = response.data.data.reorderData
      
      // Redirect to new order page with reorder data
      const params = new URLSearchParams({
        reorder: 'true',
        originalOrder: orderId
      })
      
      window.location.href = `/customer/orders/new?${params.toString()}`
    } catch (err: any) {
      console.error('Error reordering:', err)
      toast.error(err.response?.data?.message || 'Failed to reorder')
    }
  }

  const canCancelOrder = () => {
    if (!order) return false
    const cancellableStatuses = ['placed', 'assigned_to_branch', 'assigned_to_logistics_pickup']
    return cancellableStatuses.includes(order.status)
  }

  const canRateOrder = () => {
    return order?.status === 'delivered' && !order.rating
  }

  const getStatusColor = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    return config?.color || 'gray'
  }

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    return config?.icon || Clock
  }

  const getStatusLabel = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    return config?.label || status
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The order you are looking for does not exist.'}</p>
          <Link href="/customer/dashboard">
            <Button className="bg-teal-500 hover:bg-teal-600 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const StatusIcon = getStatusIcon(order.status)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <Link href="/customer/dashboard">
                <Button variant="outline" size="sm" className="flex-shrink-0">
                  <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                  Back
                </Button>
              </Link>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Order</h1>
                <p className="text-sm sm:text-base text-gray-600 font-medium break-all">#{order.orderNumber}</p>
                <p className="text-xs sm:text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {canCancelOrder() && (
                <Button
                  variant="outline"
                  onClick={() => setShowCancelModal(true)}
                  className="border-red-300 text-red-600 hover:bg-red-50 text-sm"
                  size="sm"
                >
                  <X className="w-4 h-4 mr-1 sm:mr-2" />
                  Cancel
                </Button>
              )}
              
              {order.status === 'delivered' && (
                <Button
                  variant="outline"
                  onClick={handleReorder}
                  className="border-teal-500 text-teal-600 hover:bg-teal-50 text-sm"
                  size="sm"
                >
                  <RotateCcw className="w-4 h-4 mr-1 sm:mr-2" />
                  Reorder
                </Button>
              )}
              
              {canRateOrder() && (
                <Button
                  onClick={() => setShowRatingModal(true)}
                  className="bg-teal-500 hover:bg-teal-600 text-white text-sm"
                  size="sm"
                >
                  <Star className="w-4 h-4 mr-1 sm:mr-2" />
                  Rate
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Success Message */}
            {isSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">Order Placed Successfully!</h3>
                    <p className="text-green-700">
                      Your order has been placed and you will receive updates via email and SMS.
                    </p>
                  </div>
                </div>
                
                {/* QR Code in Success Banner */}
                <div className="mt-4 pt-4 border-t border-green-200">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <QRCodeDisplay 
                      data={`${typeof window !== 'undefined' ? window.location.origin : ''}/track/${order.orderNumber}`}
                      orderNumber={order.orderNumber}
                      size={120}
                      showPrint={false}
                    />
                    <div className="text-center sm:text-left">
                      <p className="text-sm font-medium text-green-800">Save this QR Code</p>
                      <p className="text-xs text-green-600">Scan anytime to track your order</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Status</h2>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${getStatusColor(order.status)}-100`}>
                  <StatusIcon className={`w-6 h-6 text-${getStatusColor(order.status)}-600`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{getStatusLabel(order.status)}</h3>
                  <p className="text-gray-600">
                    {statusConfig[order.status as keyof typeof statusConfig]?.description}
                  </p>
                  {order.estimatedDeliveryDate && order.status !== 'delivered' && (
                    <p className="text-sm text-gray-500 mt-1">
                      Estimated delivery: {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                    </p>
                  )}
                  {order.actualDeliveryDate && (
                    <p className="text-sm text-green-600 mt-1">
                      Delivered on: {new Date(order.actualDeliveryDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">Order Timeline</h4>
                <div className="space-y-3">
                  {order.statusHistory.map((status, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">
                            {getStatusLabel(status.status)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(status.updatedAt).toLocaleString()}
                          </span>
                        </div>
                        {status.notes && (
                          <p className="text-sm text-gray-600 mt-1">{status.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Items</h2>
              
              <div className="space-y-4">
                {order.items.map((item, index) => {
                  // Extract clean item name from format like "Kota101 Chamko Saree Mji5owds"
                  const rawName = item.itemType || item.name || 'Item'
                  const words = rawName.split(' ')
                  
                  // Filter out words that look like IDs (contain both letters and numbers)
                  const cleanWords = words.filter((word: string) => {
                    // Keep word if it's purely alphabetic (no numbers mixed in)
                    const hasLetters = /[a-zA-Z]/.test(word)
                    const hasNumbers = /\d/.test(word)
                    // Remove if it has both letters AND numbers (like Kota101, Mji5owds)
                    return !(hasLetters && hasNumbers)
                  })
                  
                  const cleanItemName = cleanWords.length > 0 
                    ? cleanWords.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
                    : rawName.replace(/_/g, ' ')
                  
                  return (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{cleanItemName}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>Service: {(item.service || '').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
                        <span>Category: {(item.category || '').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                      {item.specialInstructions && (
                        <p className="text-sm text-gray-500 mt-1">Note: {item.specialInstructions}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">₹{item.totalPrice}</p>
                      <p className="text-sm text-gray-500">₹{item.unitPrice} each</p>
                    </div>
                  </div>
                  )
                })}
              </div>

              {order.specialInstructions && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Special Instructions</h4>
                  <p className="text-gray-600">{order.specialInstructions}</p>
                </div>
              )}
            </div>

            {/* Addresses */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Addresses</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {order.pickupAddress && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                    <Home className="w-4 h-4 mr-2" />
                    Pickup Address
                  </h4>
                  <div className="text-gray-600">
                    <p className="font-medium">{order.pickupAddress?.name || 'N/A'}</p>
                    <p>{order.pickupAddress?.addressLine1 || ''}</p>
                    {order.pickupAddress?.addressLine2 && <p>{order.pickupAddress.addressLine2}</p>}
                    <p>{order.pickupAddress?.city || ''}{order.pickupAddress?.pincode ? `, ${order.pickupAddress.pincode}` : ''}</p>
                    {order.pickupAddress?.phone && (
                    <p className="flex items-center mt-2">
                      <Phone className="w-4 h-4 mr-1" />
                      {order.pickupAddress.phone}
                    </p>
                    )}
                  </div>
                </div>
                )}
                
                {order.deliveryAddress && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                    <Truck className="w-4 h-4 mr-2" />
                    Delivery Address
                  </h4>
                  <div className="text-gray-600">
                    <p className="font-medium">{order.deliveryAddress?.name || 'N/A'}</p>
                    <p>{order.deliveryAddress?.addressLine1 || ''}</p>
                    {order.deliveryAddress?.addressLine2 && <p>{order.deliveryAddress.addressLine2}</p>}
                    <p>{order.deliveryAddress?.city || ''}{order.deliveryAddress?.pincode ? `, ${order.deliveryAddress.pincode}` : ''}</p>
                    {order.deliveryAddress?.phone && (
                    <p className="flex items-center mt-2">
                      <Phone className="w-4 h-4 mr-1" />
                      {order.deliveryAddress.phone}
                    </p>
                    )}
                  </div>
                </div>
                )}

                {!order.pickupAddress && !order.deliveryAddress && (
                  <div className="col-span-2 text-center text-gray-500 py-4">
                    <p>Self drop-off / Self pickup order - No address required</p>
                  </div>
                )}
              </div>
            </div>

            {/* Rating Display */}
            {order.rating && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Rating</h2>
                <div className="flex items-start space-x-4">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= order.rating!.score
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 font-medium text-gray-800">{order.rating.score}/5</span>
                  </div>
                </div>
                {order.rating.feedback && (
                  <p className="text-gray-600 mt-3">{order.rating.feedback}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Rated on {new Date(order.rating.ratedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{order.pricing.subtotal}</span>
                </div>
                
                {order.isExpress && order.pricing.expressCharge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Express Charge</span>
                    <span className="font-medium">₹{order.pricing.expressCharge}</span>
                  </div>
                )}
                
                {order.pricing.deliveryCharge > 0 && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Delivery Charge</span>
                      {order.deliveryDetails?.distance && (
                        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                          {order.deliveryDetails.distance} km
                        </span>
                      )}
                    </div>
                    <span className="font-medium">₹{order.pricing.deliveryCharge}</span>
                  </div>
                )}
                
                {order.pricing.deliveryCharge === 0 && order.deliveryDetails?.distance && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Delivery</span>
                      <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                        {order.deliveryDetails.distance} km
                      </span>
                    </div>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                )}
                
                {/* Promotional Savings Section */}
                {(order.pricing.discount > 0 || (order as any).loyaltyPointsRedeemed || (order as any).walletAmountUsed) && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                      <Gift className="w-4 h-4" />
                      Savings Applied
                    </p>
                    
                    {order.pricing.discount > 0 && (
                      <div className="flex justify-between text-green-600 text-sm">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {(order as any).couponCode ? `Coupon (${(order as any).couponCode})` : 'Discount'}
                        </span>
                        <span className="font-medium">-₹{order.pricing.discount}</span>
                      </div>
                    )}
                    
                    {(order as any).loyaltyPointsRedeemed > 0 && (
                      <div className="flex justify-between text-purple-600 text-sm mt-1">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Loyalty Points ({(order as any).loyaltyPointsRedeemed} pts)
                        </span>
                        <span className="font-medium">-₹{(order as any).loyaltyPointsRedeemed}</span>
                      </div>
                    )}
                    
                    {(order as any).walletAmountUsed > 0 && (
                      <div className="flex justify-between text-blue-600 text-sm mt-1">
                        <span className="flex items-center gap-1">
                          <Wallet className="w-3 h-3" />
                          Wallet Payment
                        </span>
                        <span className="font-medium">-₹{(order as any).walletAmountUsed}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-green-700 font-medium text-sm mt-2 pt-2 border-t border-green-100">
                      <span>Total Savings</span>
                      <span>₹{order.pricing.discount + ((order as any).loyaltyPointsRedeemed || 0) + ((order as any).walletAmountUsed || 0)}</span>
                    </div>
                  </div>
                )}
                
                {order.pricing.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18%)</span>
                    <span className="font-medium">₹{order.pricing.tax}</span>
                  </div>
                )}
                
                <hr className="my-3" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-teal-600">₹{order.pricing.total}</span>
                </div>
                
                {/* Loyalty Points Earned */}
                {(order as any).loyaltyPointsEarned > 0 && order.status === 'delivered' && (
                  <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-purple-700 flex items-center gap-1">
                        <Star className="w-4 h-4 fill-purple-600" />
                        Points Earned
                      </span>
                      <span className="font-bold text-purple-700">+{(order as any).loyaltyPointsEarned} pts</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Details</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID</span>
                  <span className="font-medium">{order.orderNumber}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Pickup Date</span>
                  <span className="font-medium">{new Date(order.pickupDate).toLocaleDateString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Slot</span>
                  <span className="font-medium">{order.pickupTimeSlot}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium">
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`font-medium ${
                    order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </span>
                </div>
                
                {order.isExpress && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Type</span>
                    <span className="font-medium text-orange-600">Express</span>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code for Order */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Order QR Code</h3>
              <div className="flex justify-center">
                <QRCodeDisplay 
                  data={`${typeof window !== 'undefined' ? window.location.origin : ''}/track/${order.orderNumber}`}
                  orderNumber={order.orderNumber}
                  size={160}
                />
              </div>
            </div>

            {/* Support */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Need Help?</h3>
              
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat with Support
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Support
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Rate Your Experience</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How was your experience?
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback (Optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us about your experience..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={3}
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={handleRateOrder}
                disabled={submittingRating}
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
              >
                {submittingRating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Rating'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRatingModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Cancel Order</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation (Optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please let us know why you're cancelling..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Order'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCancelModal(false)}
                className="flex-1"
              >
                Keep Order
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}