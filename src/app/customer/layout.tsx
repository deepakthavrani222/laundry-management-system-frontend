'use client'

import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import CustomerSidebar from '@/components/layout/CustomerSidebar'
import CustomerHeader from '@/components/layout/CustomerHeader'

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleMenuClick = () => {
    setMobileMenuOpen(true)
  }

  const handleMobileClose = () => {
    setMobileMenuOpen(false)
  }

  useEffect(() => {
    // Wait a bit for store to initialize
    const timer = setTimeout(() => {
      if (!isAuthenticated || !user) {
        router.push('/auth/login')
        return
      }
      
      if (user.role !== 'customer') {
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <CustomerSidebar 
        mobileOpen={mobileMenuOpen} 
        onMobileClose={handleMobileClose}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        {/* Header */}
        <CustomerHeader onMenuClick={handleMenuClick} sidebarCollapsed={sidebarCollapsed} />
        
        {/* Page Content - Add pt-24 for fixed header (increased from pt-20) */}
        <main className="p-4 lg:p-6 pt-24">
          {children}
        </main>
      </div>
    </div>
  )
}
