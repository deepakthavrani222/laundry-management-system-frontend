'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Shield, Eye, EyeOff, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import { api } from '@/lib/api'

interface SupportUser {
  _id: string
  name: string
  email: string
  phone: string
  isActive: boolean
  assignedBranch?: {
    _id: string
    name: string
  }
  permissions: {
    tickets: {
      view: boolean
      create: boolean
      update: boolean
      assign: boolean
      resolve: boolean
      escalate: boolean
    }
  }
  createdAt: string
}

interface Branch {
  _id: string
  name: string
  code: string
}

export default function SupportUsersPage() {
  const [supportUsers, setSupportUsers] = useState<SupportUser[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<SupportUser | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    assignedBranch: '',
    permissions: {
      tickets: {
        view: true,
        create: true,
        update: true,
        assign: false,
        resolve: true,
        escalate: false
      }
    }
  })

  useEffect(() => {
    fetchSupportUsers()
    fetchBranches()
  }, [])

  const fetchSupportUsers = async () => {
    try {
      const response = await api.get('/admin/support/users')
      setSupportUsers(response.data.data?.data || [])
    } catch (error: any) {
      console.error('Error fetching support users:', error)
      toast.error(error.response?.data?.message || 'Failed to fetch support users')
    } finally {
      setLoading(false)
    }
  }

  const fetchBranches = async () => {
    try {
      const response = await api.get('/admin/branches')
      setBranches(response.data.data?.branches || [])
    } catch (error) {
      console.error('Error fetching branches:', error)
    }
  }

  const handleCreateUser = async () => {
    try {
      const payload = {
        ...formData,
        assignedBranch: formData.assignedBranch || undefined
      }
      
      await api.post('/admin/support/users', payload)
      toast.success('Support user created successfully')
      setShowCreateModal(false)
      resetForm()
      fetchSupportUsers()
    } catch (error: any) {
      console.error('Error creating support user:', error)
      toast.error(error.response?.data?.message || 'Failed to create support user')
    }
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        assignedBranch: formData.assignedBranch || null,
        permissions: formData.permissions
      }
      
      await api.put(`/admin/support/users/${editingUser._id}`, payload)
      toast.success('Support user updated successfully')
      setEditingUser(null)
      resetForm()
      fetchSupportUsers()
    } catch (error: any) {
      console.error('Error updating support user:', error)
      toast.error(error.response?.data?.message || 'Failed to update support user')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this support user?')) return

    try {
      await api.delete(`/admin/support/users/${userId}`)
      toast.success('Support user deleted successfully')
      fetchSupportUsers()
    } catch (error: any) {
      console.error('Error deleting support user:', error)
      toast.error(error.response?.data?.message || 'Failed to delete support user')
    }
  }

  const handleResetPassword = async (userId: string) => {
    const newPassword = prompt('Enter new password (minimum 6 characters):')
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    try {
      await api.post(`/admin/support/users/${userId}/reset-password`, {
        newPassword
      })
      toast.success('Password reset successfully')
    } catch (error: any) {
      console.error('Error resetting password:', error)
      toast.error(error.response?.data?.message || 'Failed to reset password')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      assignedBranch: '',
      permissions: {
        tickets: {
          view: true,
          create: true,
          update: true,
          assign: false,
          resolve: true,
          escalate: false
        }
      }
    })
    setShowPassword(false)
  }

  const openEditModal = (user: SupportUser) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: '',
      assignedBranch: user.assignedBranch?._id || '',
      permissions: user.permissions
    })
  }

  const filteredUsers = (supportUsers || []).filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Users</h1>
          <p className="text-gray-600">Manage support team members and their permissions</p>
        </div>
        
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Support User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Support User</DialogTitle>
            </DialogHeader>
            <CreateEditForm
              formData={formData}
              setFormData={setFormData}
              branches={branches}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              onSubmit={handleCreateUser}
              isEditing={false}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search support users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Support Users List */}
      <div className="grid gap-4">
        {filteredUsers.length === 0 ? (
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Support Users</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No users match your search criteria.' : 'Create your first support user to get started.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Support User
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user._id} className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                      <p className="text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500">{user.phone}</p>
                      {user.assignedBranch && (
                        <Badge variant="outline" className="mt-1">
                          {user.assignedBranch.name}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResetPassword(user._id)}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Permissions Display */}
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Ticket Permissions:</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(user.permissions.tickets).map(([permission, enabled]) => (
                      <Badge
                        key={permission}
                        variant={enabled ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Support User</DialogTitle>
          </DialogHeader>
          <CreateEditForm
            formData={formData}
            setFormData={setFormData}
            branches={branches}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            onSubmit={handleUpdateUser}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Form Component
function CreateEditForm({
  formData,
  setFormData,
  branches,
  showPassword,
  setShowPassword,
  onSubmit,
  isEditing
}: {
  formData: any
  setFormData: (data: any) => void
  branches: Branch[]
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  onSubmit: () => void
  isEditing: boolean
}) {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter full name"
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="10-digit phone number"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter email address"
          disabled={isEditing}
        />
      </div>

      {!isEditing && (
        <div>
          <Label htmlFor="password">Password *</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="branch">Assigned Branch (Optional)</Label>
        <Select
          value={formData.assignedBranch}
          onValueChange={(value) => setFormData({ ...formData, assignedBranch: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No specific branch</SelectItem>
            {(branches || []).map((branch) => (
              <SelectItem key={branch._id} value={branch._id}>
                {branch.name} ({branch.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Permissions */}
      <div>
        <Label>Ticket Permissions</Label>
        <div className="mt-2 space-y-2">
          {Object.entries(formData.permissions.tickets).map(([permission, enabled]) => (
            <div key={permission} className="flex items-center space-x-2">
              <Checkbox
                id={permission}
                checked={enabled as boolean}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    permissions: {
                      ...formData.permissions,
                      tickets: {
                        ...formData.permissions.tickets,
                        [permission]: checked
                      }
                    }
                  })
                }
              />
              <Label htmlFor={permission} className="capitalize">
                {permission.replace('_', ' ')}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => {}}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {isEditing ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </div>
  )
}