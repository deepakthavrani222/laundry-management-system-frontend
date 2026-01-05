'use client'

import {
  AdminSidebar,
  AdminSidebarProvider,
  useAdminSidebar,
} from '@/components/layout/AdminSidebar'
import AdminHeader from '@/components/layout/AdminHeader'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed, setMobileOpen } = useAdminSidebar()

  return (
    <div className="min-h-screen bg-gray-50">
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
          <div className="max-w-full">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated || !user) {
        router.push('/auth/login')
        return
      }

      if (user.role !== 'admin') {
        router.push('/auth/login')
        return
      }

      setIsLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [isAuthenticated, user, router])

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Admin Panel...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminSidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminSidebarProvider>
  )
}
