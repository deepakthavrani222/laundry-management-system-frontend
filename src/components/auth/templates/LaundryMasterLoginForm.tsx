'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Crown, Star, Award, Zap } from 'lucide-react'

export default function LaundryMasterLoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAuth = useAuthStore((state) => state.setAuth)
  const redirectUrl = searchParams.get('redirect')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await authAPI.login(formData)
      const { token, user } = response.data.data
      setAuth(user, token)
      toast.success('Login successful!')
      if (redirectUrl) {
        router.push(decodeURIComponent(redirectUrl))
      } else {
        const routes: Record<string, string> = {
          superadmin: '/superadmin/dashboard',
          admin: '/admin/dashboard',
          branch_admin: '/branch-admin/dashboard',
          center_admin: '/center-admin/dashboard',
          branch_manager: '/branch-manager/dashboard',
          support: '/support/dashboard',
          customer: '/customer/dashboard'
        }
        router.push(routes[user.role] || '/')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 flex">
      {/* Left Side - Premium Luxury Design */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 p-8 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-purple-300 rounded-full"></div>
          <div className="absolute bottom-32 right-16 w-40 h-40 border border-purple-300 rounded-full"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="text-3xl font-bold text-white">LaundryMaster</span>
              <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />)}
                <span className="text-purple-200 text-xs ml-1">Premium</span>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Master<br />
            <span className="text-purple-300">Your</span> <span className="text-violet-300">Laundry</span>
          </h1>
          <p className="text-lg text-purple-100 mb-8">Premium laundry excellence delivered to your doorstep</p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-purple-300/20">
              <Award className="w-5 h-5 text-purple-300" />
              <div>
                <div className="text-white text-sm font-semibold">Premium Quality</div>
                <div className="text-purple-200 text-xs">Expert care for all fabrics</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-purple-300/20">
              <Zap className="w-5 h-5 text-purple-300" />
              <div>
                <div className="text-white text-sm font-semibold">Lightning Fast</div>
                <div className="text-purple-200 text-xs">24-48 hour turnaround time</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 overflow-y-auto">
        <div className="flex items-center justify-center py-6 px-4 min-h-screen">
          <div className="w-full max-w-md">
            <Link href="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4 text-sm font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" />Back to Home
            </Link>

            <div className="bg-white rounded-xl shadow-xl p-5 border border-gray-100">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-xl">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Welcome back!</h2>
                <p className="text-gray-600 text-sm">Enter your credentials to access your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 w-4 h-4" />
                    <input
                      type="email" required value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-purple-50/50 text-sm"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 w-4 h-4" />
                    <input
                      type={showPassword ? 'text' : 'password'} required value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-purple-50/50 text-sm"
                      placeholder="Enter your password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-purple-300 text-purple-600 w-4 h-4" />
                    <span className="ml-2 text-gray-600">Remember me</span>
                  </label>
                  <Link href="/auth/forgot-password" className="text-purple-600 hover:text-purple-700 font-semibold">Forgot password?</Link>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white py-2.5 rounded-lg font-semibold shadow-lg text-sm">
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              <p className="mt-4 text-center text-sm text-gray-600">
                Don't have an account? <Link href="/auth/register" className="text-purple-600 hover:text-purple-700 font-semibold">Create account</Link>
              </p>
            </div>

            {/* Quick Demo Login */}
            <div className="mt-4 bg-purple-50 rounded-lg p-3 border border-purple-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Quick Demo Login:</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ email: 'testcustomer@demo.com', password: 'password123' })}
                  className="flex items-center justify-center py-2 px-2 rounded-md bg-white hover:bg-purple-100 border border-purple-300 transition-colors"
                >
                  <span className="text-xs font-medium text-gray-700">👤 Customer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ email: 'admin@demo.com', password: 'password123' })}
                  className="flex items-center justify-center py-2 px-2 rounded-md bg-white hover:bg-purple-100 border border-purple-300 transition-colors"
                >
                  <span className="text-xs font-medium text-gray-700">👑 Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ email: 'supportadmin@laundrypro.com', password: 'deep2025' })}
                  className="flex items-center justify-center py-2 px-2 rounded-md bg-white hover:bg-purple-100 border border-purple-300 transition-colors"
                >
                  <span className="text-xs font-medium text-gray-700">🎧 Support</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
