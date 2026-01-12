'use client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
import { Button } from '@/components/ui/button'
import { Truck, ChevronDown, Loader2, Phone } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import TemplateHeader from '@/components/layout/TemplateHeader'
import { ThemeColor, SchemeMode, Language, getThemeColors } from '@/components/layout/SettingsPanel'
import { translations } from '@/lib/translations'
import BookingModal from '@/components/BookingModal'

interface PriceItem { _id: string; garment: string; dryClean: number; steamPress: number; washFold: number; washIron: number }

function PricingTable({ theme, t }: { theme: ReturnType<typeof getThemeColors>; t: (key: string) => string }) {
  const [activeCategory, setActiveCategory] = useState('men')
  const [pricingData, setPricingData] = useState<Record<string, PriceItem[]>>({})
  const [loading, setLoading] = useState(true)
  const categories = [{ id: 'men', label: t('pricing.categories.men') }, { id: 'women', label: t('pricing.categories.women') }, { id: 'kids', label: t('pricing.categories.kids') }, { id: 'household', label: t('pricing.categories.household') }]

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch(`${API_URL}/service-items`)
        const data = await res.json()
        if (data.success && data.items) {
          const grouped: Record<string, Record<string, PriceItem>> = {}
          data.items.forEach((item: any) => {
            const cat = item.category
            if (!grouped[cat]) grouped[cat] = {}
            if (!grouped[cat][item.name]) grouped[cat][item.name] = { _id: item._id, garment: item.name, dryClean: 0, steamPress: 0, washFold: 0, washIron: 0 }
            if (item.service?.includes('dry_clean')) grouped[cat][item.name].dryClean = item.basePrice
            else if (item.service?.includes('steam_press')) grouped[cat][item.name].steamPress = item.basePrice
            else if (item.service === 'wash_fold') grouped[cat][item.name].washFold = item.basePrice
            else if (item.service === 'wash_iron') grouped[cat][item.name].washIron = item.basePrice
          })
          const result: Record<string, PriceItem[]> = {}
          Object.keys(grouped).forEach(cat => result[cat] = Object.values(grouped[cat]))
          setPricingData(result)
        }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchPrices()
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.accent }} /></div>

  const currentData = pricingData[activeCategory] || []
  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.id ? 'text-white' : ''}`} style={activeCategory === cat.id ? { backgroundColor: theme.accent } : { backgroundColor: theme.cardBg, color: theme.textSecondary }}>{cat.label}</button>
        ))}
      </div>
      {currentData.length === 0 ? (
        <p className="text-center py-8" style={{ color: theme.textMuted }}>No pricing data available</p>
      ) : (
        <div className="overflow-x-auto rounded-xl" style={{ backgroundColor: theme.cardBg }}>
          <table className="w-full">
            <thead><tr style={{ backgroundColor: theme.accent }}><th className="px-4 py-3 text-left text-white">Item</th><th className="px-4 py-3 text-center text-white">Dry Clean</th><th className="px-4 py-3 text-center text-white">Steam Press</th><th className="px-4 py-3 text-center text-white">Wash & Fold</th><th className="px-4 py-3 text-center text-white">Wash & Iron</th></tr></thead>
            <tbody>{currentData.map((item, i) => (
              <tr key={item._id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                <td className="px-4 py-3 font-medium" style={{ color: theme.textPrimary }}>{item.garment}</td>
                <td className="px-4 py-3 text-center" style={{ color: theme.textSecondary }}>{item.dryClean ? `₹${item.dryClean}` : '-'}</td>
                <td className="px-4 py-3 text-center" style={{ color: theme.textSecondary }}>{item.steamPress ? `₹${item.steamPress}` : '-'}</td>
                <td className="px-4 py-3 text-center" style={{ color: theme.textSecondary }}>{item.washFold ? `₹${item.washFold}` : '-'}</td>
                <td className="px-4 py-3 text-center" style={{ color: theme.textSecondary }}>{item.washIron ? `₹${item.washIron}` : '-'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function TenantPricingPage() {
  const params = useParams()
  const tenant = params.tenant as string
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [themeColor, setThemeColor] = useState<ThemeColor>('teal')
  const [scheme, setScheme] = useState<SchemeMode>('light')
  const [language, setLanguage] = useState<Language>('en')
  const theme = getThemeColors(themeColor, scheme)
  const t = (key: string) => translations[language]?.[key] || translations['en'][key] || key

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const c = localStorage.getItem('landing_color') as ThemeColor
      const s = localStorage.getItem('landing_scheme') as SchemeMode
      const l = localStorage.getItem('landing_language') as Language
      if (c) setThemeColor(c)
      if (s) setScheme(s)
      if (l) setLanguage(l)
    }
  }, [])

  useEffect(() => {
    const h = (e: CustomEvent<{ scheme: string }>) => setScheme(e.detail.scheme as SchemeMode)
    window.addEventListener('schemeChange', h as EventListener)
    return () => window.removeEventListener('schemeChange', h as EventListener)
  }, [])

  const handleBookNow = () => {
    if (!isAuthenticated) { router.push(`/${tenant}?openBooking=true`); return }
    setShowBookingModal(true)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.pageBg }}>
      <TemplateHeader />
      <BookingModal isOpen={showBookingModal} onClose={() => setShowBookingModal(false)} onLoginRequired={() => router.push(`/${tenant}`)} />
      
      <section className="relative h-[400px] overflow-hidden pt-28">
        <div className="max-w-screen-2xl mx-auto h-full relative">
          <div className="absolute inset-0 mx-0 lg:mx-8 rounded-none lg:rounded-2xl overflow-hidden">
            <video autoPlay loop muted playsInline className="w-full h-full object-cover"><source src="/images/pricing.mp4" type="video/mp4" /></video>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-900/40"></div>
          </div>
          <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="max-w-xl lg:ml-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('pricing.hero.title')}</h1>
              <p className="text-lg text-gray-200 mb-8">{t('pricing.hero.subtitle')}</p>
              <Button size="lg" className="bg-gray-800 hover:bg-gray-900 text-white" onClick={handleBookNow}><Truck className="w-5 h-5 mr-2" />{t('pricing.hero.schedulePickup')}</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16" style={{ backgroundColor: theme.pageBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: theme.textPrimary }}>{t('pricing.table.title')}</h2>
            <p style={{ color: theme.textSecondary }}>{t('pricing.table.subtitle')}</p>
          </div>
          <PricingTable theme={theme} t={t} />
        </div>
      </section>

      <section className="py-16" style={{ background: `linear-gradient(to right, ${theme.accent}, ${theme.accentSecondary})` }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t('pricing.cta.title')}</h2>
          <p className="text-white/80 mb-8">{t('pricing.cta.subtitle')}</p>
          <Button size="lg" className="bg-white hover:bg-gray-100" style={{ color: theme.accent }} onClick={handleBookNow}><Truck className="w-5 h-5 mr-2" />{t('pricing.cta.bookNow')}</Button>
        </div>
      </section>
    </div>
  )
}
