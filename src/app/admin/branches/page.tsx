'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Search, MapPin, Users, Activity, Settings, Trash2, Edit, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreateBranchModal } from '@/components/branches/CreateBranchModal'
import { EditBranchModal } from '@/components/branches/EditBranchModal'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const getAuthToken = () => {
  const authData = localStorage.getItem('laundry-auth')
  if (authData) {
    try {
      const parsed = JSON.parse(authData)
      return parsed.state?.token
    } catch (e) {}
  }
  // Also check for direct token storage
  return localStorage.getItem('token')
}

interface Branch {
  _id: string
  name: string
  code: string
  address: {
    addressLine1: string
    city: string
    state: string
    pincode: string
  }
  contact: {
    phone: string
    email?: string
  }
  status: string
  isActive: boolean
  staffCount: number
  metrics?: {
    totalOrders: number
    totalRevenue: number
    efficiency: number
  }
  capacity?: {
    maxOrdersPerDay: number
    maxWeightPerDay: number
  }
  utilizationRate: number
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  
  // Services management state
  const [showServicesModal, setShowServicesModal] = useState(false)
  const [selectedBranchForServices, setSelectedBranchForServices] = useState<Branch | null>(null)
  const [services, setServices] = useState<any[]>([])
  const [branchServices, setBranchServices] = useState<any[]>([])
  const [servicesLoading, setServicesLoading] = useState(false)

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/admin/branches-management`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setBranches(data.data.branches)
      } else {
        const errorData = await response.text()
        console.error('Fetch branches error:', response.status, errorData)
      }
    } catch (error) {
      console.error('Error fetching branches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBranch = () => {
    fetchBranches()
    setShowCreateModal(false)
  }

  const handleEditBranch = () => {
    fetchBranches()
    setEditingBranch(null)
  }

  // Services management functions
  const handleOpenServicesModal = async (branch: Branch) => {
    setSelectedBranchForServices(branch)
    setShowServicesModal(true)
    setServicesLoading(true)
    
    try {
      const token = getAuthToken()
      
      // Fetch all services
      const servicesResponse = await fetch(`${API_URL}/admin/services`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json()
        console.log('📦 Services data:', servicesData)
        setServices(servicesData.data.services || [])
      } else {
        console.error('Failed to fetch services:', servicesResponse.status)
      }
      
      // Fetch branch-specific services
      const branchServicesResponse = await fetch(`${API_URL}/admin/branches/${branch._id}/services`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (branchServicesResponse.ok) {
        const branchServicesData = await branchServicesResponse.json()
        console.log('🏢 Branch services data:', branchServicesData)
        setBranchServices(branchServicesData.data.services || branchServicesData.data || [])
      } else {
        console.error('Failed to fetch branch services:', branchServicesResponse.status)
        // If endpoint doesn't exist, set empty array
        setBranchServices([])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      toast.error('Failed to load services')
      setBranchServices([])
    } finally {
      setServicesLoading(false)
    }
  }

  const handleToggleServiceForBranch = async (serviceId: string, isEnabled: boolean) => {
    if (!selectedBranchForServices) return
    
    try {
      const token = getAuthToken()
      const response = await fetch(
        `${API_URL}/admin/branches/${selectedBranchForServices._id}/services/${serviceId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isEnabled })
        }
      )
      
      if (response.ok) {
        toast.success(`Service ${isEnabled ? 'enabled' : 'disabled'} for ${selectedBranchForServices.name}`)
        
        // Update local state instead of refetching
        setBranchServices(prev => {
          // Check if service already exists in branch services
          const existingIndex = prev.findIndex(bs => {
            const bsServiceId = bs.service?._id || bs.service || bs.serviceId
            return bsServiceId === serviceId
          })
          
          if (existingIndex >= 0) {
            // Update existing service
            const updated = [...prev]
            updated[existingIndex] = { ...updated[existingIndex], isEnabled }
            return updated
          } else {
            // Add new service
            return [...prev, { service: serviceId, serviceId, isEnabled }]
          }
        })
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to update service')
      }
    } catch (error) {
      console.error('Error toggling service:', error)
      toast.error('Failed to update service')
    }
  }

  const isServiceEnabledForBranch = (serviceId: string) => {
    return branchServices.some(bs => {
      // Handle both populated and non-populated service references
      const bsServiceId = bs.service?._id || bs.service || bs.serviceId
      return bsServiceId === serviceId && bs.isEnabled
    })
  }

  const handleDeleteBranch = async (branchId: string) => {
    // Show loading toast
    const loadingToast = toast.loading('Deactivating branch...', {
      position: 'top-right',
      style: {
        background: '#f8fafc',
        color: '#475569',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
      },
    })

    try {
      const token = getAuthToken()
      console.log('🗑️ Deleting branch:', branchId)
      
      const response = await fetch(`${API_URL}/admin/branches-management/${branchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('Delete response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Delete success:', result)
        
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast)
        toast.success('Branch deactivated successfully!', {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#fef3c7',
            color: '#92400e',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          iconTheme: {
            primary: '#f59e0b',
            secondary: '#fef3c7',
          },
        })
        
        fetchBranches() // Refresh the list
      } else {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }))
        console.error('❌ Delete error:', error)
        
        // Dismiss loading toast and show error
        toast.dismiss(loadingToast)
        toast.error(`Failed to deactivate branch: ${error.message || 'Unknown error'}`, {
          duration: 5000,
          position: 'top-right',
          style: {
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #f87171',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          iconTheme: {
            primary: '#f87171',
            secondary: '#fef2f2',
          },
        })
      }
    } catch (error) {
      console.error('❌ Error deleting branch:', error)
      
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast)
      toast.error('Failed to deactivate branch. Please try again.', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#fef2f2',
          color: '#991b1b',
          border: '1px solid #f87171',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
        iconTheme: {
          primary: '#f87171',
          secondary: '#fef2f2',
        },
      })
    }
  }

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branch.address.city.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && branch.isActive) ||
                         (statusFilter === 'inactive' && !branch.isActive)
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (branch: Branch) => {
    if (!branch.isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    
    switch (branch.status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>
      case 'maintenance':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Maintenance</Badge>
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>
      default:
        return <Badge variant="secondary">{branch.status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branch Management</h1>
          <p className="text-gray-600">Manage your laundry branches and locations</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Branch
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search branches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Branches</p>
                <p className="text-2xl font-bold">{branches.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Branches</p>
                <p className="text-2xl font-bold text-green-600">
                  {branches.filter(b => b.isActive).length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold">
                  {branches.reduce((sum, b) => sum + b.staffCount, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Utilization</p>
                <p className="text-2xl font-bold text-orange-600">
                  {branches.length > 0 
                    ? Math.round(branches.reduce((sum, b) => sum + b.utilizationRate, 0) / branches.length)
                    : 0}%
                </p>
              </div>
              <Settings className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBranches.map((branch) => (
          <Card key={branch._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{branch.name}</CardTitle>
                  <p className="text-sm text-gray-600">Code: {branch.code}</p>
                </div>
                {getStatusBadge(branch)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Address */}
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="text-sm">
                  <p>{branch.address.addressLine1}</p>
                  <p className="text-gray-600">
                    {branch.address.city}, {branch.address.state} - {branch.address.pincode}
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="text-sm">
                <p className="font-medium">Phone: {branch.contact.phone}</p>
                {branch.contact.email && (
                  <p className="text-gray-600">Email: {branch.contact.email}</p>
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-xs text-gray-600">Staff</p>
                  <p className="font-semibold">{branch.staffCount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Utilization</p>
                  <p className="font-semibold">{branch.utilizationRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Orders</p>
                  <p className="font-semibold">{branch.metrics?.totalOrders || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Capacity</p>
                  <p className="font-semibold">{branch.capacity?.maxOrdersPerDay || 0}/day</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingBranch(branch)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenServicesModal(branch)}
                  className="flex-1"
                >
                  <Package className="h-4 w-4 mr-1" />
                  Services
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast((t) => (
                      <div className="flex flex-col gap-3">
                        <div>
                          <p className="font-medium">Deactivate Branch?</p>
                          <p className="text-sm text-gray-600">
                            This will make "{branch.name}" inactive but preserve all data.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              toast.dismiss(t.id)
                              handleDeleteBranch(branch._id)
                            }}
                          >
                            Yes, Deactivate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toast.dismiss(t.id)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ), {
                      duration: 10000,
                      position: 'top-center',
                    })
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBranches.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No branches found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first branch'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Branch
            </Button>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateBranchModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateBranch}
      />

      {editingBranch && (
        <EditBranchModal
          isOpen={!!editingBranch}
          onClose={() => setEditingBranch(null)}
          onSuccess={handleEditBranch}
          branch={editingBranch}
        />
      )}

      {/* Services Management Modal */}
      {showServicesModal && selectedBranchForServices && typeof window !== 'undefined' && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 flex items-center justify-center p-4 overflow-y-auto" style={{ zIndex: 999999 }}>
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Manage Services</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Enable or disable services for {selectedBranchForServices.name}
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowServicesModal(false)
                  setSelectedBranchForServices(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {servicesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading services...</span>
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No services found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {services.map((service) => {
                    const isEnabled = isServiceEnabledForBranch(service._id)
                    return (
                      <div 
                        key={service._id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isEnabled ? 'bg-green-100' : 'bg-gray-200'
                          }`}>
                            <Package className={`w-5 h-5 ${
                              isEnabled ? 'text-green-600' : 'text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{service.name}</h4>
                            <p className="text-sm text-gray-600">
                              {service.category} • ₹{service.pricing?.standard || 0}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleServiceForBranch(service._id, !isEnabled)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            isEnabled ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowServicesModal(false)
                  setSelectedBranchForServices(null)
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