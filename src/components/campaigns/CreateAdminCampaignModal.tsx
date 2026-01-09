'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import {
  Target,
  X,
  Calendar,
  Users,
  DollarSign,
  Percent,
  Tag,
  Star,
  Users2,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader2,
  Building2
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface Promotion {
  _id: string
  name: string
  type: 'DISCOUNT' | 'COUPON' | 'LOYALTY_POINTS' | 'WALLET_CREDIT'
}

interface Template {
  _id: string
  name: string
  description: string
  templateCategory: string
  promotions: any[]
  budget: any
  limits: any
}

interface CreateAdminCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const AUDIENCE_TYPES = [
  { value: 'ALL_USERS', label: 'All Users' },
  { value: 'NEW_USERS', label: 'New Users Only' },
  { value: 'EXISTING_USERS', label: 'Existing Users Only' },
  { value: 'SEGMENT', label: 'User Segment' },
  { value: 'CUSTOM', label: 'Custom Filters' }
]

const BUDGET_TYPES = [
  { value: 'UNLIMITED', label: 'Unlimited Budget' },
  { value: 'FIXED_AMOUNT', label: 'Fixed Amount' },
  { value: 'PER_USER', label: 'Per User Limit' }
]

const TRIGGER_TYPES = [
  { value: 'ORDER_CHECKOUT', label: 'Order Checkout' },
  { value: 'USER_REGISTRATION', label: 'User Registration' },
  { value: 'TIME_BASED', label: 'Time Based' },
  { value: 'BEHAVIOR_BASED', label: 'Behavior Based' }
]

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
]

