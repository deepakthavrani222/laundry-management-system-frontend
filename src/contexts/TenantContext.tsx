'use client'

import { createContext, useContext, ReactNode } from 'react'

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

interface TenantContextType {
  tenant: TenantBranding | null
  isTenantPage: boolean
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  isTenantPage: false,
})

export function TenantProvider({ 
  children, 
  tenant,
  isTenantPage = false 
}: { 
  children: ReactNode
  tenant?: TenantBranding | null
  isTenantPage?: boolean
}) {
  return (
    <TenantContext.Provider value={{ tenant: tenant || null, isTenantPage }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  return useContext(TenantContext)
}
