import { api } from '@/lib/api'
import toast from 'react-hot-toast'

export const refreshUserPermissions = async () => {
  try {
    console.log('🔄 Triggering permission refresh...')
    
    const response = await api.post('/refresh-permissions')
    
    if (response.data.success) {
      console.log('✅ Permission refresh triggered successfully')
      toast.success('Permissions updated!', {
        icon: '🔄',
        duration: 2000
      })
      return true
    }
    
    return false
  } catch (error: any) {
    console.error('❌ Failed to refresh permissions:', error)
    toast.error('Failed to refresh permissions')
    return false
  }
}