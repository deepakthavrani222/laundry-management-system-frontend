'use client'

import { useEffect, useState } from 'react'
import { useSubdomain, useTenantBranding } from '@/hooks/useSubdomain'

interface SubdomainLayoutProps {
  children: React.ReactNode
}

export function SubdomainLayout({ children }: SubdomainLayoutProps) {
  const { subdomain, isSubdomain, tenantSlug } = useSubdomain()
  const { branding, loading, error } = useTenantBranding(tenantSlug)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // If we have a subdomain but branding is loading
  if (isSubdomain && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {subdomain}...</p>
        </div>
      </div>
    )
  }

  // If we have a subdomain but branding failed to load
  if (isSubdomain && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🏢</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Tenant Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            The subdomain "{subdomain}" is not configured or doesn't exist.
          </p>
          <a 
            href="https://laundrylobby.com" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Main Site
          </a>
        </div>
      </div>
    )
  }

  // Apply tenant-specific branding if available
  useEffect(() => {
    if (branding?.branding) {
      const theme = branding.branding.theme
      if (theme) {
        // Apply custom CSS variables for tenant theming
        document.documentElement.style.setProperty('--tenant-primary', theme.primaryColor || '#3B82F6')
        document.documentElement.style.setProperty('--tenant-secondary', theme.secondaryColor || '#10B981')
        document.documentElement.style.setProperty('--tenant-accent', theme.accentColor || '#F59E0B')
        
        // Update page title
        const businessName = branding.branding.businessName || branding.name
        if (businessName) {
          document.title = `${businessName} - Laundry Management`
        }
      }
    }
    
    return () => {
      // Cleanup: Reset to default theme
      document.documentElement.style.removeProperty('--tenant-primary')
      document.documentElement.style.removeProperty('--tenant-secondary')
      document.documentElement.style.removeProperty('--tenant-accent')
    }
  }, [branding])

  // Log tenant info for debugging
  useEffect(() => {
    if (isSubdomain) {
      console.log('🏢 Tenant detected:', {
        subdomain,
        tenantSlug,
        businessName: branding?.branding?.businessName,
        theme: branding?.branding?.theme
      })
    }
  }, [isSubdomain, subdomain, tenantSlug, branding])

  return (
    <>
      {/* Tenant-specific meta tags */}
      {branding?.branding && (
        <>
          <meta name="tenant-subdomain" content={subdomain || ''} />
          <meta name="tenant-name" content={branding.branding.businessName || ''} />
          <meta name="tenant-tagline" content={branding.branding.tagline || ''} />
        </>
      )}
      
      {children}
    </>
  )
}