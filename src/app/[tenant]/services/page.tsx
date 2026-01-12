'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import TemplateHeader from '@/components/layout/TemplateHeader'
import { ThemeColor, SchemeMode, Language, getThemeColors } from '@/components/layout/SettingsPanel'
import { Shirt, Sparkles, Award, Package, Clock, Truck, Phone, CheckCircle, ChevronDown } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import BookingModal from '@/components/BookingModal'
import { translations } from '@/lib/translations'
import BannerCarousel from '@/components/customer/BannerCarousel'

const services = [
  { id: 'wash-fold', name: 'Wash & Fold', icon: Shirt, description: 'Regular washing and folding', price: '₹25/item', features: ['Same day pickup', 'Eco-friendly'] },
  { id: 'dry-cleaning', name: 'Dry Cleaning', icon: Sparkles, description: 'Professional dry cleaning', price: '₹60/item', features: ['Expert care', 'Stain removal'] },
  { id: 'laundry', name: 'Laundry Service', icon: Package, description: 'Complete laundry service', price: '₹30/item', features: ['Full service', 'Quick turnaround'] },
  { id: 'shoe-cleaning', name: 'Shoe Cleaning', icon: Award, description: 'Professional shoe care', price: '₹80/pair', features: ['Deep cleaning', 'Polish'] },
  { id: 'express', name: 'Express Service', icon: Clock, description: 'Same-day delivery', price: '₹45/item', features: ['4-6 hour delivery', 'Priority'] }
]

export default function TenantServicesPage() {
  const params = useParams()
  const tenant = params.tenant as string
  const { isAuthenticated } = useAuthStore()
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [themeColor, setThemeColor] = useState<ThemeColor>('teal')
  const [scheme, setScheme] = useState<SchemeMode>('light')
  const [language, setLanguage] = useState<Language>('en')
  const router = useRouter()
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
      
      <div className="pt-20">
        <BannerCarousel page="SERVICES" />
      </div>
      
      <section className="relative h-[400px] overflow-hidden pt-8">
        <div className="max-w-screen-2xl mx-auto h-full relative">
          <div className="absolute inset-0 mx-0 lg:mx-8 rounded-none lg:rounded-2xl overflow-hidden">
            <video autoPlay loop muted playsInline className="w-full h-full object-cover"><source src="/images/pricing.mp4" type="video/mp4" /></video>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-900/40"></div>
          </div>
          <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="max-w-xl lg:ml-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('services.hero.title')}</h1>
              <p className="text-lg text-gray-200 mb-8">{t('services.hero.subtitle')}</p>
              <Button size="lg" className="bg-gray-800 hover:bg-gray-900 text-white" onClick={handleBookNow}><Truck className="w-5 h-5 mr-2" />{t('services.hero.schedulePickup')}</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16" style={{ backgroundColor: theme.pageBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: theme.textPrimary }}>{t('services.ourServices.title')}</h2>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {services.map((service, i) => (
              <div key={service.id} className="rounded-xl p-4 hover:shadow-lg transition-all" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: theme.accent }}><service.icon className="w-5 h-5 text-white" /></div>
                <h3 className="text-base font-semibold mb-1" style={{ color: theme.textPrimary }}>{service.name}</h3>
                <p className="text-sm mb-2" style={{ color: theme.textMuted }}>{service.description}</p>
                <p className="text-sm font-bold mb-3" style={{ color: theme.accent }}>{service.price}</p>
                <ul className="space-y-1 mb-3">{service.features.map((f, j) => <li key={j} className="flex items-center text-xs" style={{ color: theme.textSecondary }}><CheckCircle className="w-3 h-3 mr-1" style={{ color: theme.accent }} />{f}</li>)}</ul>
                <Button size="sm" className="w-full text-white" style={{ backgroundColor: theme.accent }} onClick={handleBookNow}>{t('nav.bookNow')}</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16" style={{ background: `linear-gradient(to right, ${theme.accent}, ${theme.accentSecondary})` }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t('services.cta.title')}</h2>
          <p className="text-white/80 mb-8">{t('services.cta.subtitle')}</p>
          <Button size="lg" className="bg-white hover:bg-gray-100" style={{ color: theme.accent }} onClick={handleBookNow}><Truck className="w-5 h-5 mr-2" />{t('services.cta.bookNow')}</Button>
        </div>
      </section>
    </div>
  )
}
