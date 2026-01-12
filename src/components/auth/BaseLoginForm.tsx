'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react'
import { LandingPageTemplate, getTemplateTheme, getTemplateContent } from '@/utils/templateUtils'

interface BaseLoginFormProps {
  template: LandingPageTemplate
  leftSideContent?: React.ReactNode
  customStyling?: {
    containerClass?: string
    formCardClass?: string
    buttonClass?: string
  }
}

export default function BaseLoginForm({ 
  template, 
  leftSideContent, 
  customStyling 
}: BaseLoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAuth = useAuthStore((state) => state.setAuth)
  
  const redirectUrl = searchParams.get('redirect')
  const theme = getTemplateTheme(template)
  const content = getTemplateContent(template)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await authAPI.login(formData)
      const { token, user } = response.data.data

      setAuth(user, token)
      toast.success('Login successful!')

      // Role-based redirect logic
      const roleRoutes: Record<string, string> = {
        customer: '/',
        admin: '/admin/dashboard',
        branch_admin: '/branch-admin/dashboard',
        center_admin: '/center-admin/dashboard',
        superadmin: '/superadmin/dashboard',
      }

      // If user is NOT a customer, always redirect to their role-specific dashboard
      // (ignore redirect URL for non-customer roles)
      if (user.role !== 'customer') {
        const redirectPath = roleRoutes[user.role] || '/admin/dashboard'
        console.log(`Non-customer role (${user.role}) - redirecting to:`, redirectPath)
        setTimeout(() => {
          router.push(redirectPath)
        }, 100)
        return
      }

      // For customers, handle redirect URL if present
      if (redirectUrl) {
        const decodedUrl = decodeURIComponent(redirectUrl)
        console.log('Customer redirecting to:', decodedUrl)
        setTimeout(() => {
          router.push(decodedUrl)
        }, 100)
        return
      }

      // Default customer redirect
      const redirectPath = roleRoutes[user.role] || '/'
      setTimeout(() => {
        router.push(redirectPath)
      }, 100)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed'
      
      if (error.response?.data?.requiresEmailVerification) {
        toast.error('Please verify your email address before logging in')
        router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`)
        return
      }
      
      toast.error(errorMessage)
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

  const containerClass = customStyling?.containerClass || `min-h-screen bg-gradient-to-br ${theme.gradient}`
  const formCardClass = customStyling?.formCardClass || 'bg-white rounded-2xl shadow-xl p-8 border border-gray-100'
  const buttonClass = customStyling?.buttonClass || `w-full bg-gradient-to-r ${theme.buttonGradient} hover:${theme.hoverGradient} text-white py-3 px-4 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`

  return (
    <div className={containerClass}>
      {/* Back Button - Fixed Top Left */}
      <div className="absolute top-6 left-6 z-20">
        <Link 
          href="/" 
          className={`inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm text-${theme.primary}-600 hover:text-${theme.primary}-700 hover:bg-white transition-all duration-200`}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="min-h-screen flex items-center justify-center">
        {/* Left Side - Custom Content */}
        {leftSideContent && (
          <div className="hidden lg:flex lg:w-[45%] flex-col justify-center px-12 xl:px-16">
            {leftSideContent}
          </div>
        )}

        {/* Right Side - Login Form */}
        <div className={`w-full ${leftSideContent ? 'lg:w-[45%]' : 'max-w-md'} flex items-center justify-center px-6 py-12 lg:px-12`}>
          <div className="w-full max-w-md">
            {/* Login Form Card */}
            <div className={formCardClass}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {content.loginTitle}
                </h2>
                <p className="text-gray-600 mt-1" style={{ fontSize: '15px' }}>
                  {content.loginSubtitle}
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                      autoComplete="email"
                      required
                      className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary}-500 focus:border-transparent transition-all duration-200 bg-gray-50`}
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
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
                      autoComplete="current-password"
                      required
                      className={`block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary}-500 focus:border-transparent transition-all duration-200 bg-gray-50`}
                      placeholder="Enter your password"
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
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className={`h-4 w-4 text-${theme.primary}-600 focus:ring-${theme.primary}-500 border-gray-300 rounded`}
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <Link href="/auth/forgot-password" className={`text-sm text-${theme.primary}-600 hover:text-${theme.primary}-500 font-medium`}>
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className={buttonClass}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600" style={{ fontSize: '15px' }}>
                  Don't have an account?{' '}
                  <Link href="/auth/register" className={`font-medium text-${theme.primary}-600 hover:text-${theme.primary}-500 transition-colors`}>
                    Create one now
                  </Link>
                </p>
              </div>
            </div>

            {/* Demo Accounts */}
            <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Demo Login:</h3>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <input
                    type="radio"
                    name="demoAccount"
                    className={`w-4 h-4 text-${theme.primary}-600 focus:ring-${theme.primary}-500`}
                    onChange={() => setFormData({ email: 'testcustomer@demo.com', password: 'password123' })}
                  />
                  <span className="text-sm text-gray-600">Customer</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <input
                    type="radio"
                    name="demoAccount"
                    className={`w-4 h-4 text-${theme.primary}-600 focus:ring-${theme.primary}-500`}
                    onChange={() => setFormData({ email: 'deepakthavrani72@gmail.com', password: 'password123' })}
                  />
                  <span className="text-sm text-gray-600">Admin</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}