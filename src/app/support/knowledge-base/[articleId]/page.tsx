'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Eye, 
  Clock, 
  User, 
  Tag, 
  ThumbsUp, 
  ThumbsDown,
  Edit,
  Share2,
  BookOpen
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface Article {
  _id: string
  title: string
  content: string
  category: string
  tags: string[]
  views: number
  likes: number
  helpfulPercentage: number
  createdAt: string
  updatedAt: string
  author: {
    name: string
    email: string
  }
  lastUpdatedBy?: {
    name: string
    email: string
  }
  relatedArticles: Array<{
    _id: string
    title: string
    category: string
    views: number
  }>
}

export default function ArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const articleId = params.articleId as string
  
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userFeedback, setUserFeedback] = useState<boolean | null>(null)

  useEffect(() => {
    if (articleId) {
      fetchArticle()
    }
  }, [articleId])

  const fetchArticle = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await api.get(`/support/knowledge-base/${articleId}`)
      
      if (response.data.success) {
        setArticle(response.data.data.article)
      } else {
        setError(response.data.message || 'Article not found')
      }
    } catch (err: any) {
      console.error('Article fetch error:', err)
      setError(err.response?.data?.message || 'Failed to fetch article')
    } finally {
      setLoading(false)
    }
  }

  const markArticleHelpful = async (helpful: boolean) => {
    try {
      await api.post(`/support/knowledge-base/${articleId}/helpful`, { helpful })
      setUserFeedback(helpful)
      toast.success('Thank you for your feedback!')
      
      // Refresh article to get updated helpful percentage
      fetchArticle()
    } catch (error) {
      toast.error('Failed to record feedback')
    }
  }

  const shareArticle = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Article link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Getting Started': 'bg-blue-100 text-blue-800',
      'Ticket Management': 'bg-green-100 text-green-800',
      'Communication': 'bg-purple-100 text-purple-800',
      'Procedures': 'bg-orange-100 text-orange-800',
      'Technical': 'bg-red-100 text-red-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Article Not Found</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
              <Button variant="outline" asChild>
                <Link href="/support/knowledge-base">
                  Browse Articles
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Knowledge Base
        </Button>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={shareArticle}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/support/knowledge-base/${articleId}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Article Content */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <Badge className={getCategoryColor(article.category)}>
              {article.category}
            </Badge>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{article.views} views</span>
              </div>
              {article.helpfulPercentage > 0 && (
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{article.helpfulPercentage}% helpful</span>
                </div>
              )}
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold text-gray-900 mb-4">
            {article.title}
          </CardTitle>
          
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>By {article.author.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Created {formatTime(article.createdAt)}</span>
            </div>
            {article.lastUpdatedBy && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Updated {formatTime(article.updatedAt)} by {article.lastUpdatedBy.name}</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {article.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Article Content */}
          <div className="prose max-w-none mb-8">
            <div 
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: article.content.replace(/\n/g, '<br />') 
              }}
            />
          </div>
          
          {/* Feedback Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Was this article helpful?</h3>
            <div className="flex items-center space-x-4">
              <Button
                variant={userFeedback === true ? "default" : "outline"}
                onClick={() => markArticleHelpful(true)}
                className="flex items-center space-x-2"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Yes, helpful</span>
              </Button>
              <Button
                variant={userFeedback === false ? "default" : "outline"}
                onClick={() => markArticleHelpful(false)}
                className="flex items-center space-x-2"
              >
                <ThumbsDown className="w-4 h-4" />
                <span>Not helpful</span>
              </Button>
            </div>
            {userFeedback !== null && (
              <p className="text-sm text-gray-600 mt-2">
                Thank you for your feedback! It helps us improve our knowledge base.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Related Articles */}
      {article.relatedArticles && article.relatedArticles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>Related Articles</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {article.relatedArticles.map((relatedArticle) => (
                <Link
                  key={relatedArticle._id}
                  href={`/support/knowledge-base/${relatedArticle._id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    {relatedArticle.title}
                  </h4>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {relatedArticle.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{relatedArticle.views}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}