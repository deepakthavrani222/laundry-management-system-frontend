'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Headphones,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  MessageCircle,
  Ticket,
  Phone,
  Mail,
  HelpCircle,
  ChevronDown,
  Package,
  Truck,
  CreditCard,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import Link from 'next/link'

interface TicketItem {
  _id: string
  ticketNumber: string
  title: string
  category: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  relatedOrder?: {
    orderNumber: string
    status: string
  }
}

const faqs = [
  {
    question: 'How long does laundry service take?',
    answer: 'Standard service takes 24-48 hours. Express service is available for same-day delivery with an additional charge.',
  },
  {
    question: 'What if my clothes are damaged?',
    answer: 'We take utmost care of your garments. In rare cases of damage, please raise a ticket immediately and we will compensate appropriately.',
  },
  {
    question: 'How can I track my order?',
    answer: 'You can track your order in real-time from the Orders section. You will also receive notifications at each stage.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit/debit cards, UPI, net banking, and cash on delivery.',
  },
  {
    question: 'Can I cancel my order?',
    answer: 'Yes, you can cancel your order before pickup. Once picked up, cancellation may not be possible.',
  },
]

export default function CustomerSupportPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<TicketItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  useEffect(() => {
    fetchTickets()
  }, [statusFilter])

  const fetchTickets = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      
      const response = await api.get(`/customer/tickets?${params}`)
      if (response.data.success) {
        setTickets(response.data.data.data || [])
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tickets')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4 text-amber-500" />
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'closed': return <CheckCircle className="w-4 h-4 text-gray-500" />
      default: return <Ticket className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-amber-700 bg-amber-100'
      case 'in_progress': return 'text-blue-700 bg-blue-100'
      case 'resolved': return 'text-green-700 bg-green-100'
      case 'closed': return 'text-gray-700 bg-gray-100'
      case 'escalated': return 'text-red-700 bg-red-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Headphones className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">How can we help you?</h1>
              <p className="text-teal-100">We're here to assist you with any questions or issues</p>
            </div>
          </div>
          <Link href="/customer/support/new">
            <Button className="bg-white text-teal-600 hover:bg-white/90 shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <Ticket className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{tickets.length}</p>
              <p className="text-xs text-gray-500">Total Tickets</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{openTickets}</p>
              <p className="text-xs text-gray-500">Open</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{resolvedTickets}</p>
              <p className="text-xs text-gray-500">Resolved</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">24h</p>
              <p className="text-xs text-gray-500">Avg Response</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Help Categories */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Help</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/customer/support/new?category=quality" className="group">
            <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-medium text-gray-800 text-sm">Quality Issue</h3>
              <p className="text-xs text-gray-500 mt-1">Report quality problems</p>
            </div>
          </Link>
          <Link href="/customer/support/new?category=delay" className="group">
            <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-100 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Truck className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-medium text-gray-800 text-sm">Delivery Delay</h3>
              <p className="text-xs text-gray-500 mt-1">Track delayed orders</p>
            </div>
          </Link>
          <Link href="/customer/support/new?category=missing_item" className="group">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-800 text-sm">Missing Item</h3>
              <p className="text-xs text-gray-500 mt-1">Report missing clothes</p>
            </div>
          </Link>
          <Link href="/customer/support/new?category=payment" className="group">
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-800 text-sm">Payment Issue</h3>
              <p className="text-xs text-gray-500 mt-1">Billing & refunds</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Your Tickets Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="font-semibold text-gray-800">Your Tickets</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {['', 'open', 'in_progress', 'resolved'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    statusFilter === status 
                      ? 'bg-white text-teal-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {status === '' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
            <Button onClick={fetchTickets} variant="ghost" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading tickets...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchTickets} variant="outline">Retry</Button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-800 mb-2">No tickets yet</h3>
            <p className="text-gray-500 text-sm mb-4">Create a ticket if you need help with anything</p>
            <Link href="/customer/support/new">
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Ticket
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {tickets.map((ticket) => (
              <Link
                key={ticket._id}
                href={`/customer/support/${ticket._id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center">
                      {getStatusIcon(ticket.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{ticket.ticketNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">{ticket.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{formatCategory(ticket.category)}</span>
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs text-gray-400">{formatDate(ticket.createdAt)}</span>
                        {ticket.relatedOrder && (
                          <>
                            <span className="text-xs text-gray-300">•</span>
                            <span className="text-xs text-teal-600">Order: {ticket.relatedOrder.orderNumber}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
            <p className="text-sm text-gray-500">Quick answers to common questions</p>
          </div>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-800">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`} />
              </button>
              {expandedFaq === index && (
                <div className="px-4 pb-4">
                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <Phone className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Call Us</h3>
              <p className="text-teal-600 font-medium">+91 1800-123-4567</p>
              <p className="text-xs text-gray-500 mt-1">Mon-Sat, 9 AM - 8 PM</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Email Us</h3>
              <p className="text-blue-600 font-medium">support@LaundryLobby.com</p>
              <p className="text-xs text-gray-500 mt-1">We reply within 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
