'use client'

import { useEffect, useState } from 'react'
import BaseLoginForm from '@/components/auth/BaseLoginForm'
import MinimalLoginForm from '@/components/auth/templates/MinimalLoginForm'
import FreshSpinLoginForm from '@/components/auth/templates/FreshSpinLoginForm'
import LaundryMasterLoginForm from '@/components/auth/templates/LaundryMasterLoginForm'
import { getCurrentTemplate, getTemplateTheme, getTemplateContent, LandingPageTemplate } from '@/utils/templateUtils'
import { Sparkles, Truck, Clock, Shield, CheckCircle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function LoginPage() {
  const [template, setTemplate] = useState<string>('original')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const detectTemplate = async () => {
      // Check if we're on a tenant subdomain
      const hostname = window.location.hostname
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
      
      // Extract subdomain (e.g., "dgsfg" from "dgsfg.example.com")
      let subdomain: string | null = null
      if (!isLocalhost) {
        const parts = hostname.split('.')
        // If we have more than 2 parts (subdomain.domain.tld), first part is subdomain
        if (parts.length > 2) {
          subdomain = parts[0]
        }
      }
      
      // Also check URL params for tenant (used when redirecting from tenant pages)
      const urlParams = new URLSearchParams(window.location.search)
      const tenantParam = urlParams.get('tenant')
      
      // Also check sessionStorage for last visited tenant (set by tenant pages)
      const lastTenant = sessionStorage.getItem('lastVisitedTenant')
      
      // Determine which tenant to use
      const tenantSlug = subdomain || tenantParam || lastTenant
      
      console.log('🔍 Login Page - Hostname:', hostname)
      console.log('🔍 Login Page - Subdomain detected:', subdomain)
      console.log('🔍 Login Page - Tenant param:', tenantParam)
      console.log('🔍 Login Page - Last visited tenant:', lastTenant)
      console.log('🔍 Login Page - Using tenant:', tenantSlug)
      
      // If we have a tenant, fetch tenant branding
      if (tenantSlug && tenantSlug !== 'www') {
        try {
          console.log('🔍 Login Page - Fetching tenant branding for:', tenantSlug)
          const response = await fetch(`${API_URL}/public/tenancy/branding/${tenantSlug}`)
          const data = await response.json()
          
          console.log('🔍 Login Page - Tenant branding response:', data)
          
          if (data.success && data.data) {
            // Get template from tenant branding
            const tenantTemplate = data.data.branding?.landingPageTemplate || 
                                   data.data.landingPageTemplate || 
                                   'original'
            console.log('🔍 Login Page - Using tenant template:', tenantTemplate)
            setTemplate(tenantTemplate)
            setIsLoading(false)
            return
          }
        } catch (error) {
          console.error('🔍 Login Page - Error fetching tenant branding:', error)
        }
      }
      
      // Fallback to localStorage for non-tenant pages
      const detectedTemplate = getCurrentTemplate()
      console.log('🔍 Login Page - Detected template from localStorage:', detectedTemplate)
      console.log('🔍 Login Page - localStorage landing_template:', localStorage.getItem('landing_template'))
      setTemplate(detectedTemplate)
      setIsLoading(false)
    }
    
    detectTemplate()
  }, [])

  // Show loading state while determining template
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  // Use template-specific login forms for templates 2, 3, and 4
  if (template === 'minimal') {
    return <MinimalLoginForm />
  }

  if (template === 'freshspin') {
    return <FreshSpinLoginForm />
  }

  if (template === 'starter') {
    return <LaundryMasterLoginForm />
  }

  // Original template (template 1) - keep existing design
  const theme = getTemplateTheme(template)
  const content = getTemplateContent(template)

  // Original template content (keep as is)
  const originalLeftContent = (
    <>
      {/* Logo & Brand */}
      <div className="mb-12">
        <div className="flex items-center space-x-3 mb-6">
          <div className={`w-14 h-14 bg-gradient-to-r ${theme.cardGradient} rounded-xl flex items-center justify-center shadow-lg`}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <span className="text-4xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {content.brandName}
          </span>
        </div>
        <h1 className="text-4xl xl:text-5xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {content.loginTitle}
        </h1>
        <p className="text-xl text-gray-600" style={{ fontSize: '15px' }}>
          {content.tagline}
        </p>
      </div>

      {/* Features */}
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 bg-${theme.primary}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
            <Truck className={`w-6 h-6 text-${theme.primary}-600`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Free Pickup & Delivery</h3>
            <p className="text-gray-600 text-sm">We pick up and deliver your clothes right at your doorstep</p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 bg-${theme.secondary}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
            <Clock className={`w-6 h-6 text-${theme.secondary}-600`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>24-48 Hour Turnaround</h3>
            <p className="text-gray-600 text-sm">Quick service with express options available</p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 bg-${theme.accent}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
            <Shield className={`w-6 h-6 text-${theme.accent}-600`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Quality Guaranteed</h3>
            <p className="text-gray-600 text-sm">Professional care for all types of fabrics</p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Real-time Tracking</h3>
            <p className="text-gray-600 text-sm">Track your order status from pickup to delivery</p>
          </div>
        </div>
      </div>
    </>
  )

  // Minimal template content
  const minimalLeftContent = (
    <div className="text-center">
      <div className="mb-8">
        <div className={`w-20 h-20 bg-gradient-to-r ${theme.cardGradient} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-light text-gray-800 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
          {content.brandName}
        </h1>
        <p className="text-lg text-gray-500 font-light">
          {content.tagline}
        </p>
      </div>
      <div className="space-y-4 text-left max-w-sm mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
          <span className="text-gray-600">Effortless booking</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span className="text-gray-600">Transparent pricing</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
          <span className="text-gray-600">Reliable service</span>
        </div>
      </div>
    </div>
  )

  // FreshSpin template content
  const freshspinLeftContent = (
    <>
      <div className="mb-12">
        <div className="flex items-center space-x-3 mb-6">
          <div className={`w-16 h-16 bg-gradient-to-r ${theme.cardGradient} rounded-2xl flex items-center justify-center shadow-xl transform rotate-12`}>
            <Sparkles className="w-9 h-9 text-white" />
          </div>
          <span className="text-4xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {content.brandName}
          </span>
        </div>
        <h1 className="text-5xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {content.loginTitle}
        </h1>
        <p className="text-xl text-gray-600 font-medium">
          {content.loginSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-100 rounded-xl p-4 text-center">
          <div className="text-2xl mb-2">🌿</div>
          <div className="text-sm font-medium text-emerald-800">Eco-Friendly</div>
        </div>
        <div className="bg-green-100 rounded-xl p-4 text-center">
          <div className="text-2xl mb-2">⚡</div>
          <div className="text-sm font-medium text-green-800">Super Fast</div>
        </div>
        <div className="bg-lime-100 rounded-xl p-4 text-center">
          <div className="text-2xl mb-2">✨</div>
          <div className="text-sm font-medium text-lime-800">Fresh Clean</div>
        </div>
        <div className="bg-teal-100 rounded-xl p-4 text-center">
          <div className="text-2xl mb-2">💚</div>
          <div className="text-sm font-medium text-teal-800">Love Care</div>
        </div>
      </div>
    </>
  )

  // LaundryMaster template content
  const starterLeftContent = (
    <>
      <div className="mb-12">
        <div className="flex items-center space-x-3 mb-6">
          <div className={`w-16 h-16 bg-gradient-to-r ${theme.cardGradient} rounded-xl flex items-center justify-center shadow-xl border-2 border-purple-200`}>
            <Sparkles className="w-9 h-9 text-white" />
          </div>
          <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {content.brandName}
          </span>
        </div>
        <h1 className="text-5xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {content.loginTitle}
        </h1>
        <p className="text-xl text-gray-600">
          {content.loginSubtitle}
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6">
          <h3 className="font-bold text-purple-800 mb-2">Premium Features</h3>
          <ul className="space-y-2 text-sm text-purple-700">
            <li>• AI-powered fabric care</li>
            <li>• 24/7 concierge service</li>
            <li>• Premium packaging</li>
            <li>• Express delivery</li>
          </ul>
        </div>
        
        <div className="bg-gradient-to-r from-violet-100 to-purple-100 rounded-xl p-6">
          <h3 className="font-bold text-violet-800 mb-2">Master Benefits</h3>
          <ul className="space-y-2 text-sm text-violet-700">
            <li>• Priority booking</li>
            <li>• Loyalty rewards</li>
            <li>• Quality guarantee</li>
            <li>• Expert consultation</li>
          </ul>
        </div>
      </div>
    </>
  )

  const getLeftContent = () => {
    switch (template) {
      case 'minimal':
        return minimalLeftContent
      case 'freshspin':
        return freshspinLeftContent
      case 'starter':
        return starterLeftContent
      default:
        return originalLeftContent
    }
  }

  return (
    <BaseLoginForm 
      template={template}
      leftSideContent={getLeftContent()}
    />
  )
}
