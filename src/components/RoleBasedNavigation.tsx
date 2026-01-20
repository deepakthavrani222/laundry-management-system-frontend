'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { usePreviewStore } from '@/store/previewStore'

/**
 * Role-based navigation guard that prevents users from accessing unauthorized areas
 * - Admins cannot access customer areas
 * - Customers cannot access admin areas
 * - Each role has specific allowed paths
 */
export function RoleBasedNavigation({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, _hasHydrated } = useAuthStore()
  const { isAdminPreviewMode } = usePreviewStore()

  useEffect(() => {
    if (!_hasHydrated || !user) return

    // Define role-based path restrictions
    const roleRestrictions = {
      admin: {
        // Admin cannot access customer areas (unless in preview mode)
        forbidden: isAdminPreviewMode ? [] : ['/customer', '/track', '/pricing', '/'],
        defaultDashboard: '/admin/dashboard'
      },
      center_admin: {
        // Center Admin cannot access customer areas (unless in preview mode)
        forbidden: isAdminPreviewMode ? [] : ['/customer', '/track', '/pricing', '/'],
        defaultDashboard: '/center-admin/dashboard'
      },
      branch_admin: {
        // Branch Admin cannot access customer areas (unless in preview mode)
        forbidden: isAdminPreviewMode ? [] : ['/customer', '/track', '/pricing', '/'],
        defaultDashboard: '/branch-admin/dashboard'
      },
      branch_manager: {
        // Branch Manager cannot access customer areas (unless in preview mode)
        forbidden: isAdminPreviewMode ? [] : ['/customer', '/track', '/pricing', '/'],
        defaultDashboard: '/center-admin/dashboard'
      },
      staff: {
        // Staff cannot access admin or customer areas
        forbidden: ['/admin', '/center-admin', '/customer', '/track', '/pricing', '/'],
        defaultDashboard: '/staff/dashboard'
      },
      support: {
        // Support cannot access admin or customer areas
        forbidden: ['/admin', '/center-admin', '/branch-admin', '/staff', '/customer', '/track', '/pricing', '/'],
        defaultDashboard: '/support/dashboard'
      },
      customer: {
        // Customer cannot access admin areas
        forbidden: ['/admin', '/center-admin', '/branch-admin', '/staff', '/support', '/superadmin'],
        defaultDashboard: '/customer/dashboard'
      },
      superadmin: {
        // SuperAdmin has access to everything
        forbidden: [],
        defaultDashboard: '/superadmin/dashboard'
      }
    }

    const userRole = user.role as keyof typeof roleRestrictions
    const restrictions = roleRestrictions[userRole]

    if (!restrictions) {
      console.warn('Unknown user role:', userRole)
      return
    }

    // Check if current path is forbidden for this role
    const isForbidden = restrictions.forbidden.some(forbiddenPath => {
      // Exact match or starts with forbidden path
      return pathname === forbiddenPath || pathname.startsWith(forbiddenPath + '/')
    })

    if (isForbidden) {
      console.log(`🚫 Role ${userRole} attempted to access forbidden path: ${pathname}`)
      console.log(`🔄 Redirecting to: ${restrictions.defaultDashboard}`)
      
      // Redirect to role-specific dashboard
      router.replace(restrictions.defaultDashboard)
      return
    }

    // Special handling for root path '/' - allow in preview mode
    if (pathname === '/' && userRole !== 'customer' && !isAdminPreviewMode) {
      console.log(`🔄 Non-customer role ${userRole} accessing root, redirecting to dashboard`)
      router.replace(restrictions.defaultDashboard)
      return
    }

    // Special handling for '/dashboard' - redirect to role-specific dashboard
    if (pathname === '/dashboard') {
      console.log(`🔄 Generic dashboard access, redirecting ${userRole} to specific dashboard`)
      router.replace(restrictions.defaultDashboard)
      return
    }

  }, [_hasHydrated, user, pathname, router, isAdminPreviewMode])

  return <>{children}</>
}