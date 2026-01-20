'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  MessageSquare,
  Target
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { api } from '@/lib/api'

interface PerformanceMetrics {
  ticketsResolved: number
  averageResponseTime: number
  customerSatisfaction: number
  activeTickets: number
  totalTickets: number
  resolutionRate: number
  responseTimeTarget: number
  satisfactionTarget: number
}

export default function SupportPerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    ticketsResolved: 0,
    averageResponseTime: 0,
    customerSatisfaction: 0,
    activeTickets: 0,
    totalTickets: 0,
    resolutionRate: 0,
    responseTimeTarget: 24,
    satisfactionTarget: 90
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    fetchPerformanceMetrics()
  }, [timeRange])

  const fetchPerformanceMetrics = async () => {
    try {
      const response = await api.get('/support/performance', {
        params: { timeRange }
      })
      
      if (response.data.success) {
        setMetrics(response.data.data || metrics)
      }
    } catch (error) {
      console.error('Error fetching performance metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceColor = (value: number, target: number, reverse = false) => {
    const percentage = reverse ? (target / value) * 100 : (value / target) * 100
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProgressColor = (value: number, target: number, reverse = false) => {
    const percentage = reverse ? (target / value) * 100 : (value / target) * 100
    if (percentage >= 90) return 'bg-green-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
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
          <h1 className="text-2xl font-bold text-gray-900">Performance Dashboard</h1>
          <p className="text-gray-600">Track your support performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tickets Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.ticketsResolved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                {metrics.resolutionRate.toFixed(1)}% resolution rate
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(metrics.averageResponseTime, metrics.responseTimeTarget, true)}`}>
                  {metrics.averageResponseTime.toFixed(1)}h
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Target: {metrics.responseTimeTarget}h
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Customer Satisfaction</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(metrics.customerSatisfaction, metrics.satisfactionTarget)}`}>
                  {metrics.customerSatisfaction.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Target: {metrics.satisfactionTarget}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeTickets}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-orange-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                {metrics.totalTickets} total tickets
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Response Time Goal</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Current: {metrics.averageResponseTime.toFixed(1)}h</span>
                  <span>Target: {metrics.responseTimeTarget}h</span>
                </div>
                <Progress 
                  value={Math.min((metrics.responseTimeTarget / metrics.averageResponseTime) * 100, 100)} 
                  className="h-2"
                />
              </div>
              <div className="text-sm text-gray-600">
                {metrics.averageResponseTime <= metrics.responseTimeTarget ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Meeting response time target</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Response time needs improvement</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Satisfaction Goal</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Current: {metrics.customerSatisfaction.toFixed(1)}%</span>
                  <span>Target: {metrics.satisfactionTarget}%</span>
                </div>
                <Progress 
                  value={Math.min((metrics.customerSatisfaction / metrics.satisfactionTarget) * 100, 100)} 
                  className="h-2"
                />
              </div>
              <div className="text-sm text-gray-600">
                {metrics.customerSatisfaction >= metrics.satisfactionTarget ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Meeting satisfaction target</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Satisfaction needs improvement</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Performance Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {metrics.resolutionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Resolution Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {metrics.ticketsResolved}
              </div>
              <div className="text-sm text-gray-600">Tickets Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {metrics.activeTickets}
              </div>
              <div className="text-sm text-gray-600">Active Tickets</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}