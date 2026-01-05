'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { TenantProvider } from '@/contexts/TenantContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface TenantBranding {
  name: string
  slug: string
  logo?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  landingPageTemplate?: string
  contact?: {
    email?: string
    phone?: string
    whatsapp?: string
  }
}

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const tenantSlug = params.tenant as string
  const [tenant, setTenant] = useState<TenantBranding | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const response = await fetch(`${API_URL}/public/tenancy/branding/${tenantSlug}`)
        const data = await response.json()
        if (data.success) {
          setTenant({
            name: data.data.name,
            slug: data.data.slug,
            logo: data.data.branding?.logo?.url,
            primaryColor: data.data.branding?.theme?.primaryColor,
            secondaryColor: data.data.branding?.theme?.secondaryColor,
            accentColor: data.data.branding?.theme?.accentColor,
            landingPageTemplate: data.data.landingPageTemplate || data.data.branding?.landingPageTemplate || 'minimal',
            contact: data.data.contact
          })
        }
      } catch (error) {
        console.error('Failed to fetch tenant:', error)
      } finally {
        setLoading(false)
      }
    }

    if (tenantSlug) {
      fetchTenant()
    }
  }, [tenantSlug])

  // Show loading state briefly
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <TenantProvider tenant={tenant} isTenantPage={true}>
      {children}
    </TenantProvider>
  )
}
