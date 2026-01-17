'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/Pagination'
import { api } from '@/lib/api'
import { 
  Users, Search, Phone, Mail, Building2, AlertCircle, Shield, Calendar,
  UserCheck, UserX, RefreshCw, Loader2, Key, Eye
} from 'lucide-react'

const ITEMS_PER_PAGE = 10

interface Staff {
  _id: string
  name: string
  email: string
  phone: string
  role: string
  assignedBranch?: { _id: string; name: string }
  permissions?: Record<string, Record<string, boolean>>
  isActive: boolean
  lastLogin?: string
  createdAt: string
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => { fetchStaff() }, [])

  const fetchStaff = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/admin/staff')
      const users = data.data?.data || data.data?.staff || data.data || []
      setStaff(Array.isArray(users) ? users : [])
    } catch (err: any) {
      console.error('Error fetching staff:', err)
      setError(err.response?.data?.message || err.message || 'Failed to fetch staff')
      setStaff([])
    }
    setLoading(false)
  }

  const filteredStaff = staff.filter(s => {
    const matchesSearch = !search || 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || (statusFilter === 'active' ? s.isActive : !s.isActive)
    const matchesRole = !roleFilter || s.role === roleFilter
    return matchesSearch && matchesStatus && matchesRole
  })

  const totalPages = Math.ceil(filteredStaff.length / ITEMS_PER_PAGE)
  const paginatedStaff = filteredStaff.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  useEffect(() => { setCurrentPage(1) }, [search, statusFilter, roleFilter])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const countPermissions = (perms?: Record<string, Record<string, boolean>>) => {
    if (!perms) return 0
    return Object.values(perms).reduce((sum, m) => sum + Object.values(m).filter(v => v).length, 0)
  }

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; className: string }> = {
      'admin': { label: 'Admin', className: 'bg-blue-100 text-blue-700' },
      'center_admin': { label: 'Center Admin', className: 'bg-green-100 text-green-700' },
      'superadmin': { label: 'Super Admin', className: 'bg-red-100 text-red-700' },
    }
    const config = roleConfig[role] || { label: role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Staff', className: 'bg-gray-100 text-gray-700' }
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>{config.label}</span>
  }

  const viewStaffDetails = (staffMember: Staff) => {
    setSelectedStaff(staffMember)
    setShowDetailsModal(true)
  }

  // Stats
  const activeCount = staff.filter(s => s.isActive).length
  const adminCount = staff.filter(s => s.role === 'admin').length
  const centerAdminCount = staff.filter(s => s.role === 'center_admin').length

  if (loading && staff.length === 0) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
  }

  return (
    <div className="space-y-6 mt-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Users</h1>
          <p className="text-gray-600">View all system users (View Only)</p>
        </div>
        <Button variant="outline" onClick={fetchStaff}>
          <RefreshCw className="w-4 h-4 mr-2" />Refresh
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">View Only Access</p>
          <p className="text-sm text-blue-700">User management (create, edit, delete) is only available to Super Admin.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{staff.length}</p>
              <p className="text-xs text-gray-500">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{activeCount}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{adminCount}</p>
              <p className="text-xs text-gray-500">Admins</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{centerAdminCount}</p>
              <p className="text-xs text-gray-500">Center Admins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)} 
            className="px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="center_admin">Center Admin</option>
          </select>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            className="px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">All Users ({filteredStaff.length})</h2>
        </div>
        
        {filteredStaff.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="divide-y">
            {paginatedStaff.map(s => (
              <div key={s._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${s.isActive ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gray-400'}`}>
                      <span className="text-white font-semibold text-sm">{s.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-800">{s.name}</h3>
                        {getRoleBadge(s.role)}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${s.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                        <span className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1" />{s.email}</span>
                        <span className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1" />{s.phone || 'N/A'}</span>
                        {s.assignedBranch && (
                          <span className="flex items-center"><Building2 className="w-3.5 h-3.5 mr-1" />{s.assignedBranch.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-15 lg:ml-0">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      <Key className="w-3 h-3 inline mr-1" />{countPermissions(s.permissions)} permissions
                    </span>
                    <Button variant="outline" size="sm" onClick={() => viewStaffDetails(s)}>
                      <Eye className="w-4 h-4 mr-1" />View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredStaff.length > ITEMS_PER_PAGE && (
          <Pagination
            current={currentPage}
            pages={totalPages}
            total={filteredStaff.length}
            limit={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
            itemName="users"
          />
        )}
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedStaff && typeof window !== 'undefined' && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">User Details</h3>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${selectedStaff.isActive ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gray-400'}`}>
                  <span className="text-white font-bold text-xl">{selectedStaff.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-800">{selectedStaff.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {getRoleBadge(selectedStaff.role)}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${selectedStaff.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {selectedStaff.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h5 className="font-medium text-gray-700">Contact Information</h5>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{selectedStaff.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{selectedStaff.phone || 'Not provided'}</span>
                  </div>
                  {selectedStaff.assignedBranch && (
                    <div className="flex items-center text-sm">
                      <Building2 className="w-4 h-4 mr-3 text-gray-400" />
                      <span>{selectedStaff.assignedBranch.name}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                    <span>Joined {new Date(selectedStaff.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Permissions Summary */}
              <div className="space-y-3">
                <h5 className="font-medium text-gray-700">Permissions ({countPermissions(selectedStaff.permissions)})</h5>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedStaff.permissions && Object.keys(selectedStaff.permissions).length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(selectedStaff.permissions).map(([module, perms]) => {
                        const activePerms = Object.entries(perms).filter(([, v]) => v).map(([k]) => k)
                        if (activePerms.length === 0) return null
                        return (
                          <div key={module} className="text-sm">
                            <span className="font-medium capitalize">{module}:</span>
                            <span className="text-gray-600 ml-1">{activePerms.join(', ')}</span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No specific permissions assigned</p>
                  )}
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t p-4">
              <Button variant="outline" onClick={() => setShowDetailsModal(false)} className="w-full">
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
