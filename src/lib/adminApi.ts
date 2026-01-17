// Properly handle API URL - ensure it ends with /api
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`

class AdminAPI {
  private getAuthHeaders() {
    // Get token from laundry-auth localStorage (zustand persist format)
    const authData = localStorage.getItem('laundry-auth')
    let token = null
    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        // Zustand persist wraps data in 'state' object
        token = parsed.state?.token || parsed.token
      } catch (e) {
        console.error('Error parsing auth data:', e)
      }
    }
    // Fallback to direct token storage
    if (!token) {
      token = localStorage.getItem('token')
    }
    
    // Debug: Log token status (only first/last few chars for security)
    if (token) {
      console.log('🔑 Token found:', token.substring(0, 20) + '...' + token.substring(token.length - 10))
    } else {
      console.error('❌ No token found in localStorage!')
    }
    
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  private async handleResponse(response: Response) {
    const contentType = response.headers.get('content-type')
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('Non-JSON response received:', text)
      throw new Error(`Server returned non-JSON response. Status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!response.ok) {
      // Log detailed error for debugging
      console.error('API Error:', {
        status: response.status,
        message: data.message,
        url: response.url
      })
      throw new Error(data.message || `API request failed with status ${response.status}`)
    }
    
    return data
  }

  // Dashboard
  async getDashboard() {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      headers: this.getAuthHeaders()
    })
    
    return this.handleResponse(response)
  }

  // Order Management
  async getOrders(params?: {
    page?: number
    limit?: number
    status?: string
    branch?: string
    isExpress?: boolean
    search?: string
    startDate?: string
    endDate?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/admin/orders?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )
    
    return this.handleResponse(response)
  }

  async assignOrderToBranch(orderId: string, branchId: string) {
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/assign-branch`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ branchId })
    })
    
    return this.handleResponse(response)
  }

  async assignOrderToLogistics(orderId: string, logisticsPartnerId: string, type: 'pickup' | 'delivery') {
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/assign-logistics`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ logisticsPartnerId, type })
    })
    
    return this.handleResponse(response)
  }

  async updateOrderStatus(orderId: string, status: string, notes?: string) {
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status, notes })
    })
    
    return this.handleResponse(response)
  }

  // Customer Management
  async getCustomers(params?: {
    page?: number
    limit?: number
    search?: string
    isVIP?: boolean
    isActive?: boolean
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/admin/customers?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )
    
    return this.handleResponse(response)
  }

  async getCustomerDetails(customerId: string) {
    const response = await fetch(`${API_BASE_URL}/admin/customers/${customerId}/details`, {
      headers: this.getAuthHeaders()
    })
    
    return this.handleResponse(response)
  }

  async toggleCustomerStatus(customerId: string) {
    const response = await fetch(`${API_BASE_URL}/admin/customers/${customerId}/toggle-status`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    })
    
    return this.handleResponse(response)
  }

  async updateCustomerVIPStatus(customerId: string, isVIP: boolean) {
    const response = await fetch(`${API_BASE_URL}/admin/customers/${customerId}/vip`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ isVIP })
    })
    
    return this.handleResponse(response)
  }

  // Complaint Management
  async getComplaints(params?: {
    page?: number
    limit?: number
    status?: string
    priority?: string
    category?: string
    search?: string
    isOverdue?: boolean
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/admin/complaints?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )
    
    return this.handleResponse(response)
  }

  async getComplaint(complaintId: string) {
    const response = await fetch(`${API_BASE_URL}/admin/complaints/${complaintId}`, {
      headers: this.getAuthHeaders()
    })
    
    return this.handleResponse(response)
  }

  async assignComplaint(complaintId: string, agentId: string) {
    const response = await fetch(`${API_BASE_URL}/admin/complaints/${complaintId}/assign`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ agentId })
    })
    
    return this.handleResponse(response)
  }

  async updateComplaintStatus(complaintId: string, status: string, resolution?: string) {
    const response = await fetch(`${API_BASE_URL}/admin/complaints/${complaintId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status, resolution })
    })
    
    return this.handleResponse(response)
  }

  // Refund Management
  async getRefunds(params?: {
    page?: number
    limit?: number
    status?: string
    isEscalated?: boolean
    search?: string
    startDate?: string
    endDate?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/admin/refunds?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )
    
    return this.handleResponse(response)
  }

  async getRefund(refundId: string) {
    const response = await fetch(`${API_BASE_URL}/admin/refunds/${refundId}`, {
      headers: this.getAuthHeaders()
    })
    
    return this.handleResponse(response)
  }

  async createRefund(data: {
    orderId: string
    amount: number
    reason: string
    category: string
    ticketId?: string
  }) {
    const response = await fetch(`${API_BASE_URL}/admin/refunds`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })
    
    return this.handleResponse(response)
  }

  async approveRefund(refundId: string, notes?: string) {
    const response = await fetch(`${API_BASE_URL}/admin/refunds/${refundId}/approve`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ notes })
    })
    
    return this.handleResponse(response)
  }

  async rejectRefund(refundId: string, reason: string) {
    const response = await fetch(`${API_BASE_URL}/admin/refunds/${refundId}/reject`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ reason })
    })
    
    return this.handleResponse(response)
  }

  async escalateRefund(refundId: string, reason: string) {
    const response = await fetch(`${API_BASE_URL}/admin/refunds/${refundId}/escalate`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ reason })
    })
    
    return this.handleResponse(response)
  }

  async processRefund(refundId: string, transactionId?: string) {
    const response = await fetch(`${API_BASE_URL}/admin/refunds/${refundId}/process`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ transactionId })
    })
    
    return this.handleResponse(response)
  }

  // Support Agents
  async getSupportAgents() {
    const response = await fetch(`${API_BASE_URL}/admin/support-agents`, {
      headers: this.getAuthHeaders()
    })
    
    return this.handleResponse(response)
  }

  // Branch Management (for getting branches for assignment)
  async getBranches() {
    const response = await fetch(`${API_BASE_URL}/admin/branches`, {
      headers: this.getAuthHeaders()
    })
    
    return this.handleResponse(response)
  }

  // Logistics Partners (for getting logistics partners for assignment)
  async getLogisticsPartners() {
    const response = await fetch(`${API_BASE_URL}/admin/logistics-partners`, {
      headers: this.getAuthHeaders()
    })
    
    return this.handleResponse(response)
  }

  // Branch Management with stats
  async getBranchesWithStats(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    city?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/admin/branches?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )
    
    return this.handleResponse(response)
  }

  // Transactions/Payments
  async getTransactions(params?: {
    page?: number
    limit?: number
    type?: string
    status?: string
    startDate?: string
    endDate?: string
    search?: string
    paymentMethod?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/admin/payments?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )
    
    return this.handleResponse(response)
  }

  // Analytics
  async getAnalytics(timeframe: string = '30d') {
    const response = await fetch(
      `${API_BASE_URL}/admin/analytics?timeframe=${timeframe}`,
      { headers: this.getAuthHeaders() }
    )
    
    return this.handleResponse(response)
  }

  // Staff Management
  async getStaff(params?: {
    page?: number
    limit?: number
    role?: string
    branchId?: string
    search?: string
    isActive?: boolean
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/admin/staff?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )
    
    return this.handleResponse(response)
  }

  async toggleStaffStatus(userId: string) {
    const response = await fetch(`${API_BASE_URL}/admin/staff/${userId}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders()
    })
    
    return this.handleResponse(response)
  }

  // Logistics Partners with full details
  async getLogisticsPartnersWithStats() {
    const response = await fetch(`${API_BASE_URL}/admin/logistics-partners`, {
      headers: this.getAuthHeaders()
    })
    
    return this.handleResponse(response)
  }

  // Admin Payments (from orders)
  async getPayments(params?: {
    page?: number
    limit?: number
    status?: string
    paymentMethod?: string
    search?: string
    startDate?: string
    endDate?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await fetch(
      `${API_BASE_URL}/admin/payments?${searchParams}`,
      { headers: this.getAuthHeaders() }
    )
    
    return this.handleResponse(response)
  }

  async getPaymentStats() {
    const response = await fetch(`${API_BASE_URL}/admin/payments/stats`, {
      headers: this.getAuthHeaders()
    })
    
    return this.handleResponse(response)
  }
}

export const adminApi = new AdminAPI()
