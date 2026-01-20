'use client'

import { useState, useEffect } from 'react'
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  ChevronRight, 
  Tag, 
  Clock, 
  Eye,
  Plus,
  Edit,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import CreateArticleModal from '@/components/support/CreateArticleModal'

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
}

interface Category {
  _id: string
  name: string
  description?: string
  count: number
  color: string
  icon: string
}

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchKnowledgeBase()
  }, [currentPage, selectedCategory, searchTerm])

  const fetchKnowledgeBase = async () => {
    try {
      setLoading(true)
      setError('')
      
      const params: any = {
        page: currentPage,
        limit: 12
      }
      
      if (selectedCategory !== 'all') {
        params.category = selectedCategory
      }
      
      if (searchTerm) {
        params.search = searchTerm
      }
      
      const response = await api.get('/support/knowledge-base', { params })
      
      if (response.data.success) {
        setArticles(response.data.data?.data || [])
        setCategories(response.data.data?.categories || [])
        setTotalPages(response.data.data?.totalPages || 1)
      } else {
        setError(response.data.message || 'Failed to fetch knowledge base')
      }
    } catch (err: any) {
      console.error('Knowledge base fetch error:', err)
      setError(err.response?.data?.message || 'Failed to fetch knowledge base')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const markArticleHelpful = async (articleId: string, helpful: boolean) => {
    try {
      await api.post(`/support/knowledge-base/${articleId}/helpful`, { helpful })
      toast.success('Thank you for your feedback!')
      fetchKnowledgeBase() // Refresh to get updated helpful percentage
    } catch (error) {
      toast.error('Failed to record feedback')
    }
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const getCategoryColor = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      pink: 'bg-pink-100 text-pink-800 border-pink-200'
    }
    return colors[color] || colors.blue
  }

  if (loading && articles.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-20 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-600">Find answers and helpful resources</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <BookOpen className="w-4 h-4" />
            <span>{articles.length} articles</span>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Article
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search articles, topics, or keywords..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Categories ({categories.reduce((sum, cat) => sum + cat.count, 0)})
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => handleCategoryChange(category.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.name
                      ? getCategoryColor(category.color)
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
            <Button 
              variant="outline" 
              onClick={fetchKnowledgeBase}
              className="mt-2"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.length === 0 && !loading ? (
          <div className="col-span-full text-center py-12">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or category filter'
                : 'No articles available in the knowledge base'
              }
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Article
            </Button>
          </div>
        ) : (
          articles.map((article) => (
            <Card key={article._id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={getCategoryColor(
                    categories.find(cat => cat.name === article.category)?.color || 'blue'
                  )}>
                    {article.category}
                  </Badge>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{article.views}</span>
                    </div>
                    {article.helpfulPercentage > 0 && (
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{article.helpfulPercentage}%</span>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {truncateContent(article.content)}
                </p>

                {/* Tags */}
                {article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {article.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {article.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{article.tags.length - 3} more</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Updated {formatTime(article.updatedAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>By {article.author.name}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => markArticleHelpful(article._id, true)}
                      className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-xs"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Helpful</span>
                    </button>
                    <button
                      onClick={() => markArticleHelpful(article._id, false)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-xs"
                    >
                      <ThumbsDown className="w-3 h-3" />
                      <span>Not Helpful</span>
                    </button>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/support/knowledge-base/${article._id}`}>
                      Read More
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center justify-start p-4 h-auto bg-white"
              onClick={() => setShowCreateModal(true)}
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Plus className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Create Article</p>
                <p className="text-sm text-gray-500">Add new knowledge base article</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center justify-start p-4 h-auto bg-white"
              asChild
            >
              <Link href="/support/knowledge-base/categories">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <Tag className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Manage Categories</p>
                  <p className="text-sm text-gray-500">Organize article categories</p>
                </div>
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center justify-start p-4 h-auto bg-white"
              asChild
            >
              <Link href="/support/knowledge-base/analytics">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <HelpCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">View Analytics</p>
                  <p className="text-sm text-gray-500">Track article performance</p>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Article Modal */}
      <CreateArticleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchKnowledgeBase}
      />
    </div>
  )
}