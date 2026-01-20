'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Save,
  Eye,
  EyeOff
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { api } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface SupportSettings {
  profile: {
    name: string
    email: string
    phone: string
    department: string
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    ticketAssigned: boolean
    ticketUpdated: boolean
    newMessage: boolean
  }
  preferences: {
    autoAssignTickets: boolean
    showClosedTickets: boolean
    defaultTicketView: string
    ticketsPerPage: number
  }
}

export default function SupportSettings() {
  const [settings, setSettings] = useState<SupportSettings>({
    profile: {
      name: '',
      email: '',
      phone: '',
      department: 'Support'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      ticketAssigned: true,
      ticketUpdated: true,
      newMessage: true
    },
    preferences: {
      autoAssignTickets: false,
      showClosedTickets: false,
      defaultTicketView: 'assigned',
      ticketsPerPage: 10
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await api.get('/support/settings')
      
      if (response.data.success) {
        setSettings(response.data.data || settings)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const response = await api.put('/support/settings', settings)
      
      if (response.data.success) {
        toast.success('Settings saved successfully')
      } else {
        toast.error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      const response = await api.put('/support/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      
      if (response.data.success) {
        toast.success('Password changed successfully')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        toast.error(response.data.message || 'Failed to change password')
      }
    } catch (error: any) {
      console.error('Error changing password:', error)
      toast.error(error.response?.data?.message || 'Failed to change password')
    }
  }

  const updateProfile = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value
      }
    }))
  }

  const updateNotifications = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }))
  }

  const updatePreferences = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your support account settings</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Profile Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={settings.profile.name}
                onChange={(e) => updateProfile('name', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={settings.profile.email}
                onChange={(e) => updateProfile('email', e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={settings.profile.phone}
                onChange={(e) => updateProfile('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={settings.profile.department}
                onChange={(e) => updateProfile('department', e.target.value)}
                placeholder="Enter your department"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Change Password</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))}
                  placeholder="Enter current password"
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
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({
                  ...prev,
                  newPassword: e.target.value
                }))}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({
                  ...prev,
                  confirmPassword: e.target.value
                }))}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <Button onClick={handlePasswordChange} variant="outline">
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notification Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emailNotifications"
                checked={settings.notifications.emailNotifications}
                onCheckedChange={(checked) => updateNotifications('emailNotifications', checked as boolean)}
              />
              <Label htmlFor="emailNotifications">Email Notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pushNotifications"
                checked={settings.notifications.pushNotifications}
                onCheckedChange={(checked) => updateNotifications('pushNotifications', checked as boolean)}
              />
              <Label htmlFor="pushNotifications">Push Notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ticketAssigned"
                checked={settings.notifications.ticketAssigned}
                onCheckedChange={(checked) => updateNotifications('ticketAssigned', checked as boolean)}
              />
              <Label htmlFor="ticketAssigned">Ticket Assigned</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ticketUpdated"
                checked={settings.notifications.ticketUpdated}
                onCheckedChange={(checked) => updateNotifications('ticketUpdated', checked as boolean)}
              />
              <Label htmlFor="ticketUpdated">Ticket Updated</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="newMessage"
                checked={settings.notifications.newMessage}
                onCheckedChange={(checked) => updateNotifications('newMessage', checked as boolean)}
              />
              <Label htmlFor="newMessage">New Messages</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Support Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoAssignTickets"
                checked={settings.preferences.autoAssignTickets}
                onCheckedChange={(checked) => updatePreferences('autoAssignTickets', checked as boolean)}
              />
              <Label htmlFor="autoAssignTickets">Auto-assign new tickets</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showClosedTickets"
                checked={settings.preferences.showClosedTickets}
                onCheckedChange={(checked) => updatePreferences('showClosedTickets', checked as boolean)}
              />
              <Label htmlFor="showClosedTickets">Show closed tickets</Label>
            </div>
            <div>
              <Label htmlFor="defaultView">Default Ticket View</Label>
              <select
                id="defaultView"
                value={settings.preferences.defaultTicketView}
                onChange={(e) => updatePreferences('defaultTicketView', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="assigned">Assigned to me</option>
                <option value="all">All tickets</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>
            <div>
              <Label htmlFor="ticketsPerPage">Tickets per page</Label>
              <select
                id="ticketsPerPage"
                value={settings.preferences.ticketsPerPage}
                onChange={(e) => updatePreferences('ticketsPerPage', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}