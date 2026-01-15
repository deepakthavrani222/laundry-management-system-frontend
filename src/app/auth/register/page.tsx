'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { authAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, Phone, Sparkles, ArrowLeft, CheckCircle, Shield, Truck, Clock, Star, Gift } from 'lucide-react'
import MinimalRegisterForm from '@/components/auth/templates/MinimalRegisterForm'
import FreshSpinRegisterForm from '@/components/auth/templates/FreshSpinRegisterForm'
import LaundryMasterRegisterForm from '@/components/auth/templates/LaundryMasterRegisterForm'
import { getCurrentTemplate } from '@/utils/templateUtils'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Loading component
function RegisterLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
    </div>
  )
}

// Main register content
function RegisterContent() {
  const [template, setTemplate] = useState<string>('original')
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(true)
  const searchParams = useSearchParams()
  const referralCode = searchParams.get('ref')

  useEffect(() => {
    // Store referral code in sessionStorage for other templates
    if (referralCode) {
      sessionStorage.setItem('referralCode', referralCode)
    }
    
    const detectTemplate = async () => {
      // Check if we're on a tenant subdomain
      const hostname = window.location.hostname
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
      
      // Extract subdomain (e.g., "dgsfg" from "dgsfg.example.com")
      // Skip Vercel preview URLs (*.vercel.app) as they're not real tenant subdomains
      let subdomain: string | null = null
      if (!isLocalhost) {
        const parts = hostname.split('.')
        const isVercelUrl = hostname.endsWith('.vercel.app')
        const isRenderUrl = hostname.endsWith('.onrender.com')
        
        // Only extract subdomain for real custom domains (not deployment platforms)
        // For custom domains: subdomain.yourdomain.com has 3+ parts
        if (parts.length > 2 && !isVercelUrl && !isRenderUrl) {
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
      
      // If we have a tenant, fetch tenant branding
      if (tenantSlug && tenantSlug !== 'www') {
        try {
          const response = await fetch(`${API_URL}/public/tenancy/branding/${tenantSlug}`)
          const data = await response.json()
          
          if (data.success && data.data) {
            // Get template from tenant branding
            const tenantTemplate = data.data.branding?.landingPageTemplate || 
                                   data.data.landingPageTemplate || 
                                   'original'
            setTemplate(tenantTemplate)
            setIsLoadingTemplate(false)
            return
          }
        } catch (error) {
          console.error('Error fetching tenant branding:', error)
        }
      }
      
      // Fallback to localStorage for non-tenant pages
      setTemplate(getCurrentTemplate())
      setIsLoadingTemplate(false)
    }
    
    detectTemplate()
  }, [])

  // Show loading state while determining template
  if (isLoadingTemplate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  // Use template-specific register forms for templates 2, 3, and 4
  if (template === 'minimal') {
    return <MinimalRegisterForm referralCode={referralCode} />
  }

  if (template === 'freshspin') {
    return <FreshSpinRegisterForm referralCode={referralCode} />
  }

  if (template === 'starter') {
    return <LaundryMasterRegisterForm referralCode={referralCode} />
  }

  // Original template (template 1) - keep existing design
  return <OriginalRegisterForm referralCode={referralCode} />
}

// Export with Suspense wrapper
export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterLoading />}>
      <RegisterContent />
    </Suspense>
  )
}

function OriginalRegisterForm({ referralCode }: { referralCode: string | null }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    // Password validation - require uppercase, lowercase, number, and special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/
    if (!passwordRegex.test(formData.password)) {
      toast.error('Password must contain at least one uppercase, one lowercase, one number, and one special character (!@#$%^&*)')
      return
    }

    setIsLoading(true)

    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        referralCode: referralCode || undefined,
      })

      if (response.data?.referralApplied) {
        toast.success(`🎁 Referral bonus will be applied on your first order!`)
      }
      
      toast.success('Registration successful! Please check your email to verify your account.')
      router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed'
      toast.error(errorMessage)
      
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err: any) => {
          toast.error(err.message)
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const passwordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: '', color: '' }
    if (password.length < 6) return { strength: 25, text: 'Weak', color: 'bg-red-500' }
    if (password.length < 8) return { strength: 50, text: 'Fair', color: 'bg-yellow-500' }
    if (password.length < 12) return { strength: 75, text: 'Good', color: 'bg-blue-500' }
    return { strength: 100, text: 'Strong', color: 'bg-green-500' }
  }

  const strength = passwordStrength(formData.password)

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      {/* Back Button - Fixed Top Left */}
      <div className="absolute top-6 left-6 z-20">
        <Link 
          href="/" 
          className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm text-teal-600 hover:text-teal-700 hover:bg-white transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="min-h-screen flex items-center justify-center">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:flex lg:w-[45%] flex-col justify-center px-12 xl:px-16">
          {/* Logo & Brand */}
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <span className="text-4xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>LaundryLobby</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Join LaundryLobby
            </h1>
            <p className="text-xl text-gray-600" style={{ fontSize: '15px' }}>
              Create your account and experience premium laundry service. Thousands of happy customers trust us with their clothes.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Free Pickup & Delivery</h3>
                <p className="text-gray-600 text-sm">We pick up and deliver your clothes right at your doorstep</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>24-48 Hour Turnaround</h3>
                <p className="text-gray-600 text-sm">Quick service with express options available</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Quality Guaranteed</h3>
                <p className="text-gray-600 text-sm">Professional care for all types of fabrics</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>10,000+ Happy Customers</h3>
                <p className="text-gray-600 text-sm">Trusted by thousands across the city</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full lg:w-[45%] flex items-center justify-center px-6 py-12 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-bold text-gray-800">LaundryLobby</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
            </div>

            {/* Register Form Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              {/* Referral Banner */}
              {referralCode && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Gift className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">Referral Code Applied!</p>
                      <p className="text-sm text-green-600">You'll get a bonus on your first order 🎁</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="hidden lg:block mb-6">
                <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>Create Account</h2>
                <p className="text-gray-600 mt-1" style={{ fontSize: '15px' }}>Join thousands of satisfied customers</p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="off"
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="new-email"
                      required
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      autoComplete="off"
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                      placeholder="Enter 10-digit phone number"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      className="block w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                      placeholder="Min 8 characters"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="mt-1.5">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Password strength</span>
                        <span className={`font-medium ${strength.strength >= 75 ? 'text-green-600' : strength.strength >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {strength.text}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${strength.color}`}
                          style={{ width: `${strength.strength}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      className="block w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {formData.confirmPassword && (
                    <div className="mt-1 flex items-center">
                      {formData.password === formData.confirmPassword ? (
                        <div className="flex items-center text-green-600 text-xs">
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          Passwords match
                        </div>
                      ) : (
                        <div className="text-red-600 text-xs">
                          Passwords do not match
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-start pt-2">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded mt-0.5"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
                    I agree to the{' '}
                    <Link href="#" className="text-teal-600 hover:text-teal-500">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="#" className="text-teal-600 hover:text-teal-500">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white py-3 px-4 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>

              <div className="mt-5 text-center">
                <p className="text-gray-600" style={{ fontSize: '15px' }}>
                  Already have an account?{' '}
                  <Link href="/auth/login" className="font-medium text-teal-600 hover:text-teal-500 transition-colors">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
