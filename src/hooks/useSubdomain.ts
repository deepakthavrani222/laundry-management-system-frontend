'use client'

import { useState, useEffect } from 'react'

interface SubdomainInfo {
  subdomain: string | null
  isSubdomain: boolean
  fullDomain: string
  tenantSlug: string | null
}

/**
 * Hook to detect and manage subdomain information
 * Handles both subdomain.domain.com and domain.com/tenant patterns
 */
export function useSubdomain(): SubdomainInfo {
  const [subdomainInfo, setSubdomainInfo] = useState<SubdomainInfo>({
    subdomain: null,
    isSubdomain: false,
    fullDomain: '',
    tenantSlug: null
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const hostname = window.location.hostname
    const pathname = window.location.pathname
    
    console.log('🌐 Subdomain detection - Hostname:', hostname, 'Path:', pathname)
    
    // Extract subdomain from hostname
    const subdomain = extractSubdomain(hostname)
    
    // Check for tenant in URL path (fallback)
    const pathTenant = extractTenantFromPath(pathname)
    
    // Check cookies for tenant info
    const cookieTenant = getCookieTenant()
    
    // Determine final tenant
    const finalTenant = subdomain || pathTenant || cookieTenant
    
    const info: SubdomainInfo = {
      subdomain,
      isSubdomain: !!subdomain,
      fullDomain: hostname,
      tenantSlug: finalTenant
    }
    
    console.log('🏢 Tenant info:', info)
    
    // Store tenant info in sessionStorage for consistency
    if (finalTenant) {
      sessionStorage.setItem('currentTenant', finalTenant)
    }
    
    setSubdomainInfo(info)
  }, [])

  return subdomainInfo
}

/**
 * Extract subdomain from hostname
 * Examples:
 * - prakash.laundrylobby.com → prakash
 * - www.laundrylobby.com → null
 * - laundrylobby.com → null
 * - localhost:3002 → null
 */
function extractSubdomain(hostname: string): string | null {
  // Remove port if present
  const cleanHostname = hostname.split(':')[0]
  
  // Skip localhost and IP addresses
  if (cleanHostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(cleanHostname)) {
    return null
  }
  
  // Skip Vercel preview URLs
  if (cleanHostname.endsWith('.vercel.app')) {
    return null
  }
  
  // Split hostname into parts
  const parts = cleanHostname.split('.')
  
  // Need at least 3 parts for subdomain (subdomain.domain.com)
  if (parts.length < 3) {
    return null
  }
  
  // Check if it's our main domain
  const domain = parts.slice(-2).join('.') // Get last 2 parts (domain.com)
  if (domain !== 'laundrylobby.com') {
    return null
  }
  
  // Get subdomain (first part)
  const subdomain = parts[0]
  
  // Reserved subdomains
  const reserved = ['www', 'superadmin', 'marketing', 'api', 'admin']
  if (reserved.includes(subdomain)) {
    return null
  }
  
  return subdomain
}

/**
 * Extract tenant from URL path
 * Examples:
 * - /tenant/prakash/dashboard → prakash
 * - /prakash/orders → prakash (if prakash is not a reserved route)
 */
function extractTenantFromPath(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean)
  
  if (segments.length === 0) return null
  
  // Check for /tenant/slug pattern
  if (segments[0] === 'tenant' && segments[1]) {
    return segments[1]
  }
  
  // Check if first segment could be a tenant slug
  const firstSegment = segments[0]
  const reservedRoutes = [
    'admin', 'auth', 'api', 'branch', 'center-admin', 'customer',
    'debug-login', 'help', 'pricing', 'role-switcher', 'services',
    'test-auth', 'track', 'version', 'releases'
  ]
  
  if (!reservedRoutes.includes(firstSegment)) {
    return firstSegment
  }
  
  return null
}

/**
 * Get tenant from cookies
 */
function getCookieTenant(): string | null {
  if (typeof document === 'undefined') return null
  
  const cookies = document.cookie.split(';')
  const tenantCookie = cookies.find(cookie => 
    cookie.trim().startsWith('tenant-subdomain=')
  )
  
  if (tenantCookie) {
    return tenantCookie.split('=')[1]?.trim() || null
  }
  
  return null
}

/**
 * Hook to get tenant branding information
 */
export function useTenantBranding(tenantSlug: string | null) {
  const [branding, setBranding] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tenantSlug) {
      setBranding(null)
      return
    }

    const fetchBranding = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
        const response = await fetch(`${API_URL}/public/tenancy/branding/${tenantSlug}`)
        const data = await response.json()
        
        if (data.success) {
          setBranding(data.data)
          console.log('🎨 Tenant branding loaded:', data.data.branding?.businessName)
        } else {
          setError(data.message || 'Failed to load tenant branding')
        }
      } catch (err) {
        console.error('Error fetching tenant branding:', err)
        setError('Failed to load tenant branding')
      } finally {
        setLoading(false)
      }
    }

    fetchBranding()
  }, [tenantSlug])

  return { branding, loading, error }
}