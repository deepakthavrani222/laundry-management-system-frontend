'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ThemeColor } from '@/components/landing/ThemeCustomizer'
import { Language } from '@/lib/translations'
import BookingModal from '@/components/BookingModal'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { TenantProvider } from '@/contexts/TenantContext'
import BannerCarousel from '@/components/customer/BannerCarousel'
import BannerDisplay from '@/components/customer/BannerDisplay'

// Dynamic imports for templates
const OriginalTemplate = dynamic(() => import('@/components/landing/templates/OriginalTemplate'), { ssr: false })
const MinimalTemplate = dynamic(() => import('@/components/landing/templates/MinimalTemplate'), { ssr: false })
const FreshSpinTemplate = dynamic(() => import('@/components/landing/templates/FreshSpinTemplate'), { ssr: false })
const LaundryMasterTemplate = dynamic(() => import('@/components/landing/templates/LaundryMasterTemplate'), { ssr: false })

type LandingPageTemplate = 'original' | 'minimal' | 'freshspin' | 'starter'

interface TenantBranding {
  name: string
  slug: string
  subdomain: string
  customDomain?: string
  landingPageTemplate: LandingPageTemplate
  branding: {
    logo?: { url?: string }
    theme?: {
      primaryColor?: string
      secondaryColor?: string
      accentColor?: string
      fontFamily?: string
    }
    landingPageTemplate?: LandingPageTemplate
  }
  contact: {
    email?: string
    phone?: string
    whatsapp?: string
  }
  branches?: Array<{
    _id: string
    name: string
    code: string
    address?: {
      street?: string
      city?: string
      pincode?: string
      addressLine1?: string
    }
    contact?: { phone?: string }
    phone?: string
  }>
  tenancyId?: string
}

// Map hex colors to theme color names
function mapHexToThemeColor(hex?: string): ThemeColor {
  if (!hex) return 'teal'
  const lowerHex = hex.toLowerCase()
  
  // Check for teal/cyan colors
  if (lowerHex.includes('14b8a6') || lowerHex.includes('0d9488') || lowerHex.includes('2dd4bf')) return 'teal'
  // Check for blue colors
  if (lowerHex.includes('3b82f6') || lowerHex.includes('2563eb') || lowerHex.includes('60a5fa')) return 'blue'
  // Check for purple colors
  if (lowerHex.includes('8b5cf6') || lowerHex.includes('7c3aed') || lowerHex.includes('a78bfa')) return 'purple'
  // Check for orange colors
  if (lowerHex.includes('f97316') || lowerHex.includes('ea580c') || lowerHex.includes('fb923c')) return 'orange'
  // Check for green colors
  if (lowerHex.includes('22c55e') || lowerHex.includes('16a34a') || lowerHex.includes('10b981')) return 'teal'
  
  return 'teal'
}

