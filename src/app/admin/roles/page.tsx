'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { 
  Shield, Search, Plus, Edit2, Trash2, AlertCircle, 
  RefreshCw, Loader2, Check, X, Users, UserCog
} from 'lucide-react'

interface ModulePermission {
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
}

interface Role {
  _id: string
  name: string
  slug: string
  description: string
  permissions: Record<string, ModulePermission>
  isDefault: boolean
  isActive: boolean
  color: string
  createdAt: string
}

interface User {
  _id: string
  name: string
  email: string
  phone: string
  role: string
  roleId?: { _id: string; name: string; color: string }
  isActive: boolean
  assignedBranch?: { _id: string; name: string }
}

interface PermissionModule {
  key: string
  name: string
  description: string
}

const PERMISSION_ACTIONS = ['view', 'create', 'edit', 'delete'] as const

export default function AdminRolesPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'users'>('roles')
  const [roles, setRoles] = useState<Role[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [modules, setModules] = useState<PermissionModule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [saving, setSaving] = useState(false)
  
  // User assignment modal
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    permissions: {} as Record<string, ModulePermission>
  })

  useEffect(() => {
    fetchRoles()
    fetchModules()
    fetchUsers()
  }, [])

  const fetchRoles = async () => {
    try {
      const { data } = await api.get('/admin/roles')
      setRoles(data.data?.roles || [])
    } catch (err: any) {
      console.error('Failed to fetch roles:', err)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/roles/users/list')
      setUsers(data.data?.users || [])
    } catch (err: any) {
      console.error('Failed to fetch users:', err)
    }
    setLoading(false)
  }

  const fetchModules = async () => {
    try {
      const { data } = await api.get('/admin/roles/modules')
      setModules(data.data?.modules || [])
    } catch (err) {
      console.error('Failed to fetch modules:', err)
    }
  }

  const initializePermissions = (): Record<string, ModulePermission> => {
    const perms: Record<string, ModulePermission> = {}
    modules.forEach(m => {
      perms[m.key] = { view: false, create: false, edit: false, delete: false }
    })
    return perms
  }

  const openCreateModal = () => {
    setEditingRole(null)
    setFormData({
      name: '',
      description: '',
      color: '#6366f1',
      permissions: initializePermissions()
    })
    setShowModal(true)
  }

  const openEditModal = (role: Role) => {
    setEditingRole(role)
    setFormData({
      name: role.name,
      description: role.description,
      color: role.color,
      permissions: { ...role.permissions }
    })
    setShowModal(true)
  }

  const openAssignModal = (user: User) => {
    setSelectedUser(user)
    setSelectedRoleId(user.roleId?._id || '')
    setShowAssignModal(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Role name is required')
      return
    }
    
    setSaving(true)
    setError(null)
    try {
      if (editingRole) {
        await api.put(`/admin/roles/${editingRole._id}`, formData)
      } else {
        await api.post('/admin/roles', formData)
      }
      setShowModal(false)
      fetchRoles()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save role')
    }
    setSaving(false)
  }

  const handleAssignRole = async () => {
    if (!selectedUser) return
    
    setSaving(true)
    setError(null)
    try {
      await api.put(`/admin/roles/users/${selectedUser._id}/assign`, {
        roleId: selectedRoleId || null
      })
      setShowAssignModal(false)
      fetchUsers()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign role')
    }
    setSaving(false)
  }

  const handleDelete = async (role: Role) => {
    if (role.isDefault) {
      setError('Cannot delete default roles')
      return
    }
    if (!confirm(`Delete role "${role.name}"?`)) return
    
    try {
      await api.delete(`/admin/roles/${role._id}`)
      fetchRoles()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete role')
    }
  }

  const togglePermission = (module: string, action: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: !prev.permissions[module]?.[action]
        }
      }
    }))
  }

  const toggleAllModule = (module: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: { view: value, create: value, edit: value, delete: value }
      }
    }))
  }

  const countPermissions = (perms: Record<string, ModulePermission>) => {
    return Object.values(perms).reduce((sum, m) => 
      sum + Object.values(m).filter(v => v).length, 0
    )
  }

  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  )

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const getRoleBadge = (role: string) => {
    const config: Record<string, string> = {
      'admin': 'bg-blue-100 text-blue-700',
      'branch_admin': 'bg-green-100 text-green-700',
      'staff': 'bg-gray-100 text-gray-700'
    }
    return config[role] || 'bg-gray-100 text-gray-700'
  }

  if (loading && roles.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Roles & Permissions</h1>
          <p className="text-gray-600">Manage user roles and assign permissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { fetchRoles(); fetchUsers(); }}>
            <RefreshCw className="w-4 h-4 mr-2" />Refresh
          </Button>
          {activeTab === 'roles' && (
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />Create Role
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'roles' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Shield className="w-4 h-4 inline mr-2" />
            Roles ({roles.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'users' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Users ({users.length})
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder={activeTab === 'roles' ? 'Search roles...' : 'Search users...'} 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Roles Tab Content */}
      {activeTab === 'roles' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoles.map(role => (
            <div key={role._id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="p-4 border-b" style={{ borderLeftWidth: 4, borderLeftColor: role.color }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{role.name}</h3>
                      {role.isDefault && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">Default</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{role.description || 'No description'}</p>
                  </div>
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: role.color }} />
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span>{countPermissions(role.permissions)} permissions</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditModal(role)}>
                    <Edit2 className="w-4 h-4 mr-1" />Edit
                  </Button>
                  {!role.isDefault && (
                    <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(role)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredRoles.length === 0 && (
            <div className="col-span-full bg-white rounded-xl border p-12 text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Roles Found</h3>
              <Button onClick={openCreateModal}><Plus className="w-4 h-4 mr-2" />Create Role</Button>
            </div>
          )}
        </div>
      )}

      {/* Users Tab Content */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border shadow-sm">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
            </div>
          ) : (
            <div className="divide-y">
              {filteredUsers.map(user => (
                <div key={user._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.isActive ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gray-400'}`}>
                        <span className="text-white font-medium text-sm">
                          {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-800">{user.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getRoleBadge(user.role)}`}>
                            {user.role?.replace('_', ' ')}
                          </span>
                          {!user.isActive && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Inactive</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {user.roleId ? (
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: user.roleId.color }}
                        >
                          {user.roleId.name}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                          No Role Assigned
                        </span>
                      )}
                      <Button variant="outline" size="sm" onClick={() => openAssignModal(user)}>
                        <UserCog className="w-4 h-4 mr-1" />Assign Role
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Role Modal */}
      {showModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{editingRole ? 'Edit Role' : 'Create New Role'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Sales Manager"
                    disabled={editingRole?.isDefault}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={formData.color} onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))} className="w-12 h-10 border rounded cursor-pointer" />
                    <input type="text" value={formData.color} onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))} className="flex-1 px-3 py-2 border rounded-lg" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" rows={2} placeholder="Brief description..." />
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Permissions</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Module</th>
                        <th className="text-center px-2 py-3 font-medium text-gray-700">View</th>
                        <th className="text-center px-2 py-3 font-medium text-gray-700">Create</th>
                        <th className="text-center px-2 py-3 font-medium text-gray-700">Edit</th>
                        <th className="text-center px-2 py-3 font-medium text-gray-700">Delete</th>
                        <th className="text-center px-2 py-3 font-medium text-gray-700">All</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {modules.map(module => {
                        const perms = formData.permissions[module.key] || { view: false, create: false, edit: false, delete: false }
                        const allChecked = PERMISSION_ACTIONS.every(a => perms[a])
                        return (
                          <tr key={module.key} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-800">{module.name}</div>
                              <div className="text-xs text-gray-500">{module.description}</div>
                            </td>
                            {PERMISSION_ACTIONS.map(action => (
                              <td key={action} className="text-center px-2 py-3">
                                <input type="checkbox" checked={perms[action] || false} onChange={() => togglePermission(module.key, action)} className="w-4 h-4 text-blue-600 rounded" />
                              </td>
                            ))}
                            <td className="text-center px-2 py-3">
                              <input type="checkbox" checked={allChecked} onChange={() => toggleAllModule(module.key, !allChecked)} className="w-4 h-4 text-indigo-600 rounded" />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingRole ? 'Update Role' : 'Create Role'}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Assign Role Modal */}
      {showAssignModal && selectedUser && typeof window !== 'undefined' && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="border-b p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Assign Role</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {selectedUser.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{selectedUser.name}</h4>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Role (Remove Assignment)</option>
                  {roles.map(role => (
                    <option key={role._id} value={role._id}>{role.name}</option>
                  ))}
                </select>
              </div>
              {selectedRoleId && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    User will get all permissions defined in the selected role.
                  </p>
                </div>
              )}
            </div>
            <div className="border-t p-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAssignModal(false)}>Cancel</Button>
              <Button onClick={handleAssignRole} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Assign Role
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
