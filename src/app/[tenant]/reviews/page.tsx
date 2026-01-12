'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  Star, Plus, Edit2, Trash2, ThumbsUp, MessageSquare, Award, CheckCircle,
  ChevronDown, ChevronLeft, ChevronRight, X, Loader2, Home, ShoppingBag,
  Gift, Wallet, HelpCircle, MapPin, User, LogOut, ArrowLeft, Menu, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Sidebar Navigation
const getSidebarNavigation = (tenantSlug: string) => [
  { name: 'Dashboard', href: `/${tenantSlug}/dashboard`, icon: Home },
  { name: 'My Orders', href: `/${tenantSlug}/orders`, icon: ShoppingBag },
  { name: 'My Reviews', href: `/${tenantSlug}/reviews`, icon: MessageSquare, current: true },
  { name: 'Loyalty', href: `/${tenantSlug}/loyalty`, icon: Award },
  { name: 'Referrals', href: `/${tenantSlug}/referrals`, icon: Gift },
  { name: 'Wallet', href: `/${tenantSlug}/wallet`, icon: Wallet },
  { name: 'Support', href: `/${tenantSlug}/support`, icon: HelpCircle },
  { name: 'Addresses', href: `/${tenantSlug}/addresses`, icon: MapPin },
  { name: 'Profile', href: `/${tenantSlug}/profile`, icon: User },
]

interface Review {
  _id: string
  branch: { _id: string; name: string }
  ratings: { overall: number; serviceQuality?: number; deliverySpeed?: number }
  title?: string
  content: string
  photos: { url: string }[]
  helpfulVotes: number
  badges: string[]
  reply?: { content: string; repliedBy: { name: string }; repliedAt: string }
  isEdited: boolean
  createdAt: string
}

interface ReviewableBranch {
  branch: { _id: string; name: string }
  orderId: string
  orderNumber: string
}

