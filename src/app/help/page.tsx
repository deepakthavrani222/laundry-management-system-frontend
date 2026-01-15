'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Sparkles, 
  Phone, 
  Mail, 
  MessageCircle,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Truck,
  CreditCard,
  Shield,
  Star,
  FileText,
  AlertCircle,
  CheckCircle,
  Package,
  RefreshCw,
  Users,
  Headphones,
  Search,
  ArrowRight,
  Ticket,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useState, useEffect } from 'react'
import TemplateHeader from '@/components/layout/TemplateHeader'
import { ThemeColor, SchemeMode, Language, getThemeColors } from '@/components/layout/SettingsPanel'
import { useLanguage } from '@/hooks/useLanguage'

function FAQItem({ question, answer, isOpen, onToggle, primaryColor, isDark }: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  primaryColor: string
  isDark?: boolean
}) {
  return (
    <div className={`overflow-hidden rounded-xl border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <button
        onClick={onToggle}
        className={`w-full px-8 py-5 text-left flex items-center justify-between transition-colors duration-200`}
        style={{ 
          backgroundColor: isOpen 
            ? isDark ? primaryColor : '#f3f4f6'
            : isDark 
              ? '#1f2937' 
              : '#f3f4f6'
        }}
      >
        <h4 className={`text-base font-medium pr-4 ${
          isOpen 
            ? isDark ? 'text-white' : 'text-gray-800'
            : isDark 
              ? 'text-white' 
              : 'text-gray-800'
        }`}>{question}</h4>
        <div className="flex-shrink-0">
          <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${
            isOpen 
              ? isDark ? 'text-white' : 'text-gray-600'
              : isDark 
                ? 'text-white' 
                : 'text-gray-600'
          } ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className={`px-8 py-6 border-x border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{answer}</p>
        </div>
      </div>
    </div>
  )
}

export default function HelpPage() {
  const { isAuthenticated, user } = useAuthStore()
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState('general')
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


  const faqCategories = {
    general: [
      {
        question: "How does LaundryLobby work?",
        answer: "LaundryLobby makes laundry simple! Just place an order online, schedule a pickup time, and our team will collect your clothes from your doorstep. We clean them professionally and deliver them back fresh and folded within 24-48 hours."
      },
      {
        question: "What areas do you serve?",
        answer: "We currently serve 5+ major cities across India including Delhi NCR, Mumbai, Bangalore, Hyderabad, and Chennai. We're constantly expanding to new areas. Check our service availability by entering your pincode on the homepage."
      },
      {
        question: "What are your operating hours?",
        answer: "Our pickup and delivery services operate from 8 AM to 9 PM, 7 days a week. Customer support is available 24/7 via phone, email, and WhatsApp."
      },
      {
        question: "How do I track my order?",
        answer: "Once your order is placed, you'll receive SMS and email updates at every stage. You can also track your order in real-time through your customer dashboard or by calling our support team."
      }
    ],
    orders: [
      {
        question: "How do I place an order?",
        answer: "You can place an order through our website or mobile app. Simply select your service type, add items, choose pickup/delivery times, and confirm. It takes less than 2 minutes!"
      },
      {
        question: "Can I modify or cancel my order?",
        answer: "Yes! You can modify or cancel your order up to 2 hours before the scheduled pickup time. Go to 'My Orders' in your dashboard and select the order you want to change."
      },
      {
        question: "What is the minimum order value?",
        answer: "There's no minimum order value! You can place orders for even a single item. However, orders above ₹200 qualify for free pickup and delivery."
      },
      {
        question: "Do you offer same-day service?",
        answer: "Yes! Our Express Service provides same-day pickup and delivery for urgent needs. An additional express charge of ₹50 applies. Orders must be placed before 2 PM for same-day delivery."
      }
    ],
    payment: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept Cash on Delivery (COD), UPI payments, credit/debit cards (Visa, Mastercard, RuPay), and digital wallets like Paytm, PhonePe, and Google Pay."
      },
      {
        question: "Is online payment secure?",
        answer: "Absolutely! We use industry-standard SSL encryption and partner with trusted payment gateways like Razorpay to ensure your payment information is always secure."
      },
      {
        question: "Do you offer any discounts?",
        answer: "Yes! We offer bulk order discounts: 5% off on orders above ₹500, 10% off above ₹1000, and 15% off above ₹2000. Discounts are applied automatically at checkout."
      },
      {
        question: "Can I get a refund?",
        answer: "If you're not satisfied with our service, we'll redo your order for free. If you're still not happy, we provide a full refund within 7 business days. Contact our support team to initiate a refund."
      }
    ],
    services: [
      {
        question: "What services do you offer?",
        answer: "We offer Wash & Fold, Dry Cleaning, Ironing, Steam Press, Starching, and Premium services for delicate fabrics. Each service is handled by trained professionals using quality products."
      },
      {
        question: "How do you handle delicate fabrics?",
        answer: "Our dry cleaning service specializes in delicate fabrics like silk, wool, cashmere, and designer garments. We use eco-friendly solvents and have trained professionals who understand fabric care requirements."
      },
      {
        question: "Do you provide stain removal?",
        answer: "Yes! Stain removal is included in our dry cleaning service. For tough stains, our experts use specialized treatments. Please inform us about any specific stains when placing your order."
      },
      {
        question: "What if my clothes get damaged?",
        answer: "While rare, if any item gets damaged during our process, we provide full compensation based on the item's declared value. We also have comprehensive insurance coverage for all orders."
      }
    ]
  }

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  const currentFAQs = faqCategories[activeCategory as keyof typeof faqCategories]

  const quickHelpCards = [
    {
      icon: Package,
      title: t('help.quickHelp.trackOrder'),
      description: t('help.quickHelp.trackOrderDesc'),
      link: isAuthenticated ? "/customer/orders" : "/auth/login",
    },
    {
      icon: Ticket,
      title: t('help.quickHelp.raiseTicket'),
      description: t('help.quickHelp.raiseTicketDesc'),
      link: isAuthenticated ? "/customer/support/new" : "/auth/login",
    },
    {
      icon: RefreshCw,
      title: t('help.quickHelp.requestRefund'),
      description: t('help.quickHelp.requestRefundDesc'),
      link: isAuthenticated ? "/customer/support/new?category=payment" : "/auth/login",
    },
    {
      icon: Headphones,
      title: t('help.quickHelp.liveSupport'),
      description: t('help.quickHelp.liveSupportDesc'),
      link: isAuthenticated ? "/customer/support" : "/auth/login",
    }
  ]

  const categoryTabs = [
    { id: 'general', label: t('help.faq.general'), icon: HelpCircle },
    { id: 'orders', label: t('help.faq.orders'), icon: Package },
    { id: 'payment', label: t('help.faq.payment'), icon: CreditCard },
    { id: 'services', label: t('help.faq.services'), icon: Sparkles }
  ]

  // Calculate top padding based on template
  const topPadding = 'pt-8'

  // Dark mode classes
  const isDark = scheme === 'dark'
  const bgClass = isDark ? 'bg-gray-900' : 'bg-gradient-to-b from-gray-50 to-white'
  const textClass = isDark ? 'text-gray-100' : 'text-gray-800'
  const textMutedClass = isDark ? 'text-gray-400' : 'text-gray-600'
  const cardBgClass = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
  const sectionBgClass = isDark ? 'bg-gray-800' : 'bg-gray-50'

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <TemplateHeader />
      
      {/* Hero Section */}
      <section className={`relative ${topPadding} pb-20 overflow-hidden min-h-[400px]`}>
        <div className="max-w-screen-2xl mx-auto relative h-full">
          {/* Background Image - Contained */}
          <div 
            className="absolute inset-0 mx-0 lg:mx-8 rounded-none lg:rounded-2xl overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=1920&q=80')" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent"></div>
          </div>
          
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-xl pt-8 lg:ml-8">
              <div 
                className="inline-flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-4"
                style={{ backgroundColor: `${theme.primaryHex}33`, color: theme.primaryHex }}
              >
                <Headphones className="w-4 h-4" />
                <span>{t('help.hero.badge')}</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {t('help.hero.title')}
              </h1>
              
              <p className="text-lg text-gray-300 mb-6">
                {t('help.hero.subtitle')}
              </p>

              {/* Quick Stats */}
              <div className="flex gap-8 mt-6">
                <div>
                  <div className="text-2xl font-bold text-white">50K+</div>
                  <div className="text-gray-400 text-sm">{t('help.stats.customers')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-gray-400 text-sm">{t('help.stats.support')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">98%</div>
                  <div className="text-gray-400 text-sm">{t('help.stats.resolution')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Help Cards */}
      <section className={`py-16 relative z-20 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {quickHelpCards.map((card, index) => (
              <Link key={index} href={card.link}>
                <div className={`rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border group cursor-pointer h-full flex flex-col ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div 
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
                      isDark ? 'shadow-lg' : 'shadow-md'
                    }`}
                    style={isDark ? { 
                      background: `linear-gradient(135deg, ${theme.primaryHex}, ${theme.secondaryHex})`,
                      boxShadow: `0 4px 14px ${theme.primaryHex}40`
                    } : {
                      backgroundColor: theme.light,
                      border: `2px solid ${theme.primaryHex}`
                    }}
                  >
                    <card.icon 
                      className={`w-7 h-7 ${isDark ? 'text-white' : ''}`}
                      strokeWidth={2.5}
                      style={!isDark ? { color: theme.primaryHex } : {}}
                    />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{card.title}</h3>
                  <p className={`text-sm mb-3 flex-grow ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{card.description}</p>
                  <div 
                    className="flex items-center text-sm font-medium group-hover:gap-2 transition-all"
                    style={{ color: theme.primaryHex }}
                  >
                    <span>{t('help.quickHelp.getStarted')}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={`py-20 ${isDark ? 'bg-gray-900' : ''}`}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-2xl">
          <div className="text-center mb-12">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
              style={{ backgroundColor: isDark ? `${theme.primaryHex}33` : theme.light, color: theme.primaryHex }}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t('help.contact.badge')}</span>
            </div>
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textClass}`}>
              {t('help.contact.title')}
            </h2>
            <p className={`max-w-2xl mx-auto ${textMutedClass}`}>
              {t('help.contact.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Phone */}
            <div 
              className={`rounded-2xl p-8 text-center border hover:shadow-lg transition-all ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              style={{ background: isDark ? `linear-gradient(to bottom right, ${theme.primaryHex}22, transparent)` : `linear-gradient(to bottom right, ${theme.light}, white)` }}
            >
              <div 
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${isDark ? 'shadow-lg' : 'shadow-md'}`}
                style={isDark ? { 
                  background: `linear-gradient(135deg, ${theme.primaryHex}, ${theme.secondaryHex})`,
                  boxShadow: `0 4px 14px ${theme.primaryHex}40`
                } : {
                  backgroundColor: theme.light,
                  border: `2px solid ${theme.primaryHex}`
                }}
              >
                <Phone 
                  className={`w-8 h-8 ${isDark ? 'text-white' : ''}`}
                  strokeWidth={2}
                  style={!isDark ? { color: theme.primaryHex } : {}}
                />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${textClass}`}>{t('help.contact.callUs')}</h3>
              <p className={`mb-4 ${textMutedClass}`}>{t('help.contact.callUsDesc')}</p>
              <a href="tel:+911234567890" className="font-semibold text-lg hover:opacity-80" style={{ color: theme.primaryHex }}>
                +91 123 456 7890
              </a>
            </div>

            {/* Email */}
            <div 
              className={`rounded-2xl p-8 text-center border hover:shadow-lg transition-all ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              style={{ background: isDark ? `linear-gradient(to bottom right, ${theme.primaryHex}22, transparent)` : `linear-gradient(to bottom right, ${theme.light}, white)` }}
            >
              <div 
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${isDark ? 'shadow-lg' : 'shadow-md'}`}
                style={isDark ? { 
                  background: `linear-gradient(135deg, ${theme.primaryHex}, ${theme.secondaryHex})`,
                  boxShadow: `0 4px 14px ${theme.primaryHex}40`
                } : {
                  backgroundColor: theme.light,
                  border: `2px solid ${theme.primaryHex}`
                }}
              >
                <Mail 
                  className={`w-8 h-8 ${isDark ? 'text-white' : ''}`}
                  strokeWidth={2}
                  style={!isDark ? { color: theme.primaryHex } : {}}
                />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${textClass}`}>{t('help.contact.emailUs')}</h3>
              <p className={`mb-4 ${textMutedClass}`}>{t('help.contact.emailUsDesc')}</p>
              <a href="mailto:support@LaundryLobby.com" className="font-semibold text-lg hover:opacity-80" style={{ color: theme.primaryHex }}>
                support@LaundryLobby.com
              </a>
            </div>

            {/* WhatsApp */}
            <div 
              className={`rounded-2xl p-8 text-center border hover:shadow-lg transition-all ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              style={{ background: isDark ? `linear-gradient(to bottom right, ${theme.primaryHex}22, transparent)` : `linear-gradient(to bottom right, ${theme.light}, white)` }}
            >
              <div 
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${isDark ? 'shadow-lg' : 'shadow-md'}`}
                style={isDark ? { 
                  background: `linear-gradient(135deg, ${theme.primaryHex}, ${theme.secondaryHex})`,
                  boxShadow: `0 4px 14px ${theme.primaryHex}40`
                } : {
                  backgroundColor: theme.light,
                  border: `2px solid ${theme.primaryHex}`
                }}
              >
                <MessageCircle 
                  className={`w-8 h-8 ${isDark ? 'text-white' : ''}`}
                  strokeWidth={2}
                  style={!isDark ? { color: theme.primaryHex } : {}}
                />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${textClass}`}>{t('help.contact.whatsapp')}</h3>
              <p className={`mb-4 ${textMutedClass}`}>{t('help.contact.whatsappDesc')}</p>
              <a href="https://wa.me/911234567890" target="_blank" rel="noopener noreferrer" className="font-semibold text-lg hover:opacity-80" style={{ color: theme.primaryHex }}>
                {t('help.contact.chatNow')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={`py-20 ${sectionBgClass}`}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-2xl">
          <div className="text-center mb-12">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
              style={{ backgroundColor: isDark ? `${theme.primaryHex}33` : theme.light, color: theme.primaryHex }}
            >
              <HelpCircle className="w-4 h-4" />
              <span>{t('help.faq.badge')}</span>
            </div>
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textClass}`}>
              {t('help.faq.title')}
            </h2>
            <p className={`max-w-2xl mx-auto ${textMutedClass}`}>
              {t('help.faq.subtitle')}
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveCategory(tab.id)
                  setOpenFAQ(null)
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg border-2 ${
                  activeCategory === tab.id
                    ? isDark 
                      ? 'text-white border-transparent'
                      : 'border-transparent'
                    : isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600' 
                      : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200'
                }`}
                style={activeCategory === tab.id ? (
                  isDark 
                    ? { background: `linear-gradient(135deg, ${theme.primaryHex}, ${theme.secondaryHex})` }
                    : { 
                        backgroundColor: theme.light,
                        borderColor: theme.primaryHex,
                        color: theme.primaryHex
                      }
                ) : {}}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="max-w-6xl mx-auto space-y-4">
            {currentFAQs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === index}
                onToggle={() => toggleFAQ(index)}
                primaryColor={theme.primaryHex}
                isDark={isDark}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(to bottom right, ${theme.primaryHex}, ${theme.secondaryHex})` }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">LaundryLobby</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/" className="hover:text-white transition-colors">{t('nav.home')}</Link>
              <Link href="/services" className="hover:text-white transition-colors">{t('nav.services')}</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">{t('nav.pricing')}</Link>
              <Link href="/help" className="hover:text-white transition-colors">{t('nav.help')}</Link>
            </div>
            <p className="text-sm">{t('help.footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
