'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuthStore } from '@/store/authStore'
import {
  Users2,
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
  Copy,
  ExternalLink,
  Gift,
  Star,
  CreditCard
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface ReferralReward {
  type: 'credit' | 'coupon' | 'discount' | 'points' | 'free_service'
  value: number
  couponCode?: string
  serviceId?: string
  pointsType?: string
}

interface ReferralProgram {
  _id: string
  name: string
  description?: string
  referrerReward: ReferralReward
  refereeReward: ReferralReward
  minOrderValue: number
  maxReferralsPerUser: number
  referralCodeExpiry: number
  enableMultiLevel: boolean
  maxLevels: number
  startDate: string
  endDate: string
  isActive: boolean
  totalReferrals: number
  successfulReferrals: number
  totalRewardsGiven: number
  createdAt: string
}

interface Referral {
  _id: string
  program: {
    _id: string
    name: string
  }
  referrer: {
    _id: string
    name: string
    email: string
  }
  referee?: {
    _id: string
    name: string
    email: string
  }
  code: string
  link: string
  status: 'pending' | 'completed' | 'expired' | 'cancelled'
  clicks: number
  signups: number
  conversions: number
  completedAt?: string
  firstOrderValue?: number
  referrerRewardGiven: boolean
  refereeRewardGiven: boolean
  expiresAt: string
  createdAt: string
}

interface ReferralStats {
  totalPrograms: number
  activePrograms: number
  totalReferrals: number
  successfulReferrals: number
  totalRewards: number
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const REWARD_TYPES = [
  { value: 'credit', label: 'Account Credit', icon: CreditCard },
  { value: 'coupon', label: 'Coupon Code', icon: Gift },
  { value: 'discount', label: 'Discount %', icon: TrendingUp },
  { value: 'points', label: 'Loyalty Points', icon: Star },
  { value: 'free_service', label: 'Free Service', icon: Users2 }
]

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800'
}

export default function ReferralsPage() {
  const { token } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'programs' | 'referrals'>('programs')
  const [programs, setPrograms] = useState<ReferralProgram[]>([])
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [stats, setStats] = useState<ReferralStats>({
    totalPrograms: 0,
    activePrograms: 0,
    totalReferrals: 0,
    successfulReferrals: 0,
    totalRewards: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingProgram, setEditingProgram] = useState<ReferralProgram | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    referrerReward: {
      type: 'credit' as const,
      value: 10
    },
    refereeReward: {
      type: 'credit' as const,
      value: 10
    },
    minOrderValue: 0,
    maxReferralsPerUser: 0,
    referralCodeExpiry: 30,
    enableMultiLevel: false,
    maxLevels: 1,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    isActive: true
  })

  useEffect(() => {
    if (activeTab === 'programs') {
      fetchPrograms()
      fetchStats()
    } else {
      fetchReferrals()
    }
  }, [activeTab])

  const fetchPrograms = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const res = await fetch(`${API_BASE}/admin/referrals/programs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setPrograms(data.data.programs || [])
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error)
      toast.error('Failed to load referral programs')
    } finally {
      setLoading(false)
    }
  }

  const fetchReferrals = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/admin/referrals`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setReferrals(data.data.referrals || [])
      }
    } catch (error) {
      console.error('Failed to fetch referrals:', error)
      toast.error('Failed to load referrals')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/referrals/programs/stats`, {
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
      const url = editingProgram
        ? `${API_BASE}/admin/referrals/programs/${editingProgram._id}`
        : `${API_BASE}/admin/referrals/programs`
      
      const method = editingProgram ? 'PUT' : 'POST'

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
        toast.success(`Referral program ${editingProgram ? 'updated' : 'created'} successfully`)
        setShowModal(false)
        resetForm()
        fetchPrograms()
        fetchStats()
      } else {
        toast.error(data.message || 'Failed to save referral program')
      }
    } catch (error) {
      console.error('Save program error:', error)
      toast.error('Failed to save referral program')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (program: ReferralProgram) => {
    setEditingProgram(program)
    setFormData({
      name: program.name,
      description: program.description || '',
      referrerReward: program.referrerReward,
      refereeReward: program.refereeReward,
      minOrderValue: program.minOrderValue,
      maxReferralsPerUser: program.maxReferralsPerUser,
      referralCodeExpiry: program.referralCodeExpiry,
      enableMultiLevel: program.enableMultiLevel,
      maxLevels: program.maxLevels,
      startDate: format(new Date(program.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(program.endDate), 'yyyy-MM-dd'),
      isActive: program.isActive
    })
    setShowModal(true)
  }

  const handleDelete = async (programId: string) => {
    if (!confirm('Are you sure you want to delete this referral program?')) return

    try {
      const res = await fetch(`${API_BASE}/admin/referrals/programs/${programId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Referral program deleted successfully')
        fetchPrograms()
        fetchStats()
      } else {
        toast.error(data.message || 'Failed to delete program')
      }
    } catch (error) {
      console.error('Delete program error:', error)
      toast.error('Failed to delete program')
    }
  }

  const copyReferralLink = (link: string) => {
    navigator.clipboard.writeText(link)
    toast.success('Referral link copied to clipboard!')
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      referrerReward: {
        type: 'credit',
        value: 10
      },
      refereeReward: {
        type: 'credit',
        value: 10
      },
      minOrderValue: 0,
      maxReferralsPerUser: 0,
      referralCodeExpiry: 30,
      enableMultiLevel: false,
      maxLevels: 1,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      isActive: true
    })
    setEditingProgram(null)
  }

  const getRewardDisplay = (reward: ReferralReward) => {
    switch (reward.type) {
      case 'credit':
        return `$${reward.value} credit`
      case 'coupon':
        return `${reward.value}% coupon`
      case 'discount':
        return `${reward.value}% discount`
      case 'points':
        return `${reward.value} points`
      case 'free_service':
        return 'Free service'
      default:
        return `${reward.value} reward`
    }
  }

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && program.isActive) ||
                         (statusFilter === 'inactive' && !program.isActive)
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referral Management</h1>
          <p className="text-gray-600">Manage referral programs and track referral performance</p>
        </div>
        {activeTab === 'programs' && (
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Program
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('programs')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'programs'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Programs
        </button>
        <button
          onClick={() => setActiveTab('referrals')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'referrals'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Referrals
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Programs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPrograms}</p>
            </div>
            <Users2 className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Programs</p>
              <p className="text-2xl font-bold text-green-600">{stats.activePrograms}</p>
            </div>
            <ToggleRight className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Referrals</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalReferrals}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Successful</p>
              <p className="text-2xl font-bold text-orange-600">{stats.successfulReferrals}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rewards Given</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.totalRewards}</p>
            </div>
            <Gift className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {activeTab === 'programs' && (
        <>
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search programs..."
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

              <button
                onClick={fetchPrograms}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Apply
              </button>
            </div>
          </div>

          {/* Programs Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : filteredPrograms.length === 0 ? (
              <div className="text-center py-12">
                <Users2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No referral programs found</h3>
                <p className="text-gray-600 mb-4">Create your first referral program to get started</p>
                <button
                  onClick={() => {
                    resetForm()
                    setShowModal(true)
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Program
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Program
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rewards
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
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
                    {filteredPrograms.map((program) => (
                      <tr key={program._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{program.name}</div>
                            {program.description && (
                              <div className="text-sm text-gray-500">{program.description}</div>
                            )}
                            <div className="text-xs text-gray-400 mt-1">
                              Min order: ${program.minOrderValue} • Expires: {program.referralCodeExpiry} days
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="text-gray-600">Referrer:</span>{' '}
                              <span className="font-medium text-blue-600">
                                {getRewardDisplay(program.referrerReward)}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-600">Referee:</span>{' '}
                              <span className="font-medium text-green-600">
                                {getRewardDisplay(program.refereeReward)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {program.successfulReferrals} / {program.totalReferrals}
                          </div>
                          <div className="text-xs text-gray-500">
                            {program.totalReferrals > 0 
                              ? `${Math.round((program.successfulReferrals / program.totalReferrals) * 100)}% success rate`
                              : 'No referrals yet'
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {format(new Date(program.startDate), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-sm text-gray-500">
                            to {format(new Date(program.endDate), 'MMM dd, yyyy')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              program.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {program.isActive ? (
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
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(program)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(program._id)}
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
        </>
      )}

      {activeTab === 'referrals' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-12">
              <Users2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No referrals found</h3>
              <p className="text-gray-600">Referrals will appear here when customers start referring others</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referral Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referrer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
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
                  {referrals.map((referral) => (
                    <tr key={referral._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 font-mono">
                            {referral.code}
                          </div>
                          <div className="text-xs text-gray-500">
                            {referral.program.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            Expires: {format(new Date(referral.expiresAt), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {referral.referrer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {referral.referrer.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {referral.referee ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {referral.referee.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {referral.referee.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No signup yet</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm space-y-1">
                          <div>Clicks: <span className="font-medium">{referral.clicks}</span></div>
                          <div>Signups: <span className="font-medium">{referral.signups}</span></div>
                          <div>Conversions: <span className="font-medium">{referral.conversions}</span></div>
                          {referral.firstOrderValue && (
                            <div className="text-xs text-green-600">
                              First order: ${referral.firstOrderValue}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            STATUS_COLORS[referral.status]
                          }`}
                        >
                          {referral.status}
                        </span>
                        {referral.status === 'completed' && (
                          <div className="text-xs text-gray-500 mt-1">
                            {format(new Date(referral.completedAt!), 'MMM dd, yyyy')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => copyReferralLink(referral.link)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          title="Copy referral link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Program Modal */}
      {showModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingProgram ? 'Edit Referral Program' : 'Create New Referral Program'}
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
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Friend Referral Program"
                  />
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
                    placeholder="Describe your referral program..."
                  />
                </div>
              </div>

              {/* Rewards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Referrer Reward */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Referrer Reward</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reward Type
                      </label>
                      <select
                        value={formData.referrerReward.type}
                        onChange={(e) => setFormData({
                          ...formData,
                          referrerReward: { ...formData.referrerReward, type: e.target.value as any }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {REWARD_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {formData.referrerReward.type === 'credit' ? 'Amount ($)' : 
                         formData.referrerReward.type === 'points' ? 'Points' : 'Value'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step={formData.referrerReward.type === 'credit' ? '0.01' : '1'}
                        value={formData.referrerReward.value}
                        onChange={(e) => setFormData({
                          ...formData,
                          referrerReward: { ...formData.referrerReward, value: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Referee Reward */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Referee Reward</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reward Type
                      </label>
                      <select
                        value={formData.refereeReward.type}
                        onChange={(e) => setFormData({
                          ...formData,
                          refereeReward: { ...formData.refereeReward, type: e.target.value as any }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {REWARD_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {formData.refereeReward.type === 'credit' ? 'Amount ($)' : 
                         formData.refereeReward.type === 'points' ? 'Points' : 'Value'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step={formData.refereeReward.type === 'credit' ? '0.01' : '1'}
                        value={formData.refereeReward.value}
                        onChange={(e) => setFormData({
                          ...formData,
                          refereeReward: { ...formData.refereeReward, value: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Order Value ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Referrals per User
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxReferralsPerUser}
                    onChange={(e) => setFormData({ ...formData, maxReferralsPerUser: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0 = unlimited"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code Expiry (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.referralCodeExpiry}
                    onChange={(e) => setFormData({ ...formData, referralCodeExpiry: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
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
                  Active (program will accept new referrals)
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
                  {editingProgram ? 'Update Program' : 'Create Program'}
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