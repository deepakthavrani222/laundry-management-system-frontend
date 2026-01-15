'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { authAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, Zap, Shield, Clock, Truck, Star, Gift } from 'lucide-react'

export default function MinimalRegisterForm({ referralCode }: { referralCode?: string | null }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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
      toast.error('Password must contain uppercase, lowercase, number, and special character')
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
        referralCode: referralCode || undefined
      })
      if (response.data?.referralApplied) {
        toast.success('🎁 Referral bonus will be applied on your first order!')
      }
      toast.success('Registration successful! Please check your email.')
      router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-indigo-50 flex">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-slate-800 to-indigo-900 p-12 flex-col justify-center relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 border border-white rounded-full"></div>
          <div className="absolute top-40 right-24 w-20 h-20 border border-white rounded-full"></div>
          <div className="absolute bottom-32 right-20 w-32 h-32 border border-white rounded-full"></div>
          <div className="absolute bottom-20 left-32 w-16 h-16 border border-white rounded-full"></div>
        </div>
        
        <div className="relative z-10 max-w-md">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-light text-white tracking-wide">LaundryLobby</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-light text-white mb-4 leading-tight">
            Join the<br />
            <span className="text-indigo-300 font-normal">Revolution</span>
          </h1>
          
          {/* Description */}
          <p className="text-lg text-gray-300 font-light mb-10">
            Create your account and experience premium laundry service. Simple. Clean. Efficient.
          </p>
          
          {/* Features */}
          <div className="space-y-5">
            <div className="flex items-start space-x-4">
              <div className="w-11 h-11 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">Free Pickup & Delivery</h3>
                <p className="text-gray-400 text-sm">We pick up and deliver at your doorstep</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-11 h-11 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">24-48 Hour Turnaround</h3>
                <p className="text-gray-400 text-sm">Quick service with express options</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-11 h-11 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">Quality Guaranteed</h3>
                <p className="text-gray-400 text-sm">Professional care for all fabrics</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-11 h-11 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">10,000+ Happy Customers</h3>
                <p className="text-gray-400 text-sm">Trusted by thousands across the city</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4 text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />Back to Home
          </Link>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Create Account</h2>
            <p className="text-gray-600 text-sm mb-4">Join the clean revolution</p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Your name" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Phone number" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="your@email.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Min 8 chars" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Confirm</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="password" required value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Confirm" />
                  </div>
                </div>
              </div>

              <div className="flex items-start pt-1">
                <input type="checkbox" required className="mt-0.5 rounded border-gray-300 text-indigo-600" />
                <span className="ml-2 text-xs text-gray-600">
                  I agree to the <Link href="/terms" className="text-indigo-600">Terms</Link> and <Link href="/privacy" className="text-indigo-600">Privacy Policy</Link>
                </span>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2.5 rounded-lg">
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <p className="mt-3 text-center text-sm text-gray-600">
              Already have an account? <Link href="/auth/login" className="text-indigo-600 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
