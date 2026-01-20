'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical,
  Ticket,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Key
} from 'lucide-react'
import CreateSupportUserModal from '@/components/support/CreateSupportUserModal'
import SupportUserDetailsModal from '@/components/support/SupportUserDetailsModal'
import { toast } from '@/components/ui/toast'

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
  ticketStats: {
    total: number
    open: number
    inProgress: number
    resolved: number
  }
  createdAt: string
}

interface SupportDashboard {
  totalSupportUsers: number
  ticketStats: {
    total: number
    byStatus: Array<{ _id: string; count: number }>
    unassigned: number
    overdue: number
  }
  recentTickets: Array<any>
  supportPerformance: Array<any>
}

export default function SupportManagementPage() {
  const [supportUsers, setSupportUsers] = useState<SupportUser[]>([])
  const [dashboardData, setDashboardData] = useState<SupportDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<SupportUser | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchSupportData()
  }, [])

  const fetchSupportData = async () => {
    try {
      setLoading(true)
      
      // Fetch support users and dashboard data
      const [usersResponse, dashboardResponse] = await Promise.all([
        fetch('/api/admin/support/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('/api/admin/support/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ])

      if (usersResponse.ok) {
        const usersResult = await usersResponse.json()
        if (usersResult.success) {
          setSupportUsers(usersResult.data.data || [])
        }
      }

      if (dashboardResponse.ok) {
        const dashboardResult = await dashboardResponse.json()
        if (dashboardResult.success) {
          setDashboardData(dashboardResult.data)
        }
      }
    } catch (error) {
      console.error('Error fetching support data:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch support data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (userData: any) => {
    try {
      const response = await fetch('/api/admin/support/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Support user created successfully'
        })
        setShowCreateModal(false)
        fetchSupportData()
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to create support user',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error creating support user:', error)
      toast({
        title: 'Error',
        description: 'Failed to create support user',
        variant: 'destructive'
      })
    }
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/support/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: 'Success',
          description: `Support user ${!currentStatus ? 'activated' : 'deactivated'} successfully`
        })
        fetchSupportData()
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to update user status',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error updating user status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this support user?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/support/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Support user deleted successfully'
        })
        fetchSupportData()
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to delete support user',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error deleting support user:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete support user',
        variant: 'destructive'
      })
    }
  }

  const filteredUsers = supportUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Support Management</h1>
          <p className="text-gray-600">Manage support users and monitor ticket performance</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Support User
        </Button>
      </div>

      {/* Dashboard Stats */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Support Users</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.totalSupportUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.ticketStats.total}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Ticket className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unassigned Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.ticketStats.unassigned}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.ticketStats.overdue}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search support users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Support Users List */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Support Users ({filteredUsers.length})</h2>
        </div>
        
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Support Users Found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'Try a different search term' : 'Get started by creating your first support user'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Support User
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <div key={user._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-600">{user.phone}</p>
                      {user.assignedBranch && (
                        <p className="text-sm text-blue-600">Branch: {user.assignedBranch.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Status Badge */}
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>

                    {/* Ticket Stats */}
                    <div className="text-right">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>Total: {user.ticketStats.total}</span>
                        <span>•</span>
                        <span className="text-green-600">Resolved: {user.ticketStats.resolved}</span>
                        <span>•</span>
                        <span className="text-orange-600">Open: {user.ticketStats.open}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setShowDetailsModal(true)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
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
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modals */}
      {showCreateModal && (
        <CreateSupportUserModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUser}
        />
      )}

      {showDetailsModal && selectedUser && (
        <SupportUserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedUser(null)
          }}
          onUpdate={fetchSupportData}
        />
      )}
    </div>
  )
}