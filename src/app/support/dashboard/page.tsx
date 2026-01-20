'use client'

import { useState, useEffect } from 'react'
import { 
  Ticket, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  MessageSquare,
  User,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import Link from 'next/link'

interface DashboardStats {
  assignedTickets: number
  resolvedToday: number
  avgResponseTime: string
  pendingTickets: number
  totalResolved: number
  customerSatisfaction: number
  openTickets: number
  inProgressTickets: number
}

interface RecentTicket {
  _id: string
  ticketNumber: string
  title: string
  status: string
  priority: string
  raisedBy: {
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export default function SupportDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats>({
    assignedTickets: 0,
    resolvedToday: 0,
    avgResponseTime: '-',
    pendingTickets: 0,
    totalResolved: 0,
    customerSatisfaction: 0,
    openTickets: 0,
    inProgressTickets: 0
  })
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setError(null)
      console.log('🔍 Fetching support dashboard data...')
      
      const response = await api.get('/support/tickets/dashboard')
      console.log('📊 Dashboard API response:', response.data)
      
      if (response.data.success) {
        const data = response.data.data
        console.log('🎯 Raw API data:', data)
        
        // Use the new dynamic stats from backend
        const dynamicStats = {
          assignedTickets: data.stats?.assignedTickets || 0,
          resolvedToday: data.stats?.resolvedToday || 0,
          avgResponseTime: '-', // Calculate this later
          pendingTickets: data.stats?.pendingTickets || 0,
          totalResolved: data.stats?.totalResolved || 0,
          customerSatisfaction: 85, // Mock data for now
          openTickets: data.stats?.openTickets || 0,
          inProgressTickets: data.stats?.inProgressTickets || 0
        }
        
        console.log('📈 Dynamic stats:', dynamicStats)
        
        // Combine assigned tickets and unassigned tickets for display
        const allRecentTickets = [
          ...(data.myTickets || []),
          ...(data.unassignedTickets || [])
        ].sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt));
        
        console.log('🎫 All recent tickets:', allRecentTickets)
        
        setStats(dynamicStats)
        setRecentTickets(allRecentTickets)
      } else {
        console.error('❌ API returned error:', response.data)
        setError('Failed to load dashboard data')
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error)
      console.error('Response data:', error.response?.data)
      setError(`Unable to connect to server: ${error.response?.data?.message || error.message}`)
      // Keep default stats on error
    } finally {
      setLoading(false)
    }
  }

  const handleAssignTicket = async (ticketId: string) => {
    try {
      const response = await api.post(`/support/tickets/${ticketId}/assign`)
      if (response.data.success) {
        // Refresh dashboard data to show updated assignments
        fetchDashboardData()
        // You could also show a success toast here
        console.log('✅ Ticket assigned successfully')
      } else {
        console.error('❌ Failed to assign ticket:', response.data.message)
      }
    } catch (error) {
      console.error('❌ Error assigning ticket:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support Dashboard</h1>
            <p className="text-gray-600">Here's your support dashboard overview</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Dashboard</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchDashboardData}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name || 'Support Agent'}!
          </h1>
          <p className="text-gray-600">Here's your support dashboard overview</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.assignedTickets ?? 0}</div>
            <p className="text-xs text-gray-500">Active tickets assigned to you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.resolvedToday ?? 0}</div>
            <p className="text-xs text-gray-500">Tickets resolved today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tickets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.pendingTickets ?? 0}</div>
            <p className="text-xs text-gray-500">Unassigned tickets waiting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats?.customerSatisfaction && stats.customerSatisfaction > 0 ? `${stats.customerSatisfaction}%` : '85%'}
            </div>
            <p className="text-xs text-gray-500">Based on customer feedback</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Ticket className="w-5 h-5" />
              <span>Recent Tickets</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTickets.length > 0 ? (
              <div className="space-y-4">
                {recentTickets.slice(0, 5).map((ticket) => (
                  <div key={ticket._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-sm">{ticket.title || 'Untitled Ticket'}</h4>
                        <Badge className={`text-xs ${getStatusColor(ticket.status || 'open')}`}>
                          {(ticket.status || 'open').replace('_', ' ')}
                        </Badge>
                        <Badge className={`text-xs ${getPriorityColor(ticket.priority || 'medium')}`}>
                          {ticket.priority || 'medium'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{ticket.raisedBy?.name || 'Unknown Customer'}</span>
                        </span>
                        <span>{new Date(ticket.createdAt || ticket.updatedAt || Date.now()).toLocaleDateString()}</span>
                        {!ticket.assignedTo && (
                          <span className="text-orange-600 font-medium">Unassigned</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/support/tickets/${ticket._id}`}>
                          View
                        </Link>
                      </Button>
                      {!ticket.assignedTo && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleAssignTicket(ticket._id)}
                        >
                          Assign to Me
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="text-center pt-4">
                  <Button variant="outline" asChild>
                    <Link href="/support/tickets">View All Tickets</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Ticket className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No recent tickets</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/support/tickets/unassigned">Check Unassigned Tickets</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/support/tickets/unassigned">
                <AlertTriangle className="w-4 h-4 mr-2" />
                View Unassigned Tickets
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/support/tickets">
                <Ticket className="w-4 h-4 mr-2" />
                My Assigned Tickets
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/support/messages">
                <MessageSquare className="w-4 h-4 mr-2" />
                Recent Messages
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/support/performance">
                <TrendingUp className="w-4 h-4 mr-2" />
                Performance Stats
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}