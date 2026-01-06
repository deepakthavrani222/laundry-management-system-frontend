'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import TemplateHeader from '@/components/layout/TemplateHeader'
import { ThemeColor, SchemeMode, Language, getThemeColors } from '@/components/layout/SettingsPanel'
import { Shirt, Sparkles, Award, Package, Clock, Truck, Phone, CheckCircle, Star, ChevronDown } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import BookingModal from '@/components/BookingModal'
import { useLanguage } from '@/hooks/useLanguage'

const services = [
  { id: 'wash-fold', name: 'Wash & Fold', icon: Shirt, description: 'Regular washing and folding service for everyday clothes', price: 'Starting ₹25/item', features: ['Same day pickup', 'Eco-friendly detergents', 'Neatly folded'] },
  { id: 'dry-cleaning', name: 'Dry Cleaning', icon: Sparkles, description: 'Professional dry cleaning for delicate and formal wear', price: 'Starting ₹60/item', features: ['Expert care', 'Stain removal', 'Premium finish'] },
  { id: 'laundry', name: 'Laundry Service', icon: Package, description: 'Complete laundry service with wash, dry and iron', price: 'Starting ₹30/item', features: ['Full service', 'Quick turnaround', 'Quality assured'] },
  { id: 'shoe-cleaning', name: 'Shoe Cleaning', icon: Award, description: 'Professional shoe care and cleaning services', price: 'Starting ₹80/pair', features: ['Deep cleaning', 'Polish & shine', 'Odor removal'] },
  { id: 'express', name: 'Express Service', icon: Clock, description: 'Same-day delivery for urgent laundry needs', price: 'Starting ₹45/item', features: ['4-6 hour delivery', 'Priority handling', 'Premium care'] }
]

const faqData = [
  { question: "What types of clothes do you clean?", answer: "We clean all types of garments including everyday wear, formal clothes, delicates, woolens, silks, sarees, suits, curtains, bed sheets, and more." },
  { question: "How do you handle delicate fabrics?", answer: "Delicate fabrics like silk, wool, and cashmere receive special attention with gentle, fabric-specific detergents and appropriate cleaning methods." },
  { question: "What is the difference between Wash & Fold and Dry Cleaning?", answer: "Wash & Fold is regular water-based washing for everyday clothes. Dry Cleaning uses special solvents for delicate fabrics and formal wear." },
  { question: "Can you remove tough stains?", answer: "Yes! Our expert technicians specialize in stain removal including oil, ink, wine, coffee, and food stains." },
  { question: "How long does the service take?", answer: "Standard service takes 24-48 hours. Express service is available for same-day or next-day delivery." },
  { question: "Do you provide packaging for delivered clothes?", answer: "Yes, all cleaned garments are carefully packed. Formal wear is delivered on hangers with protective covers." }
]