export default function CreateAdminCampaignModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateAdminCampaignModalProps) {
  const { token } = useAuthStore()
  const [step, setStep] = useState<'method' | 'form'>('method')
  const [creationMethod, setCreationMethod] = useState<'scratch' | 'template'>('scratch')
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [availablePromotions, setAvailablePromotions] = useState<{
    discounts: any[]
    coupons: any[]
    loyaltyPrograms: any[]
  }>({
    discounts: [],
    coupons: [],
    loyaltyPrograms: []
  })

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    priority: 0,
    
    // Triggers - ENHANCED
    triggers: [{
      type: 'ORDER_CHECKOUT',
      conditions: {
        minOrderValue: 0,
        dayOfWeek: [] as string[],
        timeRange: {
          start: '00:00',
          end: '23:59'
        },
        userSegment: '',
        behaviorType: ''
      }
    }],
    
    // Audience - ENHANCED
    audience: {
      targetType: 'ALL_USERS',
      userSegments: [],
      customFilters: {
        minOrderCount: 0,
        maxOrderCount: 0,
        minTotalSpent: 0,
        maxTotalSpent: 0,
        lastOrderDays: 0,
        registrationDays: 0
      }
    },
    
    // Promotions - ENHANCED
    promotions: [] as Array<{
      type: string
      promotionId: string
      promotionModel: string
      overrides: {
        value?: number
        maxDiscount?: number
        minOrderValue?: number
      }
    }>,
    
    // Budget
    budget: {
      type: 'UNLIMITED',
      totalAmount: 1000,
      budgetSource: 'TENANT_BUDGET'
    },
    
    // Limits
    limits: {
      totalUsageLimit: 0,
      perUserLimit: 1,
      dailyLimit: 0
    },
    
    // Stacking - ENHANCED
    stacking: {
      allowStackingWithCoupons: false,
      allowStackingWithDiscounts: false,
      allowStackingWithLoyalty: true,
      stackingPriority: 0
    }
  })

  useEffect(() => {
    if (isOpen && step === 'method') {
      fetchTemplates()
    }
    if (isOpen && step === 'form') {
      fetchAvailablePromotions()
    }
  }, [isOpen, step])

  useEffect(() => {
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        name: selectedTemplate.name + ' - Copy',
        description: selectedTemplate.description,
        promotions: selectedTemplate.promotions || [],
        budget: selectedTemplate.budget || prev.budget,
        limits: selectedTemplate.limits || prev.limits
      }))
    }
  }, [selectedTemplate])

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/campaigns/templates`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setTemplates(data.data.templates || [])
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  const fetchAvailablePromotions = async () => {
    try {
      // Fetch discounts
      const discountsRes = await fetch(`${API_BASE}/admin/discounts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const discountsData = await discountsRes.json()

      // Fetch coupons
      const couponsRes = await fetch(`${API_BASE}/admin/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const couponsData = await couponsRes.json()

      // Fetch loyalty programs
      const loyaltyRes = await fetch(`${API_BASE}/admin/loyalty/programs`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const loyaltyData = await loyaltyRes.json()

      setAvailablePromotions({
        discounts: discountsData.success ? discountsData.data.discounts || [] : [],
        coupons: couponsData.success ? couponsData.data.coupons || [] : [],
        loyaltyPrograms: loyaltyData.success ? loyaltyData.data.programs || [] : []
      })
    } catch (error) {
      console.error('Failed to fetch promotions:', error)
    }
  }

  const handleMethodSelect = (method: 'scratch' | 'template') => {
    setCreationMethod(method)
    setStep('form')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let endpoint = `${API_BASE}/admin/campaigns`
      let payload = { ...formData }

      // If creating from template, use template endpoint
      if (creationMethod === 'template' && selectedTemplate) {
        endpoint = `${API_BASE}/admin/campaigns/templates/${selectedTemplate._id}/create`
        payload = {
          customizations: formData
        }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Campaign created successfully')
        onSuccess?.()
        onClose()
        resetForm()
      } else {
        toast.error(data.message || 'Failed to create campaign')
      }
    } catch (error) {
      console.error('Create campaign error:', error)
      toast.error('Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep('method')
    setCreationMethod('scratch')
    setSelectedTemplate(null)
    setFormData({
      name: '',
      description: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      priority: 0,
      triggers: [{
        type: 'ORDER_CHECKOUT',
        conditions: {
          minOrderValue: 0,
          dayOfWeek: [],
          timeRange: { start: '00:00', end: '23:59' },
          userSegment: '',
          behaviorType: ''
        }
      }],
      audience: {
        targetType: 'ALL_USERS',
        userSegments: [],
        customFilters: {
          minOrderCount: 0,
          maxOrderCount: 0,
          minTotalSpent: 0,
          maxTotalSpent: 0,
          lastOrderDays: 0,
          registrationDays: 0
        }
      },
      promotions: [],
      budget: { type: 'UNLIMITED', totalAmount: 1000, budgetSource: 'TENANT_BUDGET' },
      limits: { totalUsageLimit: 0, perUserLimit: 1, dailyLimit: 0 },
      stacking: { allowStackingWithCoupons: false, allowStackingWithDiscounts: false, allowStackingWithLoyalty: true, stackingPriority: 0 }
    })
  }

  const addPromotion = () => {
    setFormData(prev => ({
      ...prev,
      promotions: [
        ...prev.promotions,
        {
          type: 'DISCOUNT',
          promotionId: '',
          promotionModel: 'Discount',
          overrides: {
            value: undefined,
            maxDiscount: undefined,
            minOrderValue: undefined
          }
        }
      ]
    }))
  }

  const removePromotion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      promotions: prev.promotions.filter((_, i) => i !== index)
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            {step === 'method' ? 'Create Campaign' : `Create ${creationMethod === 'template' ? 'from Template' : 'New'} Campaign`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === 'method' ? (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">How would you like to create your campaign?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Create from Scratch */}
                <button
                  onClick={() => handleMethodSelect('scratch')}
                  className="p-6 border-2 border-gray-200 rounded-lg text-left transition-colors hover:border-blue-300 hover:bg-blue-50"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900 text-lg">Create from Scratch</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Build a completely custom campaign tailored to your specific needs and goals.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Full customization</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-600 mt-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Complete control</span>
                  </div>
                </button>

                {/* Create from Template */}
                <button
                  onClick={() => handleMethodSelect('template')}
                  className="p-6 border-2 border-gray-200 rounded-lg text-left transition-colors hover:border-purple-300 hover:bg-purple-50"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Star className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="font-medium text-gray-900 text-lg">Use Template</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Start with a proven template created by SuperAdmin and customize it for your tenancy.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-purple-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Quick setup</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-purple-600 mt-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>{templates.length} templates available</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Template Selection */}
            {creationMethod === 'template' && templates.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Select a Template</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                  {templates.map((template) => (
                    <button
                      key={template._id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        selectedTemplate?._id === template._id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Star className={`w-4 h-4 ${selectedTemplate?._id === template._id ? 'text-purple-600' : 'text-gray-400'}`} />
                        <span className="font-medium text-gray-900">{template.name}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100">
                          {template.templateCategory}
                        </span>
                        <span>{template.promotions?.length || 0} promotions</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('form')}
                disabled={creationMethod === 'template' && !selectedTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Summer Sale Campaign"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                placeholder="Describe your campaign..."
              />
            </div>

            {/* Schedule */}
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

            {/* Audience Targeting */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <select
                value={formData.audience.targetType}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  audience: { ...formData.audience, targetType: e.target.value as any }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {AUDIENCE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              {/* Custom Audience Filters */}
              {formData.audience.targetType === 'CUSTOM' && (
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h5 className="text-sm font-medium text-gray-900 mb-3">Custom Filters</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Min Order Count
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.audience.customFilters.minOrderCount}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          audience: {
                            ...formData.audience,
                            customFilters: {
                              ...formData.audience.customFilters,
                              minOrderCount: parseInt(e.target.value) || 0
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="0 = no minimum"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Max Order Count
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.audience.customFilters.maxOrderCount}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          audience: {
                            ...formData.audience,
                            customFilters: {
                              ...formData.audience.customFilters,
                              maxOrderCount: parseInt(e.target.value) || 0
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="0 = no maximum"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Min Total Spent (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.audience.customFilters.minTotalSpent}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          audience: {
                            ...formData.audience,
                            customFilters: {
                              ...formData.audience.customFilters,
                              minTotalSpent: parseInt(e.target.value) || 0
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="0 = no minimum"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Max Total Spent (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.audience.customFilters.maxTotalSpent}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          audience: {
                            ...formData.audience,
                            customFilters: {
                              ...formData.audience.customFilters,
                              maxTotalSpent: parseInt(e.target.value) || 0
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="0 = no maximum"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Last Order Within (days)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.audience.customFilters.lastOrderDays}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          audience: {
                            ...formData.audience,
                            customFilters: {
                              ...formData.audience.customFilters,
                              lastOrderDays: parseInt(e.target.value) || 0
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="0 = any time"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Registered Within (days)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.audience.customFilters.registrationDays}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          audience: {
                            ...formData.audience,
                            customFilters: {
                              ...formData.audience.customFilters,
                              registrationDays: parseInt(e.target.value) || 0
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="0 = any time"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Trigger Configuration */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Campaign Triggers</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trigger Type
                  </label>
                  <select
                    value={formData.triggers[0].type}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      triggers: [{ ...formData.triggers[0], type: e.target.value as any }]
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {TRIGGER_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {formData.triggers[0].type === 'ORDER_CHECKOUT' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Order Value (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.triggers[0].conditions.minOrderValue}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          triggers: [{
                            ...formData.triggers[0],
                            conditions: {
                              ...formData.triggers[0].conditions,
                              minOrderValue: parseInt(e.target.value) || 0
                            }
                          }]
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0 = no minimum"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Days of Week (leave empty for all days)
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {DAYS_OF_WEEK.map(day => (
                          <label key={day.value} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={formData.triggers[0].conditions.dayOfWeek?.includes(day.value)}
                              onChange={(e) => {
                                const currentDays = formData.triggers[0].conditions.dayOfWeek || []
                                const newDays = e.target.checked
                                  ? [...currentDays, day.value]
                                  : currentDays.filter(d => d !== day.value)
                                
                                setFormData({ 
                                  ...formData, 
                                  triggers: [{
                                    ...formData.triggers[0],
                                    conditions: {
                                      ...formData.triggers[0].conditions,
                                      dayOfWeek: newDays
                                    }
                                  }]
                                })
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm">{day.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={formData.triggers[0].conditions.timeRange?.start || '00:00'}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            triggers: [{
                              ...formData.triggers[0],
                              conditions: {
                                ...formData.triggers[0].conditions,
                                timeRange: {
                                  ...formData.triggers[0].conditions.timeRange,
                                  start: e.target.value
                                }
                              }
                            }]
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
                          value={formData.triggers[0].conditions.timeRange?.end || '23:59'}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            triggers: [{
                              ...formData.triggers[0],
                              conditions: {
                                ...formData.triggers[0].conditions,
                                timeRange: {
                                  ...formData.triggers[0].conditions.timeRange,
                                  end: e.target.value
                                }
                              }
                            }]
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Budget Configuration */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Budget Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Type
                  </label>
                  <select
                    value={formData.budget.type}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      budget: { ...formData.budget, type: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {BUDGET_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {formData.budget.type !== 'UNLIMITED' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Amount ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.budget.totalAmount}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        budget: { ...formData.budget, totalAmount: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Usage Limits */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Usage Limits</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.limits.totalUsageLimit}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      limits: { ...formData.limits, totalUsageLimit: parseInt(e.target.value) || 0 }
                    })}
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
                    min="1"
                    value={formData.limits.perUserLimit}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      limits: { ...formData.limits, perUserLimit: parseInt(e.target.value) || 1 }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Limit
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.limits.dailyLimit}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      limits: { ...formData.limits, dailyLimit: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0 = unlimited"
                  />
                </div>
              </div>
            </div>

            {/* Stacking Rules */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Stacking Rules</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.stacking.allowStackingWithCoupons}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      stacking: { ...formData.stacking, allowStackingWithCoupons: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Allow Stacking with Coupons</span>
                    <p className="text-xs text-gray-500">Campaign can be combined with coupon codes</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.stacking.allowStackingWithDiscounts}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      stacking: { ...formData.stacking, allowStackingWithDiscounts: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Allow Stacking with Discounts</span>
                    <p className="text-xs text-gray-500">Campaign can be combined with automatic discounts</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.stacking.allowStackingWithLoyalty}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      stacking: { ...formData.stacking, allowStackingWithLoyalty: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Allow Stacking with Loyalty</span>
                    <p className="text-xs text-gray-500">Campaign can be combined with loyalty rewards</p>
                  </div>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stacking Priority (higher = applied first)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.stacking.stackingPriority}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      stacking: { ...formData.stacking, stackingPriority: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Promotions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">Attached Promotions</h4>
                <button
                  type="button"
                  onClick={addPromotion}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Promotion
                </button>
              </div>

              {formData.promotions.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Tag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No promotions added yet</p>
                  <button
                    type="button"
                    onClick={addPromotion}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add First Promotion
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.promotions.map((promotion, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                      <div className="flex items-center gap-4">
                        <select
                          value={promotion.type}
                          onChange={(e) => {
                            const newPromotions = [...formData.promotions]
                            newPromotions[index] = { 
                              ...promotion, 
                              type: e.target.value as any,
                              promotionId: '', // Reset ID when type changes
                              promotionModel: e.target.value === 'DISCOUNT' ? 'Discount' : 
                                             e.target.value === 'COUPON' ? 'Coupon' : 
                                             'LoyaltyProgram'
                            }
                            setFormData({ ...formData, promotions: newPromotions })
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="DISCOUNT">Discount</option>
                          <option value="COUPON">Coupon</option>
                          <option value="LOYALTY_POINTS">Loyalty Points</option>
                          <option value="WALLET_CREDIT">Wallet Credit</option>
                        </select>

                        <select
                          value={promotion.promotionId}
                          onChange={(e) => {
                            const newPromotions = [...formData.promotions]
                            newPromotions[index] = { ...promotion, promotionId: e.target.value }
                            setFormData({ ...formData, promotions: newPromotions })
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select {promotion.type === 'DISCOUNT' ? 'Discount' : 
                                                      promotion.type === 'COUPON' ? 'Coupon' : 
                                                      'Loyalty Program'}</option>
                          
                          {promotion.type === 'DISCOUNT' && availablePromotions.discounts.map(discount => (
                            <option key={discount._id} value={discount._id}>
                              {discount.name} - {discount.rules?.[0]?.value || 0}% off
                            </option>
                          ))}
                          
                          {promotion.type === 'COUPON' && availablePromotions.coupons.map(coupon => (
                            <option key={coupon._id} value={coupon._id}>
                              {coupon.code} - {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`} off
                            </option>
                          ))}
                          
                          {(promotion.type === 'LOYALTY_POINTS' || promotion.type === 'WALLET_CREDIT') && 
                           availablePromotions.loyaltyPrograms.map(program => (
                            <option key={program._id} value={program._id}>
                              {program.name} - {program.pointsConfig?.earningRate || 1} pts/₹
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => removePromotion(index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Promotion Overrides */}
                      <div className="pl-4 border-l-2 border-blue-200 space-y-2">
                        <p className="text-xs font-medium text-gray-700">Override Settings (optional)</p>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Value</label>
                            <input
                              type="number"
                              min="0"
                              value={promotion.overrides?.value || ''}
                              onChange={(e) => {
                                const newPromotions = [...formData.promotions]
                                newPromotions[index] = {
                                  ...promotion,
                                  overrides: {
                                    ...promotion.overrides,
                                    value: parseInt(e.target.value) || undefined
                                  }
                                }
                                setFormData({ ...formData, promotions: newPromotions })
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Auto"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Max Discount</label>
                            <input
                              type="number"
                              min="0"
                              value={promotion.overrides?.maxDiscount || ''}
                              onChange={(e) => {
                                const newPromotions = [...formData.promotions]
                                newPromotions[index] = {
                                  ...promotion,
                                  overrides: {
                                    ...promotion.overrides,
                                    maxDiscount: parseInt(e.target.value) || undefined
                                  }
                                }
                                setFormData({ ...formData, promotions: newPromotions })
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Auto"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Min Order</label>
                            <input
                              type="number"
                              min="0"
                              value={promotion.overrides?.minOrderValue || ''}
                              onChange={(e) => {
                                const newPromotions = [...formData.promotions]
                                newPromotions[index] = {
                                  ...promotion,
                                  overrides: {
                                    ...promotion.overrides,
                                    minOrderValue: parseInt(e.target.value) || undefined
                                  }
                                }
                                setFormData({ ...formData, promotions: newPromotions })
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Auto"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-between pt-6 border-t">
              <button
                type="button"
                onClick={() => setStep('method')}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Back
              </button>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.name}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Campaign
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}