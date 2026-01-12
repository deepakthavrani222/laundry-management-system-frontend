'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useTenancyTheme } from '@/contexts/TenancyThemeContext'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  Star,
  Plus,
  Edit2,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Award,
  CheckCircle,
  Clock,
  ChevronDown,
  X,
  Camera,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Review {
  _id: string
  reviewId: string
  branch: {
    _id: string
    name: string
    address?: { city?: string }
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
  reply?: {
    content: string
    repliedBy: { name: string }
    repliedAt: string
    isEdited: boolean
  }
  isEdited: boolean
  createdAt: string
}

interface ReviewableBranch {
  branch: {
    _id: string
    name: string
    address?: { city?: string }
  }
  orderId: string
  orderNumber: string
  deliveredAt: string
}

export default function CustomerReviewsPage() {
  const { user } = useAuthStore()
  const { theme } = useTenancyTheme()
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewableBranches, setReviewableBranches] = useState<ReviewableBranch[]>([])
  const [loading, setLoading] = useState(true)
  const [showWriteModal, setShowWriteModal] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<ReviewableBranch | null>(null)

  useEffect(() => {
    fetchMyReviews()
    fetchReviewableBranches()
  }, [])

  const fetchMyReviews = async () => {
    try {
      const response = await api.get('/customer/reviews/my-reviews')
      if (response.data.success) {
        setReviews(response.data.data.reviews)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviewableBranches = async () => {
    try {
      const response = await api.get('/customer/reviews/reviewable-branches')
      if (response.data.success) {
        setReviewableBranches(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching reviewable branches:', error)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    
    try {
      const response = await api.delete(`/customer/reviews/${reviewId}`)
      if (response.data.success) {
        toast.success('Review deleted')
        fetchMyReviews()
        fetchReviewableBranches()
      }
    } catch (error) {
      toast.error('Failed to delete review')
    }
  }

  const renderStars = (rating: number, size = 'w-4 h-4') => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme?.primaryColor }} />
      </div>
    )
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-gray-500 mt-1">Share your experience with our services</p>
        </div>
        
        {reviewableBranches.length > 0 && (
          <Button
            onClick={() => setShowWriteModal(true)}
            className="text-white"
            style={{ backgroundColor: theme?.primaryColor }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Write a Review
          </Button>
        )}
      </div>

      {/* Reviewable Branches Prompt */}
      {reviewableBranches.length > 0 && (
        <div 
          className="rounded-xl p-4 mb-6 border"
          style={{ 
            backgroundColor: `${theme?.primaryColor}10`,
            borderColor: `${theme?.primaryColor}30`
          }}
        >
          <div className="flex items-start gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: theme?.primaryColor }}
            >
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Share your feedback!</h3>
              <p className="text-sm text-gray-600 mt-1">
                You have {reviewableBranches.length} branch{reviewableBranches.length > 1 ? 'es' : ''} waiting for your review.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {reviewableBranches.slice(0, 3).map((item) => (
                  <button
                    key={item.branch._id}
                    onClick={() => {
                      setSelectedBranch(item)
                      setShowWriteModal(true)
                    }}
                    className="text-sm px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    {item.branch.name}
                  </button>
                ))}
                {reviewableBranches.length > 3 && (
                  <button
                    onClick={() => setShowWriteModal(true)}
                    className="text-sm px-3 py-1.5 rounded-lg"
                    style={{ color: theme?.primaryColor }}
                  >
                    +{reviewableBranches.length - 3} more
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-500 mb-4">
            {reviewableBranches.length > 0 
              ? 'Share your experience with our services!'
              : 'Complete an order to leave a review'}
          </p>
          {reviewableBranches.length > 0 && (
            <Button
              onClick={() => setShowWriteModal(true)}
              className="text-white"
              style={{ backgroundColor: theme?.primaryColor }}
            >
              Write Your First Review
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-xl border border-gray-200 p-5">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{review.branch.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    {renderStars(review.ratings.overall)}
                    <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                    {review.isEdited && (
                      <span className="text-xs text-gray-400">(edited)</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingReview(review)
                      setShowWriteModal(true)
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Badges */}
              {review.badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {review.badges.includes('verified_purchase') && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3" />
                      Verified Purchase
                    </span>
                  )}
                  {review.badges.includes('first_review') && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      <Award className="w-3 h-3" />
                      First Review
                    </span>
                  )}
                </div>
              )}

              {/* Review Content */}
              {review.title && (
                <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
              )}
              <p className="text-gray-700 mb-3">{review.content}</p>

              {/* Category Ratings */}
              {(review.ratings.serviceQuality || review.ratings.deliverySpeed) && (
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                  {review.ratings.serviceQuality && (
                    <div className="flex items-center gap-1">
                      <span>Service:</span>
                      {renderStars(review.ratings.serviceQuality, 'w-3 h-3')}
                    </div>
                  )}
                  {review.ratings.deliverySpeed && (
                    <div className="flex items-center gap-1">
                      <span>Delivery:</span>
                      {renderStars(review.ratings.deliverySpeed, 'w-3 h-3')}
                    </div>
                  )}
                  {review.ratings.valueForMoney && (
                    <div className="flex items-center gap-1">
                      <span>Value:</span>
                      {renderStars(review.ratings.valueForMoney, 'w-3 h-3')}
                    </div>
                  )}
                </div>
              )}

              {/* Photos */}
              {review.photos.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {review.photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo.url}
                      alt={`Review photo ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {/* Helpful Votes */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  {review.helpfulVotes} found helpful
                </span>
              </div>

              {/* Branch Reply */}
              {review.reply && (
                <div className="mt-4 pl-4 border-l-2" style={{ borderColor: theme?.primaryColor }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium" style={{ color: theme?.primaryColor }}>
                      Response from {review.reply.repliedBy?.name || 'Branch'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(review.reply.repliedAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{review.reply.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Write/Edit Review Modal */}
      {showWriteModal && (
        <WriteReviewModal
          isOpen={showWriteModal}
          onClose={() => {
            setShowWriteModal(false)
            setEditingReview(null)
            setSelectedBranch(null)
          }}
          editingReview={editingReview}
          selectedBranch={selectedBranch}
          reviewableBranches={reviewableBranches}
          theme={theme}
          onSuccess={() => {
            fetchMyReviews()
            fetchReviewableBranches()
          }}
        />
      )}
    </div>
  )
}

// Write Review Modal Component
function WriteReviewModal({
  isOpen,
  onClose,
  editingReview,
  selectedBranch,
  reviewableBranches,
  theme,
  onSuccess
}: {
  isOpen: boolean
  onClose: () => void
  editingReview: Review | null
  selectedBranch: ReviewableBranch | null
  reviewableBranches: ReviewableBranch[]
  theme: any
  onSuccess: () => void
}) {
  const [branch, setBranch] = useState(selectedBranch)
  const [ratings, setRatings] = useState({
    overall: editingReview?.ratings.overall || 0,
    serviceQuality: editingReview?.ratings.serviceQuality || 0,
    deliverySpeed: editingReview?.ratings.deliverySpeed || 0,
    cleanliness: editingReview?.ratings.cleanliness || 0,
    valueForMoney: editingReview?.ratings.valueForMoney || 0,
    staffBehavior: editingReview?.ratings.staffBehavior || 0
  })
  const [title, setTitle] = useState(editingReview?.title || '')
  const [content, setContent] = useState(editingReview?.content || '')
  const [submitting, setSubmitting] = useState(false)
  const [showCategoryRatings, setShowCategoryRatings] = useState(false)

  const handleSubmit = async () => {
    if (!editingReview && !branch) {
      toast.error('Please select a branch')
      return
    }
    if (ratings.overall === 0) {
      toast.error('Please provide an overall rating')
      return
    }
    if (!content.trim()) {
      toast.error('Please write your review')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        branchId: editingReview ? editingReview.branch._id : branch?.branch._id,
        orderId: branch?.orderId,
        ratings,
        title: title.trim() || undefined,
        content: content.trim()
      }

      let response
      if (editingReview) {
        response = await api.put(`/customer/reviews/${editingReview._id}`, payload)
      } else {
        response = await api.post('/customer/reviews', payload)
      }

      if (response.data.success) {
        toast.success(editingReview ? 'Review updated!' : 'Review submitted!')
        onSuccess()
        onClose()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`w-6 h-6 ${star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            />
          </button>
        ))}
      </div>
    </div>
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {editingReview ? 'Edit Review' : 'Write a Review'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Branch Selection */}
          {!editingReview && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Branch
              </label>
              <select
                value={branch?.branch._id || ''}
                onChange={(e) => {
                  const selected = reviewableBranches.find(b => b.branch._id === e.target.value)
                  setBranch(selected || null)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': theme?.primaryColor } as any}
              >
                <option value="">Choose a branch...</option>
                {reviewableBranches.map((item) => (
                  <option key={item.branch._id} value={item.branch._id}>
                    {item.branch.name} - Order #{item.orderNumber}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Overall Rating *
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatings(prev => ({ ...prev, overall: star }))}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${star <= ratings.overall ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">
              {ratings.overall === 0 && 'Tap to rate'}
              {ratings.overall === 1 && 'Poor'}
              {ratings.overall === 2 && 'Fair'}
              {ratings.overall === 3 && 'Good'}
              {ratings.overall === 4 && 'Very Good'}
              {ratings.overall === 5 && 'Excellent'}
            </p>
          </div>

          {/* Category Ratings (Collapsible) */}
          <div>
            <button
              type="button"
              onClick={() => setShowCategoryRatings(!showCategoryRatings)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showCategoryRatings ? 'rotate-180' : ''}`} />
              Rate specific categories (optional)
            </button>
            
            {showCategoryRatings && (
              <div className="mt-3 space-y-3 p-3 bg-gray-50 rounded-lg">
                <StarRating
                  label="Service Quality"
                  value={ratings.serviceQuality}
                  onChange={(v) => setRatings(prev => ({ ...prev, serviceQuality: v }))}
                />
                <StarRating
                  label="Delivery Speed"
                  value={ratings.deliverySpeed}
                  onChange={(v) => setRatings(prev => ({ ...prev, deliverySpeed: v }))}
                />
                <StarRating
                  label="Cleanliness"
                  value={ratings.cleanliness}
                  onChange={(v) => setRatings(prev => ({ ...prev, cleanliness: v }))}
                />
                <StarRating
                  label="Value for Money"
                  value={ratings.valueForMoney}
                  onChange={(v) => setRatings(prev => ({ ...prev, valueForMoney: v }))}
                />
                <StarRating
                  label="Staff Behavior"
                  value={ratings.staffBehavior}
                  onChange={(v) => setRatings(prev => ({ ...prev, staffBehavior: v }))}
                />
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': theme?.primaryColor } as any}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your experience with this branch..."
              rows={4}
              maxLength={1000}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent resize-none"
              style={{ '--tw-ring-color': theme?.primaryColor } as any}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {content.length}/1000
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 text-white"
            style={{ backgroundColor: theme?.primaryColor }}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : editingReview ? (
              'Update Review'
            ) : (
              'Submit Review'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
