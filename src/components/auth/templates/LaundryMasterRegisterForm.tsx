'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { authAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, Crown, Award } from 'lucide-react'

export default function LaundryMasterRegisterForm() {
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
    setIsLoading(true)
    try {
      await authAPI.register({ name: formData.name, email: formData.email, phone: formData.phone, password: formData.password, confirmPassword: formData.confirmPassword })
      toast.success('Registration successful! Please check your email.')
      router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 flex">
      {/* Left Side */}
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
                {[...Array(5)].map((_, i) => <Award key={i} className="w-3 h-3 text-yellow-400 fill-current" />)}
                <span className="text-purple-200 text-xs ml-1">Premium</span>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Join The<br />
            <span className="text-purple-300">Premium</span> <span className="text-violet-300">Experience</span>
          </h1>
          <p className="text-lg text-purple-100 mb-6">Experience hassle-free laundry with doorstep service</p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-purple-300/20">
              <Award className="w-5 h-5 text-purple-300" />
              <div>
                <div className="text-white text-sm font-semibold">Free Pickup & Delivery</div>
                <div className="text-purple-200 text-xs">We come to your doorstep</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-purple-300/20">
              <Crown className="w-5 h-5 text-purple-300" />
              <div>
                <div className="text-white text-sm font-semibold">VIP Treatment</div>
                <div className="text-purple-200 text-xs">Priority service & care</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4 text-sm font-semibold">
            <ArrowLeft className="w-4 h-4 mr-2" />Back to Home
          </Link>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
              <p className="text-gray-600 text-sm">Join our premium laundry service today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 w-4 h-4" />
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-purple-50/50" placeholder="Your name" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 w-4 h-4" />
                    <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-purple-50/50" placeholder="Phone" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 w-4 h-4" />
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-purple-50/50" placeholder="your@email.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 w-4 h-4" />
                    <input type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-9 pr-8 py-2 text-sm border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-purple-50/50" placeholder="Min 8 chars" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-500">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Confirm</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 w-4 h-4" />
                    <input type="password" required value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-purple-50/50" placeholder="Confirm" />
                  </div>
                </div>
              </div>

              <div className="flex items-start pt-1">
                <input type="checkbox" required className="mt-0.5 rounded border-purple-300 text-purple-600" />
                <span className="ml-2 text-xs text-gray-600">
                  I agree to the <Link href="/terms" className="text-purple-600">Terms</Link> and <Link href="/privacy" className="text-purple-600">Privacy Policy</Link>
                </span>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white py-2.5 rounded-xl font-bold shadow-xl">
                {isLoading ? 'Creating account...' : <><Crown className="w-4 h-4 mr-2 inline" />Create Account</>}
              </Button>
            </form>

            <p className="mt-3 text-center text-sm text-gray-600">
              Already have an account? <Link href="/auth/login" className="text-purple-600 font-bold">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
