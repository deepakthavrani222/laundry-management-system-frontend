'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Zap, Shield, Clock, Sparkles, Truck } from 'lucide-react'

export default function MinimalLoginForm() {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-indigo-50 flex">
      {/* Left Side - Minimal Design */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-slate-800 to-indigo-900 p-12 flex-col justify-center relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 border border-white rounded-full"></div>
          <div className="absolute top-40 right-20 w-20 h-20 border border-white rounded-full"></div>
          <div className="absolute bottom-32 right-16 w-32 h-32 border border-white rounded-full"></div>
          <div className="absolute bottom-20 left-32 w-16 h-16 border border-white rounded-full"></div>
        </div>
        
        <div className="relative z-10 max-w-md">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-light text-white tracking-wide">LaundryLobby</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-light text-white mb-4 leading-tight">
            Simplicity<br />
            <span className="text-indigo-300 font-normal">Redefined</span>
          </h1>
          
          {/* Description */}
          <p className="text-lg text-gray-300 font-light mb-10">
            Experience the future of laundry services with our premium care and attention to detail.
          </p>
          
          {/* Features */}
          <div className="space-y-5">
            <div className="flex items-start space-x-4">
              <div className="w-11 h-11 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">Secure & Reliable</h3>
                <p className="text-gray-400 text-sm">Your clothes are safe with us</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-11 h-11 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">Quick Turnaround</h3>
                <p className="text-gray-400 text-sm">Fast service with express options</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-11 h-11 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">Free Pickup & Delivery</h3>
                <p className="text-gray-400 text-sm">We come to your doorstep</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-11 h-11 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">Premium Quality</h3>
                <p className="text-gray-400 text-sm">Professional care for all fabrics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6 text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />Back to Home
          </Link>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-gray-600 text-sm mb-5">Sign in to your account</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email" required value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'} required value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-indigo-600" />
                  <span className="ml-2 text-gray-600">Remember me</span>
                </label>
                <Link href="/auth/forgot-password" className="text-indigo-600 hover:text-indigo-500">Forgot password?</Link>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2.5 rounded-lg">
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
              Don't have an account? <Link href="/auth/register" className="text-indigo-600 hover:text-indigo-500 font-medium">Sign up</Link>
            </p>
          </div>

          {/* Quick Demo Login */}
          <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Demo Login:</h3>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100">
                <input type="radio" name="demo" className="text-indigo-600" onChange={() => setFormData({ email: 'testcustomer@demo.com', password: 'password123' })} />
                <span className="text-sm text-gray-600">Customer</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100">
                <input type="radio" name="demo" className="text-indigo-600" onChange={() => setFormData({ email: 'admin@demo.com', password: 'password123' })} />
                <span className="text-sm text-gray-600">Admin</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100">
                <input type="radio" name="demo" className="text-indigo-600" onChange={() => setFormData({ email: 'supportadmin@laundrypro.com', password: 'deep2025' })} />
                <span className="text-sm text-gray-600">Support</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
