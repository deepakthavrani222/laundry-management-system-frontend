'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'

export interface Ticket {
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
    email?: string
  }
  relatedOrder?: {
    _id: string
    orderNumber: string
    status: string
  }
  resolution?: string
  resolvedBy?: { _id: string; name: string }
  resolvedAt?: string
  escalatedTo?: { _id: string; name: string }
  escalationReason?: string
  sla: {
    isOverdue: boolean
    responseTime?: number
    resolutionTime?: number
  }
  messages: Array<{
    _id: string
    sender: { _id: string; name: string; role: string }
    message: string
    isInternal: boolean
    timestamp: string
  }>
  createdAt: string
  updatedAt: string
}

export function useAdminTickets(filters?: {
  page?: number
  limit?: number
  status?: string
  priority?: string
  category?: string
  assignedTo?: string
  search?: string
  isOverdue?: boolean
}) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 20
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString())
          }
        })
      }
      
      const response = await api.get(`/admin/support/tickets?${params}`)
      
      // Backend returns { success, data: { data: [...], pagination: {...} }, message }
      const responseData = response.data.data || response.data
      const ticketsArray = responseData.data || responseData.tickets || responseData || []
      
      setTickets(Array.isArray(ticketsArray) ? ticketsArray : [])
      
      const backendPagination = responseData.pagination || response.data.pagination || {}
      setPagination({
        current: backendPagination.currentPage || 1,
        pages: backendPagination.totalPages || 1,
        total: backendPagination.totalItems || 0,
        limit: backendPagination.itemsPerPage || 20
      })
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch tickets')
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  const takeTicket = async (ticketId: string) => {
    try {
      await api.put(`/admin/support/tickets/${ticketId}/status`, { status: 'in_progress' })
      await fetchTickets()
      return { success: true }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to take ticket')
    }
  }

  const updateStatus = async (ticketId: string, status: string) => {
    try {
      await api.put(`/admin/support/tickets/${ticketId}/status`, { status })
      await fetchTickets()
      return { success: true }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to update status')
    }
  }

  const resolveTicket = async (ticketId: string, resolution: string) => {
    try {
      await api.put(`/admin/support/tickets/${ticketId}/resolve`, { resolution })
      await fetchTickets()
      return { success: true }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to resolve ticket')
    }
  }

  const escalateTicket = async (ticketId: string, escalatedTo: string, reason: string) => {
    try {
      await api.put(`/admin/support/tickets/${ticketId}/escalate`, { escalatedTo, reason })
      await fetchTickets()
      return { success: true }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to escalate ticket')
    }
  }

  const addMessage = async (ticketId: string, message: string, isInternal: boolean = false) => {
    try {
      await api.post(`/admin/support/tickets/${ticketId}/messages`, { message, isInternal })
      return { success: true }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to add message')
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  return {
    tickets,
    pagination,
    loading,
    error,
    takeTicket,
    updateStatus,
    resolveTicket,
    escalateTicket,
    addMessage,
    refetch: fetchTickets
  }
}

export function useAdminTicketDetail(ticketId: string | null) {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/admin/support/tickets/${ticketId}`)
      // Backend returns { success, data: { ticket }, message }
      const ticketData = response.data.data?.ticket || response.data.ticket
      setTicket(ticketData)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch ticket')
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  const addMessage = async (message: string, isInternal: boolean = false) => {
    if (!ticketId) return
    try {
      await api.post(`/admin/support/tickets/${ticketId}/messages`, { message, isInternal })
      await fetchTicket()
      return { success: true }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to add message')
    }
  }

  const resolve = async (resolution: string) => {
    if (!ticketId) return
    try {
      await api.put(`/admin/support/tickets/${ticketId}/resolve`, { resolution })
      await fetchTicket()
      return { success: true }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to resolve ticket')
    }
  }

  useEffect(() => {
    fetchTicket()
  }, [fetchTicket])

  return {
    ticket,
    loading,
    error,
    addMessage,
    resolve,
    refetch: fetchTicket
  }
}
