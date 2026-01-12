'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  Star,
  Search,
  MessageSquare,
  ThumbsUp,
  Clock,
  TrendingUp,
  Send,
  Edit2,
  Trash2,
  X,
  Loader2,
  CheckCircle,
  Award,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Review {
  _id: string
  reviewId: string
  customer: {
    _id: string
    name: string
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
  badges: string[]
  reply?: {
    content: string
    repliedBy: { name: string }
    repliedAt: string
    isEdited: boolean
  }
  createdAt: string
}

interface Stats {
  totalReviews: number
  avgOverall: number
  avgServiceQuality: number
  avgDeliverySpeed: number
  avgCleanliness: number
  avgValueForMoney: number
  avgStaffBehavior: number
  distribution: { [key: number]: number }
  needsReply: number
}

export default function BranchAdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    rating: '',
    hasReply: '',
    search: ''
  })
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [editingReply, setEditingReply] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [page, filters])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.rating && { rating: filters.rating }),
        ...(filters.hasReply && { hasReply: filters.hasReply }),
        ...(filters.search && { search: filters.search })
      })
      
      const response = await api.get(`/branch-admin/reviews?${params}`)
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

  const handleSubmitReply = async (reviewId: string) => {
    if (!replyContent.trim()) {
      toast.error('Please enter a reply')
      return
    }

    setSubmitting(true)
    try {
      const endpoint = editingReply 
        ? `/branch-admin/reviews/${reviewId}/reply`
        : `/branch-admin/reviews/${reviewId}/reply`
      
      const method = editingReply ? 'put' : 'post'
      const response = await api[method](endpoint, { content: replyContent.trim() })
      
      if (response.data.success) {
        toast.success(editingReply ? 'Reply updated' : 'Reply added')
        setReplyingTo(null)
        setEditingReply(null)
        setReplyContent('')
        fetchReviews()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit reply')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReply = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this reply?')) return

    try {
      const response = await api.delete(`/branch-admin/reviews/${reviewId}/reply`)
      if (response.data.success) {
        toast.success('Reply deleted')
        fetchReviews()
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const RatingBar = ({ label, value, max = 5 }: { label: string; value: number; max?: number }) => (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-32">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-yellow-400 rounded-full"
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-700 w-8">{value.toFixed(1)}</span>
    </div>
  )

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Branch Reviews</h1>
        <p className="text-gray-500 mt-1">View and respond to customer reviews</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Overall Rating Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <span className="text-3xl font-bold text-yellow-600">{stats.avgOverall.toFixed(1)}</span>
              </div>
              <div>
                {renderStars(Math.round(stats.avgOverall), 'w-5 h-5')}
                <p className="text-sm text-gray-500 mt-1">{stats.totalReviews} reviews</p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Rating Distribution</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-4">{rating}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${stats.totalReviews > 0 ? (stats.distribution[rating] / stats.totalReviews) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8">{stats.distribution[rating] || 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{stats.totalReviews}</p>
                <p className="text-xs text-gray-500">Total Reviews</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{stats.needsReply}</p>
                <p className="text-xs text-gray-500">Needs Reply</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Ratings */}
      {stats && stats.avgServiceQuality > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Category Ratings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RatingBar label="Service Quality" value={stats.avgServiceQuality} />
            <RatingBar label="Delivery Speed" value={stats.avgDeliverySpeed} />
            <RatingBar label="Cleanliness" value={stats.avgCleanliness} />
            <RatingBar label="Value for Money" value={stats.avgValueForMoney} />
            <RatingBar label="Staff Behavior" value={stats.avgStaffBehavior} />
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
            value={filters.hasReply}
            onChange={(e) => setFilters(prev => ({ ...prev, hasReply: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Reviews</option>
            <option value="false">Needs Reply</option>
            <option value="true">Replied</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-xl border border-gray-200 p-5">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="font-medium text-gray-600">
                      {review.customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{review.customer.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {renderStars(review.ratings.overall)}
                      <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                </div>
                {review.badges.includes('verified_purchase') && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>

              {/* Review Content */}
              {review.title && (
                <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
              )}
              <p className="text-gray-700 mb-3">{review.content}</p>

              {/* Photos */}
              {review.photos.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {review.photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo.url}
                      alt={`Review photo ${idx + 1}`}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {/* Helpful Count */}
              {review.helpfulVotes > 0 && (
                <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  {review.helpfulVotes} found helpful
                </p>
              )}

              {/* Reply Section */}
              {review.reply ? (
                <div className="mt-4 pl-4 border-l-2 border-blue-500 bg-blue-50 rounded-r-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700">Your Response</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingReply(review._id)
                          setReplyingTo(review._id)
                          setReplyContent(review.reply!.content)
                        }}
                        className="p-1 text-gray-400 hover:text-blue-500"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReply(review._id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{review.reply.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDate(review.reply.repliedAt)}
                    {review.reply.isEdited && ' (edited)'}
                  </p>
                </div>
              ) : replyingTo === review._id ? (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your response..."
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">{replyContent.length}/500</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null)
                          setReplyContent('')
                          setEditingReply(null)
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSubmitReply(review._id)}
                        disabled={submitting}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {submitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-1" />
                            {editingReply ? 'Update' : 'Reply'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setReplyingTo(review._id)}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <MessageSquare className="w-4 h-4" />
                  Reply to this review
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
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
  )
}
