import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { usePermissions } from '@/hooks/usePermissions'
import { useFeatures } from '@/hooks/useFeatures'
import { usePreviewStore } from '@/store/previewStore'

/**
 * Hook for role-based navigation utilities
 */
export function useRoleNavigation() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { hasPermission } = usePermissions()
  const { hasFeature } = useFeatures()
  const { isAdminPreviewMode, setAdminPreviewMode } = usePreviewStore()

  // Get the default dashboard for current user role
  const getDashboardPath = () => {
    if (!user) return '/auth/login'

    const roleRoutes: Record<string, string> = {
      admin: '/admin/dashboard',
      center_admin: '/center-admin/dashboard',
      branch_admin: '/branch-admin/dashboard',
      branch_manager: '/center-admin/dashboard',
      staff: '/staff/dashboard',
      customer: '/customer/dashboard',
      superadmin: '/superadmin/dashboard',
      support: '/support/dashboard'
    }

    return roleRoutes[user.role] || '/auth/login'
  }

  // Navigate to user's dashboard (always admin dashboard if admin in preview mode)
  const goToDashboard = () => {
    // If admin in preview mode, always go to admin dashboard
    if (isAdminPreviewMode && ['admin', 'center_admin', 'branch_admin', 'branch_manager'].includes(user?.role || '')) {
      const adminDashboardRoutes: Record<string, string> = {
        admin: '/admin/dashboard',
        center_admin: '/center-admin/dashboard',
        branch_admin: '/branch-admin/dashboard',
        branch_manager: '/center-admin/dashboard'
      }
      
      const adminDashboard = adminDashboardRoutes[user?.role || ''] || '/admin/dashboard'
      router.push(adminDashboard)
      return
    }

    // Normal dashboard navigation
    const dashboardPath = getDashboardPath()
    router.push(dashboardPath)
  }

  // Enable admin preview mode
  const enablePreviewMode = () => {
    if (user && ['admin', 'center_admin', 'branch_admin', 'branch_manager'].includes(user.role)) {
      setAdminPreviewMode(true, user.role)
    }
  }

  // Check if user can access a specific path
  const canAccessPath = (path: string): boolean => {
    if (!user) return false

    const roleRestrictions = {
      admin: isAdminPreviewMode ? [] : ['/customer', '/track', '/pricing', '/'],
      center_admin: isAdminPreviewMode ? [] : ['/customer', '/track', '/pricing', '/'],
      branch_admin: isAdminPreviewMode ? [] : ['/customer', '/track', '/pricing', '/'],
      branch_manager: isAdminPreviewMode ? [] : ['/customer', '/track', '/pricing', '/'],
      staff: ['/admin', '/center-admin', '/customer', '/track', '/pricing', '/'],
      customer: ['/admin', '/center-admin', '/branch-admin', '/staff', '/superadmin'],
      superadmin: [] // SuperAdmin can access everything
    }

    const forbidden = roleRestrictions[user.role as keyof typeof roleRestrictions] || []
    
    return !forbidden.some(forbiddenPath => 
      path === forbiddenPath || path.startsWith(forbiddenPath + '/')
    )
  }

  // Get user role display name
  const getRoleDisplayName = () => {
    if (!user) return 'Unknown'

    const roleNames: Record<string, string> = {
      admin: 'Tenancy Admin',
      center_admin: 'Center Admin',
      branch_admin: 'Branch Admin',
      branch_manager: 'Branch Manager',
      staff: 'Staff',
      customer: 'Customer',
      superadmin: 'Super Admin',
      support: 'Support Agent'
    }

    return roleNames[user.role] || user.role
  }

  return {
    getDashboardPath,
    goToDashboard,
    enablePreviewMode,
    canAccessPath,
    getRoleDisplayName,
    currentRole: user?.role,
    isInPreviewMode: isAdminPreviewMode
  }
}