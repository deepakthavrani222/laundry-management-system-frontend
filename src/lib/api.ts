import axios from 'axios'
import { useAuthStore } from '@/store/authStore'
import { useSuperAdminStore } from '@/store/superAdminStore'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // Send cookies with every request
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check if it's a superadmin route - use super admin token
    const isSuperAdminRoute = config.url?.includes('superadmin')
    
    if (isSuperAdminRoute) {
      const superAdminToken = useSuperAdminStore.getState().token
      if (superAdminToken) {
        config.headers.Authorization = `Bearer ${superAdminToken}`
      }
    } else {
      // Use regular auth token for other routes
      const token = useAuthStore.getState().token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong'
    const requestUrl = error.config?.url || ''
    const isSuperAdminRoute = requestUrl.includes('superadmin')
    const errorCode = error.response?.data?.code
    
    if (error.response?.status === 401) {
      // Check if store is hydrated before showing session expired
      const authStore = useAuthStore.getState()
      const superAdminStore = useSuperAdminStore.getState()
      
      if (isSuperAdminRoute) {
        // Only show session expired if user was actually logged in
        if (superAdminStore.token) {
          superAdminStore.logout()
          toast.error('Session expired. Please login again.')
          window.location.href = '/superadmin/auth/login'
        }
      } else {
        // Only show session expired if user was actually logged in
        if (authStore.token && authStore._hasHydrated) {
          authStore.logout()
          toast.error('Session expired. Please login again.')
          window.location.href = '/auth/login'
        }
      }
    } else if (error.response?.status === 403) {
      // Don't show toast for PERMISSION_DENIED errors - let components handle it silently
      if (errorCode !== 'PERMISSION_DENIED') {
        toast.error(message)
      }
    } else if (error.response?.status >= 400) {
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

// API endpoints
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: {
    name: string
    email: string
    phone: string
    password: string
    confirmPassword: string
    role?: string
  }) => api.post('/auth/register', userData),
  
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
  
  resendVerification: (email: string) => api.post('/auth/resend-verification', { email }),
  
  getProfile: () => api.get('/auth/profile'),
}

export const customerAPI = {
  // Orders
  getOrders: (params?: { page?: number; limit?: number; status?: string }) => 
    api.get('/customer/orders', { params }),
  createOrder: (orderData: any) => api.post('/customer/orders', orderData),
  getOrder: (orderId: string) => api.get(`/customer/orders/${orderId}`),
  getOrderTracking: (orderId: string) => api.get(`/customer/orders/${orderId}/tracking`),
  cancelOrder: (orderId: string, reason?: string) => 
    api.put(`/customer/orders/${orderId}/cancel`, { reason }),
  rateOrder: (orderId: string, score: number, feedback?: string) =>
    api.put(`/customer/orders/${orderId}/rate`, { score, feedback }),
  reorder: (orderId: string) => api.post(`/customer/orders/${orderId}/reorder`),
  
  // Addresses
  getAddresses: () => api.get('/customer/addresses'),
  addAddress: (addressData: any) => api.post('/customer/addresses', addressData),
  updateAddress: (addressId: string, addressData: any) =>
    api.put(`/customer/addresses/${addressId}`, addressData),
  deleteAddress: (addressId: string) => api.delete(`/customer/addresses/${addressId}`),
  setDefaultAddress: (addressId: string) => 
    api.put(`/customer/addresses/${addressId}/set-default`),
  
  // Notifications
  getNotifications: () => api.get('/customer/notifications'),
  markNotificationRead: (notificationId: string) =>
    api.patch(`/customer/notifications/${notificationId}/read`),
}

// Services API
export const servicesAPI = {
  calculatePricing: (items: any[], isExpress?: boolean) =>
    api.post('/services/calculate', { items, isExpress }),
  getTimeSlots: () => api.get('/services/time-slots'),
  checkServiceAvailability: (pincode: string) =>
    api.get(`/services/availability/${pincode}`),
}

export const adminAPI = {
  getOrders: () => api.get('/admin/orders'),
  assignOrderToBranch: (orderId: string, branchId: string) =>
    api.patch(`/admin/orders/${orderId}/assign-branch`, { branchId }),
  assignOrderToLogistics: (orderId: string, logisticsPartnerId: string) =>
    api.patch(`/admin/orders/${orderId}/assign-logistics`, { logisticsPartnerId }),
  processRefund: (orderId: string, amount: number, reason: string) =>
    api.post(`/admin/orders/${orderId}/refund`, { amount, reason }),
  
  getCustomers: () => api.get('/admin/customers'),
  updateCustomerStatus: (customerId: string, isActive: boolean) =>
    api.patch(`/admin/customers/${customerId}/status`, { isActive }),
  toggleVIPStatus: (customerId: string) =>
    api.patch(`/admin/customers/${customerId}/vip`),
}

// Barcode API
export const barcodeAPI = {
  // Scan barcode and get order details
  scanBarcode: (barcode: string) => api.get(`/barcode/scan/${barcode}`),
  
  // Get barcode for a specific order
  getOrderBarcode: (orderId: string) => api.get(`/barcode/order/${orderId}`),
  
  // Get print labels for order items
  getOrderLabels: (orderId: string) => api.get(`/barcode/order/${orderId}/labels`),
  
  // Update order status via barcode scan
  updateStatusViaScan: (barcode: string, status: string, notes?: string) =>
    api.put(`/barcode/scan/${barcode}/status`, { status, notes }),
  
  // Update item processing status via tag scan
  updateItemStatus: (tagCode: string, processingStatus: string, notes?: string) =>
    api.put(`/barcode/scan-item/${tagCode}/status`, { processingStatus, notes }),
  
  // Report issue on item via tag scan
  reportItemIssue: (tagCode: string, issueType: string, description?: string) =>
    api.post(`/barcode/scan-item/${tagCode}/issue`, { issueType, description }),
  
  // Bulk scan multiple barcodes
  bulkScan: (barcodes: string[]) => api.post('/barcode/bulk-scan', { barcodes }),
}

export default api
