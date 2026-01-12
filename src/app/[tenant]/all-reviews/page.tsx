'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  Star, ThumbsUp, Flag, MessageSquare, CheckCircle, ArrowLeft, Loader2, X, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface Review {
  _id: string
  customer: { _id: string; name: string }
  branch: { _id: string; name: string }
  ratings: { overall: number }
  title?: string
  content: string
  helpfulVotes: number
  badges: string[]
  reply?: { content: string; repliedBy: { name: string }; repliedAt: string }
  createdAt: string
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or fake review' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'offensive', label: 'Offensive language' },
  { value: 'fake', label: 'Fake or misleading' },
  { value: 'other', label: 'Other' }
]

export default function AllReviewsPage() {
  const params = useParams()
  const router = useRouter()
  const tenant = (params?.tenant as string) || ''
  const { isAuthenticated, user, token } = useAuthStore()
  
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [tenantInfo, setTenantInfo] = useState<any>(null)
  const [selectedBranch, setSelectedBranch] = useState<string>('all')
  const [branches, setBranches] = useState<any[]>([])
  const [sortBy, setSortBy] = useState<string>('recent')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportingReview, setReportingReview] = useState<Review | null>(null)
  const [reportReason, setReportReason] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [reportSubmitting, setReportSubmitting] = useState(false)

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const response = await fetch(`${API_URL}/public/tenancy/branding/${tenant}`)
        const data = await response.json()
        if (data.success) {
          setTenantInfo({ ...data.data, tenancyId: data.data.tenancyId })
          setBranches(data.data.branches || [])
        }
      } catch (error) { console.error('Error:', error) }
    }
    if (tenant) fetchTenant()
  }, [tenant])

  useEffect(() => {
    if (tenantInfo?.tenancyId) fetchReviews()
  }, [tenantInfo?.tenancyId, selectedBranch, sortBy, page])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      let url = ''
      if (selectedBranch === 'all') {
        // Fetch from all branches
        url = `${API_URL}/public/tenancy/reviews/tenancy/${tenantInfo.tenancyId}/featured?limit=50`
      } else {
        url = `${API_URL}/public/tenancy/reviews/branch/${selectedBranch}?page=${page}&limit=10&sort=${sortBy}`
      }
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setReviews(data.data.reviews || [])
        if (data.data.pagination) {
          setTotalPages(data.data.pagination.pages || 1)
        }
      }
    } catch (error) { 
      console.error('Error:', error) 
    } finally { 
      setLoading(false) 
    }
  }

  const handleVote = async (reviewId: string, vote: 'helpful' | 'not_helpful') => {
    if (!isAuthenticated) {
      toast.error('Please login to vote')
      router.push(`/auth/login?redirect=${encodeURIComponent(`/${tenant}/all-reviews`)}`)
      return
    }
    
    try {
      const response = await api.post(`/customer/reviews/${reviewId}/vote`, { vote })
      if (response.data.success) {
        toast.success('Vote recorded!')
        fetchReviews()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to vote')
    }
  }

  const openReportModal = (review: Review) => {
    if (!isAuthenticated) {
      toast.error('Please login to report')
      router.push(`/auth/login?redirect=${encodeURIComponent(`/${tenant}/all-reviews`)}`)
      return
    }
    
    // Can't report own review
    if (review.customer._id === user?._id) {
      toast.error("You can't report your own review")
      return
    }
    
    setReportingReview(review)
    setReportReason('')
    setReportDescription('')
    setShowReportModal(true)
  }

  const handleReport = async () => {
    if (!reportReason) {
      toast.error('Please select a reason')
      return
    }
    
    setReportSubmitting(true)
    try {
      const response = await api.post(`/customer/reviews/${reportingReview?._id}/flag`, {
        reason: reportReason,
        description: reportDescription
      })
      
      if (response.data.success) {
        toast.success('Review reported. Our team will review it.')
        setShowReportModal(false)
        setReportingReview(null)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to report')
    } finally {
      setReportSubmitting(false)
    }
  }

  const primaryColor = tenantInfo?.branding?.theme?.primaryColor || '#14b8a6'

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
      ))}
    </div>
  )

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN', { 
    day: 'numeric', month: 'short', year: 'numeric' 
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/${tenant}`} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Customer Reviews</h1>
              <p className="text-sm text-gray-500">{tenantInfo?.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl border p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <select 
                value={selectedBranch} 
                onChange={(e) => { setSelectedBranch(e.target.value); setPage(1) }}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">All Branches</option>
                {branches.map((branch: any) => (
                  <option key={branch._id} value={branch._id}>{branch.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select 
                value={sortBy} 
                onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="recent">Most Recent</option>
                <option value="helpful">Most Helpful</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-500">Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-xl border p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: primaryColor }}>
                      {review.customer?.name?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{review.customer?.name || 'Customer'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {renderStars(review.ratings.overall)}
                        <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">{review.branch?.name}</span>
                </div>

                {review.badges?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {review.badges.includes('verified_purchase') && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3" />Verified Purchase
                      </span>
                    )}
                  </div>
                )}

                {review.title && <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>}
                <p className="text-gray-700 mb-4">{review.content}</p>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-3 border-t">
                  <button 
                    onClick={() => handleVote(review._id, 'helpful')}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Helpful ({review.helpfulVotes})
                  </button>
                  <button 
                    onClick={() => openReportModal(review)}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500"
                  >
                    <Flag className="w-4 h-4" />
                    Report
                  </button>
                </div>

                {/* Reply */}
                {review.reply && (
                  <div className="mt-4 pl-4 border-l-2" style={{ borderColor: primaryColor }}>
                    <span className="text-sm font-medium" style={{ color: primaryColor }}>
                      Response from {review.reply.repliedBy?.name || 'Branch'}
                    </span>
                    <p className="text-sm text-gray-700 mt-1">{review.reply.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && selectedBranch !== 'all' && (
          <div className="flex justify-center gap-2 mt-6">
            <Button 
              variant="outline" 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </main>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Report Review</h2>
              </div>
              <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600">
                Why are you reporting this review? Our team will review your report.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
                <div className="space-y-2">
                  {REPORT_REASONS.map((reason) => (
                    <label key={reason.value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="reportReason"
                        value={reason.value}
                        checked={reportReason === reason.value}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="text-red-500"
                      />
                      <span className="text-sm">{reason.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details (optional)</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Provide more details about your report..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 p-4 border-t">
              <Button variant="outline" onClick={() => setShowReportModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleReport} 
                disabled={reportSubmitting || !reportReason}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                {reportSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Report'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
