'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useNotificationsWebSocket } from '@/hooks/useNotificationsWebSocket'
import { usePermissionSync } from '@/hooks/usePermissionSync'

export function PermissionSyncProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()
  const { isConnected } = useNotificationsWebSocket()
  const { refreshPermissions } = usePermissionSync()

  // Initialize permission sync for authenticated users
  useEffect(() => {
    if (isAuthenticated && user && isConnected) {
      console.log('🔄 Permission sync initialized for user:', user.email)
    }
  }, [isAuthenticated, user, isConnected])

  return <>{children}</>
}