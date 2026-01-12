'use client'


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
import { useState, useEffect, useCallback, useRef } from 'react'
import { X, MapPin, Sparkles, Package, Calendar, Clock, ChevronRight, ChevronLeft, Loader2, Check, Minus, Plus, Phone, CreditCard, Truck, CheckCircle, Building2, Home, Tag, Star, Wallet, Gift, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { formatOrderNumber } from '@/utils/orderUtils'
import { useLoyaltyBalance } from '@/hooks/useLoyalty'
import { useWalletBalance } from '@/hooks/useWallet'
import { useApplicableDiscounts } from '@/hooks/useDiscounts'
import JsBarcode from 'jsbarcode'

interface Branch {
  _id: string
  name: string
  code: string
  address: {
    street?: string
    city?: string
    pincode?: string
    addressLine1?: string
  }
  contact?: { phone?: string }
  phone?: string
  rating?: {
    average: number
    count: number
  }
}

interface Service {
  _id: string
  name: string
  code: string
  displayName: string
  description: string
  turnaroundTime: { standard: number; express: number }
}

interface ServiceItem {
  id: string
  name: string
  basePrice: number
  category: string
}

interface Address {
  _id: string
  name: string
  phone: string
  addressLine1: string
  addressLine2?: string
  landmark?: string
  city: string
  pincode: string
  isDefault: boolean
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginRequired: () => void
  tenantBranches?: Branch[]
  tenancyId?: string
  tenantBranding?: {
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
  }
}

const STEPS = [
  { id: 1, title: 'Service Type', icon: Truck },
  { id: 2, title: 'Service', icon: Sparkles },
  { id: 3, title: 'Items', icon: Package },
  { id: 4, title: 'Address', icon: MapPin },
  { id: 5, title: 'Schedule', icon: Calendar },
  { id: 6, title: 'Payment', icon: CreditCard },
  { id: 7, title: 'Confirm', icon: Check },
]

// Service type options for self drop-off / self pickup
const SERVICE_TYPES = [
  { id: 'full_service', title: 'Full Service', subtitle: 'Home Pickup + Home Delivery', icon: 'truck', discount: 0 },
  { id: 'self_drop_self_pickup', title: 'Self Drop & Pickup', subtitle: 'Drop & Pickup at Branch', icon: 'building', discount: 50, discountLabel: 'Save upto ₹50' },
  { id: 'self_drop_home_delivery', title: 'Self Drop + Delivery', subtitle: 'Drop at Branch + Home Delivery', icon: 'home', discount: 25, discountLabel: 'Save upto ₹25' },
  { id: 'home_pickup_self_pickup', title: 'Pickup + Self Collect', subtitle: 'Home Pickup + Collect from Branch', icon: 'package', discount: 25, discountLabel: 'Save upto ₹25' },
]

export default function BookingModal({ isOpen, onClose, onLoginRequired, tenantBranches, tenancyId, tenantBranding }: BookingModalProps) {
  const { isAuthenticated, user, token } = useAuthStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [servicesLoading, setServicesLoading] = useState(false) // Separate loading for services (doesn't affect branch selection UI)
  const [submitting, setSubmitting] = useState(false)
  
  // Tenant branding state - use prop if provided, otherwise fetch
  const [brandingColors, setBrandingColors] = useState<{
    primaryColor: string
    secondaryColor: string
    accentColor: string
  }>({
    primaryColor: tenantBranding?.primaryColor || '#14b8a6', // Default teal
    secondaryColor: tenantBranding?.secondaryColor || '#0d9488',
    accentColor: tenantBranding?.accentColor || '#2dd4bf'
  })
  
  // Data states
  const [services, setServices] = useState<Service[]>([])
  const [serviceItems, setServiceItems] = useState<Record<string, ServiceItem[]>>({})
  const [addresses, setAddresses] = useState<Address[]>([])
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  
  // Selection states
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [items, setItems] = useState<Record<string, number>>({})
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('cod')
  const [specialInstructions, setSpecialInstructions] = useState('')
  
  // Tenant booking logic
  const isTenantBooking = !!tenantBranches && tenantBranches.length > 0
  
  // Service type state (self drop-off / self pickup)
  const [serviceType, setServiceType] = useState<'full_service' | 'self_drop_self_pickup' | 'self_drop_home_delivery' | 'home_pickup_self_pickup'>('full_service')
  
  // Helper functions for service type
  const needsPickupAddress = serviceType === 'full_service' || serviceType === 'home_pickup_self_pickup'
  const needsDeliveryAddress = serviceType === 'full_service' || serviceType === 'self_drop_home_delivery'
  const getServiceTypeDiscount = () => SERVICE_TYPES.find(s => s.id === serviceType)?.discount || 0
  
  // Coupon states
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [couponError, setCouponError] = useState('')
  
  // Promotional features
  const { balance: loyaltyBalance } = useLoyaltyBalance()
  const { balance: walletBalance } = useWalletBalance()
  const { getDiscounts } = useApplicableDiscounts()
  const [applicableDiscounts, setApplicableDiscounts] = useState<any[]>([])
  const [totalAutoDiscount, setTotalAutoDiscount] = useState(0)
  const [pointsToEarn, setPointsToEarn] = useState(0)
  const [useWallet, setUseWallet] = useState(false)
  const [walletAmountUsed, setWalletAmountUsed] = useState(0)
  const [redeemPoints, setRedeemPoints] = useState(false)
  const [pointsToRedeem, setPointsToRedeem] = useState(0)
  const [pointsRedemptionValue, setPointsRedemptionValue] = useState(0)
  
  // Order states
  const [isExpress, setIsExpress] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<any>(null)
  const [calculatedPricing, setCalculatedPricing] = useState<any>(null)
  const [deliveryInfo, setDeliveryInfo] = useState<any>(null)
  
  // Address form
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    name: '', phone: '', addressLine1: '', landmark: '', city: '', pincode: ''
  })

  // Fetch branch ratings
  const fetchBranchRatings = async (branchList: Branch[]) => {
    const branchesWithRatings = await Promise.all(
      branchList.map(async (branch: Branch) => {
        try {
          const ratingRes = await fetch(`${API_URL}/public/tenancy/reviews/branch/${branch._id}/stats`)
          const ratingData = await ratingRes.json()
          if (ratingData.success) {
            return {
              ...branch,
              rating: {
                average: ratingData.data.avgOverall || 0,
                count: ratingData.data.totalReviews || 0
              }
            }
          }
        } catch (e) {
          // Ignore rating fetch errors
        }
        return branch
      })
    )
    return branchesWithRatings
  }

  // Fetch branches on mount OR use tenant branches
  useEffect(() => {
    if (isOpen) {
      // Fetch tenant branding colors only if not provided as prop
      if (!tenantBranding) {
        fetchTenantBranding()
      }
      
      if (isTenantBooking && tenantBranches) {
        // Use tenant's branches and fetch ratings
        fetchBranchRatings(tenantBranches).then(branchesWithRatings => {
          setBranches(branchesWithRatings)
          // If only one branch, auto-select it and skip to step 2
          if (branchesWithRatings.length === 1) {
            setSelectedBranch(branchesWithRatings[0])
            setStep(2) // Skip branch selection
          }
        })
      } else {
        fetchBranches()
      }
      if (isAuthenticated) {
        fetchAddresses()
        fetchTimeSlots()
      }
    }
  }, [isOpen, isAuthenticated, isTenantBooking, tenantBranches, tenantBranding])

  // Update new address with user info when authenticated
  useEffect(() => {
    if (user) {
      setNewAddress(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || ''
      }))
    }
  }, [user])

  // Fetch services when branch is selected
  useEffect(() => {
    if (selectedBranch) {
      fetchServices(selectedBranch._id)
      fetchServiceItems(selectedBranch._id)
    }
  }, [selectedBranch])

  // Calculate pricing when items change
  useEffect(() => {
    if (Object.values(items).some(qty => qty > 0) && selectedService) {
      calculatePrice()
    } else {
      setCalculatedPricing(null)
    }
  }, [items, selectedService, isExpress])
  
  // Fetch applicable discounts when price changes
  useEffect(() => {
    if (step === 7 && getTotalPrice() > 0) {
      fetchApplicableDiscounts()
      calculateLoyaltyPoints()
    }
  }, [step, items, isExpress, deliveryInfo])

  // Calculate delivery when address and branch selected
  useEffect(() => {
    // Skip delivery calculation for self drop & self pickup
    if (serviceType === 'self_drop_self_pickup') {
      setDeliveryInfo(null)
      return
    }
    
    if (selectedBranch && selectedAddressId && addresses.length > 0) {
      calculateDelivery()
    }
  }, [selectedBranch, selectedAddressId, addresses, isExpress, serviceType])

  const fetchTenantBranding = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/tenancy/branding`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success && data.data?.branding?.theme) {
        const theme = data.data.branding.theme
        setBrandingColors({
          primaryColor: theme.primaryColor || '#14b8a6',
          secondaryColor: theme.secondaryColor || '#0d9488',
          accentColor: theme.accentColor || '#2dd4bf'
        })
      }
    } catch (error) {
      console.error('Failed to fetch tenant branding:', error)
      // Keep default teal colors
    }
  }

  // Helper function to create gradient style
  const getGradientStyle = () => ({
    background: `linear-gradient(to right, ${brandingColors.primaryColor}, ${brandingColors.accentColor})`
  })

  // Helper function to get color with opacity
  const getColorWithOpacity = (color: string, opacity: number) => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  // Ref for barcode canvas
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null)

  // Generate real scannable barcode when order is created
  useEffect(() => {
    if (createdOrder && createdOrder.orderNumber && barcodeCanvasRef.current) {
      try {
        const orderNum = createdOrder.orderNumber || createdOrder._id || '';
        // Generate Code 128 barcode (industry standard)
        JsBarcode(barcodeCanvasRef.current, orderNum, {
          format: 'CODE128',
          width: 2,
          height: 60,
          displayValue: true,
          fontSize: 14,
          margin: 10,
          background: '#ffffff',
          lineColor: '#000000'
        })
      } catch (error) {
        console.error('Barcode generation failed:', error)
      }
    }
  }, [createdOrder])

  // Helper function to get theme-based styles
  const getThemeStyles = () => ({
    primary: { color: brandingColors.primaryColor },
    primaryBg: { backgroundColor: brandingColors.primaryColor },
    primaryBgLight: { backgroundColor: getColorWithOpacity(brandingColors.primaryColor, 0.1) },
    primaryBorder: { borderColor: brandingColors.primaryColor },
    secondary: { color: brandingColors.secondaryColor },
    secondaryBg: { backgroundColor: brandingColors.secondaryColor },
    accent: { color: brandingColors.accentColor },
  })

  const fetchBranches = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/services/branches`)
      const data = await response.json()
      if (data.success) {
        const branchList = data.data.branches || []
        // Fetch ratings for each branch
        const branchesWithRatings = await Promise.all(
          branchList.map(async (branch: Branch) => {
            try {
              const ratingRes = await fetch(`${API_URL}/public/tenancy/reviews/branch/${branch._id}/stats`)
              const ratingData = await ratingRes.json()
              if (ratingData.success) {
                return {
                  ...branch,
                  rating: {
                    average: ratingData.data.avgOverall || 0,
                    count: ratingData.data.totalReviews || 0
                  }
                }
              }
            } catch (e) {
              // Ignore rating fetch errors
            }
            return branch
          })
        )
        setBranches(branchesWithRatings)
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchServices = async (branchId: string) => {
    try {
      setServicesLoading(true) // Use separate loading state - doesn't affect branch selection UI
      const response = await fetch(`${API_URL}/branches/${branchId}/services/enabled`)
      const data = await response.json()
      if (data.success) setServices(data.data.services || [])
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setServicesLoading(false)
    }
  }

  const fetchServiceItems = async (branchId: string) => {
    try {
      const response = await fetch(`${API_URL}/service-items/branch/${branchId}`)
      const data = await response.json()
      if (data.success) setServiceItems(data.data || {})
    } catch (error) {
      console.error('Failed to fetch items:', error)
    }
  }

  const fetchAddresses = async () => {
    try {
      const response = await fetch(`${API_URL}/customer/addresses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        const addrs = data.data.addresses || []
        setAddresses(addrs)
        const defaultAddr = addrs.find((a: Address) => a.isDefault) || addrs[0]
        if (defaultAddr) setSelectedAddressId(defaultAddr._id)
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error)
    }
  }

  const fetchTimeSlots = async () => {
    try {
      const response = await fetch(`${API_URL}/services/time-slots`)
      const data = await response.json()
      if (data.success) setTimeSlots(data.data.timeSlots || [])
    } catch (error) {
      setTimeSlots(['09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00', '17:00-19:00'])
    }
  }

  const calculatePrice = async () => {
    const orderItems = Object.entries(items)
      .filter(([_, qty]) => qty > 0)
      .map(([itemId, qty]) => ({
        itemType: itemId,
        service: selectedService?.code || '',
        category: 'normal',
        quantity: qty
      }))
    
    if (orderItems.length === 0) return
    
    try {
      const response = await fetch(`${API_URL}/services/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: orderItems, isExpress })
      })
      const data = await response.json()
      if (data.success) setCalculatedPricing(data.data)
    } catch (error) {
      console.error('Failed to calculate pricing:', error)
    }
  }

  const calculateDelivery = async () => {
    const selectedAddress = addresses.find(a => a._id === selectedAddressId)
    if (!selectedAddress || !selectedBranch) return
    
    try {
      const response = await fetch(`${API_URL}/delivery/calculate-distance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupAddress: {
            addressLine1: selectedAddress.addressLine1,
            city: selectedAddress.city,
            pincode: selectedAddress.pincode
          },
          branchId: selectedBranch._id,
          isExpress
        })
      })
      const data = await response.json()
      if (data.success) setDeliveryInfo(data.data)
    } catch (error) {
      console.error('Failed to calculate delivery:', error)
    }
  }

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }
    
    setCouponLoading(true)
    setCouponError('')
    
    try {
      const orderValue = getTotalPrice() + (deliveryInfo?.deliveryCharge || 0)
      const response = await fetch(`${API_URL}/customer/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
          orderValue,
          tenancyId
        })
      })
      const data = await response.json()
      
      if (data.success) {
        setAppliedCoupon(data.data)
        setCouponError('')
        toast.success(`Coupon applied! You save ₹${data.data.discount}`)
      } else {
        setCouponError(data.message || 'Invalid coupon code')
        setAppliedCoupon(null)
      }
    } catch (error) {
      setCouponError('Failed to validate coupon')
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }
  
  const fetchApplicableDiscounts = async () => {
    const orderValue = getTotalPrice() + (deliveryInfo?.deliveryCharge || 0)
    const result = await getDiscounts({
      orderValue,
      serviceType: selectedService?.code,
      items: Object.entries(items).map(([itemId, qty]) => ({
        itemId,
        quantity: qty
      }))
    })
    if (result.success) {
      setApplicableDiscounts(result.data?.discounts || [])
      setTotalAutoDiscount(result.data?.totalDiscount || 0)
      console.log('✅ Fetched applicable discounts:', result.data)
    } else {
      console.log('❌ Failed to fetch discounts:', result)
    }
  }
  
  const calculateLoyaltyPoints = () => {
    if (!loyaltyBalance?.enrolled) return
    const orderValue = getTotalPrice() + (deliveryInfo?.deliveryCharge || 0)
    // Assuming 1% points earning rate (1 point per ₹100)
    const points = Math.floor(orderValue / 100)
    setPointsToEarn(points)
  }
  
  const handleRedeemPointsToggle = (checked: boolean) => {
    setRedeemPoints(checked)
    if (checked && loyaltyBalance?.pointsBalance) {
      // Calculate max points that can be redeemed (assuming 1 point = ₹1)
      const orderValue = getTotalPrice() + (deliveryInfo?.deliveryCharge || 0) - (appliedCoupon?.discount || 0) - totalAutoDiscount
      const maxPoints = Math.min(loyaltyBalance.pointsBalance, Math.floor(orderValue * 0.5)) // Max 50% of order
      setPointsToRedeem(maxPoints)
      setPointsRedemptionValue(maxPoints) // 1 point = ₹1
    } else {
      setPointsToRedeem(0)
      setPointsRedemptionValue(0)
    }
  }
  
  const handleWalletToggle = (checked: boolean) => {
    setUseWallet(checked)
    if (checked && walletBalance > 0) {
      const orderValue = getTotalPrice() + (deliveryInfo?.deliveryCharge || 0) - (appliedCoupon?.discount || 0) - totalAutoDiscount - pointsRedemptionValue
      const amountToUse = Math.min(walletBalance, orderValue)
      setWalletAmountUsed(amountToUse)
    } else {
      setWalletAmountUsed(0)
    }
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_URL}/customer/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...newAddress, isDefault: addresses.length === 0 })
      })
      const data = await response.json()
      if (data.success) {
        const addr = data.data.address
        setAddresses(prev => [...prev, addr])
        setSelectedAddressId(addr._id)
        setShowAddressForm(false)
        setNewAddress({ name: user?.name || '', phone: user?.phone || '', addressLine1: '', landmark: '', city: '', pincode: '' })
        toast.success('Address added!')
      }
    } catch (error) {
      toast.error('Failed to add address')
    }
  }

  const handleSubmitOrder = async () => {
    if (!isAuthenticated) {
      onLoginRequired()
      return
    }
    
    const orderItems = Object.entries(items)
      .filter(([_, qty]) => qty > 0)
      .map(([itemId, qty]) => ({
        itemType: itemId,
        service: selectedService?.code || '',
        category: 'normal',
        quantity: qty,
        specialInstructions: ''
      }))
    
    const orderData = {
      items: orderItems,
      pickupAddressId: needsPickupAddress ? selectedAddressId : undefined,
      deliveryAddressId: needsDeliveryAddress ? selectedAddressId : undefined,
      pickupDate: selectedDate,
      pickupTimeSlot: selectedTimeSlot,
      paymentMethod,
      isExpress,
      specialInstructions,
      branchId: selectedBranch?._id,
      // Service type for self drop-off / self pickup
      serviceType,
      selectedBranchId: selectedBranch?._id,
      // Tenancy ID for tenant-specific orders
      tenancyId: tenancyId,
      // Coupon code if applied
      couponCode: appliedCoupon?.coupon?.code || undefined,
      // Promotional features
      useWallet: useWallet && walletAmountUsed > 0,
      walletAmount: walletAmountUsed,
      redeemLoyaltyPoints: redeemPoints && pointsToRedeem > 0,
      loyaltyPointsRedeemed: pointsToRedeem,
      applicableDiscounts: applicableDiscounts.map(d => d._id),
      deliveryDetails: deliveryInfo ? {
        distance: deliveryInfo.distance,
        deliveryCharge: deliveryInfo.deliveryCharge,
        isFallbackPricing: deliveryInfo.isFallback
      } : undefined
    }
    
    try {
      setSubmitting(true)
      const response = await fetch(`${API_URL}/customer/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      })
      const data = await response.json()
      if (data.success) {
        setCreatedOrder(data.data.order)
        setOrderSuccess(true)
        toast.success('Order placed successfully!')
      } else {
        toast.error(data.message || 'Failed to create order')
      }
    } catch (error) {
      toast.error('Failed to create order')
    } finally {
      setSubmitting(false)
    }
  }

  const getCurrentItems = () => serviceItems[selectedService?.code || ''] || []
  
  const updateItemQuantity = (itemId: string, change: number) => {
    setItems(prev => ({ ...prev, [itemId]: Math.max(0, (prev[itemId] || 0) + change) }))
  }

  const getTotalItems = () => Object.values(items).reduce((sum, qty) => sum + qty, 0)
  
  const getTotalPrice = () => {
    const currentItems = getCurrentItems()
    let total = 0
    Object.entries(items).forEach(([itemId, qty]) => {
      const item = currentItems.find(i => i.id === itemId)
      if (item) total += item.basePrice * qty
    })
    if (isExpress) total *= 1.5
    return total
  }

  const getSelectedAddress = () => addresses.find(a => a._id === selectedAddressId)

  const canProceed = () => {
    switch (step) {
      case 1: return !!selectedBranch
      case 2: return true // Service type always has default
      case 3: return !!selectedService
      case 4: return getTotalItems() > 0
      case 5: 
        // Address requirements depend on service type
        if (serviceType === 'self_drop_self_pickup') return true
        return !!selectedAddressId && (!deliveryInfo || deliveryInfo.isServiceable)
      case 6: return !!selectedDate && !!selectedTimeSlot
      case 7: return true
      default: return false
    }
  }

  const handleNext = () => {
    if (step === 4 && !isAuthenticated) {
      onLoginRequired()
      return
    }
    if (step < 7) setStep(step + 1)
    else handleSubmitOrder()
  }

  const resetModal = () => {
    // For tenant booking with single branch, start at step 2
    if (isTenantBooking && tenantBranches && tenantBranches.length === 1) {
      setStep(2)
      setSelectedBranch(tenantBranches[0])
    } else {
      setStep(1)
      setSelectedBranch(null)
    }
    setSelectedService(null)
    setItems({})
    setSelectedAddressId('')
    setSelectedDate('')
    setSelectedTimeSlot('')
    setPaymentMethod('cod')
    setSpecialInstructions('')
    setIsExpress(false)
    setOrderSuccess(false)
    setCreatedOrder(null)
    setCalculatedPricing(null)
    setDeliveryInfo(null)
    setServiceType('full_service')
    // Reset coupon
    setCouponCode('')
    setAppliedCoupon(null)
    setCouponError('')
    // Reset promotional features
    setApplicableDiscounts([])
    setTotalAutoDiscount(0)
    setPointsToEarn(0)
    setUseWallet(false)
    setWalletAmountUsed(0)
    setRedeemPoints(false)
    setPointsToRedeem(0)
    setPointsRedemptionValue(0)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  if (!isOpen) return null

  // Success Screen
  if (orderSuccess) {
    const orderNumber = createdOrder?.orderNumber || createdOrder?._id || ''
    const displayOrderNumber = formatOrderNumber(orderNumber)
    const qrData = `${typeof window !== 'undefined' ? window.location.origin : ''}/customer/orders/${createdOrder?._id}`
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Order Placed!</h2>
            <p className="text-white/80 text-sm">Your pickup has been scheduled</p>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Order Barcode Section - Real Scannable */}
            {createdOrder && (
              <div className="flex flex-col items-center py-3 bg-white rounded-xl border-2 border-gray-200">
                <p className="text-xs text-gray-500 mb-2 font-semibold">Order Barcode</p>
                <div className="bg-white p-2">
                  <canvas ref={barcodeCanvasRef}></canvas>
                </div>
                <p className="text-xs text-gray-500 mt-2">Scan with barcode scanner or mobile app</p>
                <p className="text-xs text-gray-400">Order: {orderNumber}</p>
              </div>
            )}
            
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center text-gray-700">
                <Calendar className="w-5 h-5 mr-3" style={getThemeStyles().primary} />
                <span>{selectedDate && new Date(selectedDate).toLocaleDateString('en-IN', { 
                  day: 'numeric', month: 'short', year: 'numeric', weekday: 'long'
                })}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Clock className="w-5 h-5 mr-3" style={getThemeStyles().primary} />
                <span>{selectedTimeSlot}</span>
              </div>
              {getSelectedAddress() && (
              <div className="flex items-center text-gray-700">
                <MapPin className="w-5 h-5 mr-3" style={getThemeStyles().primary} />
                <span className="text-sm">{getSelectedAddress()?.addressLine1}, {getSelectedAddress()?.city}</span>
              </div>
              )}
            </div>
            
            {createdOrder && (
              <div className="text-center">
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-mono font-bold" style={getThemeStyles().secondary}>{displayOrderNumber}</p>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => {
                setOrderSuccess(false)
                setStep(5)
              }}>
                <Clock className="w-4 h-4 mr-2" />
                Reschedule
              </Button>
              <Button className="flex-1 bg-teal-500 hover:bg-teal-600" onClick={handleClose}
                style={getThemeStyles().primaryBg}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = brandingColors.secondaryColor}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = brandingColors.primaryColor}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl quick-book-modal"
        style={{
          '--theme-primary': brandingColors.primaryColor,
          '--theme-secondary': brandingColors.secondaryColor,
          '--theme-accent': brandingColors.accentColor,
          '--theme-primary-rgb': brandingColors.primaryColor.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', '),
        } as React.CSSProperties}
      >
        <style jsx>{`
          .quick-book-modal .theme-primary { color: var(--theme-primary) !important; }
          .quick-book-modal .theme-primary-bg { background-color: var(--theme-primary) !important; }
          .quick-book-modal .theme-primary-bg-light { background-color: rgba(var(--theme-primary-rgb), 0.1) !important; }
          .quick-book-modal .theme-primary-border { border-color: var(--theme-primary) !important; }
          .quick-book-modal .theme-secondary-bg { background-color: var(--theme-secondary) !important; }
          .quick-book-modal .theme-gradient { background: linear-gradient(to right, var(--theme-primary), var(--theme-accent)) !important; }
        `}</style>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b rounded-t-2xl theme-gradient">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: getColorWithOpacity('#ffffff', 0.2) }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Quick Book</h2>
              <p className="text-xs" style={{ color: getColorWithOpacity('#ffffff', 0.8) }}>Step {step} of 7 - {STEPS[step-1].title}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-full transition-colors" style={{ backgroundColor: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getColorWithOpacity('#ffffff', 0.2)} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 pt-3">
          <div className="flex gap-1">
            {STEPS.map((s) => (
              <div key={s.id} className={`h-1.5 flex-1 rounded-full transition-colors ${s.id <= step ? 'theme-primary-bg' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && step === 1 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={getThemeStyles().primary} />
            </div>
          ) : (
            <>
              {/* Step 1: Select Branch */}
              {step === 1 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Building2 className="w-5 h-5" style={getThemeStyles().primary} />
                    Select Branch
                  </h3>
                  <p className="text-sm text-gray-500">Choose a branch near you</p>
                  
                  {branches.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No branches available</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {branches.map((branch) => {
                        const isSelected = selectedBranch?._id === branch._id
                        return (
                          <div 
                            key={branch._id} 
                            onClick={() => setSelectedBranch(branch)}
                            className={`p-3 border-2 rounded-xl cursor-pointer transition-colors duration-150 ${
                              isSelected 
                                ? 'border-current bg-current/10' 
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            style={isSelected ? { borderColor: brandingColors.primaryColor, backgroundColor: getColorWithOpacity(brandingColors.primaryColor, 0.1) } : {}}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">{branch.name}</p>
                                <p className="text-sm text-gray-500">{branch.address?.city || branch.address?.addressLine1 || 'Location available'}</p>
                                {/* Branch Rating */}
                                {branch.rating && branch.rating.count > 0 && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <span className="text-sm font-medium text-gray-700">{branch.rating.average.toFixed(1)}</span>
                                    <span className="text-xs text-gray-400">({branch.rating.count} reviews)</span>
                                  </div>
                                )}
                                {branch.rating && branch.rating.count === 0 && (
                                  <p className="text-xs text-gray-400 mt-1">No reviews yet</p>
                                )}
                              </div>
                              <div 
                                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 ${
                                  isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                                }`}
                                style={{ backgroundColor: brandingColors.primaryColor }}
                              >
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Service Type (Self Drop-off / Self Pickup) */}
              {step === 2 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Truck className="w-5 h-5" style={getThemeStyles().primary} />
                    Service Type
                  </h3>
                  <p className="text-sm text-gray-500">How would you like pickup & delivery?</p>
                  
                  <div className="space-y-2">
                    {SERVICE_TYPES.map((type) => {
                      const IconComp = type.icon === 'truck' ? Truck : type.icon === 'building' ? Building2 : type.icon === 'home' ? Home : Package
                      return (
                        <div key={type.id} onClick={() => setServiceType(type.id as any)}
                          className="p-3 border-2 rounded-xl cursor-pointer transition-all border-gray-200 hover:border-gray-300"
                          style={serviceType === type.id ? { ...getThemeStyles().primaryBorder, ...getThemeStyles().primaryBgLight } : {}}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={getThemeStyles().primaryBgLight}>
                                <IconComp className="w-5 h-5" style={getThemeStyles().secondary} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-gray-800">{type.title}</p>
                                  {type.discount > 0 && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                      {type.discountLabel}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500">{type.subtitle}</p>
                              </div>
                            </div>
                            {serviceType === type.id && (
                              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={getThemeStyles().primaryBg}>
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {serviceType !== 'full_service' && (
                    <div className="p-3 bg-amber-50 rounded-xl text-sm text-amber-700">
                      {serviceType === 'self_drop_self_pickup' && '📍 Drop & collect your clothes at the branch. No address needed!'}
                      {serviceType === 'self_drop_home_delivery' && '📍 Drop at branch, we deliver to your home.'}
                      {serviceType === 'home_pickup_self_pickup' && '📍 We pick up from home, you collect from branch.'}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Select Service */}
              {step === 3 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" style={getThemeStyles().primary} />
                    Select Service
                  </h3>
                  <p className="text-sm text-gray-500">Choose a laundry service</p>
                  
                  {servicesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" style={getThemeStyles().primary} />
                    </div>
                  ) : services.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Sparkles className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No services available</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {services.map((service) => (
                        <div key={service._id} onClick={() => { setSelectedService(service); setItems({}) }}
                          className={`p-3 border-2 rounded-xl cursor-pointer transition-all ${
                            selectedService?._id === service._id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
                          }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-800">{service.displayName}</p>
                              <p className="text-xs text-gray-500">{service.turnaroundTime?.standard || 48}h delivery</p>
                            </div>
                            {selectedService?._id === service._id && (
                              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={getThemeStyles().primaryBg}>
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Select Items */}
              {step === 4 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Package className="w-5 h-5" style={getThemeStyles().primary} />
                    Select Items
                  </h3>
                  <p className="text-sm text-gray-500">Add items for {selectedService?.displayName}</p>
                  
                  {getCurrentItems().length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No items available for this service</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {getCurrentItems().map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-800">{item.name}</p>
                            <p className="text-sm" style={getThemeStyles().secondary}>₹{item.basePrice}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateItemQuantity(item.id, -1)}
                              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{items[item.id] || 0}</span>
                            <button 
                              onClick={() => updateItemQuantity(item.id, 1)}
                              className="w-8 h-8 rounded-full text-white flex items-center justify-center"
                              style={getThemeStyles().primaryBg}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = brandingColors.secondaryColor}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = brandingColors.primaryColor}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {getTotalItems() > 0 && (
                    <>
                      <div className="p-3 bg-orange-50 rounded-xl">
                        <label className="flex items-center justify-between cursor-pointer">
                          <div>
                            <p className="font-medium text-gray-800">Express Delivery</p>
                            <p className="text-xs text-gray-500">Get it faster (+50%)</p>
                          </div>
                          <input type="checkbox" checked={isExpress} onChange={(e) => setIsExpress(e.target.checked)}
                            className="w-5 h-5 rounded" style={{ accentColor: brandingColors.primaryColor }} />
                        </label>
                      </div>
                      <div className="p-4 rounded-xl" style={getThemeStyles().primaryBgLight}>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-600">Total ({getTotalItems()} items)</p>
                            <p className="text-2xl font-bold" style={getThemeStyles().secondary}>₹{getTotalPrice()}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 5: Address */}
              {step === 5 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-5 h-5" style={getThemeStyles().primary} />
                    {serviceType === 'self_drop_self_pickup' ? 'Branch Location' : 'Pickup Address'}
                  </h3>
                  
                  {/* Self Drop & Self Pickup - No address needed */}
                  {serviceType === 'self_drop_self_pickup' ? (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                      </div>
                      <h4 className="font-medium text-gray-800 mb-2">No Address Required!</h4>
                      <p className="text-sm text-gray-600 mb-4">Drop off and pick up at:</p>
                      <div className="p-4 rounded-xl inline-block" style={getThemeStyles().primaryBgLight}>
                        <div className="flex items-center" style={getThemeStyles().secondary}>
                          <Building2 className="w-5 h-5 mr-2" />
                          <span className="font-medium">{selectedBranch?.name}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedBranch?.address?.addressLine1 || selectedBranch?.address?.city}
                        </p>
                      </div>
                      <div className="mt-4 p-3 bg-green-50 rounded-xl">
                        <p className="text-sm text-green-700">🎉 You save ₹{getServiceTypeDiscount()} with self service!</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Service type info */}
                      {serviceType !== 'full_service' && (
                        <div className="p-3 bg-amber-50 rounded-xl text-sm text-amber-700 mb-2">
                          {serviceType === 'self_drop_home_delivery' && (
                            <>📍 Drop at <strong>{selectedBranch?.name}</strong>, we deliver to your address</>
                          )}
                          {serviceType === 'home_pickup_self_pickup' && (
                            <>📍 We pick up from your address, collect from <strong>{selectedBranch?.name}</strong></>
                          )}
                        </div>
                      )}
                      
                      {addresses.length === 0 ? (
                        <div className="text-center py-6">
                          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 mb-4">No addresses saved</p>
                          <Button 
                            onClick={() => setShowAddressForm(true)} 
                            style={getThemeStyles().primaryBg}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = brandingColors.secondaryColor}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = brandingColors.primaryColor}
                          >
                            <Plus className="w-4 h-4 mr-2" /> Add Address
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            {addresses.map((address) => (
                              <div key={address._id} onClick={() => setSelectedAddressId(address._id)}
                                className={`p-3 border-2 rounded-xl cursor-pointer transition-all ${
                                  selectedAddressId === address._id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-gray-800">{address.name}</span>
                                      {address.isDefault && (
                                        <span className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">Default</span>
                                      )}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 mb-1">
                                      <Phone className="w-3 h-3 mr-1" />{address.phone}
                                    </div>
                                    <p className="text-sm text-gray-600">{address.addressLine1}, {address.city} - {address.pincode}</p>
                                  </div>
                                  {selectedAddressId === address._id && (
                                    <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                                      <Check className="w-3 h-3 text-white" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <button onClick={() => setShowAddressForm(true)}
                            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-teal-500 hover:text-teal-600 flex items-center justify-center">
                            <Plus className="w-4 h-4 mr-2" /> Add New Address
                          </button>
                        </>
                      )}

                      {/* Delivery Info */}
                      {selectedAddressId && deliveryInfo && (
                        <div className={`p-4 rounded-xl ${deliveryInfo.isServiceable ? 'bg-teal-50' : 'bg-red-50'}`}>
                          {deliveryInfo.isServiceable ? (
                            <>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <Truck className="w-4 h-4 text-teal-600 mr-2" />
                                  <span className="font-medium text-gray-800">Delivery Charge</span>
                                </div>
                                <span className="font-bold text-teal-600">
                                  {deliveryInfo.deliveryCharge === 0 ? 'FREE' : `₹${deliveryInfo.deliveryCharge}`}
                                </span>
                              </div>
                              {deliveryInfo.distance && <p className="text-sm text-gray-600">📍 Distance: {deliveryInfo.distance} km</p>}
                              {getServiceTypeDiscount() > 0 && (
                                <p className="text-sm text-green-600 mt-1">🎉 Self service discount: ₹{getServiceTypeDiscount()}</p>
                              )}
                            </>
                          ) : (
                            <div className="text-center">
                              <p className="text-red-600 font-medium">❌ Area Not Serviceable</p>
                              <p className="text-sm text-red-500">{deliveryInfo.message}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Step 6: Schedule */}
              {step === 6 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-teal-500" />
                    Schedule Pickup
                  </h3>

                  {/* Summary */}
                  <div className="p-3 bg-gray-50 rounded-xl text-sm">
                    <div className="flex items-center text-gray-700 mb-1">
                      <Building2 className="w-4 h-4 mr-2 text-teal-500" />
                      <span>{selectedBranch?.name}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <MapPin className="w-4 h-4 mr-2 text-teal-500" />
                      <span>{getSelectedAddress()?.addressLine1}, {getSelectedAddress()?.city}</span>
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 mr-2" /> Date
                    </label>
                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      min={new Date().toISOString().split('T')[0]} />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 mr-2" /> Time Slot
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((slot) => (
                        <button key={slot} onClick={() => setSelectedTimeSlot(slot)}
                          className={`p-3 border-2 rounded-xl text-sm transition-all ${
                            selectedTimeSlot === slot ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-gray-300'
                          }`}>
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                    <textarea value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="e.g., call before pickup"
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                      rows={2} />
                  </div>
                </div>
              )}

              {/* Step 7: Payment & Confirm */}
              {step === 7 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-teal-500" />
                    Confirm Order
                  </h3>

                  {/* Order Summary */}
                  <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                    <p className="font-medium text-gray-800 mb-2">Order Summary</p>
                    {Object.entries(items).filter(([_, qty]) => qty > 0).map(([itemId, qty]) => {
                      const item = getCurrentItems().find(i => i.id === itemId)
                      return (
                        <div key={itemId} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item?.name} x {qty}</span>
                          <span className="font-medium">₹{(item?.basePrice || 0) * qty}</span>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Automatic Discounts */}
                  {applicableDiscounts.length > 0 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="w-5 h-5 text-green-600" />
                        <p className="font-medium text-green-800">Auto-Applied Discounts</p>
                      </div>
                      {applicableDiscounts.map((discount, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-green-700 mb-1">
                          <span>✓ {discount.name}</span>
                          <span className="font-medium">-₹{discount.discountAmount}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-bold text-green-800 mt-2 pt-2 border-t border-green-200">
                        <span>Total Savings</span>
                        <span>₹{totalAutoDiscount}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Loyalty Points */}
                  {loyaltyBalance?.enrolled && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-purple-600" />
                          <p className="font-medium text-purple-800">Loyalty Points</p>
                        </div>
                        <span className="text-sm text-purple-600">Balance: {loyaltyBalance.pointsBalance || 0} pts</span>
                      </div>
                      
                      {pointsToEarn > 0 && (
                        <div className="flex items-center justify-between text-sm text-purple-700 mb-2">
                          <span>🎉 You'll earn</span>
                          <span className="font-bold">+{pointsToEarn} points</span>
                        </div>
                      )}
                      
                      {(loyaltyBalance.pointsBalance || 0) >= 100 && (
                        <label className="flex items-center justify-between cursor-pointer p-2 bg-white rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-800">Redeem Points</p>
                            <p className="text-xs text-gray-500">Use up to {Math.min(loyaltyBalance.pointsBalance || 0, Math.floor((getTotalPrice() + (deliveryInfo?.deliveryCharge || 0)) * 0.5))} points</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={redeemPoints}
                            onChange={(e) => handleRedeemPointsToggle(e.target.checked)}
                            className="w-5 h-5 text-purple-500 rounded"
                          />
                        </label>
                      )}
                      
                      {redeemPoints && pointsRedemptionValue > 0 && (
                        <div className="mt-2 p-2 bg-purple-100 rounded-lg text-sm text-purple-800">
                          <div className="flex justify-between">
                            <span>Points Redeemed: {pointsToRedeem}</span>
                            <span className="font-bold">-₹{pointsRedemptionValue}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Wallet Payment */}
                  {walletBalance > 0 && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-5 h-5 text-blue-600" />
                          <p className="font-medium text-blue-800">Wallet Balance</p>
                        </div>
                        <span className="text-sm text-blue-600">₹{walletBalance}</span>
                      </div>
                      
                      <label className="flex items-center justify-between cursor-pointer p-2 bg-white rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-800">Pay from Wallet</p>
                          <p className="text-xs text-gray-500">Use wallet balance for this order</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={useWallet}
                          onChange={(e) => handleWalletToggle(e.target.checked)}
                          className="w-5 h-5 text-blue-500 rounded"
                        />
                      </label>
                      
                      {useWallet && walletAmountUsed > 0 && (
                        <div className="mt-2 p-2 bg-blue-100 rounded-lg text-sm text-blue-800">
                          <div className="flex justify-between">
                            <span>Wallet Payment</span>
                            <span className="font-bold">-₹{walletAmountUsed}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Schedule Summary */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 mr-2 text-teal-500" />
                      <span>{selectedDate && new Date(selectedDate).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-4 h-4 mr-2 text-teal-500" />
                      <span>{selectedTimeSlot}</span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setPaymentMethod('cod')}
                        className={`p-3 border-2 rounded-xl text-center transition-all ${
                          paymentMethod === 'cod' ? 'border-teal-500 bg-teal-50' : 'border-gray-200'
                        }`}>
                        <Home className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                        <p className="font-medium text-gray-800 text-sm">Cash on Delivery</p>
                      </button>
                      <button onClick={() => setPaymentMethod('online')}
                        className={`p-3 border-2 rounded-xl text-center transition-all ${
                          paymentMethod === 'online' ? 'border-teal-500 bg-teal-50' : 'border-gray-200'
                        }`}>
                        <CreditCard className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                        <p className="font-medium text-gray-800 text-sm">Online Payment</p>
                      </button>
                    </div>
                  </div>

                  {/* Coupon Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Have a Coupon?</label>
                    {appliedCoupon ? (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 font-bold">{appliedCoupon.coupon.code}</span>
                            <span className="text-green-700 text-sm">- ₹{appliedCoupon.discount} off</span>
                          </div>
                          <button onClick={removeCoupon} className="text-red-500 hover:text-red-700 text-sm">
                            Remove
                          </button>
                        </div>
                        <p className="text-xs text-green-600 mt-1">{appliedCoupon.coupon.name}</p>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError('') }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase"
                        />
                        <button
                          onClick={validateCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                        </button>
                      </div>
                    )}
                    {couponError && <p className="text-red-500 text-sm mt-1">{couponError}</p>}
                  </div>

                  {/* Total */}
                  <div className="p-4 bg-teal-50 rounded-xl">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₹{getTotalPrice()}</span>
                    </div>
                    {deliveryInfo && deliveryInfo.isServiceable && (
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Delivery</span>
                        <span className={deliveryInfo.deliveryCharge === 0 ? 'text-green-600' : ''}>
                          {deliveryInfo.deliveryCharge === 0 ? 'FREE' : `₹${deliveryInfo.deliveryCharge}`}
                        </span>
                      </div>
                    )}
                    {totalAutoDiscount > 0 && (
                      <div className="flex justify-between text-sm mb-1 text-green-600">
                        <span>Auto Discounts</span>
                        <span>-₹{totalAutoDiscount}</span>
                      </div>
                    )}
                    {appliedCoupon && (
                      <div className="flex justify-between text-sm mb-1 text-green-600">
                        <span>Coupon ({appliedCoupon.coupon.code})</span>
                        <span>-₹{appliedCoupon.discount}</span>
                      </div>
                    )}
                    {pointsRedemptionValue > 0 && (
                      <div className="flex justify-between text-sm mb-1 text-purple-600">
                        <span>Points Redeemed</span>
                        <span>-₹{pointsRedemptionValue}</span>
                      </div>
                    )}
                    {walletAmountUsed > 0 && (
                      <div className="flex justify-between text-sm mb-1 text-blue-600">
                        <span>Wallet Payment</span>
                        <span>-₹{walletAmountUsed}</span>
                      </div>
                    )}
                    <hr className="my-2 border-teal-200" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-teal-600">
                        ₹{Math.max(0, getTotalPrice() + (deliveryInfo?.deliveryCharge || 0) - totalAutoDiscount - (appliedCoupon?.discount || 0) - pointsRedemptionValue - walletAmountUsed)}
                      </span>
                    </div>
                    {(totalAutoDiscount + (appliedCoupon?.discount || 0) + pointsRedemptionValue + walletAmountUsed) > 0 && (
                      <div className="mt-2 pt-2 border-t border-teal-200 flex items-center justify-between text-sm">
                        <span className="text-green-600 font-medium">🎉 Total Savings</span>
                        <span className="text-green-600 font-bold">₹{totalAutoDiscount + (appliedCoupon?.discount || 0) + pointsRedemptionValue + walletAmountUsed}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-2xl">
          <div className="flex gap-3">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            )}
            <Button 
              onClick={handleNext} 
              disabled={!canProceed() || submitting}
              className="flex-1"
              style={getThemeStyles().primaryBg}
              onMouseEnter={(e) => !submitting && !(!canProceed()) && (e.currentTarget.style.backgroundColor = brandingColors.secondaryColor)}
              onMouseLeave={(e) => !submitting && !(!canProceed()) && (e.currentTarget.style.backgroundColor = brandingColors.primaryColor)}
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
              ) : step === 7 ? (
                <><Check className="w-4 h-4 mr-1" /> Place Order</>
              ) : step === 4 && !isAuthenticated ? (
                'Login to Continue'
              ) : (
                <>Continue <ChevronRight className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Add New Address</h3>
              <button onClick={() => setShowAddressForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddAddress} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Full Name *" value={newAddress.name}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                <input type="tel" placeholder="Phone *" value={newAddress.phone}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required />
              </div>
              <input type="text" placeholder="Address Line 1 *" value={newAddress.addressLine1}
                onChange={(e) => setNewAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required />
              <input type="text" placeholder="Landmark (Optional)" value={newAddress.landmark}
                onChange={(e) => setNewAddress(prev => ({ ...prev, landmark: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="City *" value={newAddress.city}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                <input type="text" placeholder="Pincode *" value={newAddress.pincode}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, pincode: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required />
              </div>
              <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-full">
                Add Address
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
