'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import CreateAdminCampaignModal from '@/components/campaigns/CreateAdminCampaignModal'
import {
  Target,
  Plus,
  Search,
  Edit2,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Calendar,
  DollarSign,
  Users,
  Building2,
  Filter,
  RefreshCw,
  Eye,
  Globe,
  TrendingUp
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface Campaign {
  _id: string
  name: string
  description?: string
  campaignScope: 'TENANT' | 'GLOBAL' | 'TEMPLATE'
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  startDate: string
  endDate: string
  priority: number
  promotions: Array<{
    type: string
    promotionId: string
  }>
  budget: {
    type: string
    totalAmount: number
    spentAmount: number
    budgetSource: string
  }
  limits: {
    totalUsageLimit: number
    usedCount: number
    perUserLimit: number
  }
  analytics: {
    conversions: number
    totalSavings: number
    totalRevenue: number
    uniqueUsers: number
  }
  createdAt: string
}

interface Analytics {
  tenant: {
    totalCampaigns: number
    activeCampaigns: number
    totalBudgetSpent: number
    totalSavings: number
    totalConversions: number
    totalRevenue: number
  }
  global: {
    globalCampaignsAffecting: number
    estimatedGlobalSavings: number
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const CAMPAIGN_STATUSES = [
  { value: 'DRAFT', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { value: 'PENDING_APPROVAL', label: 'Pending Approval', color: 'bg-orange-100 text-orange-800' },
  { value: 'ACTIVE', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'PAUSED', label: 'Paused', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-blue-100 text-blue-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
]

export default function AdminCampaignsPage() {
  const { token } = useAuthStore()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchCampaigns()
    fetchAnalytics()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const res = await fetch(`${API_BASE}/admin/campaigns?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      const data = await res.json()
      if (data.success) {
        setCampaigns(data.data.campaigns || [])
      } else {
        toast.error(data.message || 'Failed to load campaigns')
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
      toast.error('Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/campaigns/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      const data = await res.json()
      if (data.success) {
        setAnalytics(data.data.analytics)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    }
  }

  const handleStatusChange = async (campaignId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(`Campaign ${newStatus.toLowerCase()} successfully`)
        fetchCampaigns()
      } else {
        toast.error(data.message || 'Failed to update campaign')
      }
    } catch (error) {
      console.error('Status change error:', error)
      toast.error('Failed to update campaign status')
    }
  }

  const handleDelete = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return

    try {
      const res = await fetch(`${API_BASE}/admin/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Campaign deleted successfully')
        fetchCampaigns()
      } else {
        toast.error(data.message || 'Failed to delete campaign')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete campaign')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'PAUSED':
        return <Pause className="w-4 h-4 text-yellow-500" />
      case 'DRAFT':
        return <Clock className="w-4 h-4 text-gray-500" />
      case 'PENDING_APPROVAL':
        return <AlertCircle className="w-4 h-4 text-orange-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    const statusObj = CAMPAIGN_STATUSES.find(s => s.value === status)
    return statusObj?.color || 'bg-gray-100 text-gray-800'
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
          <p className="text-gray-600">Create and manage marketing campaigns for your tenancy</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-gray-500">Tenant Campaigns</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="font-medium">{analytics.tenant.totalCampaigns}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active</span>
                <span className="font-medium text-green-600">{analytics.tenant.activeCampaigns}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Conversions</span>
                  <span className="font-medium text-blue-600">{analytics.tenant.totalConversions}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs text-gray-500">Budget & Savings</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Budget Spent</span>
                <span className="font-medium">${analytics.tenant.totalBudgetSpent.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Customer Savings</span>
                <span className="font-medium text-green-600">${analytics.tenant.totalSavings.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Revenue</span>
                  <span className="font-medium text-green-600">${analytics.tenant.totalRevenue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs text-gray-500">Global Impact</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Global Campaigns</span>
                <span className="font-medium">{analytics.global.globalCampaignsAffecting}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Est. Savings</span>
                <span className="font-medium text-purple-600">${analytics.global.estimatedGlobalSavings.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="text-xs text-gray-500">
                  Read-only view of global campaigns affecting your tenancy
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs text-gray-500">Performance</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg ROI</span>
                <span className="font-medium">
                  {analytics.tenant.totalBudgetSpent > 0 
                    ? `${((analytics.tenant.totalRevenue / analytics.tenant.totalBudgetSpent) * 100).toFixed(1)}%`
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="font-medium text-orange-600">
                  {analytics.tenant.totalCampaigns > 0 
                    ? `${((analytics.tenant.totalConversions / analytics.tenant.totalCampaigns) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            {CAMPAIGN_STATUSES.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>

          <button
            onClick={fetchCampaigns}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Apply
          </button>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600 mb-4">Create your first campaign to start engaging customers</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-900">{campaign.name}</span>
                        </div>
                        {campaign.description && (
                          <div className="text-sm text-gray-500 mt-1">{campaign.description}</div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Priority: {campaign.priority}
                          </span>
                          <span className="text-xs text-gray-500">
                            {campaign.promotions?.length || 0} promotions
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-gray-900">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(campaign.startDate), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-gray-500">
                          to {format(new Date(campaign.endDate), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-900">
                          {campaign.analytics?.conversions || 0} conversions
                        </div>
                        <div className="text-green-600">
                          ${(campaign.analytics?.totalSavings || 0).toFixed(2)} saved
                        </div>
                        <div className="text-xs text-gray-500">
                          {campaign.limits?.usedCount || 0} / {campaign.limits?.totalUsageLimit || '∞'} uses
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-900">
                          {campaign.budget?.type === 'UNLIMITED' ? 'Unlimited' : `$${campaign.budget?.totalAmount || 0}`}
                        </div>
                        <div className="text-red-600">
                          ${(campaign.budget?.spentAmount || 0).toFixed(2)} spent
                        </div>
                        {campaign.budget?.type !== 'UNLIMITED' && campaign.budget?.totalAmount > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-red-500 h-1.5 rounded-full" 
                              style={{ 
                                width: `${Math.min((campaign.budget.spentAmount / campaign.budget.totalAmount) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {getStatusIcon(campaign.status)}
                        <span className="ml-1">{campaign.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {/* Handle view */}}
                          className="text-blue-600 hover:text-blue-900"
                          title="View campaign"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => {/* Handle edit */}}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit campaign"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        
                        {campaign.status === 'DRAFT' && (
                          <button
                            onClick={() => handleStatusChange(campaign._id, 'ACTIVE')}
                            className="text-green-600 hover:text-green-900"
                            title="Activate campaign"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        
                        {campaign.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleStatusChange(campaign._id, 'PAUSED')}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Pause campaign"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                        
                        {campaign.status === 'PAUSED' && (
                          <button
                            onClick={() => handleStatusChange(campaign._id, 'ACTIVE')}
                            className="text-green-600 hover:text-green-900"
                            title="Resume campaign"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => {/* Handle analytics */}}
                          className="text-purple-600 hover:text-purple-900"
                          title="View analytics"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(campaign._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete campaign"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      <CreateAdminCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchCampaigns}
      />
    </div>
  )
}