export default function TenantLandingPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tenant = params.tenant as string
  
  const { isAuthenticated, user } = useAuthStore()
  
  const [tenantData, setTenantData] = useState<TenantBranding | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  // Fetch tenant branding
  useEffect(() => {
    const fetchTenantBranding = async () => {
      try {
        setLoading(true)
        setError(null)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
        
        console.log('Fetching tenant branding for:', tenant)
        const response = await fetch(`${apiUrl}/public/tenancy/branding/${tenant}`)
        
        const data = await response.json()
        console.log('Tenant branding response:', data)
        
        if (!response.ok || !data.success) {
          setError('not_found')
          return
        }
        
        setTenantData(data.data)
        
        // Save tenant slug to sessionStorage for auth pages to use
        console.log('🏪 Tenant Page - Saving tenant to sessionStorage:', tenant)
        sessionStorage.setItem('lastVisitedTenant', tenant as string)
        console.log('🏪 Tenant Page - Saved! Verify:', sessionStorage.getItem('lastVisitedTenant'))
      } catch (err) {
        console.error('Error fetching tenant branding:', err)
        setError('Failed to load')
      } finally {
        setLoading(false)
      }
    }

    if (tenant) {
      fetchTenantBranding()
    }
  }, [tenant])

  // Check URL params to auto-open booking modal after login
  useEffect(() => {
    if (searchParams.get('openBooking') === 'true' && isAuthenticated) {
      setShowBookingModal(true)
      // Clean up URL
      window.history.replaceState({}, '', `/${tenant}`)
    }
  }, [isAuthenticated, searchParams, tenant])

  // Listen for tenantBookNow event from TemplateHeader
  useEffect(() => {
    const handleTenantBookNow = () => {
      console.log('tenantBookNow event received')
      handleBookNow()
    }
    window.addEventListener('tenantBookNow', handleTenantBookNow)
    return () => window.removeEventListener('tenantBookNow', handleTenantBookNow)
  }, [isAuthenticated, tenant])

  // Move banner section before footer
  useEffect(() => {
    const moveBannerBeforeFooter = () => {
      const bannerSection = document.getElementById('promotional-banner-section')
      const footer = document.querySelector('footer')
      
      if (bannerSection && footer && footer.parentNode) {
        // Move banner before footer
        footer.parentNode.insertBefore(bannerSection, footer)
      }
    }

    // Run after template renders
    const timer = setTimeout(moveBannerBeforeFooter, 100)
    return () => clearTimeout(timer)
  }, [tenantData])

  const handleBookNow = () => {
    console.log('handleBookNow called, isAuthenticated:', isAuthenticated)
    if (!isAuthenticated) {
      // Redirect to login with return URL (properly encoded)
      const returnUrl = encodeURIComponent(`/${tenant}?openBooking=true`)
      router.push(`/auth/login?redirect=${returnUrl}`)
      return
    }
    console.log('Opening booking modal')
    setShowBookingModal(true)
  }

  const handleLoginRequired = () => {
    setShowBookingModal(false)
    const returnUrl = encodeURIComponent(`/${tenant}?openBooking=true`)
    router.push(`/auth/login?redirect=${returnUrl}`)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {tenant}...</p>
        </div>
      </div>
    )
  }

  // Error state - Not found
  if (error || !tenantData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-2">Laundry not found</p>
          <p className="text-gray-500 mb-8">
            The laundry "<strong>{tenant}</strong>" doesn't exist or is not active.
          </p>
          <a 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    )
  }

  // Get template and theme - prioritize branding.landingPageTemplate
  const template = tenantData.branding?.landingPageTemplate || tenantData.landingPageTemplate || 'original'
  const themeColor = mapHexToThemeColor(tenantData.branding?.theme?.primaryColor)
  
  // Common props for all templates
  const templateProps = {
    themeColor,
    language: 'en' as Language,
    isAuthenticated,
    onBookNow: handleBookNow,
    user,
    // Tenant branding data
    tenantName: tenantData.name,
    tenantLogo: tenantData.branding?.logo?.url,
    tenantSecondaryLogo: tenantData.branding?.secondaryLogo?.url,
    tenantContact: tenantData.contact,
    // Business identity
    tenantBusinessName: tenantData.branding?.businessName,
    tenantTagline: tenantData.branding?.tagline,
    tenantSlogan: tenantData.branding?.slogan,
    tenantSocialMedia: tenantData.branding?.socialMedia,
    // Mark as tenant page to hide color/template selectors
    isTenantPage: true,
    // Hide footer - we'll render it separately with banner
    hideFooter: true,
    // Tenancy ID for fetching reviews
    tenancyId: tenantData.tenancyId,
  }

  // Render selected template
  const renderTemplate = () => {
    switch (template) {
      case 'minimal':
        return <MinimalTemplate {...templateProps} />
      case 'freshspin':
        return <FreshSpinTemplate {...templateProps} />
      case 'starter':
        return <LaundryMasterTemplate {...templateProps} />
      case 'original':
      default:
        return <OriginalTemplate {...templateProps} />
    }
  }

  return (
    <TenantProvider 
      tenant={{
        name: tenantData.name,
        slug: tenantData.slug,
        logo: tenantData.branding?.logo?.url,
        secondaryLogo: tenantData.branding?.secondaryLogo?.url,
        businessName: tenantData.branding?.businessName,
        tagline: tenantData.branding?.tagline,
        slogan: tenantData.branding?.slogan,
        socialMedia: tenantData.branding?.socialMedia,
        primaryColor: tenantData.branding?.theme?.primaryColor,
        secondaryColor: tenantData.branding?.theme?.secondaryColor,
        accentColor: tenantData.branding?.theme?.accentColor,
        landingPageTemplate: template,
        contact: tenantData.contact,
      }}
      isTenantPage={true}
    >
      <div className="relative">
        {/* Global Strip Banner - Top of page */}
        <BannerDisplay position="GLOBAL_STRIP_TOP" />
        
        {/* Home Hero Banner - Large banner at top */}
        <BannerDisplay position="HOME_HERO_TOP" className="mb-6" />
        
        {renderTemplate()}
        
        {/* Home Slider Banner - Mid page carousel */}
        <div className="my-8">
          <BannerDisplay position="HOME_SLIDER_MID" />
        </div>
        
        {/* Promotional Banner Section - Will appear before footer */}
        <div id="promotional-banner-section" className="w-full bg-gradient-to-b from-gray-50 to-white py-12 border-t border-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Special Offers</h2>
            <BannerCarousel page="HOME" />
          </div>
        </div>
        
        {/* Home Strip Banner - Bottom */}
        <BannerDisplay position="HOME_STRIP_BOTTOM" />
        
        {/* Global Floating Corner Banner */}
        <BannerDisplay position="GLOBAL_FLOATING_CORNER" />
      </div>
      
      <BookingModal 
        isOpen={showBookingModal} 
        onClose={() => setShowBookingModal(false)}
        onLoginRequired={handleLoginRequired}
        tenantBranches={tenantData.branches}
        tenancyId={tenantData.tenancyId}
        tenantBranding={{
          primaryColor: tenantData.branding?.theme?.primaryColor,
          secondaryColor: tenantData.branding?.theme?.secondaryColor,
          accentColor: tenantData.branding?.theme?.accentColor
        }}
      />
    </TenantProvider>
  )
}
