'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuthStore } from '@/store/authStore'
import {
  Percent,
  Plus,
  Search,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  X,
  Loader2,
  Filter,
  ChevronDown
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface DiscountRule {
  type: 'percentage' | 'fixed_amount' | 'tiered' | 'conditional'
  value: number
  tiers?: Array<{
    minQuantity: number
    minValue: number
    discountPercentage: number
    discountAmount: number
  }>
  conditions?: {
    timeOfDay?: {
      startTime: string
      endTime: string
    }
    daysOfWeek?: number[]
    userType?: string
    minOrderValue?: number
    maxOrderValue?: number
    applicableServices?: string[]
    excludeServices?: string[]
  }
}

interface Discount {
  _id: string
  name: string
  description?: string
  rules: DiscountRule[]
  priority: number
  canStackWithCoupons: boolean
  canStackWithOtherDiscounts: boolean
  startDate: string
  endDate: string
  usageLimit: number
  usedCount: number
  perUserLimit: number
  isActive: boolean
  totalSavings: number
  totalOrders: number
  createdAt: string
}

interface DiscountStats {
  total: number
  active: number
  totalSavings: number
  totalOrders: number
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const DISCOUNT_TYPES = [
  { value: 'percentage', label: 'Percentage Off', icon: Percent },
  { value: 'fixed_amount', label: 'Fixed Amount Off', icon: DollarSign },
  { value: 'tiered', label: 'Tiered Discount', icon: TrendingUp },
  { value: 'conditional', label: 'Conditional Discount', icon: Users }
]

const USER_TYPES = [
  { value: 'all', label: 'All Users' },
  { value: 'new', label: 'New Users' },
  { value: 'returning', label: 'Returning Users' },
  { value: 'vip', label: 'VIP Users' },
  { value: 'senior', label: 'Senior Citizens' }
]

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
]

export default function DiscountsPage() {
  const { token } = useAuthStore()
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [stats, setStats] = useState<DiscountStats>({
    total: 0,
    active: 0,
    totalSavings: 0,
    totalOrders: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: [{
      type: 'percentage' as const,
      value: 10,
      conditions: {
        userType: 'all',
        minOrderValue: 0,
        maxOrderValue: 0,
        daysOfWeek: [] as number[],
        timeOfDay: {
          startTime: '',
          endTime: ''
        }
      }
    }],
    priority: 0,
    canStackWithCoupons: true,
    canStackWithOtherDiscounts: false,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    usageLimit: 0,
    perUserLimit: 0,
    isActive: true
  })

  useEffect(() => {
    fetchDiscounts()
    fetchStats()
  }, [])

  const fetchDiscounts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (typeFilter !== 'all') params.append('type', typeFilter)

      const res = await fetch(`${API_BASE}/admin/discounts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setDiscounts(data.data.discounts || [])
      }
    } catch (error) {
      console.error('Failed to fetch discounts:', error)
      toast.error('Failed to load discounts')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/discounts/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setStats(data.data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingDiscount
        ? `${API_BASE}/admin/discounts/${editingDiscount._id}`
        : `${API_BASE}/admin/discounts`
      
      const method = editingDiscount ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(`Discount ${editingDiscount ? 'updated' : 'created'} successfully`)
        setShowModal(false)
        resetForm()
        fetchDiscounts()
        fetchStats()
      } else {
        toast.error(data.message || 'Failed to save discount')
      }
    } catch (error) {
      console.error('Save discount error:', error)
      toast.error('Failed to save discount')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount)
    setFormData({
      name: discount.name,
      description: discount.description || '',
      rules: discount.rules,
      priority: discount.priority,
      canStackWithCoupons: discount.canStackWithCoupons,
      canStackWithOtherDiscounts: discount.canStackWithOtherDiscounts,
      startDate: format(new Date(discount.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(discount.endDate), 'yyyy-MM-dd'),
      usageLimit: discount.usageLimit,
      perUserLimit: discount.perUserLimit,
      isActive: discount.isActive
    })
    setShowModal(true)
  }

  const handleDelete = async (discountId: string) => {
    if (!confirm('Are you sure you want to delete this discount?')) return

    try {
      const res = await fetch(`${API_BASE}/admin/discounts/${discountId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Discount deleted successfully')
        fetchDiscounts()
        fetchStats()
      } else {
        toast.error(data.message || 'Failed to delete discount')
      }
    } catch (error) {
      console.error('Delete discount error:', error)
      toast.error('Failed to delete discount')
    }
  }

  const handleToggleStatus = async (discountId: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin/discounts/${discountId}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Discount status updated')
        fetchDiscounts()
        fetchStats()
      } else {
        toast.error(data.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Toggle status error:', error)
      toast.error('Failed to update status')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      rules: [{
        type: 'percentage',
        value: 10,
        conditions: {
          userType: 'all',
          minOrderValue: 0,
          maxOrderValue: 0,
          daysOfWeek: [],
          timeOfDay: {
            startTime: '',
            endTime: ''
          }
        }
      }],
      priority: 0,
      canStackWithCoupons: true,
      canStackWithOtherDiscounts: false,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      usageLimit: 0,
      perUserLimit: 0,
      isActive: true
    })
    setEditingDiscount(null)
  }

  const addRule = () => {
    setFormData({
      ...formData,
      rules: [...formData.rules, {
        type: 'percentage',
        value: 10,
        conditions: {
          userType: 'all',
          minOrderValue: 0,
          maxOrderValue: 0,
          daysOfWeek: [],
          timeOfDay: {
            startTime: '',
            endTime: ''
          }
        }
      }]
    })
  }

  const removeRule = (index: number) => {
    if (formData.rules.length > 1) {
      setFormData({
        ...formData,
        rules: formData.rules.filter((_, i) => i !== index)
      })
    }
  }

  const updateRule = (index: number, updates: Partial<DiscountRule>) => {
    const newRules = [...formData.rules]
    newRules[index] = { ...newRules[index], ...updates }
    setFormData({ ...formData, rules: newRules })
  }

  const filteredDiscounts = discounts.filter(discount => {
    const matchesSearch = discount.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         discount.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && discount.isActive) ||
                         (statusFilter === 'inactive' && !discount.isActive)
    const matchesType = typeFilter === 'all' || 
                       discount.rules.some(rule => rule.type === typeFilter)
    
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discount Management</h1>
          <p className="text-gray-600">Create and manage automatic discounts for your customers</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Discount
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Discounts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Percent className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Discounts</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <ToggleRight className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Savings</p>
              <p className="text-2xl font-bold text-purple-600">${stats.totalSavings.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Orders with Discounts</p>
              <p className="text-2xl font-bold text-orange-600">{stats.totalOrders}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search discounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {DISCOUNT_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          <button
            onClick={fetchDiscounts}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Apply
          </button>
        </div>
      </div>

      {/* Discounts Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : filteredDiscounts.length === 0 ? (
          <div className="text-center py-12">
            <Percent className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No discounts found</h3>
            <p className="text-gray-600 mb-4">Create your first discount to get started</p>
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Discount
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
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
                {filteredDiscounts.map((discount) => (
                  <tr key={discount._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{discount.name}</div>
                        {discount.description && (
                          <div className="text-sm text-gray-500">{discount.description}</div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          Priority: {discount.priority}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {discount.rules.map((rule, index) => (
                          <div key={index} className="text-sm">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {rule.type === 'percentage' ? `${rule.value}% off` : 
                               rule.type === 'fixed_amount' ? `$${rule.value} off` :
                               rule.type === 'tiered' ? 'Tiered discount' :
                               'Conditional discount'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {discount.usedCount} / {discount.usageLimit || '∞'}
                      </div>
                      <div className="text-xs text-gray-500">
                        ${discount.totalSavings.toFixed(2)} saved
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {format(new Date(discount.startDate), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-sm text-gray-500">
                        to {format(new Date(discount.endDate), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(discount._id)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          discount.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {discount.isActive ? (
                          <>
                            <ToggleRight className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(discount)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(discount._id)}
                          className="text-red-600 hover:text-red-900"
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

      {/* Create/Edit Modal */}
      {showModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingDiscount ? 'Edit Discount' : 'Create New Discount'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Weekend Special"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Higher numbers have higher priority</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe when and how this discount applies..."
                />
              </div>

              {/* Discount Rules */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Discount Rules *
                  </label>
                  <button
                    type="button"
                    onClick={addRule}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Rule
                  </button>
                </div>

                {formData.rules.map((rule, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-700">Rule {index + 1}</h4>
                      {formData.rules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRule(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Discount Type
                        </label>
                        <select
                          value={rule.type}
                          onChange={(e) => updateRule(index, { type: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {DISCOUNT_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {rule.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step={rule.type === 'percentage' ? '1' : '0.01'}
                          max={rule.type === 'percentage' ? '100' : undefined}
                          value={rule.value}
                          onChange={(e) => updateRule(index, { value: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Conditions */}
                    {rule.conditions && (
                      <div className="mt-4 space-y-4">
                        <h5 className="text-sm font-medium text-gray-700">Conditions</h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              User Type
                            </label>
                            <select
                              value={rule.conditions.userType || 'all'}
                              onChange={(e) => updateRule(index, {
                                conditions: { ...rule.conditions, userType: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              {USER_TYPES.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Min Order Value ($)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={rule.conditions.minOrderValue || 0}
                              onChange={(e) => updateRule(index, {
                                conditions: { ...rule.conditions, minOrderValue: parseFloat(e.target.value) || 0 }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Start Time
                            </label>
                            <input
                              type="time"
                              value={rule.conditions.timeOfDay?.startTime || ''}
                              onChange={(e) => updateRule(index, {
                                conditions: {
                                  ...rule.conditions,
                                  timeOfDay: {
                                    ...rule.conditions.timeOfDay,
                                    startTime: e.target.value
                                  }
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              End Time
                            </label>
                            <input
                              type="time"
                              value={rule.conditions.timeOfDay?.endTime || ''}
                              onChange={(e) => updateRule(index, {
                                conditions: {
                                  ...rule.conditions,
                                  timeOfDay: {
                                    ...rule.conditions.timeOfDay,
                                    endTime: e.target.value
                                  }
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Days of Week
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {DAYS_OF_WEEK.map(day => (
                              <label key={day.value} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={rule.conditions.daysOfWeek?.includes(day.value) || false}
                                  onChange={(e) => {
                                    const currentDays = rule.conditions.daysOfWeek || []
                                    const newDays = e.target.checked
                                      ? [...currentDays, day.value]
                                      : currentDays.filter(d => d !== day.value)
                                    updateRule(index, {
                                      conditions: { ...rule.conditions, daysOfWeek: newDays }
                                    })
                                  }}
                                  className="mr-2"
                                />
                                <span className="text-sm">{day.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Validity Period */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Usage Limits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0 = unlimited"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Per User Limit
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.perUserLimit}
                    onChange={(e) => setFormData({ ...formData, perUserLimit: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0 = unlimited"
                  />
                </div>
              </div>

              {/* Stacking Options */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Stacking Options</h4>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="stackCoupons"
                    checked={formData.canStackWithCoupons}
                    onChange={(e) => setFormData({ ...formData, canStackWithCoupons: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="stackCoupons" className="text-sm text-gray-700">
                    Can stack with coupons
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="stackDiscounts"
                    checked={formData.canStackWithOtherDiscounts}
                    onChange={(e) => setFormData({ ...formData, canStackWithOtherDiscounts: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="stackDiscounts" className="text-sm text-gray-700">
                    Can stack with other discounts
                  </label>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active (discount will be applied automatically)
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingDiscount ? 'Update Discount' : 'Create Discount'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}