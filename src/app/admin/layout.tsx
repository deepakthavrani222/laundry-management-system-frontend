'use client'

import {
  AdminSidebar,
  AdminSidebarProvider,
  useAdminSidebar,
} from '@/components/layout/AdminSidebar'
import AdminHeader from '@/components/layout/AdminHeader'
import NotificationContainer from '@/components/NotificationContainer'
import NotificationManager from '@/components/notifications/NotificationManager'
import RefreshPrompt from '@/components/RefreshPrompt'
import ModernToaster from '@/components/ModernToast'
import { useAuthStore } from '@/store/authStore'
import { useRefreshPromptStore } from '@/store/refreshPromptStore'
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { usePermissionSync } from '@/hooks/usePermissionSync'
import DashboardSkeleton from '@/components/DashboardSkeleton'

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed, setMobileOpen } = useAdminSidebar()
  const { setAuth, user, _hasHydrated } = useAuthStore() // Add _hasHydrated to check if store is ready
  const { showPrompt, setShowPrompt } = useRefreshPromptStore() // Add refresh prompt store
  const { isConnected } = useRealTimeNotifications() // Get connection status
  
  // Enable real-time permission sync
  usePermissionSync({
    autoReload: false, // Show refresh prompt instead of auto-reload (user wants manual control)
    onPermissionsUpdated: () => {
      console.log('🔄 Permissions updated, showing refresh prompt')
    },
    onRoleChanged: (oldRole, newRole) => {
      console.log(`👤 Role changed: ${oldRole} → ${newRole}`)
    }
  })

  // DISABLED: Sync permissions on page load
  // This was causing "Invalid token" errors on dashboard load
  // Permission sync now happens only via WebSocket events when SuperAdmin changes features
  // If you need to sync on load, user can manually refresh after seeing the refresh prompt
  
  // useEffect(() => {
  //   const syncOnLoad = async () => {
  //     // ... sync logic
  //   };
  //   if (_hasHydrated && user && user.role === 'admin') {
  //     syncOnLoad();
  //   }
  // }, [setAuth, user, _hasHydrated]);

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

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          isCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        )}
      >
        {/* Header - Fixed */}
        <AdminHeader onMenuClick={() => setMobileOpen(true)} sidebarCollapsed={isCollapsed} />

        {/* Page Content - Add padding for fixed header (h-16 = 64px) */}
        <main className="p-4 lg:p-6 mt-16">
          <div className="max-w-screen-2xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Modern Toast Notifications */}
      <ModernToaster />
    </div>
  )
}

export default function AdminLayout({
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

    if (user.role !== 'admin') {
      console.log('⚠️ User is not admin, redirecting to login');
      router.push('/auth/login');
      return;
    }

    console.log('✅ User authenticated as admin');
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
    <AdminSidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
      {/* Real-time notification toasts */}
      <NotificationContainer />
      {/* Slide notifications (flash notifications) */}
      <NotificationManager />
    </AdminSidebarProvider>
  )
}
