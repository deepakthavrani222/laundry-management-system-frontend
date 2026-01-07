'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, ToggleLeft, ToggleRight, Settings, Search, Filter, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
  return localStorage.getItem('token')
}

interface Service {
  _id: string
  name: string
  displayName: string
  description: string
  icon: string
  category: string
  basePriceMultiplier: number
  turnaroundTime: {
    hours: number
    minutes: number
  }
  isExpressAvailable: boolean
  branchConfig: {
    isEnabled: boolean
    priceMultiplier: number
    turnaroundTimeOverride?: {
      hours: number
      minutes: number
    }
    isExpressAvailable: boolean
    notes: string
    _id: string | null
  }
}

interface Branch {
  _id: string
  name: string
  code: string
}

export default function BranchServicesPage() {
  const params = useParams()
  const router = useRouter()
  const branchId = params.branchId as string

  const [branch, setBranch] = useState<Branch | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchBranchServices()
  }, [branchId])

  const fetchBranchServices = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/admin/branches/${branchId}/services`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setBranch(data.data.branch)
        setServices(data.data.services)
      } else {
        toast.error('Failed to load branch services')
      }
    } catch (error) {
      console.error('Error fetching branch services:', error)
      toast.error('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const updateServiceConfig = (serviceId: string, updates: Partial<Service['branchConfig']>) => {
    setServices(prev => prev.map(service => 
      service._id === serviceId 
        ? { ...service, branchConfig: { ...service.branchConfig, ...updates } }
        : service
    ))
    setHasChanges(true)
  }

  const toggleService = async (serviceId: string) => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/admin/branches/${branchId}/services/${serviceId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const newStatus = data.data.newStatus === 'enabled'
        
        updateServiceConfig(serviceId, { isEnabled: newStatus })
        
        toast.success(`Service ${newStatus ? 'enabled' : 'disabled'} successfully`, {
          duration: 3000,
          position: 'top-right',
          style: {
            background: newStatus ? '#f0fdf4' : '#fef3c7',
            color: newStatus ? '#166534' : '#92400e',
            border: `1px solid ${newStatus ? '#22c55e' : '#f59e0b'}`,
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          iconTheme: {
            primary: newStatus ? '#22c55e' : '#f59e0b',
            secondary: newStatus ? '#f0fdf4' : '#fef3c7',
          },
        })
      } else {
        toast.error('Failed to toggle service')
      }
    } catch (error) {
      console.error('Error toggling service:', error)
      toast.error('Failed to toggle service')
    }
  }

  const saveAllChanges = async () => {
    try {
      setSaving(true)
      const token = getAuthToken()
      
      const serviceUpdates = services.map(service => ({
        serviceId: service._id,
        isEnabled: service.branchConfig.isEnabled,
        priceMultiplier: service.branchConfig.priceMultiplier,
        turnaroundTimeOverride: service.branchConfig.turnaroundTimeOverride,
        isExpressAvailable: service.branchConfig.isExpressAvailable,
        notes: service.branchConfig.notes
      }))

      const response = await fetch(`${API_URL}/admin/branches/${branchId}/services/bulk`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ services: serviceUpdates })
      })

      if (response.ok) {
        setHasChanges(false)
        toast.success('All changes saved successfully!', {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #22c55e',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          iconTheme: {
            primary: '#22c55e',
            secondary: '#f0fdf4',
          },
        })
      } else {
        toast.error('Failed to save changes')
      }
    } catch (error) {
      console.error('Error saving changes:', error)
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'enabled' && service.branchConfig.isEnabled) ||
                         (statusFilter === 'disabled' && !service.branchConfig.isEnabled)
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const categories = [...new Set(services.map(s => s.category))].filter(Boolean)
  const enabledCount = services.filter(s => s.branchConfig.isEnabled).length

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
            <p className="text-gray-600">
              {branch?.name} ({branch?.code}) - {enabledCount} of {services.length} services enabled
            </p>
          </div>
        </div>
        
        {hasChanges && (
          <Button
            onClick={saveAllChanges}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredServices.map((service) => (
          <Card key={service._id} className={`transition-all ${service.branchConfig.isEnabled ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-lg">{service.icon || '🧺'}</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{service.displayName}</CardTitle>
                    <p className="text-sm text-gray-600">{service.category}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={service.branchConfig.isEnabled ? "default" : "secondary"}>
                    {service.branchConfig.isEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleService(service._id)}
                    className="p-1"
                  >
                    {service.branchConfig.isEnabled ? (
                      <ToggleRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{service.description}</p>
              
              {service.branchConfig.isEnabled && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`price-${service._id}`}>Price Multiplier</Label>
                      <Input
                        id={`price-${service._id}`}
                        type="number"
                        min="0.1"
                        max="10"
                        step="0.1"
                        value={service.branchConfig.priceMultiplier}
                        onChange={(e) => updateServiceConfig(service._id, { 
                          priceMultiplier: parseFloat(e.target.value) || 1.0 
                        })}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Base: {service.basePriceMultiplier}x → Final: {(service.basePriceMultiplier * service.branchConfig.priceMultiplier).toFixed(2)}x
                      </p>
                    </div>
                    
                    <div>
                      <Label>Express Available</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateServiceConfig(service._id, { 
                            isExpressAvailable: !service.branchConfig.isExpressAvailable 
                          })}
                          className="p-1"
                        >
                          {service.branchConfig.isExpressAvailable ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-400" />
                          )}
                        </Button>
                        <span className="text-sm">
                          {service.branchConfig.isExpressAvailable ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`notes-${service._id}`}>Branch-specific Notes</Label>
                    <Textarea
                      id={`notes-${service._id}`}
                      placeholder="Any special instructions or notes for this service at this branch..."
                      value={service.branchConfig.notes}
                      onChange={(e) => updateServiceConfig(service._id, { notes: e.target.value })}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-600">
            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No services available to configure'
            }
          </p>
        </div>
      )}
    </div>
  )
}