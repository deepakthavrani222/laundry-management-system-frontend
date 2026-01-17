'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuthStore } from '@/store/authStore'
import {
  Star,
  Plus,
  Search,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Users,
  TrendingUp,
  X,
  Loader2,
  Filter,
  Award,
  CreditCard,
  Gift,
  Crown,
  Target
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface LoyaltyProgram {
  _id: string
  name: string
  description?: string
  type: 'points' | 'tiered' | 'punch_card' | 'cashback' | 'subscription'
  autoEnrollment: boolean
  startDate: string
  endDate?: string
  isActive: boolean
  totalMembers: number
  activeMembers: number
  totalPointsIssued: number
  totalPointsRedeemed: number
  createdAt: string
}

interface LoyaltyStats {
  totalPrograms: number
  activePrograms: number
  totalMembers: number
  activeMembers: number
  totalPointsIssued: number
  totalPointsRedeemed: number
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const PROGRAM_TYPES = [
  { value: 'points', label: 'Points System', icon: Star, description: 'Earn and redeem points' },
  { value: 'tiered', label: 'Tiered Loyalty', icon: Crown, description: 'Silver, Gold, Platinum tiers' },
  { value: 'punch_card', label: 'Punch Card', icon: Target, description: 'Buy X, get 1 free' },
  { value: 'cashback', label: 'Cashback', icon: CreditCard, description: 'Percentage back as credit' }
]

export default function LoyaltyPage() {
  const { token } = useAuthStore()
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([])
  const [stats, setStats] = useState<LoyaltyStats>({
    totalPrograms: 0,
    activePrograms: 0,
    totalMembers: 0,
    activeMembers: 0,
    totalPointsIssued: 0,
    totalPointsRedeemed: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingProgram, setEditingProgram] = useState<LoyaltyProgram | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'points' as const,
    autoEnrollment: true,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    isActive: true
  })

  useEffect(() => {
    fetchPrograms()
    fetchStats()
  }, [])

  const fetchPrograms = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (typeFilter !== 'all') params.append('type', typeFilter)

      const res = await fetch(`${API_BASE}/admin/loyalty/programs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setPrograms(data.data.programs || [])
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error)
      toast.error('Failed to load loyalty programs')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/loyalty/programs/stats`, {
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
        ? `${API_BASE}/admin/loyalty/programs/${editingProgram._id}`
        : `${API_BASE}/admin/loyalty/programs`
      
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
        toast.success(`Loyalty program ${editingProgram ? 'updated' : 'created'} successfully`)
        setShowModal(false)
        resetForm()
        fetchPrograms()
        fetchStats()
      } else {
        toast.error(data.message || 'Failed to save loyalty program')
      }
    } catch (error) {
      console.error('Save program error:', error)
      toast.error('Failed to save loyalty program')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (program: LoyaltyProgram) => {
    setEditingProgram(program)
    setFormData({
      name: program.name,
      description: program.description || '',
      type: program.type,
      autoEnrollment: program.autoEnrollment,
      startDate: format(new Date(program.startDate), 'yyyy-MM-dd'),
      endDate: program.endDate ? format(new Date(program.endDate), 'yyyy-MM-dd') : '',
      isActive: program.isActive
    })
    setShowModal(true)
  }

  const handleDelete = async (programId: string) => {
    if (!confirm('Are you sure you want to delete this loyalty program?')) return

    try {
      const res = await fetch(`${API_BASE}/admin/loyalty/programs/${programId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Loyalty program deleted successfully')
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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'points',
      autoEnrollment: true,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      isActive: true
    })
    setEditingProgram(null)
  }

  const getProgramTypeDisplay = (type: string) => {
    const programType = PROGRAM_TYPES.find(t => t.value === type)
    return programType ? programType.label : type
  }

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && program.isActive) ||
                         (statusFilter === 'inactive' && !program.isActive)
    const matchesType = typeFilter === 'all' || program.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loyalty Management</h1>
          <p className="text-gray-600">Create and manage customer loyalty programs</p>
        </div>
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Programs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPrograms}</p>
            </div>
            <Star className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.activePrograms}</p>
            </div>
            <ToggleRight className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Members</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalMembers}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Members</p>
              <p className="text-2xl font-bold text-orange-600">{stats.activeMembers}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Points Issued</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.totalPointsIssued.toLocaleString()}</p>
            </div>
            <Gift className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Points Redeemed</p>
              <p className="text-2xl font-bold text-pink-600">{stats.totalPointsRedeemed.toLocaleString()}</p>
            </div>
            <Award className="w-8 h-8 text-pink-600" />
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

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {PROGRAM_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
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
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No loyalty programs found</h3>
            <p className="text-gray-600 mb-4">Create your first loyalty program to get started</p>
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
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Members
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points Activity
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
                          Auto-enroll: {program.autoEnrollment ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getProgramTypeDisplay(program.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {program.activeMembers} / {program.totalMembers}
                      </div>
                      <div className="text-xs text-gray-500">
                        {program.totalMembers > 0 
                          ? `${Math.round((program.activeMembers / program.totalMembers) * 100)}% active`
                          : 'No members yet'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        Issued: {program.totalPointsIssued.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Redeemed: {program.totalPointsRedeemed.toLocaleString()}
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

      {/* Create/Edit Program Modal */}
      {showModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingProgram ? 'Edit Loyalty Program' : 'Create New Loyalty Program'}
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
                    Program Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., VIP Rewards Program"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {PROGRAM_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
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
                  placeholder="Describe your loyalty program..."
                />
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
                    End Date (optional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoEnrollment"
                    checked={formData.autoEnrollment}
                    onChange={(e) => setFormData({ ...formData, autoEnrollment: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="autoEnrollment" className="text-sm text-gray-700">
                    Auto-enroll new customers
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Active (program will accept new members)
                  </label>
                </div>
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