'use client'

import {
  SupportSidebar,
  SupportSidebarProvider,
  useSupportSidebar,
} from '@/components/layout/SupportSidebar'
import SupportHeader from '@/components/layout/SupportHeader'
import NotificationContainer from '@/components/NotificationContainer'
import RefreshPrompt from '@/components/RefreshPrompt'
import ModernToaster from '@/components/ModernToast'
import ConnectionStatus from '@/components/ConnectionStatus'
import { useAuthStore } from '@/store/authStore'
import { useRefreshPromptStore } from '@/store/refreshPromptStore'
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { usePermissionSync } from '@/hooks/usePermissionSync'
import DashboardSkeleton from '@/components/DashboardSkeleton'

function SupportLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed, setMobileOpen } = useSupportSidebar()
  const { setAuth, user, _hasHydrated } = useAuthStore()
  const { showPrompt, setShowPrompt } = useRefreshPromptStore()
  const { isConnected } = useRealTimeNotifications()
  
  // Enable real-time permission sync for support users too
  usePermissionSync({
    autoReload: false,
    onPermissionsUpdated: () => {
      console.log('🔄 Support permissions updated, showing refresh prompt')
    },
    onRoleChanged: (oldRole, newRole) => {
      console.log(`👤 Support role changed: ${oldRole} → ${newRole}`)
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Refresh Prompt */}
      {showPrompt && (
        <RefreshPrompt
          onRefresh={() => {
            setShowPrompt(false);
            window.location.reload();
          }}
          onDismiss={() => setShowPrompt(false)}
        />
      )}

      {/* Sidebar - Using Support Sidebar for support-specific navigation */}
      <SupportSidebar />

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          isCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        )}
      >
        {/* Header - Using Support Header for consistent theme */}
        <SupportHeader onMenuClick={() => setMobileOpen(true)} sidebarCollapsed={isCollapsed} />

        {/* Page Content - Add padding for fixed header (h-16 = 64px) */}
        <main className="p-4 lg:p-6 mt-16">
          <div className="max-w-screen-2xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Real-time Connection Status */}
      <ConnectionStatus isConnected={isConnected} />

      {/* Modern Toast Notifications */}
      <ModernToaster />
    </div>
  )
}

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, user, _hasHydrated } = useAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Wait for store to hydrate
    if (!_hasHydrated) {
      console.log('⏳ Waiting for auth store to hydrate...');
      return;
    }
    
    // Immediate check without timeout for better UX
    if (!isAuthenticated || !user) {
      console.log('⚠️ Not authenticated, redirecting to login');
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'support') {
      console.log('⚠️ User is not support, redirecting to login');
      router.push('/auth/login');
      return;
    }

    console.log('✅ User authenticated as support');
    setIsLoading(false);
  }, [isAuthenticated, user, router, _hasHydrated]);

  if (!_hasHydrated || isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Show skeleton layout for better UX */}
        <div className="lg:pl-64">
          <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
          <main className="p-4 lg:p-6">
            <div className="max-w-screen-2xl mx-auto">
              <DashboardSkeleton />
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <SupportSidebarProvider>
      <SupportLayoutContent>{children}</SupportLayoutContent>
      {/* Real-time notification toasts */}
      <NotificationContainer />
    </SupportSidebarProvider>
  )
}