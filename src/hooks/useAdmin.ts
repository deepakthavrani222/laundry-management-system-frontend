'use client'

import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/adminApi'

export interface DashboardMetrics {
  totalOrders: number
  todayOrders: number
  pendingOrders: number
  completedTodayOrders: number
  expressOrders: number
  totalCustomers: number
  activeCustomers: number
  pendingComplaints: number
  totalBranches: number
}

export interface Order {
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
  }
  isExpress: boolean
  createdAt: string
  pickupDate: string
  estimatedDeliveryDate?: string
  items: any[]
  pickupType?: 'self' | 'logistics'
  deliveryType?: 'self' | 'logistics'
  serviceType?: string
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

export interface Customer {
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
}

export interface Branch {
  _id: string
  name: string
  code: string
  address: {
    city: string
    pincode: string
  }
  isActive: boolean
}

export interface LogisticsPartner {
  _id: string
  companyName: string
  contactPerson: {
    name: string
    phone: string
  }
  isActive: boolean
}

export function useAdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminApi.getDashboard()
      setMetrics(response.data.metrics)
      setRecentOrders(response.data.recentOrders)
    } catch (err: any) {
      // Don't show error for permission denied - handle silently
      if (err?.response?.status === 403) {
        console.log('Dashboard: Permission denied, showing limited view')
        setMetrics(null)
        setRecentOrders([])
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  return {
    metrics,
    recentOrders,
    loading,
    error,
    refetch: fetchDashboard
  }
}

export function useAdminOrders(filters?: {
  page?: number
  limit?: number
  status?: string
  branch?: string
  isExpress?: boolean
  search?: string
  startDate?: string
  endDate?: string
}) {
  const [orders, setOrders] = useState<Order[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 8
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminApi.getOrders(filters)
      setOrders(response.data.data)
      // Map backend pagination keys to frontend format
      const backendPagination = response.data.pagination
      setPagination({
        current: backendPagination.currentPage,
        pages: backendPagination.totalPages,
        total: backendPagination.totalItems,
        limit: backendPagination.itemsPerPage
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const assignToBranch = async (orderId: string, branchId: string) => {
    try {
      await adminApi.assignOrderToBranch(orderId, branchId)
      await fetchOrders() // Refresh the list
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign order to branch'
      throw new Error(errorMessage)
    }
  }

  const assignToLogistics = async (orderId: string, logisticsPartnerId: string, type: 'pickup' | 'delivery') => {
    try {
      await adminApi.assignOrderToLogistics(orderId, logisticsPartnerId, type)
      await fetchOrders() // Refresh the list
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign order to logistics'
      throw new Error(errorMessage)
    }
  }

  const updateStatus = async (orderId: string, status: string, notes?: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, status, notes)
      await fetchOrders() // Refresh the list
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order status'
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [JSON.stringify(filters)])

  return {
    orders,
    pagination,
    loading,
    error,
    assignToBranch,
    assignToLogistics,
    updateStatus,
    refetch: fetchOrders
  }
}

export function useAdminCustomers(filters?: {
  page?: number
  limit?: number
  search?: string
  isVIP?: boolean
  isActive?: boolean
}) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 8
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminApi.getCustomers(filters)
      setCustomers(response.data.data)
      // Map backend pagination keys to frontend format
      const backendPagination = response.data.pagination
      setPagination({
        current: backendPagination.currentPage,
        pages: backendPagination.totalPages,
        total: backendPagination.totalItems,
        limit: backendPagination.itemsPerPage
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (customerId: string) => {
    try {
      await adminApi.toggleCustomerStatus(customerId)
      await fetchCustomers() // Refresh the list
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle customer status'
      throw new Error(errorMessage)
    }
  }

  const updateVIPStatus = async (customerId: string, isVIP: boolean) => {
    try {
      await adminApi.updateCustomerVIPStatus(customerId, isVIP)
      await fetchCustomers() // Refresh the list
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update VIP status'
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [JSON.stringify(filters)])

  return {
    customers,
    pagination,
    loading,
    error,
    toggleStatus,
    updateVIPStatus,
    refetch: fetchCustomers
  }
}

export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBranches = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminApi.getBranches()
      setBranches(response.data.data || response.data.branches || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch branches')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBranches()
  }, [])

  return {
    branches,
    loading,
    error,
    refetch: fetchBranches
  }
}

export function useLogisticsPartners() {
  const [partners, setPartners] = useState<LogisticsPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPartners = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminApi.getLogisticsPartners()
      setPartners(response.data?.partners || response.data || [])
    } catch (err) {
      console.error('Failed to fetch logistics partners:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch logistics partners')
      // Fallback to empty array if API fails
      setPartners([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPartners()
  }, [])

  return {
    partners,
    loading,
    error,
    refetch: fetchPartners
  }
}


// Complaint/Ticket Types
export interface Complaint {
  _id: string
  ticketNumber: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated'
  raisedBy: {
    _id: string
    name: string
    email: string
    phone: string
  }
  assignedTo?: {
    _id: string
    name: string
    email: string
  }
  relatedOrder?: {
    _id: string
    orderNumber: string
    status: string
    pricing: { total: number }
  }
  resolution?: string
  resolvedBy?: { name: string }
  resolvedAt?: string
  sla: {
    isOverdue: boolean
    responseTime: number
    resolutionTime: number
  }
  createdAt: string
}

export interface Refund {
  _id: string
  refundNumber: string
  order: {
    _id: string
    orderNumber: string
    status: string
    pricing: { total: number }
  }
  customer: {
    _id: string
    name: string
    email: string
    phone: string
  }
  ticket?: {
    _id: string
    ticketNumber: string
    title: string
  }
  amount: number
  type: 'full' | 'partial' | 'store_credit'
  reason: string
  category: string
  status: 'requested' | 'approved' | 'processed' | 'completed' | 'rejected'
  isEscalated: boolean
  requestedBy: { name: string }
  requestedAt: string
  approvedBy?: { name: string }
  approvedAt?: string
  rejectedBy?: { name: string }
  rejectedAt?: string
  rejectionReason?: string
  processedBy?: { name: string }
  processedAt?: string
  transactionId?: string
  createdAt: string
}

export interface SupportAgent {
  _id: string
  name: string
  email: string
  role: string
}

export function useAdminComplaints(filters?: {
  page?: number
  limit?: number
  status?: string
  priority?: string
  category?: string
  search?: string
  isOverdue?: boolean
}) {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminApi.getComplaints(filters)
      setComplaints(response.data.data)
      setPagination(response.data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch complaints')
    } finally {
      setLoading(false)
    }
  }

  const assignComplaint = async (complaintId: string, agentId: string) => {
    try {
      await adminApi.assignComplaint(complaintId, agentId)
      await fetchComplaints()
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign complaint'
      throw new Error(errorMessage)
    }
  }

  const updateStatus = async (complaintId: string, status: string, resolution?: string) => {
    try {
      await adminApi.updateComplaintStatus(complaintId, status, resolution)
      await fetchComplaints()
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update complaint status'
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [JSON.stringify(filters)])

  return {
    complaints,
    pagination,
    loading,
    error,
    assignComplaint,
    updateStatus,
    refetch: fetchComplaints
  }
}

export function useAdminRefunds(filters?: {
  page?: number
  limit?: number
  status?: string
  isEscalated?: boolean
  search?: string
  startDate?: string
  endDate?: string
}) {
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRefunds = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminApi.getRefunds(filters)
      setRefunds(response.data.data)
      setPagination(response.data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch refunds')
    } finally {
      setLoading(false)
    }
  }

  const createRefund = async (data: {
    orderId: string
    amount: number
    reason: string
    category: string
    ticketId?: string
  }) => {
    try {
      await adminApi.createRefund(data)
      await fetchRefunds()
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create refund'
      throw new Error(errorMessage)
    }
  }

  const approveRefund = async (refundId: string, notes?: string) => {
    try {
      await adminApi.approveRefund(refundId, notes)
      await fetchRefunds()
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve refund'
      throw new Error(errorMessage)
    }
  }

  const rejectRefund = async (refundId: string, reason: string) => {
    try {
      await adminApi.rejectRefund(refundId, reason)
      await fetchRefunds()
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject refund'
      throw new Error(errorMessage)
    }
  }

  const escalateRefund = async (refundId: string, reason: string) => {
    try {
      await adminApi.escalateRefund(refundId, reason)
      await fetchRefunds()
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to escalate refund'
      throw new Error(errorMessage)
    }
  }

  const processRefund = async (refundId: string, transactionId?: string) => {
    try {
      await adminApi.processRefund(refundId, transactionId)
      await fetchRefunds()
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process refund'
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchRefunds()
  }, [JSON.stringify(filters)])

  return {
    refunds,
    pagination,
    loading,
    error,
    createRefund,
    approveRefund,
    rejectRefund,
    escalateRefund,
    processRefund,
    refetch: fetchRefunds
  }
}

export function useSupportAgents() {
  const [agents, setAgents] = useState<SupportAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAgents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminApi.getSupportAgents()
      setAgents(response.data.agents || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch support agents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  return {
    agents,
    loading,
    error,
    refetch: fetchAgents
  }
}