export default function TenantReviewsPage() {
  const params = useParams()
  const router = useRouter()
  const tenant = (params?.tenant as string) || ''
  const { isAuthenticated, user, logout } = useAuthStore()
  
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewableBranches, setReviewableBranches] = useState<ReviewableBranch[]>([])
  const [loading, setLoading] = useState(true)
  const [showWriteModal, setShowWriteModal] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<ReviewableBranch | null>(null)
  const [tenantInfo, setTenantInfo] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const sidebarNavigation = useMemo(() => getSidebarNavigation(tenant), [tenant])

  useEffect(() => {
    const saved = localStorage.getItem('tenant-sidebar-collapsed')
    if (saved) setSidebarCollapsed(JSON.parse(saved))
  }, [])

  const toggleSidebarCollapse = () => {
    const newValue = !sidebarCollapsed
    setSidebarCollapsed(newValue)
    localStorage.setItem('tenant-sidebar-collapsed', JSON.stringify(newValue))
  }

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const response = await fetch(`${API_URL}/public/tenancy/branding/${tenant}`)
        const data = await response.json()
        if (data.success) setTenantInfo({ ...data.data, tenancyId: data.data.tenancyId })
      } catch (error) { console.error('Error:', error) }
    }
    if (tenant) {
      sessionStorage.setItem('lastVisitedTenant', tenant)
      fetchTenant()
    }
  }, [tenant])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/${tenant}/reviews`)}`)
    }
  }, [isAuthenticated, tenant, router])

  useEffect(() => {
    if (isAuthenticated && tenantInfo?.tenancyId) {
      fetchMyReviews()
      fetchReviewableBranches()
    }
  }, [isAuthenticated, tenantInfo?.tenancyId])

  const fetchMyReviews = async () => {
    try {
      const response = await api.get(`/customer/reviews/my-reviews?tenancyId=${tenantInfo?.tenancyId}`)
      if (response.data.success) setReviews(response.data.data.reviews)
    } catch (error) { console.error('Error:', error) }
    finally { setLoading(false) }
  }

  const fetchReviewableBranches = async () => {
    try {
      const response = await api.get(`/customer/reviews/reviewable-branches?tenancyId=${tenantInfo?.tenancyId}`)
      if (response.data.success) setReviewableBranches(response.data.data)
    } catch (error) { console.error('Error:', error) }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review?')) return
    try {
      const response = await api.delete(`/customer/reviews/${reviewId}`)
      if (response.data.success) { toast.success('Review deleted'); fetchMyReviews(); fetchReviewableBranches() }
    } catch (error) { toast.error('Failed to delete') }
  }

  const handleLogout = () => { logout(); router.push(`/${tenant}`) }

  const primaryColor = tenantInfo?.branding?.theme?.primaryColor || '#14b8a6'

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
      ))}
    </div>
  )

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${sidebarCollapsed ? 'w-20' : 'w-72'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <Link href={`/${tenant}`} className="flex items-center gap-3">
                  {tenantInfo?.branding?.logo?.url ? (
                    <img src={tenantInfo.branding.logo.url} alt="" className="w-10 h-10 rounded-xl object-contain" />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div>
                    <h1 className="font-bold text-gray-800">{tenantInfo?.name || 'Dashboard'}</h1>
                    <p className="text-xs text-gray-500">Customer Portal</p>
                  </div>
                </Link>
              )}
              {sidebarCollapsed && (
                <Link href={`/${tenant}`} className="mx-auto">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </Link>
              )}
              <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </button>
              <button className="hidden lg:flex p-1.5 hover:bg-gray-100 rounded-lg" onClick={toggleSidebarCollapse}>
                {sidebarCollapsed ? <ChevronRight className="w-5 h-5 text-gray-500" /> : <ChevronLeft className="w-5 h-5 text-gray-500" />}
              </button>
            </div>
          </div>

          {!sidebarCollapsed && user && (
            <div className="p-4 border-b">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">{user?.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          )}

          <nav className={`flex-1 ${sidebarCollapsed ? 'p-2' : 'p-4'} space-y-1 overflow-y-auto`}>
            {sidebarNavigation.map((item) => {
              const isActive = item.current
              return (
                <Link key={item.name} href={item.href}
                  className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-xl transition-all ${isActive ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => setSidebarOpen(false)}>
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
                </Link>
              )
            })}
          </nav>

          <div className={`${sidebarCollapsed ? 'p-2' : 'p-4'} border-t space-y-2`}>
            <Link href={`/${tenant}`} className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 text-gray-600 hover:bg-gray-100 rounded-xl`}>
              <ArrowLeft className="w-5 h-5 text-gray-400" />
              {!sidebarCollapsed && <span className="font-medium">Back to Store</span>}
            </Link>
            <button onClick={handleLogout} className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 text-red-600 hover:bg-red-50 rounded-xl`}>
              <LogOut className="w-5 h-5" />
              {!sidebarCollapsed && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <header className={`bg-white border-b fixed top-0 right-0 z-30 transition-all duration-300 ${sidebarCollapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-72'}`}>
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">My Reviews</h1>
                <p className="text-sm text-gray-500">Share your experience</p>
              </div>
            </div>
            {reviewableBranches.length > 0 && (
              <Button onClick={() => setShowWriteModal(true)} className="text-white" style={{ backgroundColor: primaryColor }}>
                <Plus className="w-4 h-4 mr-2" />Write Review
              </Button>
            )}
          </div>
        </header>

        <main className="p-4 lg:p-8 mt-16">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} /></div>
          ) : (
            <>
              {reviewableBranches.length > 0 && (
                <div className="rounded-xl p-4 mb-6 border" style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}30` }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Share your feedback!</h3>
                      <p className="text-sm text-gray-600 mt-1">You have {reviewableBranches.length} branch{reviewableBranches.length > 1 ? 'es' : ''} waiting for your review.</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {reviewableBranches.slice(0, 3).map((item) => (
                          <button key={item.branch._id} onClick={() => { setSelectedBranch(item); setShowWriteModal(true) }} className="text-sm px-3 py-1.5 rounded-lg bg-white border hover:border-gray-300">
                            {item.branch.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-500 mb-4">{reviewableBranches.length > 0 ? 'Share your experience!' : 'Complete an order to leave a review'}</p>
                  {reviewableBranches.length > 0 && (
                    <Button onClick={() => setShowWriteModal(true)} className="text-white" style={{ backgroundColor: primaryColor }}>Write Your First Review</Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="bg-white rounded-xl border p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{review.branch.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            {renderStars(review.ratings.overall)}
                            <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                            {review.isEdited && <span className="text-xs text-gray-400">(edited)</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingReview(review); setShowWriteModal(true) }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteReview(review._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      {review.badges.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {review.badges.includes('verified_purchase') && <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700"><CheckCircle className="w-3 h-3" />Verified</span>}
                          {review.badges.includes('first_review') && <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700"><Award className="w-3 h-3" />First Review</span>}
                        </div>
                      )}
                      {review.title && <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>}
                      <p className="text-gray-700 mb-3">{review.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" />{review.helpfulVotes} helpful</span>
                      </div>
                      {review.reply && (
                        <div className="mt-4 pl-4 border-l-2" style={{ borderColor: primaryColor }}>
                          <span className="text-sm font-medium" style={{ color: primaryColor }}>Response from {review.reply.repliedBy?.name || 'Branch'}</span>
                          <p className="text-sm text-gray-700 mt-1">{review.reply.content}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {showWriteModal && (
        <WriteReviewModal isOpen={showWriteModal} onClose={() => { setShowWriteModal(false); setEditingReview(null); setSelectedBranch(null) }}
          editingReview={editingReview} selectedBranch={selectedBranch} reviewableBranches={reviewableBranches} primaryColor={primaryColor}
          tenancyId={tenantInfo?.tenancyId} onSuccess={() => { fetchMyReviews(); fetchReviewableBranches() }} />
      )}
    </div>
  )
}


function WriteReviewModal({ isOpen, onClose, editingReview, selectedBranch, reviewableBranches, primaryColor, tenancyId, onSuccess }: any) {
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
  const [showCategories, setShowCategories] = useState(false)

  const handleSubmit = async () => {
    if (!editingReview && !branch) { toast.error('Please select a branch'); return }
    if (ratings.overall === 0) { toast.error('Please provide a rating'); return }
    if (!content.trim()) { toast.error('Please write your review'); return }

    setSubmitting(true)
    try {
      const payload = { 
        branchId: editingReview ? editingReview.branch._id : branch?.branch._id, 
        orderId: branch?.orderId, 
        ratings, 
        title: title.trim() || undefined, 
        content: content.trim(),
        tenancyId: tenancyId
      }
      const response = editingReview ? await api.put(`/customer/reviews/${editingReview._id}`, payload) : await api.post('/customer/reviews', payload)
      if (response.data.success) { toast.success(editingReview ? 'Review updated!' : 'Review submitted!'); onSuccess(); onClose() }
    } catch (error: any) { toast.error(error.response?.data?.message || 'Failed to submit') }
    finally { setSubmitting(false) }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{editingReview ? 'Edit Review' : 'Write a Review'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-5">
          {!editingReview && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Branch</label>
              <select value={branch?.branch._id || ''} onChange={(e) => setBranch(reviewableBranches.find((b: any) => b.branch._id === e.target.value))} className="w-full px-3 py-2 border rounded-lg">
                <option value="">Choose a branch...</option>
                {reviewableBranches.map((item: any) => <option key={item.branch._id} value={item.branch._id}>{item.branch.name} - Order #{item.orderNumber}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Overall Rating *</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRatings(p => ({ ...p, overall: star }))} className="p-1 hover:scale-110 transition-transform">
                  <Star className={`w-10 h-10 ${star <= ratings.overall ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">{['Tap to rate', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][ratings.overall]}</p>
          </div>
          <div>
            <button onClick={() => setShowCategories(!showCategories)} className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <ChevronDown className={`w-4 h-4 transition-transform ${showCategories ? 'rotate-180' : ''}`} />Rate categories (optional)
            </button>
            {showCategories && (
              <div className="mt-3 space-y-3 p-3 bg-gray-50 rounded-lg">
                {[{ key: 'serviceQuality', label: 'Service Quality' }, { key: 'deliverySpeed', label: 'Delivery Speed' }, { key: 'cleanliness', label: 'Cleanliness' }, { key: 'valueForMoney', label: 'Value for Money' }, { key: 'staffBehavior', label: 'Staff Behavior' }].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{label}</span>
                    <div className="flex gap-1">{[1, 2, 3, 4, 5].map((star) => <button key={star} onClick={() => setRatings(p => ({ ...p, [key]: star }))}><Star className={`w-5 h-5 ${star <= (ratings as any)[key] ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} /></button>)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title (optional)</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summarize your experience" maxLength={100} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Review *</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share your experience..." rows={4} maxLength={1000} className="w-full px-3 py-2 border rounded-lg resize-none" />
            <p className="text-xs text-gray-400 mt-1 text-right">{content.length}/1000</p>
          </div>
        </div>
        <div className="flex gap-3 p-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="flex-1 text-white" style={{ backgroundColor: primaryColor }}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingReview ? 'Update' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  )
}