function FAQItem({ question, answer, isOpen, onToggle, accentColor }: { question: string; answer: string; isOpen: boolean; onToggle: () => void; accentColor: string }) {
  return (
    <div className="overflow-hidden">
      <button 
        onClick={onToggle} 
        className="w-full px-8 py-5 text-left flex items-center justify-between transition-colors duration-200"
        style={{ backgroundColor: isOpen ? accentColor : '#334155' }}
      >
        <h4 className="text-base font-medium text-white pr-4">{question}</h4>
        <ChevronDown className={`w-5 h-5 text-white transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-8 py-6 bg-white border-x border-b border-gray-200">
          <p className="text-gray-600 text-base leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

function HowWeWorkSection({ isModalOpen, theme, t }: { isModalOpen?: boolean; theme: ReturnType<typeof getThemeColors>; t: (key: string) => string }) {
  const [isDesktop, setIsDesktop] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  // Translated steps
  const howWeWorkSteps = [
    { id: 1, title: t('services.howWeWork.step1.title'), subtitle: t('services.howWeWork.step1.subtitle'), description: t('services.howWeWork.step1.desc'), features: ['Easy online booking', 'Flexible time slots', 'Instant confirmation', 'Real-time tracking', 'One-click reschedule'], image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 2, title: t('services.howWeWork.step2.title'), subtitle: t('services.howWeWork.step2.subtitle'), description: t('services.howWeWork.step2.desc'), features: ['Free doorstep pickup', 'Verified professionals', 'Careful handling', 'Itemized receipt', 'Special care notes'], image: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 3, title: t('services.howWeWork.step3.title'), subtitle: t('services.howWeWork.step3.subtitle'), description: t('services.howWeWork.step3.desc'), features: ['Eco-friendly detergents', 'Advanced machines', 'Stain treatment', 'Quality inspection', 'Delicate fabric care'], image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 4, title: t('services.howWeWork.step4.title'), subtitle: t('services.howWeWork.step4.subtitle'), description: t('services.howWeWork.step4.desc'), features: ['On-time delivery', 'Neatly packed', 'Quality check', 'Contactless option', '100% satisfaction'], image: '/images/del.jpg' }
  ]

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Mobile Layout - Each step with its own image
  if (!isDesktop) {
    return (
      <section className="py-12 sm:py-16 transition-colors duration-300" style={{ backgroundColor: theme.sectionBg }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <p className="font-semibold mb-2" style={{ color: theme.accent }}>{t('services.howWeWork.badge')}</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: theme.textPrimary }}>{t('services.howWeWork.title')}</h2>
            <p className="text-sm sm:text-base" style={{ color: theme.textSecondary }}>{t('services.howWeWork.subtitle')}</p>
          </div>
          
          <div className="space-y-8">
            {howWeWorkSteps.map((step, index) => (
              <div key={step.id} className="rounded-2xl shadow-lg overflow-hidden" style={{ backgroundColor: theme.cardBg }}>
                {/* Image */}
                <div className="relative h-[200px] sm:h-[250px]">
                  <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.accent }}>
                        <span className="text-lg font-bold text-white">{step.id}</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">{step.title}</p>
                        <p className="text-gray-300 text-xs">{step.subtitle}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-5">
                  <p className="text-sm mb-4 leading-relaxed" style={{ color: theme.textSecondary }}>{step.description}</p>
                  <ul className="space-y-2">
                    {step.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm" style={{ color: theme.textSecondary }}>
                        <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" style={{ color: theme.accent }} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Desktop Layout - Grid layout
  return (
    <section ref={sectionRef} className="py-16 relative transition-colors duration-300" style={{ backgroundColor: theme.sectionBg }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="font-semibold mb-2" style={{ color: theme.accent }}>{t('services.howWeWork.badge')}</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: theme.textPrimary }}>{t('services.howWeWork.title')}</h2>
          <p className="max-w-2xl mx-auto" style={{ color: theme.textSecondary }}>{t('services.howWeWork.subtitle')}</p>
        </div>
        
        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {howWeWorkSteps.map((step, index) => (
            <div key={step.id} className="rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow" style={{ backgroundColor: theme.cardBg }}>
              {/* Image */}
              <div className="relative h-[200px]">
                <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.accent }}>
                      <span className="text-lg font-bold text-white">{step.id}</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{step.title}</p>
                      <p className="text-gray-300 text-xs">{step.subtitle}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-5">
                <p className="text-sm mb-4 leading-relaxed" style={{ color: theme.textSecondary }}>{step.description}</p>
                <ul className="space-y-2">
                  {step.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm" style={{ color: theme.textSecondary }}>
                      <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" style={{ color: theme.accent }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


export default function ServicesPage() {
  const { isAuthenticated } = useAuthStore()
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [themeColor, setThemeColor] = useState<ThemeColor>('teal')
  const [scheme, setScheme] = useState<SchemeMode>('light')
  const router = useRouter()
  
  // Use language hook for reactive translations
  const { language, setLanguage, t } = useLanguage()

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
  }

  const handleBookNow = () => {
    // If not logged in, redirect to login, then come back with modal
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/services?openBooking=true')
      return
    }
    setShowBookingModal(true)
  }

  // Check URL params to auto-open booking modal after login
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('openBooking') === 'true' && isAuthenticated) {
        setShowBookingModal(true)
        // Clean up URL
        window.history.replaceState({}, '', '/services')
      }
    }
  }, [isAuthenticated])

  const handleLoginRequired = () => {
    setShowBookingModal(false)
    router.push('/auth/login?redirect=/services?openBooking=true')
  }

  // Calculate top margin based on template (FreshSpin has top bar + header but sticky, not fixed)
  const topMargin = 'pt-28'

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.pageBg }}>
      <TemplateHeader />
      
      {/* Booking Modal */}
      <BookingModal 
        isOpen={showBookingModal} 
        onClose={() => setShowBookingModal(false)}
        onLoginRequired={handleLoginRequired}
      />
      
      <section className={`relative h-[400px] overflow-hidden ${topMargin}`}>
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/images/pricing.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-900/40"></div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('services.hero.title').split(' ').slice(0, 2).join(' ')}<br />{t('services.hero.title').split(' ').slice(2).join(' ')}</h1>
            <p className="text-lg text-gray-200 mb-8">{t('services.hero.subtitle')}</p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-gray-800 hover:bg-gray-900 text-white" onClick={handleBookNow}>
                <Truck className="w-5 h-5 mr-2" />{t('services.hero.schedulePickup')}
              </Button>
              <Link href="https://wa.me/919876543210" target="_blank">
                <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white">
                  <Phone className="w-5 h-5 mr-2" />{t('services.hero.whatsapp')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <HowWeWorkSection isModalOpen={showBookingModal} theme={theme} t={t} />

      <section className="py-16 transition-colors duration-300" style={{ backgroundColor: theme.pageBg }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="font-semibold mb-2" style={{ color: theme.accent }}>{t('services.ourServices.badge')}</p>
            <h2 className="text-3xl font-bold mb-4" style={{ color: theme.textPrimary }}>{t('services.ourServices.title')}</h2>
            <p className="max-w-2xl mx-auto" style={{ color: theme.textSecondary }}>{t('services.ourServices.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {services.map((service, index) => {
              const Icon = service.icon
              const isAlt = index % 2 === 1
              return (
                <div 
                  key={service.id} 
                  className="rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  style={{ 
                    backgroundColor: theme.cardBg, 
                    border: `1px solid ${theme.border}` 
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: isAlt ? theme.accentSecondary : theme.accent }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-semibold mb-1" style={{ color: theme.textPrimary }}>{service.name}</h3>
                  <p className="text-sm mb-2 line-clamp-2" style={{ color: theme.textMuted }}>{service.description}</p>
                  <p className="text-sm font-bold mb-3" style={{ color: isAlt ? theme.accentSecondary : theme.accent }}>{service.price}</p>
                  <ul className="space-y-1 mb-4">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-xs" style={{ color: theme.textSecondary }}>
                        <CheckCircle className="w-3 h-3 mr-1.5 flex-shrink-0" style={{ color: theme.accent }} />{feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    size="sm" 
                    className="w-full text-white text-sm hover:opacity-90"
                    style={{ backgroundColor: theme.accent }}
                    onClick={handleBookNow}
                  >
                    {t('nav.bookNow')}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 transition-colors duration-300" style={{ backgroundColor: theme.sectionBg }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: theme.textPrimary }}>{t('services.whyChoose.title')}</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: theme.accentLight }}>
                <Truck className="w-8 h-8" style={{ color: theme.accent }} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: theme.textPrimary }}>{t('services.whyChoose.freePickup')}</h3>
              <p className="text-sm" style={{ color: theme.textSecondary }}>{t('services.whyChoose.freePickupDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: theme.accentLight }}>
                <Clock className="w-8 h-8" style={{ color: theme.accentSecondary }} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: theme.textPrimary }}>{t('services.whyChoose.fastDelivery')}</h3>
              <p className="text-sm" style={{ color: theme.textSecondary }}>{t('services.whyChoose.fastDeliveryDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: theme.accentLight }}>
                <Star className="w-8 h-8" style={{ color: theme.accent }} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: theme.textPrimary }}>{t('services.whyChoose.quality')}</h3>
              <p className="text-sm" style={{ color: theme.textSecondary }}>{t('services.whyChoose.qualityDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: theme.accentLight }}>
                <Phone className="w-8 h-8" style={{ color: theme.accentSecondary }} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: theme.textPrimary }}>{t('services.whyChoose.support')}</h3>
              <p className="text-sm" style={{ color: theme.textSecondary }}>{t('services.whyChoose.supportDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 transition-colors duration-300" style={{ backgroundColor: theme.pageBg }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: theme.textPrimary }}>{t('services.faq.title')}</h2>
            <p className="max-w-2xl mx-auto" style={{ color: theme.textSecondary }}>{t('services.faq.subtitle')}</p>
          </div>
          <div className="max-w-6xl mx-auto space-y-2">
            {faqData.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} isOpen={openFAQ === index} onToggle={() => setOpenFAQ(openFAQ === index ? null : index)} accentColor={theme.accent} />
            ))}
          </div>
        </div>
      </section>

      <section 
        className="py-16 transition-colors duration-300"
        style={{ background: `linear-gradient(to right, ${theme.accent}, ${theme.accentSecondary})` }}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t('services.cta.title')}</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">{t('services.cta.subtitle')}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white hover:bg-gray-100" style={{ color: theme.accent }} onClick={handleBookNow}>
              <Truck className="w-5 h-5 mr-2" />{t('services.cta.bookNow')}
            </Button>
            <Link href="tel:+919876543210">
              <Button size="lg" className="bg-white/20 border-2 border-white text-white hover:bg-white" style={{ '--hover-color': theme.accent } as any}>
                <Phone className="w-5 h-5 mr-2" />{t('services.cta.callUs')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
