'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  ArrowLeft, 
  Sparkles,
  Clock,
  AlertCircle
} from 'lucide-react'

export default function VerifyEmailPage() {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | 'expired'>('pending')
  const [countdown, setCountdown] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuth } = useAuthStore()
  
  const email = searchParams.get('email') || ''
  const token = searchParams.get('token') || ''

  // Auto-verify if token is in URL
  useEffect(() => {
    if (token) {
      handleVerifyEmail(token)
    }
  }, [token])

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleVerifyEmail = async (verificationToken: string) => {
    setIsVerifying(true)
    setErrorMessage('')

    try {
      const response = await authAPI.verifyEmail(verificationToken)
      
      if (response.data.success) {
        setVerificationStatus('success')
        toast.success('Email verified successfully!')
        
        // Set authentication state
        if (response.data.data.user && response.data.data.token) {
          setAuth(response.data.data.user, response.data.data.token)
        }
        
        // Redirect to homepage after 2 seconds
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    } catch (error: any) {
      console.error('Email verification error:', error)
      setVerificationStatus('error')
      
      const errorMsg = error.response?.data?.message || 'Email verification failed'
      setErrorMessage(errorMsg)
      
      if (errorMsg.includes('expired') || errorMsg.includes('invalid')) {
        setVerificationStatus('expired')
      }
      
      toast.error(errorMsg)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Email address is required')
      return
    }

    setIsResending(true)

    try {
      await authAPI.resendVerification(email)
      toast.success('Verification email sent! Please check your inbox.')
      setCountdown(60) // 60 second cooldown
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend verification email')
    } finally {
      setIsResending(false)
    }
  }

  const renderContent = () => {
    switch (verificationStatus) {
      case 'success':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Email Verified Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Your account has been activated. You're being redirected to the homepage...
            </p>
            <div className="flex items-center justify-center text-teal-600">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              Redirecting...
            </div>
          </div>
        )

      case 'error':
      case 'expired':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {verificationStatus === 'expired' ? 'Verification Link Expired' : 'Verification Failed'}
            </h2>
            <p className="text-gray-600 mb-6">
              {verificationStatus === 'expired' 
                ? 'Your verification link has expired. Please request a new one.'
                : errorMessage || 'There was an issue verifying your email address.'
              }
            </p>
            {email && (
              <Button
                onClick={handleResendVerification}
                disabled={isResending || countdown > 0}
                className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white mb-4"
              >
                {isResending ? (
                  <div className="flex items-center">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Sending...
                  </div>
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Verification Email
                  </div>
                )}
              </Button>
            )}
            <div className="text-center">
              <Link href="/auth/register" className="text-teal-600 hover:text-teal-700 text-sm">
                Back to Registration
              </Link>
            </div>
          </div>
        )

      default: // pending
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              {isVerifying ? (
                <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />
              ) : (
                <Mail className="w-12 h-12 text-blue-600" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {isVerifying ? 'Verifying Email...' : 'Check Your Email'}
            </h2>
            <p className="text-gray-600 mb-6">
              {isVerifying 
                ? 'Please wait while we verify your email address...'
                : `We've sent a verification link to ${email || 'your email address'}. Please check your inbox and click the link to activate your account.`
              }
            </p>
            
            {!isVerifying && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-left">
                      <h4 className="text-sm font-medium text-blue-800 mb-1">
                        Didn't receive the email?
                      </h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Check your spam/junk folder</li>
                        <li>• Make sure you entered the correct email address</li>
                        <li>• Wait a few minutes for the email to arrive</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {email && (
                  <Button
                    onClick={handleResendVerification}
                    disabled={isResending || countdown > 0}
                    variant="outline"
                    className="border-teal-500 text-teal-600 hover:bg-teal-50 mb-4"
                  >
                    {isResending ? (
                      <div className="flex items-center">
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        Sending...
                      </div>
                    ) : countdown > 0 ? (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Resend in {countdown}s
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Resend Verification Email
                      </div>
                    )}
                  </Button>
                )}
              </>
            )}
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-teal-500 rounded-full"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-blue-500 rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-cyan-500 rounded-full"></div>
        <div className="absolute bottom-40 right-1/3 w-8 h-8 bg-teal-400 rounded-full"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Back to Home */}
        <Link href="/" className="inline-flex items-center text-teal-600 hover:text-teal-700 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-800">LaundryLobby</span>
          </div>
        </div>
        
        {/* Verification Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          {renderContent()}
        </div>

        {/* Help Section */}
        {verificationStatus === 'pending' && (
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Need help?</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>If you continue to have issues, please contact our support team:</p>
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-teal-500 mr-2" />
                support@LaundryLobby.com
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
