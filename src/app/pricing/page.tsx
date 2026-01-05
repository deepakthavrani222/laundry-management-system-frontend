'use client'


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Truck,
  ChevronDown,
  ChevronUp,
  Loader2,
  Phone
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useState, useEffect } from 'react'
import TemplateHeader from '@/components/layout/TemplateHeader'
import { ThemeColor, SchemeMode, Language, getThemeColors } from '@/components/layout/SettingsPanel'
import { useLanguage } from '@/hooks/useLanguage'

interface ServiceItem {
  id: string
  name: string
  basePrice: number
  category: string
  description: string
}

interface PriceItem {
  _id: string
  garment: string
  dryClean: number
  steamPress: number
  starch: number
  washFold: number
  washIron: number
  premiumLaundry: number
}

// FAQ Component
function FAQItem({ question, answer, isOpen, onToggle, accentColor }: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  accentColor: string
}) {
  return (
    <div className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-8 py-5 text-left flex items-center justify-between transition-colors duration-200"
        style={{ backgroundColor: isOpen ? accentColor : '#334155' }}
      >
        <h4 className="text-base font-medium text-white pr-4">{question}</h4>
        <div className="flex-shrink-0">
          <ChevronDown className={`w-5 h-5 text-white transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-8 py-6 bg-white border-x border-b border-gray-200">
          <p className="text-gray-600 text-base leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  )
}

// Pricing Table Component with Category Tabs
function PricingTable({ isAuthenticated, theme, t }: { isAuthenticated: boolean; theme: ReturnType<typeof getThemeColors>; t: (key: string) => string }) {
  const [activeCategory, setActiveCategory] = useState('men')
  const [pricingData, setPricingData] = useState<Record<string, PriceItem[]>>({})
  const [loading, setLoading] = useState(true)

  const categories = [
    { id: 'men', label: t('pricing.categories.men') },
    { id: 'women', label: t('pricing.categories.women') },
    { id: 'kids', label: t('pricing.categories.kids') },
    { id: 'household', label: t('pricing.categories.household') },
    { id: 'institutional', label: t('pricing.categories.institutional') },
    { id: 'others', label: t('pricing.categories.others') },
  ]

  useEffect(() => {
    fetchPrices()
  }, [])

  const fetchPrices = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/service-items`)
      const data = await response.json()
      console.log('Service items data:', data)
      if (data.success && data.items) {
        // Group items by category and aggregate prices by service
        const grouped: Record<string, Record<string, PriceItem>> = {}
        
        data.items.forEach((item: any) => {
          const cat = item.category
          if (!grouped[cat]) grouped[cat] = {}
          
          const itemName = item.name
          if (!grouped[cat][itemName]) {
            grouped[cat][itemName] = {
              _id: item._id,
              garment: itemName,
              dryClean: 0,
              steamPress: 0,
              starch: 0,
              washFold: 0,
              washIron: 0,
              premiumLaundry: 0
            }
          }
          
          // Set price based on service type
          if (item.service === 'dry_clean' || item.service === 'premium_dry_clean') {
            grouped[cat][itemName].dryClean = item.basePrice
          } else if (item.service === 'steam_press' || item.service === 'premium_steam_press') {
            grouped[cat][itemName].steamPress = item.basePrice
          } else if (item.service === 'starching') {
            grouped[cat][itemName].starch = item.basePrice
          } else if (item.service === 'wash_fold') {
            grouped[cat][itemName].washFold = item.basePrice
          } else if (item.service === 'wash_iron') {
            grouped[cat][itemName].washIron = item.basePrice
          } else if (item.service === 'premium_laundry') {
            grouped[cat][itemName].premiumLaundry = item.basePrice
          }
        })
        
        // Convert to array format
        const result: Record<string, PriceItem[]> = {}
        Object.keys(grouped).forEach(cat => {
          result[cat] = Object.values(grouped[cat])
        })
        
        setPricingData(result)
      }
    } catch (error) {
      console.error('Error fetching prices:', error)
      setPricingData({})
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.accent }} />
      </div>
    )
  }

  return (
    <div className="mb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-4" style={{ color: theme.textPrimary }}>{t('pricing.table.title')}</h2>
        <p className="max-w-2xl mx-auto" style={{ color: theme.textSecondary }}>
          {t('pricing.table.subtitle')}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Category Tabs - Left Side */}
        <div className="lg:w-48 flex-shrink-0">
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className="px-6 py-3 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200"
                style={{
                  backgroundColor: activeCategory === category.id ? theme.accent : theme.sectionBg,
                  color: activeCategory === category.id ? '#ffffff' : theme.textSecondary,
                }}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Table - Right Side */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full border-collapse" style={{ backgroundColor: theme.cardBg }}>
            <thead>
              <tr style={{ backgroundColor: theme.sectionBg }}>
                <th className="text-left py-4 px-6 font-semibold border-b" style={{ color: theme.textPrimary, borderColor: theme.border }}>{t('pricing.table.garment')}</th>
                <th className="text-center py-4 px-4 font-semibold border-b" style={{ color: theme.textPrimary, borderColor: theme.border }}>{t('pricing.table.washFold')}</th>
                <th className="text-center py-4 px-4 font-semibold border-b" style={{ color: theme.textPrimary, borderColor: theme.border }}>{t('pricing.table.washIron')}</th>
                <th className="text-center py-4 px-4 font-semibold border-b" style={{ color: theme.textPrimary, borderColor: theme.border }}>{t('pricing.table.dryClean')}</th>
                <th className="text-center py-4 px-4 font-semibold border-b" style={{ color: theme.textPrimary, borderColor: theme.border }}>{t('pricing.table.steamPress')}</th>
              </tr>
            </thead>
            <tbody>
              {pricingData[activeCategory]?.length > 0 ? (
                pricingData[activeCategory].map((item, index) => (
                  <tr 
                    key={item._id || index} 
                    className="border-b hover:opacity-80 transition-colors"
                    style={{ 
                      backgroundColor: index % 2 === 0 ? theme.cardBg : theme.sectionBg,
                      borderColor: theme.border
                    }}
                  >
                    <td className="py-4 px-6" style={{ color: theme.textPrimary }}>{item.garment}</td>
                    <td className="py-4 px-4 text-center" style={{ color: theme.textSecondary }}>{item.washFold > 0 ? `₹${item.washFold}` : '-'}</td>
                    <td className="py-4 px-4 text-center" style={{ color: theme.textSecondary }}>{item.washIron > 0 ? `₹${item.washIron}` : '-'}</td>
                    <td className="py-4 px-4 text-center" style={{ color: theme.textSecondary }}>{item.dryClean > 0 ? `₹${item.dryClean}` : '-'}</td>
                    <td className="py-4 px-4 text-center" style={{ color: theme.textSecondary }}>{item.steamPress > 0 ? `₹${item.steamPress}` : '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center" style={{ color: theme.textMuted }}>
                    {t('pricing.table.noItems')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Now Button */}
      <div className="text-center mt-8">
        <Link href={isAuthenticated ? "/customer/orders/new" : "/auth/register"}>
          <Button size="lg" className="text-white px-8 hover:opacity-90" style={{ backgroundColor: theme.accent }}>
            <Truck className="w-5 h-5 mr-2" />
            {t('pricing.table.bookNow')}
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function PricingPage() {
  const { isAuthenticated } = useAuthStore()
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [themeColor, setThemeColor] = useState<ThemeColor>('teal')
  const [scheme, setScheme] = useState<SchemeMode>('light')
  
  // Use language hook for reactive translations
  const { language, t } = useLanguage()

  // Get computed theme colors based on scheme
  const theme = getThemeColors(themeColor, scheme)

  // Load theme color and scheme from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedColor = localStorage.getItem('landing_color') as ThemeColor
      const savedScheme = localStorage.getItem('landing_scheme') as SchemeMode
      if (savedColor && ['teal', 'blue', 'purple', 'orange'].includes(savedColor)) {
        setThemeColor(savedColor)
      }
      if (savedScheme && ['light', 'dark', 'auto'].includes(savedScheme)) {
        setScheme(savedScheme)
      }
    }
  }, [])

  // Listen for scheme changes from TemplateHeader dark mode toggle
  useEffect(() => {
    const handleSchemeChangeEvent = (e: CustomEvent<{ scheme: string }>) => {
      const newScheme = e.detail.scheme as SchemeMode
      if (['light', 'dark', 'auto'].includes(newScheme)) {
        setScheme(newScheme)
      }
    }
    window.addEventListener('schemeChange', handleSchemeChangeEvent as EventListener)
    return () => window.removeEventListener('schemeChange', handleSchemeChangeEvent as EventListener)
  }, [])

  // Handle color change
  const handleColorChange = (color: ThemeColor) => {
    setThemeColor(color)
    localStorage.setItem('landing_color', color)
    window.dispatchEvent(new CustomEvent('themeColorChange', { detail: { color } }))
  }

  // Handle scheme change
  const handleSchemeChange = (newScheme: SchemeMode) => {
    setScheme(newScheme)
    localStorage.setItem('landing_scheme', newScheme)
  }

  // Handle language change
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('landing_language', lang)
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: lang } }))
  }

  const faqData = [
    {
      question: "Do you charge for pickup and delivery?",
      answer: "No, pickup and delivery are completely free for all orders above ₹200. For orders below ₹200, a nominal charge of ₹30 applies."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept Cash on Delivery (COD), UPI payments, credit/debit cards, and digital wallets like Paytm, PhonePe, and Google Pay."
    },
    {
      question: "Is there a minimum order value?",
      answer: "No minimum order value required! Orders above ₹200 qualify for free pickup and delivery."
    },
    {
      question: "Do you offer same-day service?",
      answer: "Yes! Our Express Service provides same-day pickup and delivery. An additional express charge applies."
    },
    {
      question: "What if I'm not satisfied with the service?",
      answer: "We offer a 100% satisfaction guarantee. If not satisfied, we'll redo your order for free or provide a full refund."
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  // Calculate top padding based on template
  const topPadding = 'pt-28'

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.pageBg }}>
      <TemplateHeader />

      {/* Hero Section */}
      <section className={`relative py-16 overflow-hidden ${topPadding}`}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/images/pricing.mp4" type="video/mp4" />
        </video>
        
        <div className="absolute inset-0 bg-gray-900/70"></div>
        
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('pricing.hero.title')}
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            {t('pricing.hero.subtitle')}
          </p>
          <Link href="https://wa.me/919876543210" target="_blank">
            <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white">
              {t('pricing.hero.whatsapp')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Pricing Table Section */}
      <section className="py-16 container mx-auto px-4">
        <PricingTable isAuthenticated={isAuthenticated} theme={theme} t={t} />
        
        {/* Disclaimer */}
        <p className="text-center text-lg font-medium mt-8" style={{ color: theme.textSecondary }}>
          {t('pricing.disclaimer')}
        </p>
      </section>

      {/* FAQ Section */}
      <section className="py-16 transition-colors duration-300" style={{ backgroundColor: theme.sectionBg }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: theme.textPrimary }}>{t('pricing.faq.title')}</h2>
            <p className="max-w-2xl mx-auto" style={{ color: theme.textSecondary }}>
              {t('pricing.faq.subtitle')}
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-2">
            {faqData.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === index}
                onToggle={() => toggleFAQ(index)}
                accentColor={theme.accent}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-16 transition-colors duration-300"
        style={{ background: `linear-gradient(to right, ${theme.accent}, ${theme.accentSecondary})` }}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t('pricing.cta.title')}</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            {t('pricing.cta.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {isAuthenticated ? (
              <Link href="/customer/orders/new">
                <Button size="lg" className="bg-white hover:bg-gray-100" style={{ color: theme.accent }}>
                  <Truck className="w-5 h-5 mr-2" />
                  {t('pricing.cta.bookNow')}
                </Button>
              </Link>
            ) : (
              <Link href="/auth/login?redirect=/customer/orders/new">
                <Button size="lg" className="bg-white hover:bg-gray-100" style={{ color: theme.accent }}>
                  <Truck className="w-5 h-5 mr-2" />
                  {t('pricing.cta.getStarted')}
                </Button>
              </Link>
            )}
            <Link href="tel:+919876543210">
              <Button size="lg" className="bg-white/20 border-2 border-white text-white hover:bg-white/30">
                <Phone className="w-5 h-5 mr-2" />
                {t('pricing.cta.callUs')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
