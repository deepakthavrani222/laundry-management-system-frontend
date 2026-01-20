'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Sparkles, CheckCircle, Truck, Clock, Shield } from 'lucide-react'

export default function FreshSpinLoginForm() {
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
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-[45%] flex flex-col bg-white overflow-y-auto">
        {/* Header */}
        <div className="p-6 lg:p-8">
          <Link href="/" className="inline-flex items-center text-gray-500 hover:text-gray-700 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />Back to Home
          </Link>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-16 py-8">
          <div className="w-full max-w-md">
            {/* Logo & Title */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">LaundryLobby</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
              <p className="text-gray-500">Enter your credentials to access your account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email" required value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50/50 transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'} required value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50/50 transition-all"
                    placeholder="Enter your password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold text-base shadow-lg shadow-violet-200 transition-all hover:shadow-xl hover:shadow-violet-300">
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : 'Sign In'}
              </Button>
            </form>

            <p className="mt-8 text-center text-gray-600">
              Don't have an account? <Link href="/auth/register" className="text-violet-600 hover:text-violet-700 font-semibold transition-colors">Create account</Link>
            </p>

            {/* Quick Demo Login */}
            <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Demo Login:</h3>
              <div className="grid grid-cols-3 gap-2">
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <input
                    type="radio"
                    name="demoAccount"
                    className="w-4 h-4 text-violet-600 focus:ring-violet-500"
                    onChange={() => {
                      setFormData({ email: 'testcustomer@demo.com', password: 'password123' })
                    }}
                  />
                  <span className="text-sm text-gray-600">Customer</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <input
                    type="radio"
                    name="demoAccount"
                    className="w-4 h-4 text-violet-600 focus:ring-violet-500"
                    onChange={() => {
                      setFormData({ email: 'admin@demo.com', password: 'password123' })
                    }}
                  />
                  <span className="text-sm text-gray-600">Admin</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <input
                    type="radio"
                    name="demoAccount"
                    className="w-4 h-4 text-violet-600 focus:ring-violet-500"
                    onChange={() => {
                      setFormData({ email: 'supportadmin@laundrypro.com', password: 'deep2025' })
                    }}
                  />
                  <span className="text-sm text-gray-600">Support</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 lg:p-8 text-center text-sm text-gray-400">
          © 2024 LaundryLobby. All rights reserved.
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:block lg:w-[55%] bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-12 xl:px-20">
          <div className="max-w-lg">
            {/* Main Heading */}
            <h2 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              Premium Laundry Service at Your Fingertips
            </h2>
            <p className="text-lg text-white/80 mb-12">
              Experience hassle-free laundry with doorstep pickup, expert cleaning, and timely delivery.
            </p>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Free Pickup & Delivery</h3>
                  <p className="text-white/70 text-sm">We come to your doorstep</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">24-48 Hour Turnaround</h3>
                  <p className="text-white/70 text-sm">Quick and reliable service</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Quality Guaranteed</h3>
                  <p className="text-white/70 text-sm">Professional care for all fabrics</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
