'use client'

import { useState } from 'react'
import { RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

export function RefreshPermissions() {
  const [loading, setLoading] = useState(false)
  const { updateUser, user } = useAuthStore()

  const refreshPermissions = async () => {
    setLoading(true)
    try {
      // Get fresh user profile
      const response = await api.get('/auth/profile')
      
      if (response.data.success) {
        const freshUser = response.data.data
        
        console.log('🔄 Fresh user permissions:', freshUser.permissions?.support)
        console.log('🔄 Current user permissions:', user?.permissions?.support)
        
        // Update user in store with fresh permissions
        updateUser({
          permissions: freshUser.permissions,
          role: freshUser.role,
          features: freshUser.features
        })
        
        toast.success('Permissions refreshed!', {
          icon: '🔄',
          duration: 2000
        })
        
        console.log('✅ Permissions refreshed without logout')
        
        // Force a small delay then reload to ensure UI updates
        setTimeout(() => {
          window.location.reload()
        }, 1000)
        
      }
    } catch (error: any) {
      console.error('❌ Failed to refresh permissions:', error)
      toast.error('Failed to refresh permissions')
    } finally {
      setLoading(false)
    }
  }

  const clearCache = () => {
    localStorage.removeItem('laundry-auth')
    toast.success('Cache cleared! Please login again.', {
      icon: '🧹',
      duration: 3000
    })
    setTimeout(() => {
      window.location.href = '/auth/login'
    }, 1000)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={refreshPermissions}
        disabled={loading}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={clearCache}
        className="flex items-center gap-2 text-red-600 hover:text-red-700"
        title="Clear cache and login again"
      >
        <Trash2 className="w-4 h-4" />
        Clear Cache
      </Button>
    </div>
  )
}