'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ShoppingBag, Clock, CheckCircle, Truck, Plus, MapPin, Calendar, ArrowRight, Package, Sparkles, User, HelpCircle, Star, Gift, ChevronRight, BarChart3, Wallet, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { useOrders } from '@/hooks/useOrders'
import BannerCarousel from '@/components/customer/BannerCarousel'
import BannerDisplay from '@/components/customer/BannerDisplay'

function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    if (start === value) return
    const timer = setInterval(() => { start += 1; setCount(start); if (start >= value) clearInterval(timer) }, Math.max(duration / value, 20))
    return () => clearInterval(timer)
  }, [value, duration])
  return <span>{count}</span>
}

function DonutChart({ data, size = 200 }: { data: { value: number; color: string; label: string }[]; size?: number }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [animationProgress, setAnimationProgress] = useState(0)
  const total = data.reduce((sum, item) => sum + item.value, 0)
  useEffect(() => { const t = setTimeout(() => setAnimationProgress(1), 100); return () => clearTimeout(t) }, [])

  if (total === 0) return <div className="flex flex-col items-center py-8"><div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-3"><Package className="w-12 h-12 text-gray-300" /></div><p className="text-gray-500">No data</p></div>

  const strokeWidth = 24, radius = (size - strokeWidth) / 2, circumference = 2 * Math.PI * radius
  let currentOffset = 0

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {hoveredIndex !== null && <div className="absolute inset-0 rounded-full blur-2xl opacity-40 transition-all duration-500" style={{ backgroundColor: data[hoveredIndex].color }} />}
        <svg width={size} height={size} className="transform -rotate-90 relative z-10">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
          {data.map((item, i) => {
            if (item.value === 0) return null
            const pct = item.value / total, animPct = pct * animationProgress
            const dasharray = `${animPct * circumference} ${circumference}`
            const dashoffset = -currentOffset * circumference * animationProgress
            const isHov = hoveredIndex === i
            currentOffset += pct
            return <circle key={i} cx={size/2} cy={size/2} r={radius} fill="none" stroke={item.color} strokeWidth={isHov ? strokeWidth + 10 : strokeWidth} strokeDasharray={dasharray} strokeDashoffset={dashoffset} strokeLinecap="round" className="transition-all duration-300 cursor-pointer" style={{ filter: isHov ? `drop-shadow(0 0 15px ${item.color})` : 'none', opacity: hoveredIndex !== null && !isHov ? 0.3 : 1 }} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} />
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <div className={`transition-all duration-300 text-center ${hoveredIndex !== null ? 'scale-110' : ''}`}>
            {hoveredIndex !== null ? (<><p className="text-5xl font-bold" style={{ color: data[hoveredIndex].color }}>{data[hoveredIndex].value}</p><p className="text-sm text-gray-600 font-semibold mt-1">{data[hoveredIndex].label}</p><p className="text-xs text-gray-400">{Math.round((data[hoveredIndex].value / total) * 100)}%</p></>) : (<><p className="text-5xl font-bold text-gray-800">{total}</p><p className="text-sm text-gray-500 mt-1">Total Orders</p></>)}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        {data.map((item, i) => item.value > 0 && (
          <div key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all duration-300 border-2 ${hoveredIndex === i ? 'scale-110 shadow-lg' : 'hover:scale-105'}`} style={{ borderColor: hoveredIndex === i ? item.color : 'transparent', backgroundColor: hoveredIndex === i ? `${item.color}15` : '#f8fafc' }}>
            <div className="w-3 h-3 rounded-full transition-all" style={{ backgroundColor: item.color, boxShadow: hoveredIndex === i ? `0 0 12px ${item.color}` : 'none', transform: hoveredIndex === i ? 'scale(1.5)' : 'scale(1)' }} />
            <span className="text-sm font-medium text-gray-700">{item.label}</span>
            <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}


function SpendingChart({ orders }: { orders: any[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [animationProgress, setAnimationProgress] = useState(0)
  useEffect(() => { const t = setTimeout(() => setAnimationProgress(1), 100); return () => clearTimeout(t) }, [])

  const monthlyData = useMemo(() => {
    const data: { month: string; amount: number; orders: number; fullMonth: string }[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthOrders = orders.filter(o => { const d = new Date(o.createdAt); return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear() })
      data.push({ month: date.toLocaleDateString('en-IN', { month: 'short' }), fullMonth: date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }), amount: monthOrders.reduce((s, o) => s + (o.totalAmount || o.pricing?.total || 0), 0), orders: monthOrders.length })
    }
    return data
  }, [orders])

  const maxAmount = Math.max(...monthlyData.map(d => d.amount), 100)
  const totalSpending = monthlyData.reduce((s, d) => s + d.amount, 0)
  const totalOrders = monthlyData.reduce((s, d) => s + d.orders, 0)
  const colors = ['#14b8a6', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-3 text-center border border-teal-100">
          <p className="text-2xl font-bold text-teal-600">₹{totalSpending.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Total Spent</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 text-center border border-blue-100">
          <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
          <p className="text-xs text-gray-500">Orders</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 text-center border border-purple-100">
          <p className="text-2xl font-bold text-purple-600">₹{totalOrders > 0 ? Math.round(totalSpending / totalOrders) : 0}</p>
          <p className="text-xs text-gray-500">Avg/Order</p>
        </div>
      </div>
      <div className="space-y-2">
        {monthlyData.map((item, i) => {
          const barWidth = Math.max((item.amount / maxAmount) * 100, item.amount > 0 ? 8 : 3) * animationProgress
          const isHov = hoveredIndex === i
          return (
            <div key={i} className={`relative group cursor-pointer transition-all duration-300 ${isHov ? 'scale-[1.02]' : ''}`} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} style={{ opacity: hoveredIndex !== null && !isHov ? 0.5 : 1 }}>
              {isHov && item.amount > 0 && (
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-20 bg-gray-900 text-white px-4 py-2 rounded-xl shadow-xl text-sm whitespace-nowrap">
                  <p className="font-semibold">{item.fullMonth}</p>
                  <p className="text-xs text-gray-300">₹{item.amount.toLocaleString()} • {item.orders} orders</p>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-8 border-transparent border-t-gray-900" />
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold w-10 transition-colors ${isHov ? 'text-teal-600' : 'text-gray-600'}`}>{item.month}</span>
                <div className="flex-1 h-9 bg-gray-100 rounded-lg overflow-hidden relative">
                  <div className="h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-3" style={{ width: `${barWidth}%`, background: `linear-gradient(90deg, ${colors[i]}, ${colors[(i+1)%6]})`, transitionDelay: `${i * 100}ms`, boxShadow: isHov ? `0 4px 15px ${colors[i]}50` : 'none' }}>
                    {barWidth > 25 && <span className="text-xs font-bold text-white drop-shadow">₹{item.amount.toLocaleString()}</span>}
                  </div>
                  {barWidth <= 25 && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-600">₹{item.amount}</span>}
                </div>
                <div className={`w-8 text-center transition-transform ${isHov ? 'scale-125' : ''}`}>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.orders > 0 ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-400'}`}>{item.orders}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


export default function CustomerDashboard() {
  const { user } = useAuthStore()
  const { orders, loading, fetchOrders } = useOrders()
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, pending: 0, cancelled: 0 })
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    fetchOrders()
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening')
  }, [])

  useEffect(() => {
    if (orders.length > 0) {
      const active = orders.filter(o => ['placed', 'picked', 'in_process', 'ready', 'out_for_delivery'].includes(o.status)).length
      setStats({ total: orders.length, active, completed: orders.filter(o => o.status === 'delivered').length, pending: orders.filter(o => o.status === 'placed').length, cancelled: orders.filter(o => o.status === 'cancelled').length })
    }
  }, [orders])

  const chartData = useMemo(() => [
    { value: stats.completed, color: '#10b981', label: 'Completed' },
    { value: stats.active, color: '#f59e0b', label: 'Active' },
    { value: stats.cancelled, color: '#ef4444', label: 'Cancelled' },
  ], [stats])

  const recentOrders = orders.slice(0, 5)
  const getStatusColor = (s: string) => {
    const colors: Record<string, string> = { delivered: 'bg-emerald-100 text-emerald-700', placed: 'bg-amber-100 text-amber-700', picked: 'bg-blue-100 text-blue-700', in_process: 'bg-blue-100 text-blue-700', ready: 'bg-purple-100 text-purple-700', out_for_delivery: 'bg-purple-100 text-purple-700', cancelled: 'bg-red-100 text-red-700' }
    return colors[s] || 'bg-gray-100 text-gray-700'
  }

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 pb-8">
      {/* Global Banners */}
      <BannerDisplay position="GLOBAL_STRIP_TOP" />
      <BannerDisplay position="GLOBAL_FLOATING_CORNER" />
      
      {/* Dashboard Hero Banner */}
      <BannerDisplay position="DASHBOARD_HERO_TOP" />
      
      <BannerCarousel page="DASHBOARD" />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{greeting}, {user?.name?.split(' ')[0] || 'there'}! 👋</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your laundry</p>
        </div>
        <Link href="/customer/orders/new"><Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg shadow-teal-500/30 font-semibold px-6"><Plus className="w-4 h-4 mr-2" />New Order</Button></Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, icon: ShoppingBag, gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/25' },
          { label: 'Active', value: stats.active, icon: Clock, gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/25' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25' },
          { label: 'Pending', value: stats.pending, icon: Truck, gradient: 'from-purple-500 to-pink-600', shadow: 'shadow-purple-500/25' },
        ].map((stat, i) => (
          <div key={i} className={`group relative overflow-hidden bg-gradient-to-br ${stat.gradient} rounded-2xl p-5 text-white shadow-xl ${stat.shadow} hover:scale-[1.02] transition-all`}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="w-11 h-11 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><stat.icon className="w-5 h-5" /></div>
              <p className="text-3xl font-bold"><AnimatedCounter value={stat.value} /></p>
              <p className="text-sm text-white/80 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {orders.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div><h3 className="font-bold text-gray-800">Order Distribution</h3><p className="text-sm text-gray-500">By status</p></div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"><BarChart3 className="w-5 h-5 text-white" /></div>
            </div>
            <DonutChart data={chartData} size={200} />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div><h3 className="font-bold text-gray-800">Monthly Spending</h3><p className="text-sm text-gray-500">Last 6 months</p></div>
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg"><TrendingUp className="w-5 h-5 text-white" /></div>
            </div>
            <SpendingChart orders={orders} />
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg"><Package className="w-5 h-5 text-white" /></div>
            <div><h2 className="font-bold text-gray-800">Recent Orders</h2><p className="text-sm text-gray-500">Your latest orders</p></div>
          </div>
          <Link href="/customer/orders" className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-xl transition-colors">View All <ArrowRight className="w-4 h-4" /></Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center"><ShoppingBag className="w-10 h-10 text-teal-500" /></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">Start your laundry journey with us!</p>
            <Link href="/customer/orders/new"><Button className="bg-gradient-to-r from-teal-500 to-cyan-500"><Sparkles className="w-4 h-4 mr-2" />Book First Order</Button></Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => (
              <Link key={order._id} href={`/customer/orders/${order._id}`}>
                <div className="group p-5 hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-cyan-50/30 cursor-pointer transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform"><Package className="w-6 h-6 text-teal-600" /></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-800">#{order.orderNumber}</span>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>{order.status.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        <span>{order.items?.length || 0} items</span>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-gray-800">₹{order.totalAmount || order.pricing?.total || 0}</p>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: '/customer/addresses', icon: MapPin, label: 'Addresses', desc: 'Manage locations', gradient: 'from-teal-500 to-cyan-500' },
          { href: '/customer/profile', icon: User, label: 'Profile', desc: 'Account settings', gradient: 'from-purple-500 to-violet-500' },
          { href: '/pricing', icon: Star, label: 'Pricing', desc: 'View rates', gradient: 'from-amber-500 to-orange-500' },
          { href: '/customer/support', icon: HelpCircle, label: 'Support', desc: 'Get help', gradient: 'from-blue-500 to-indigo-500' },
        ].map((item, i) => (
          <Link key={i} href={item.href}>
            <div className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}><item.icon className="w-6 h-6 text-white" /></div>
              <p className="font-semibold text-gray-800">{item.label}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 rounded-2xl p-6 shadow-xl">
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center"><Gift className="w-7 h-7 text-white" /></div>
              <div><h3 className="text-xl font-bold text-white">Get 20% OFF</h3><p className="text-white/80">On your first order! Use code: FIRST20</p></div>
            </div>
            <Link href="/customer/orders/new"><Button className="bg-white text-orange-600 hover:bg-orange-50 font-semibold shadow-lg">Claim Now <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
          </div>
        </div>
      )}
    </div>
  )
}
