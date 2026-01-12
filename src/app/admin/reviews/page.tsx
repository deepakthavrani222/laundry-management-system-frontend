'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  Star,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  EyeOff,
  Flag,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Clock,
  ChevronDown,
  X,
  Loader2,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Review {
  _id: string
  reviewId: string
  customer: {
    _id: string
    name: string
    email: string
    phone?: string
  }
  branch: {
    _id: string
    name: string
    code: string
  }
  order?: {
    orderNumber: string
  }
  ratings: {
    overall: number
    serviceQuality?: number
    deliverySpeed?: number
    cleanliness?: number
    valueForMoney?: number
    staffBehavior?: number
  }
  title?: string
  content: string
  photos: { url: string }[]
  helpfulVotes: number
  notHelpfulVotes: number
  badges: string[]
  status: 'pending' | 'approved' | 'rejected' | 'hidden'
  flagCount: number
  flags: { reason: string; description?: string }[]
  reply?: {
    content: string
    repliedBy: { name: string }
    repliedAt: string
  }
  moderatedBy?: { name: string }
  moderatedAt?: string
  moderationReason?: string
  createdAt: string
}

interface Stats {
  total: number
  pending: number
  approved: number
  rejected: number
  hidden: number
  flagged: number
  avgRating: number
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    status: '',
    rating: '',
    flagged: '',
    search: ''
  })
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [page, filters])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.status && { status: filters.status }),
        ...(filters.rating && { rating: filters.rating }),
        ...(filters.flagged && { flagged: filters.flagged }),
        ...(filters.search && { search: filters.search })
      })
      
      const response = await api.get(`/admin/reviews?${params}`)
      if (response.data.success) {
        setReviews(response.data.data.reviews)
        setStats(response.data.data.stats)
        setTotalPages(response.data.data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('Failed to fetch reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleModerate = async (reviewId: string, status: string, reason?: string) => {
    try {
      const response = await api.put(`/admin/reviews/${reviewId}/moderate`, { status, reason })
      if (response.data.success) {
        toast.success(`Review ${status}`)
        fetchReviews()
        setShowDetailModal(false)
      }
    } catch (error) {
      toast.error('Failed to moderate review')
    }
  }

  const handleClearFlags = async (reviewId: string) => {
    try {
      const response = await api.put(`/admin/reviews/${reviewId}/clear-flags`)
      if (response.data.success) {
        toast.success('Flags cleared')
        fetchReviews()
      }
    } catch (error) {
      toast.error('Failed to clear flags')
    }
  }

  const handleReplySubmit = async (reviewId: string, content: string) => {
    try {
      const response = await api.post(`/admin/reviews/${reviewId}/reply`, { content })
      if (response.data.success) {
        toast.success('Reply submitted')
        fetchReviews()
        // Update selected review
        if (selectedReview && selectedReview._id === reviewId) {
          setSelectedReview({ ...selectedReview, reply: response.data.data.reply })
        }
      }
    } catch (error) {
      toast.error('Failed to submit reply')
    }
  }

  const handleReplyDelete = async (reviewId: string) => {
    try {
      const response = await api.delete(`/admin/reviews/${reviewId}/reply`)
      if (response.data.success) {
        toast.success('Reply deleted')
        fetchReviews()
        // Update selected review
        if (selectedReview && selectedReview._id === reviewId) {
          setSelectedReview({ ...selectedReview, reply: undefined })
        }
      }
    } catch (error) {
      toast.error('Failed to delete reply')
    }
  }

  const renderStars = (rating: number, size = 'w-4 h-4') => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      hidden: 'bg-gray-100 text-gray-700'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
        <p className="text-gray-500 mt-1">Moderate and manage customer reviews</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <MessageSquare className="w-4 h-4" />
              Total
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-yellow-600 text-sm mb-1">
              <Clock className="w-4 h-4" />
              Pending
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
              <CheckCircle className="w-4 h-4" />
              Approved
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-red-600 text-sm mb-1">
              <XCircle className="w-4 h-4" />
              Rejected
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <EyeOff className="w-4 h-4" />
              Hidden
            </div>
            <p className="text-2xl font-bold text-gray-600">{stats.hidden}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-orange-600 text-sm mb-1">
              <Flag className="w-4 h-4" />
              Flagged
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats.flagged}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-blue-600 text-sm mb-1">
              <Star className="w-4 h-4" />
              Avg Rating
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.avgRating?.toFixed(1) || '0.0'}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="hidden">Hidden</option>
          </select>
          <select
            value={filters.rating}
            onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          <select
            value={filters.flagged}
            onChange={(e) => setFilters(prev => ({ ...prev, flagged: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Reviews</option>
            <option value="true">Flagged Only</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No reviews found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Review</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Customer</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Branch</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Rating</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviews.map((review) => (
                  <tr key={review._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        {review.title && (
                          <p className="font-medium text-gray-900 truncate">{review.title}</p>
                        )}
                        <p className="text-sm text-gray-600 line-clamp-2">{review.content}</p>
                        {review.flagCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-orange-600 mt-1">
                            <Flag className="w-3 h-3" />
                            {review.flagCount} flags
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{review.customer.name}</p>
                      <p className="text-sm text-gray-500">{review.customer.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900">{review.branch.name}</p>
                      <p className="text-xs text-gray-500">{review.branch.code}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {renderStars(review.ratings.overall)}
                        <span className="text-sm text-gray-600">{review.ratings.overall}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(review.status)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedReview(review)
                            setShowDetailModal(true)
                          }}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {review.status !== 'approved' && (
                          <button
                            onClick={() => handleModerate(review._id, 'approved')}
                            className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {review.status !== 'hidden' && (
                          <button
                            onClick={() => handleModerate(review._id, 'hidden')}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                            title="Hide"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      {showDetailModal && selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedReview(null)
          }}
          onModerate={handleModerate}
          onClearFlags={handleClearFlags}
          onReplySubmit={handleReplySubmit}
          onReplyDelete={handleReplyDelete}
          renderStars={renderStars}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
        />
      )}
    </div>
  )
}

// Review Detail Modal
function ReviewDetailModal({
  review,
  onClose,
  onModerate,
  onClearFlags,
  renderStars,
  formatDate,
  getStatusBadge,
  onReplySubmit,
  onReplyDelete
}: {
  review: Review
  onClose: () => void
  onModerate: (id: string, status: string, reason?: string) => void
  onClearFlags: (id: string) => void
  renderStars: (rating: number, size?: string) => JSX.Element
  formatDate: (date: string) => string
  getStatusBadge: (status: string) => JSX.Element
  onReplySubmit: (reviewId: string, content: string) => Promise<void>
  onReplyDelete: (reviewId: string) => Promise<void>
}) {
  const [moderationReason, setModerationReason] = useState('')
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState(review.reply?.content || '')
  const [submittingReply, setSubmittingReply] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-lg font-semibold">Review Details</h2>
            <p className="text-sm text-gray-500">{review.reviewId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Status & Rating */}
          <div className="flex items-center justify-between">
            {getStatusBadge(review.status)}
            <div className="flex items-center gap-2">
              {renderStars(review.ratings.overall, 'w-5 h-5')}
              <span className="font-semibold">{review.ratings.overall}/5</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Customer</h3>
            <p className="font-medium">{review.customer.name}</p>
            <p className="text-sm text-gray-500">{review.customer.email}</p>
            {review.customer.phone && (
              <p className="text-sm text-gray-500">{review.customer.phone}</p>
            )}
          </div>

          {/* Branch & Order */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Branch</h3>
              <p className="font-medium">{review.branch.name}</p>
              <p className="text-sm text-gray-500">{review.branch.code}</p>
            </div>
            {review.order && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Order</h3>
                <p className="font-medium">#{review.order.orderNumber}</p>
              </div>
            )}
          </div>

          {/* Review Content */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Review</h3>
            {review.title && (
              <p className="font-semibold text-gray-900 mb-1">{review.title}</p>
            )}
            <p className="text-gray-700">{review.content}</p>
          </div>

          {/* Category Ratings */}
          {(review.ratings.serviceQuality || review.ratings.deliverySpeed) && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Category Ratings</h3>
              <div className="grid grid-cols-2 gap-3">
                {review.ratings.serviceQuality && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Service Quality</span>
                    {renderStars(review.ratings.serviceQuality, 'w-3 h-3')}
                  </div>
                )}
                {review.ratings.deliverySpeed && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Delivery Speed</span>
                    {renderStars(review.ratings.deliverySpeed, 'w-3 h-3')}
                  </div>
                )}
                {review.ratings.cleanliness && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cleanliness</span>
                    {renderStars(review.ratings.cleanliness, 'w-3 h-3')}
                  </div>
                )}
                {review.ratings.valueForMoney && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Value for Money</span>
                    {renderStars(review.ratings.valueForMoney, 'w-3 h-3')}
                  </div>
                )}
                {review.ratings.staffBehavior && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Staff Behavior</span>
                    {renderStars(review.ratings.staffBehavior, 'w-3 h-3')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Photos */}
          {review.photos.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Photos</h3>
              <div className="flex gap-2">
                {review.photos.map((photo, idx) => (
                  <img
                    key={idx}
                    src={photo.url}
                    alt={`Review photo ${idx + 1}`}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Flags */}
          {review.flagCount > 0 && (
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-orange-700 flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  {review.flagCount} Flag{review.flagCount > 1 ? 's' : ''}
                </h3>
                <button
                  onClick={() => onClearFlags(review._id)}
                  className="text-xs text-orange-600 hover:text-orange-700"
                >
                  Clear Flags
                </button>
              </div>
              <div className="space-y-2">
                {review.flags.map((flag, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-medium capitalize">{flag.reason.replace('_', ' ')}</span>
                    {flag.description && (
                      <span className="text-gray-600"> - {flag.description}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Branch Reply */}
          {review.reply ? (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-blue-700">Branch Response</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowReplyForm(true); setReplyContent(review.reply!.content) }}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Delete this reply?')) {
                        await onReplyDelete(review._id)
                      }
                    }}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-gray-700">{review.reply.content}</p>
              <p className="text-xs text-gray-500 mt-2">
                By {review.reply.repliedBy?.name} on {formatDate(review.reply.repliedAt)}
              </p>
            </div>
          ) : !showReplyForm ? (
            <button
              onClick={() => setShowReplyForm(true)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <MessageSquare className="w-4 h-4" />
              Reply to this review
            </button>
          ) : null}

          {/* Reply Form */}
          {showReplyForm && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                {review.reply ? 'Edit Reply' : 'Write a Reply'}
              </h3>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your response to this review..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3"
              />
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    if (!replyContent.trim()) {
                      toast.error('Please enter a reply')
                      return
                    }
                    setSubmittingReply(true)
                    await onReplySubmit(review._id, replyContent)
                    setSubmittingReply(false)
                    setShowReplyForm(false)
                  }}
                  disabled={submittingReply}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  size="sm"
                >
                  {submittingReply ? 'Submitting...' : review.reply ? 'Update Reply' : 'Submit Reply'}
                </Button>
                <Button
                  onClick={() => { setShowReplyForm(false); setReplyContent(review.reply?.content || '') }}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Moderation History */}
          {review.moderatedBy && (
            <div className="text-sm text-gray-500">
              <p>
                Moderated by {review.moderatedBy.name} on {formatDate(review.moderatedAt!)}
              </p>
              {review.moderationReason && (
                <p>Reason: {review.moderationReason}</p>
              )}
            </div>
          )}

          {/* Moderation Actions */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Moderation Actions</h3>
            <div className="space-y-3">
              <textarea
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                placeholder="Reason for moderation (optional)"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => onModerate(review._id, 'approved', moderationReason)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => onModerate(review._id, 'rejected', moderationReason)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => onModerate(review._id, 'hidden', moderationReason)}
                  variant="outline"
                  className="flex-1"
                >
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
