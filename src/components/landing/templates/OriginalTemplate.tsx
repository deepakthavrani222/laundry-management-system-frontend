'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  MapPin, Shirt, Sparkles, Truck, CheckCircle, Clock, CreditCard, Headphones,
  Star, Shield, Zap, Award, Phone, Mail, Instagram, Facebook, Twitter,
  ChevronLeft, ChevronRight, User, ShoppingBag, LogOut, ChevronDown, Package, Menu, X,
  Settings, Sun, Moon, Monitor, RotateCcw
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { ThemeColor } from '../ThemeCustomizer'
import { Language, getTranslation } from '@/lib/translations'
import { useLanguage } from '@/hooks/useLanguage'

interface OriginalTemplateProps {
  themeColor: ThemeColor
  language?: Language
  isAuthenticated: boolean
  user: any
  onBookNow: () => void
  onColorChange?: (color: ThemeColor) => void
  onLanguageChange?: (language: Language) => void
  onTemplateChange?: (template: string) => void
  currentTemplate?: string
}

type SchemeMode = 'light' | 'dark' | 'auto'

// Professional Theme Colors Interface
interface ThemeColors {
  pageBg: string
  cardBg: string
  headerBg: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  border: string
  accent: string
  accentSecondary: string
  accentHover: string
  accentLight: string
  accentText: string
  sectionBg: string
  sectionBgAlt: string
  footerBg: string
  footerText: string
  heroBg: string
}

// Light Mode Palettes
const lightPalettes: Record<ThemeColor, ThemeColors> = {
  teal: {
    pageBg: '#ffffff',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    textPrimary: '#1f2937',
    textSecondary: '#4b5563',
    textMuted: '#9ca3af',
    border: '#e5e7eb',
    accent: '#14b8a6',
    accentSecondary: '#06b6d4',
    accentHover: '#0d9488',
    accentLight: '#ccfbf1',
    accentText: '#14b8a6',
    sectionBg: '#f0fdfa',
    sectionBgAlt: '#e6fffa',
    footerBg: '#111827',
    footerText: '#ffffff',
    heroBg: '#ccfbf1',
  },
  blue: {
    pageBg: '#ffffff',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    textPrimary: '#1f2937',
    textSecondary: '#4b5563',
    textMuted: '#9ca3af',
    border: '#e5e7eb',
    accent: '#3b82f6',
    accentSecondary: '#6366f1',
    accentHover: '#2563eb',
    accentLight: '#dbeafe',
    accentText: '#3b82f6',
    sectionBg: '#eff6ff',
    sectionBgAlt: '#dbeafe',
    footerBg: '#111827',
    footerText: '#ffffff',
    heroBg: '#dbeafe',
  },
  purple: {
    pageBg: '#ffffff',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    textPrimary: '#1f2937',
    textSecondary: '#4b5563',
    textMuted: '#9ca3af',
    border: '#e5e7eb',
    accent: '#8b5cf6',
    accentSecondary: '#ec4899',
    accentHover: '#7c3aed',
    accentLight: '#fce7f3',
    accentText: '#8b5cf6',
    sectionBg: '#fdf4ff',
    sectionBgAlt: '#fce7f3',
    footerBg: '#111827',
    footerText: '#ffffff',
    heroBg: '#f3e8ff',
  },
  orange: {
    pageBg: '#ffffff',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    textPrimary: '#1f2937',
    textSecondary: '#4b5563',
    textMuted: '#9ca3af',
    border: '#e5e7eb',
    accent: '#f97316',
    accentSecondary: '#ef4444',
    accentHover: '#ea580c',
    accentLight: '#ffedd5',
    accentText: '#f97316',
    sectionBg: '#fff7ed',
    sectionBgAlt: '#ffedd5',
    footerBg: '#111827',
    footerText: '#ffffff',
    heroBg: '#ffedd5',
  },
}

// Dark Mode Palettes
const darkPalettes: Record<ThemeColor, ThemeColors> = {
  teal: {
    pageBg: '#0f172a',
    cardBg: '#1e293b',
    headerBg: '#0f172a',
    textPrimary: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textMuted: '#64748b',
    border: '#334155',
    accent: '#2dd4bf',
    accentSecondary: '#22d3ee',
    accentHover: '#14b8a6',
    accentLight: '#134e4a',
    accentText: '#2dd4bf',
    sectionBg: '#1e293b',
    sectionBgAlt: '#0f172a',
    footerBg: '#020617',
    footerText: '#f1f5f9',
    heroBg: '#134e4a',
  },
  blue: {
    pageBg: '#0f172a',
    cardBg: '#1e293b',
    headerBg: '#0f172a',
    textPrimary: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textMuted: '#64748b',
    border: '#334155',
    accent: '#60a5fa',
    accentSecondary: '#818cf8',
    accentHover: '#3b82f6',
    accentLight: '#1e3a8a',
    accentText: '#60a5fa',
    sectionBg: '#1e293b',
    sectionBgAlt: '#0f172a',
    footerBg: '#020617',
    footerText: '#f1f5f9',
    heroBg: '#1e3a8a',
  },
  purple: {
    pageBg: '#1a0a1a',
    cardBg: '#2d1a2d',
    headerBg: '#1a0a1a',
    textPrimary: '#fdf4ff',
    textSecondary: '#f0abfc',
    textMuted: '#a855f7',
    border: '#581c87',
    accent: '#a78bfa',
    accentSecondary: '#f472b6',
    accentHover: '#8b5cf6',
    accentLight: '#701a75',
    accentText: '#f472b6',
    sectionBg: '#2d1a2d',
    sectionBgAlt: '#1a0a1a',
    footerBg: '#0a0510',
    footerText: '#fdf4ff',
    heroBg: '#581c87',
  },
  orange: {
    pageBg: '#1c1410',
    cardBg: '#292018',
    headerBg: '#1c1410',
    textPrimary: '#fef3c7',
    textSecondary: '#fcd34d',
    textMuted: '#92400e',
    border: '#451a03',
    accent: '#fb923c',
    accentSecondary: '#f87171',
    accentHover: '#f97316',
    accentLight: '#7c2d12',
    accentText: '#fb923c',
    sectionBg: '#292018',
    sectionBgAlt: '#1c1410',
    footerBg: '#0c0a09',
    footerText: '#fef3c7',
    heroBg: '#7c2d12',
  },
}

// Get theme based on scheme mode
const getThemeColors = (colorName: ThemeColor, scheme: SchemeMode): ThemeColors => {
  if (scheme === 'dark') return darkPalettes[colorName]
  if (scheme === 'light') return lightPalettes[colorName]
  if (typeof window !== 'undefined') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? darkPalettes[colorName] : lightPalettes[colorName]
  }
  return lightPalettes[colorName]
}

// Settings Panel Component
function SettingsPanel({ 
  themeColor,
  currentLanguage,
  currentScheme,
  currentTemplate,
  onColorChange,
  onLanguageChange,
  onSchemeChange,
  onTemplateChange
}: { 
  themeColor: ThemeColor
  currentLanguage: Language
  currentScheme: SchemeMode
  currentTemplate?: string
  onColorChange?: (color: ThemeColor) => void
  onLanguageChange?: (language: Language) => void
  onSchemeChange?: (scheme: SchemeMode) => void
  onTemplateChange?: (template: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { id: 'en', name: 'English', flag: '🇺🇸' },
    { id: 'es', name: 'Español', flag: '🇪🇸' },
    { id: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  ]

  const templates = [
    { id: 'original', name: 'Landing Page 1' },
    { id: 'minimal', name: 'Landing Page 2' },
    { id: 'freshspin', name: 'Landing Page 3' },
    { id: 'starter', name: 'Landing Page 4' },
  ]

  const resetColors = () => {
    onColorChange?.('teal')
    onSchemeChange?.('light')
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-white shadow-lg rounded-l-xl p-3 hover:bg-gray-50 transition-colors border border-r-0 border-gray-200"
      >
        <Settings className="w-5 h-5 text-gray-600" style={{ animation: 'spin 3s linear infinite' }} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setIsOpen(false)}>
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}

      <div 
        className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">{getTranslation(currentLanguage, 'original.settings.title')}</h2>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-60px)] scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{getTranslation(currentLanguage, 'original.settings.scheme')}</h3>
            <div className="flex gap-2">
              {(['auto', 'dark', 'light'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onSchemeChange?.(mode)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 transition-all ${
                    currentScheme === mode 
                      ? 'border-blue-500 bg-blue-50 text-blue-600' 
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {mode === 'auto' && <Monitor className="w-4 h-4" />}
                  {mode === 'dark' && <Moon className="w-4 h-4" />}
                  {mode === 'light' && <Sun className="w-4 h-4" />}
                  <span className="text-sm font-medium capitalize">{mode}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">{getTranslation(currentLanguage, 'original.settings.colorCustomizer')}</h3>
              <button onClick={resetColors} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Reset">
                <RotateCcw className="w-4 h-4 text-blue-500" />
              </button>
            </div>
            <div className="flex gap-3 flex-wrap">
              {(['teal', 'blue', 'purple', 'orange'] as const).map((color) => (
                <button
                  key={color}
                  onClick={() => onColorChange?.(color)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all hover:scale-110 ${
                    themeColor === color ? `border-gray-800 ring-2 ring-offset-2 ring-${color}-400` : 'border-gray-200'
                  }`}
                  title={`${color} Theme`}
                >
                  <div className="w-full h-full flex">
                    <div className={`w-1/2 h-full bg-${color}-500`} />
                    <div className={`w-1/2 h-full ${color === 'teal' ? 'bg-cyan-400' : color === 'blue' ? 'bg-indigo-500' : color === 'purple' ? 'bg-pink-500' : 'bg-red-400'}`} />
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 capitalize">Current: {themeColor}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{getTranslation(currentLanguage, 'theme.language')}</h3>
            <div className="space-y-2">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => onLanguageChange?.(lang.id as Language)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    currentLanguage === lang.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className={`font-medium ${currentLanguage === lang.id ? 'text-blue-600' : 'text-gray-700'}`}>{lang.name}</span>
                  {currentLanguage === lang.id && <CheckCircle className="w-5 h-5 text-blue-500 ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{getTranslation(currentLanguage, 'original.settings.landingPage')}</h3>
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onTemplateChange?.(template.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    currentTemplate === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className={`font-medium ${currentTemplate === template.id ? 'text-blue-600' : 'text-gray-700'}`}>{template.name}</span>
                  {currentTemplate === template.id && <CheckCircle className="w-5 h-5 text-blue-500 ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Color classes for dynamic theming
const colorClasses = {
  teal: { 
    primary: 'bg-teal-500', hover: 'hover:bg-teal-600', text: 'text-teal-500', 
    light: 'bg-teal-50', lightText: 'text-teal-600', border: 'border-teal-500',
    lightBorder: 'border-teal-100', hoverText: 'hover:text-teal-500', hoverTextDark: 'hover:text-teal-400',
    gradient: 'from-teal-50 to-cyan-50', heroBg: 'bg-teal-100', sectionBg: 'bg-teal-50/50',
    testimonialBg: 'bg-gradient-to-br from-teal-50 to-cyan-50'
  },
  blue: { 
    primary: 'bg-blue-500', hover: 'hover:bg-blue-600', text: 'text-blue-500', 
    light: 'bg-blue-50', lightText: 'text-blue-600', border: 'border-blue-500',
    lightBorder: 'border-blue-100', hoverText: 'hover:text-blue-500', hoverTextDark: 'hover:text-blue-400',
    gradient: 'from-blue-50 to-indigo-50', heroBg: 'bg-blue-100', sectionBg: 'bg-blue-50/50',
    testimonialBg: 'bg-gradient-to-br from-blue-50 to-indigo-50'
  },
  purple: { 
    primary: 'bg-purple-500', hover: 'hover:bg-purple-600', text: 'text-purple-500', 
    light: 'bg-purple-50', lightText: 'text-purple-600', border: 'border-purple-500',
    lightBorder: 'border-purple-100', hoverText: 'hover:text-purple-500', hoverTextDark: 'hover:text-purple-400',
    gradient: 'from-purple-50 to-pink-50', heroBg: 'bg-purple-100', sectionBg: 'bg-purple-50/50',
    testimonialBg: 'bg-gradient-to-br from-purple-50 to-pink-50'
  },
  orange: { 
    primary: 'bg-orange-500', hover: 'hover:bg-orange-600', text: 'text-orange-500', 
    light: 'bg-orange-50', lightText: 'text-orange-600', border: 'border-orange-500',
    lightBorder: 'border-orange-100', hoverText: 'hover:text-orange-500', hoverTextDark: 'hover:text-orange-400',
    gradient: 'from-orange-50 to-amber-50', heroBg: 'bg-orange-100', sectionBg: 'bg-orange-50/50',
    testimonialBg: 'bg-gradient-to-br from-orange-50 to-amber-50'
  },
}

// Get RGB values for scroll banner animation
const colorRGB = {
  teal: { start: { r: 204, g: 251, b: 241 }, end: { r: 20, g: 184, b: 166 } },
  blue: { start: { r: 219, g: 234, b: 254 }, end: { r: 59, g: 130, b: 246 } },
  purple: { start: { r: 243, g: 232, b: 255 }, end: { r: 168, g: 85, b: 247 } },
  orange: { start: { r: 255, g: 237, b: 213 }, end: { r: 249, g: 115, b: 22 } },
}

// Hero Carousel Component with Infinite Slide Effect
function HeroCarousel({ isAuthenticated, user, onBookNow, colors, t, theme }: { isAuthenticated: boolean; user: any; onBookNow: () => void; colors: any; t: (key: string) => string; theme: ThemeColors }) {
  const [currentSlide, setCurrentSlide] = useState(1) // Start at 1 because of clone
  const [isHovered, setIsHovered] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(true)

  const originalSlides = [
    {
      title: isAuthenticated ? `${t('original.hero.welcomeBack')}, ${user?.name}!` : t('hero.title'),
      subtitle: t('hero.badge'),
      description: isAuthenticated ? t('hero.subtitle') : t('hero.subtitle'),
      features: [
        { icon: Clock, text: t('about.feature2') },
        { icon: Truck, text: t('about.feature1') },
        { icon: CreditCard, text: t('original.hero.easyPayment') },
        { icon: Headphones, text: t('original.hero.dedicatedSupport') },
      ],
      image: '/images/hero-laundry.jpg',
    },
    {
      title: t('services.dryCleaning'),
      subtitle: t('services.dryCleaningDesc'),
      description: t('about.desc1'),
      features: [
        { icon: Shield, text: t('about.feature4') },
        { icon: Sparkles, text: t('original.hero.premiumQuality') },
        { icon: Award, text: t('original.hero.certifiedPros') },
        { icon: Star, text: t('original.hero.fiveStarService') },
      ],
      image: '/images/hero-slide-2.jpg',
    },
  ]

  // Clone first and last slides for infinite effect
  const slides = [
    originalSlides[originalSlides.length - 1], // Clone of last
    ...originalSlides,
    originalSlides[0], // Clone of first
  ]

  const nextSlide = () => {
    setIsTransitioning(true)
    setCurrentSlide((prev) => prev + 1)
  }

  const prevSlide = () => {
    setIsTransitioning(true)
    setCurrentSlide((prev) => prev - 1)
  }

  // Handle infinite loop reset
  useEffect(() => {
    if (currentSlide === slides.length - 1) {
      // At clone of first slide, jump to real first
      setTimeout(() => {
        setIsTransitioning(false)
        setCurrentSlide(1)
      }, 500)
    } else if (currentSlide === 0) {
      // At clone of last slide, jump to real last
      setTimeout(() => {
        setIsTransitioning(false)
        setCurrentSlide(slides.length - 2)
      }, 500)
    }
  }, [currentSlide, slides.length])

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isHovered) {
        nextSlide()
      }
    }, 5000)
    return () => clearInterval(timer)
  }, [isHovered])

  // Get actual slide index for indicators
  const getActualIndex = () => {
    if (currentSlide === 0) return originalSlides.length - 1
    if (currentSlide === slides.length - 1) return 0
    return currentSlide - 1
  }

  return (
    <div className="relative overflow-hidden group" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {/* Navigation Arrows */}
      <button onClick={prevSlide} className={`absolute left-4 top-1/2 -translate-y-1/2 z-30 ${colors.primary} ${colors.hover} rounded-lg p-3 shadow-lg transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button onClick={nextSlide} className={`absolute right-4 top-1/2 -translate-y-1/2 z-30 ${colors.primary} ${colors.hover} rounded-lg p-3 shadow-lg transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Slides Container */}
      <div className="relative">
        <div 
          className={`flex ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <div className="grid lg:grid-cols-2 gap-4 items-center">
                <div className="px-4 lg:pl-16">
                  <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">{slide.title}</h1>
                  <p className="text-lg font-medium text-gray-800 mb-6">{slide.description}</p>
                  <div className="space-y-3 mb-8">
                    {slide.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <CheckCircle className={`w-5 h-5 ${colors.text} flex-shrink-0`} />
                        <span className="text-gray-800 font-medium">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button size="lg" className={`${colors.primary} ${colors.hover} text-white px-6`} onClick={onBookNow}>
                      <Truck className="w-5 h-5 mr-2" />{t('nav.bookNow')}
                    </Button>
                    <Link href="https://wa.me/919876543210" target="_blank">
                      <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white px-6">
                        <Phone className="w-5 h-5 mr-2" />{t('cta.whatsapp')}
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="relative flex justify-center items-end overflow-hidden">
                  <img src={slide.image} alt={slide.title} className="w-auto max-h-[450px] object-contain object-bottom" style={{ mixBlendMode: 'multiply' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center gap-2 mt-6 pb-4">
        {originalSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => { setIsTransitioning(true); setCurrentSlide(index + 1) }}
            className={`h-2 rounded-full transition-all ${
              getActualIndex() === index 
                ? `w-8 ${colors.primary}` 
                : 'w-2 bg-gray-400 hover:bg-gray-500'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// Testimonials Carousel
function TestimonialsCarousel({ colors, theme }: { colors: any; theme: ThemeColors }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const testimonials = [
    { id: 1, name: 'Divya K.', review: 'I gave them my silk saree and was honestly worried. But they handled it with such care. Impressive service!', rating: 5 },
    { id: 2, name: 'Rajat T.', review: 'Very smooth process — booked on the app, got a confirmation instantly, and pickup arrived right on time.', rating: 5 },
    { id: 3, name: 'Tanvi M.', review: 'Affordable prices and great quality. Clothes were perfectly ironed and smelled so fresh. 10/10!', rating: 5 },
    { id: 4, name: 'Karan V.', review: "This is my third time using LaundryPro and I'm never going back. So easy and dependable!", rating: 5 },
    { id: 5, name: 'Priya S.', review: 'Best laundry service in the city! My curtains came back looking brand new.', rating: 5 },
    { id: 6, name: 'Amit R.', review: 'The pickup and delivery is so convenient. Excellent quality every single time!', rating: 5 },
    { id: 7, name: 'Sneha P.', review: 'Quality exceeded my expectations. My formal suits look professionally cleaned.', rating: 5 },
    { id: 8, name: 'Vikram J.', review: 'Fast, reliable, and affordable. Been using for 6 months now, never disappointed.', rating: 5 },
  ]
  const extendedTestimonials = [...testimonials, ...testimonials, ...testimonials]
  const nextSlide = () => setCurrentIndex(prev => prev + 1)
  const prevSlide = () => setCurrentIndex(prev => prev - 1)
  useEffect(() => {
    if (currentIndex >= testimonials.length) setTimeout(() => setCurrentIndex(0), 500)
    if (currentIndex < 0) setTimeout(() => setCurrentIndex(testimonials.length - 1), 500)
  }, [currentIndex, testimonials.length])

  return (
    <div className="relative">
      <button onClick={prevSlide} className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full border-2 ${colors.border} bg-white flex items-center justify-center ${colors.hoverText}`}>
        <ChevronLeft className={`w-5 h-5 ${colors.text}`} />
      </button>
      <button onClick={nextSlide} className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full border-2 ${colors.border} bg-white flex items-center justify-center ${colors.hoverText}`}>
        <ChevronRight className={`w-5 h-5 ${colors.text}`} />
      </button>
      <div className="overflow-hidden mx-8">
        <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${(currentIndex + testimonials.length) * 25}%)` }}>
          {extendedTestimonials.map((testimonial, index) => (
            <div key={`${testimonial.id}-${index}`} className="flex-shrink-0 w-1/4 px-2">
              <div className="bg-white rounded-xl p-6 text-center h-full">
                <div className={`w-14 h-14 ${colors.primary} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <div className="flex justify-center mb-4">{[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}</div>
                <p className="text-gray-700 text-base mb-4 leading-relaxed">{testimonial.review}</p>
                <p className="font-bold text-gray-800 text-lg">{testimonial.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


// Scroll Banner Section with dynamic colors
function ScrollBannerSection({ isAuthenticated, onGalleryVisible, colors, themeColor, onBookNow }: { isAuthenticated: boolean; onGalleryVisible?: (visible: boolean) => void; colors: any; themeColor: ThemeColor; onBookNow: () => void }) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [imageRowOffset, setImageRowOffset] = useState(0)
  const [isPinned, setIsPinned] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight * 1.2)))
      setScrollProgress(progress)
      const shouldPin = progress > 0.1 && progress < 0.95
      setIsPinned(shouldPin)
      setImageRowOffset(window.scrollY * 0.5)
      if (onGalleryVisible) onGalleryVisible(progress > 0.8)
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [onGalleryVisible])

  const bannerWidth = 40 + (scrollProgress * 60)
  const bannerPaddingY = 30 + (scrollProgress * 80)
  const topRadius = Math.max(0, 20 - (scrollProgress * 20))
  
  // Dynamic color interpolation based on theme
  const rgb = colorRGB[themeColor]
  const colorR = rgb.start.r - (scrollProgress * (rgb.start.r - rgb.end.r))
  const colorG = rgb.start.g - (scrollProgress * (rgb.start.g - rgb.end.g))
  const colorB = rgb.start.b - (scrollProgress * (rgb.start.b - rgb.end.b))
  
  const showGallery = scrollProgress > 0.8
  const galleryOpacity = Math.max(0, (scrollProgress - 0.8) * 5)
  const bgColorProgress = Math.max(0, (scrollProgress - 0.6) * 2.5)
  const bgR = Math.round(255 - (bgColorProgress * 238))
  const bgG = Math.round(255 - (bgColorProgress * 231))
  const bgB = Math.round(255 - (bgColorProgress * 216))

  const topRowImages = [
    'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1489274495757-95c7c837b101?w=400&h=300&fit=crop',
  ]
  const bottomRowImages = [
    'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1469504512102-900f29606341?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=300&fit=crop',
  ]

  // Get text color class based on theme
  const accentTextClass = {
    teal: 'text-teal-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  }[themeColor]

  const accentLightTextClass = {
    teal: 'text-teal-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
  }[themeColor]

  return (
    <div ref={sectionRef} className="relative" style={{ minHeight: isPinned ? '200vh' : 'auto' }}>
      <section className={`py-16 min-h-[100vh] flex items-center justify-center overflow-hidden transition-colors duration-300 ${isPinned ? 'sticky top-0' : ''}`}
        style={{ zIndex: isPinned ? 10 : 1, backgroundColor: `rgb(${bgR}, ${bgG}, ${bgB})` }}>
        <div className="w-full flex justify-center">
          <div className="transition-all duration-300 ease-out relative"
            style={{ width: `${bannerWidth}%`, padding: `${bannerPaddingY}px 24px`, borderRadius: `${topRadius}px ${topRadius}px 20px 20px`, backgroundColor: `rgb(${colorR}, ${colorG}, ${colorB})`, textAlign: scrollProgress < 0.5 ? 'left' : 'center' }}>
            <p className="font-bold tracking-[0.2em] uppercase text-gray-600 transition-all" style={{ fontSize: `${10 + scrollProgress * 6}px`, marginBottom: `${8 + scrollProgress * 16}px` }}>Schedule today to</p>
            <h2 className="leading-tight transition-all" style={{ fontSize: `${22 + scrollProgress * 44}px`, marginBottom: `${16 + scrollProgress * 16}px` }}>
              <span className="font-extrabold text-gray-900">Get 20% off </span>
              <span className={`font-semibold ${accentTextClass}`}>your first order</span>
            </h2>
            <Button 
              className={`rounded-full font-bold ${colors.primary} ${colors.hover} text-white`} 
              style={{ padding: `${10 + scrollProgress * 6}px ${24 + scrollProgress * 20}px`, fontSize: `${13 + scrollProgress * 3}px` }}
              onClick={onBookNow}
            >
              Schedule your first pickup
            </Button>
          </div>
        </div>
      </section>
      {showGallery && (
        <section className="bg-gray-900 py-8 overflow-hidden transition-all duration-500" style={{ opacity: galleryOpacity }}>
          <div className="mb-4 overflow-hidden">
            <div className="flex gap-4" style={{ width: 'max-content', transform: `translateX(-${imageRowOffset % 1000}px)` }}>
              {[...topRowImages, ...topRowImages, ...topRowImages].map((img, index) => (
                <div key={`top-${index}`} className="w-72 h-48 flex-shrink-0 rounded-xl overflow-hidden">
                  <img src={img} alt={`Laundry ${index + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden">
            <div className="flex gap-4" style={{ width: 'max-content', transform: `translateX(-${1000 - (imageRowOffset % 1000)}px)` }}>
              {[...bottomRowImages, ...bottomRowImages, ...bottomRowImages].map((img, index) => (
                <div key={`bottom-${index}`} className="w-72 h-48 flex-shrink-0 rounded-xl overflow-hidden">
                  <img src={img} alt={`Laundry ${index + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
          <div className="container mx-auto px-4 py-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div><h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">The LaundryPro<br /><span className={accentLightTextClass}>Guarantee.</span></h2></div>
              <div>
                <div className="flex mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />)}</div>
                <p className="text-gray-300 text-lg leading-relaxed">Every order is backed by our industry-leading guarantee. If you're not satisfied with the cleaning of your clothes, we will re-clean them – free of charge.</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}


// Main Component
export default function OriginalTemplate({ themeColor, isAuthenticated, user, onBookNow, onColorChange, onLanguageChange, onTemplateChange, currentTemplate }: OriginalTemplateProps) {
  // Use language hook for reactive translations
  const { language, t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [scheme, setScheme] = useState<SchemeMode>('light')
  const router = useRouter()
  const colors = colorClasses[themeColor]

  // Get computed theme colors based on scheme
  const theme = getThemeColors(themeColor, scheme)

  // Load scheme from localStorage
  useEffect(() => {
    const savedScheme = localStorage.getItem('landing_scheme') as SchemeMode
    if (savedScheme && ['light', 'dark', 'auto'].includes(savedScheme)) {
      setScheme(savedScheme)
    }
  }, [])

  // Listen for scheme changes from TemplateHeader dark mode toggle
  useEffect(() => {
    const handleSchemeChange = (e: CustomEvent<{ scheme: string }>) => {
      const newScheme = e.detail.scheme as SchemeMode
      if (['light', 'dark', 'auto'].includes(newScheme)) {
        setScheme(newScheme)
      }
    }
    window.addEventListener('schemeChange', handleSchemeChange as EventListener)
    return () => window.removeEventListener('schemeChange', handleSchemeChange as EventListener)
  }, [])

  // Handle scheme change
  const handleSchemeChange = (newScheme: SchemeMode) => {
    setScheme(newScheme)
    localStorage.setItem('landing_scheme', newScheme)
  }

  const handleGalleryVisible = (visible: boolean) => setIsDarkTheme(visible)

  const services = [
    { icon: Shirt, title: t('services.washFold'), desc: t('services.washFoldDesc') },
    { icon: Sparkles, title: t('original.services.washIron'), desc: t('original.services.washIronDesc') },
    { icon: Award, title: t('original.services.premiumLaundry'), desc: t('original.services.premiumLaundryDesc') },
    { icon: Shield, title: t('services.dryCleaning'), desc: t('services.dryCleaningDesc') },
    { icon: Zap, title: t('services.steamPress'), desc: t('services.steamPressDesc') },
    { icon: Star, title: t('original.services.starching'), desc: t('original.services.starchingDesc') },
    { icon: CheckCircle, title: t('original.services.premiumSteamPress'), desc: t('original.services.premiumSteamPressDesc') },
    { icon: Package, title: t('original.services.premiumDryClean'), desc: t('original.services.premiumDryCleanDesc') },
  ]

  const steps = [
    { num: '1', icon: CreditCard, title: t('original.steps.orderOnline'), desc: t('original.steps.orderOnlineDesc'), img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80' },
    { num: '2', icon: Truck, title: t('process.step1.title'), desc: t('process.step1.desc'), img: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&q=80' },
    { num: '3', icon: Sparkles, title: t('process.step2.title'), desc: t('process.step2.desc'), img: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=400&q=80' },
    { num: '4', icon: CheckCircle, title: t('process.step3.title'), desc: t('process.step3.desc'), img: '/images/del.jpg' },
  ]

  const whyChooseUs = [
    { icon: Truck, text: t('about.feature1') },
    { icon: CreditCard, text: t('original.whyChoose.affordablePricing') },
    { icon: Sparkles, text: t('about.feature3') },
    { icon: MapPin, text: t('original.whyChoose.realTimeTracking') },
    { icon: Headphones, text: t('original.hero.dedicatedSupport') },
  ]

  return (
    <div className={`min-h-screen transition-colors duration-500`} style={{ backgroundColor: isDarkTheme ? '#111827' : theme.pageBg }}>
      
      {/* Navigation */}
      <nav 
        className="shadow-sm border-b fixed top-0 left-0 right-0 z-50 transition-colors duration-500"
        style={{ 
          backgroundColor: isDarkTheme ? '#111827' : theme.headerBg,
          borderColor: isDarkTheme ? '#374151' : theme.border
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.accent }}><Sparkles className="w-6 h-6 text-white" /></div>
              <span className="text-2xl font-bold" style={{ color: isDarkTheme ? '#ffffff' : theme.textPrimary }}>LaundryPro</span>
            </div>
            <div className="flex items-center space-x-2 md:hidden">
              {/* Mobile Dark Mode Toggle */}
              <button
                onClick={() => {
                  const newScheme = scheme === 'dark' ? 'light' : 'dark'
                  handleSchemeChange(newScheme)
                }}
                className="p-2 rounded-full transition-colors"
                style={{ 
                  backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`
                }}
                title={scheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {scheme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5" style={{ color: theme.textSecondary }} />
                )}
              </button>
              <button 
                className="p-2 rounded-lg"
                style={{ color: isDarkTheme ? '#ffffff' : theme.textPrimary }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="hover:opacity-80 transition-opacity" style={{ color: isDarkTheme ? '#d1d5db' : theme.textSecondary }}>{t('nav.home')}</Link>
              <Link href="/services" className="hover:opacity-80 transition-opacity" style={{ color: isDarkTheme ? '#d1d5db' : theme.textSecondary }}>{t('nav.services')}</Link>
              <Link href="/pricing" className="hover:opacity-80 transition-opacity" style={{ color: isDarkTheme ? '#d1d5db' : theme.textSecondary }}>{t('nav.pricing')}</Link>
              <Link href="/help" className="hover:opacity-80 transition-opacity" style={{ color: isDarkTheme ? '#d1d5db' : theme.textSecondary }}>{t('nav.help')}</Link>
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {/* Dark Mode Toggle */}
                  <button
                    onClick={() => {
                      const newScheme = scheme === 'dark' ? 'light' : 'dark'
                      handleSchemeChange(newScheme)
                    }}
                    className="p-2 rounded-full transition-colors"
                    style={{ 
                      backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`
                    }}
                    title={scheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  >
                    {scheme === 'dark' ? (
                      <Sun className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <Moon className="w-5 h-5" style={{ color: theme.textSecondary }} />
                    )}
                  </button>
                  <Link href="/customer/dashboard"><Button className="text-white" style={{ backgroundColor: theme.accent }}><User className="w-4 h-4 mr-2" />{t('nav.dashboard')}</Button></Link>
                  <div className="relative group">
                    <button className="flex items-center space-x-2 py-2" style={{ color: isDarkTheme ? '#d1d5db' : theme.textSecondary }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.accent }}><span className="text-white text-sm font-medium">{user?.name?.charAt(0).toUpperCase()}</span></div>
                      <span className="font-medium">{user?.name?.split(' ')[0]}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-48 rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50" style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}>
                      <div className="py-2">
                        <Link href="/customer/dashboard" className="flex items-center px-4 py-2 hover:opacity-80" style={{ color: theme.textSecondary }}><User className="w-4 h-4 mr-3" />{t('nav.dashboard')}</Link>
                        <Link href="/customer/orders" className="flex items-center px-4 py-2 hover:opacity-80" style={{ color: theme.textSecondary }}><ShoppingBag className="w-4 h-4 mr-3" />{t('nav.myOrders')}</Link>
                        <Link href="/customer/addresses" className="flex items-center px-4 py-2 hover:opacity-80" style={{ color: theme.textSecondary }}><MapPin className="w-4 h-4 mr-3" />{t('nav.addresses')}</Link>
                        <hr style={{ borderColor: theme.border }} className="my-2" />
                        <button onClick={() => { useAuthStore.getState().logout(); window.location.href = '/' }} className="flex items-center w-full px-4 py-2 text-red-500 hover:bg-red-50/10"><LogOut className="w-4 h-4 mr-3" />{t('nav.logout')}</button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  {/* Dark Mode Toggle */}
                  <button
                    onClick={() => {
                      const newScheme = scheme === 'dark' ? 'light' : 'dark'
                      handleSchemeChange(newScheme)
                    }}
                    className="p-2 rounded-full transition-colors"
                    style={{ 
                      backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      border: `1px solid ${isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`
                    }}
                    title={scheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  >
                    {scheme === 'dark' ? (
                      <Sun className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <Moon className="w-5 h-5" style={{ color: theme.textSecondary }} />
                    )}
                  </button>
                  <Link href="/auth/login"><Button variant="outline" style={{ borderColor: theme.accent, color: theme.accentText }}>{t('nav.login')}</Button></Link>
                  <Button className="text-white" style={{ backgroundColor: theme.accent }} onClick={onBookNow}>{t('nav.bookNow')}</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-0 overflow-hidden transition-colors duration-300" style={{ backgroundColor: theme.heroBg }}>
        <div className="container mx-auto px-4 relative z-10">
          <HeroCarousel isAuthenticated={isAuthenticated} user={user} onBookNow={onBookNow} colors={colors} t={t} theme={theme} />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 transition-colors duration-300" style={{ backgroundColor: theme.pageBg }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="font-semibold mb-2" style={{ color: theme.accentText }}>{t('process.subtitle')}</p>
            <h2 className="text-4xl font-bold mb-4" style={{ color: theme.textPrimary }}>{t('process.title')}</h2>
            <p className="font-semibold max-w-3xl mx-auto" style={{ color: theme.textSecondary }}>{t('about.desc1')}</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {steps.map((step, idx) => (
              <div key={idx} className="text-center group">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-[-28px] relative z-10 shadow-lg border-4" style={{ backgroundColor: theme.accent, borderColor: theme.cardBg }}>
                  <span className="text-xl font-bold text-white">{step.num}</span>
                </div>
                <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group-hover:-translate-y-1" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}>
                  <div className="h-44 overflow-hidden">
                    <img src={step.img} alt={step.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5 pt-4">
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: theme.accentLight, border: `1px solid ${theme.border}` }}>
                      <step.icon className="w-5 h-5" style={{ color: theme.accent }} />
                    </div>
                    <h3 className="text-lg font-semibold mb-1" style={{ color: theme.textPrimary }}>{step.title}</h3>
                    <p className="font-medium text-sm" style={{ color: theme.textSecondary }}>{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-2xl p-8" style={{ backgroundColor: theme.sectionBg }}>
              <h3 className="text-2xl font-bold mb-6" style={{ color: theme.textPrimary }}>{t('original.whyChoose.title')}</h3>
              <div className="space-y-4">
                {whyChooseUs.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-4 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: theme.cardBg }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.accent }}><item.icon className="w-5 h-5 text-white" /></div>
                    <span className="font-medium" style={{ color: theme.textPrimary }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden min-h-[450px]">
              <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover"><source src="/images/pricing.mp4" type="video/mp4" /></video>
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/85 to-gray-800/90"></div>
              <div className="relative z-10 p-8 h-full flex flex-col justify-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg" style={{ backgroundColor: theme.accent }}><Sparkles className="w-8 h-8 text-white" /></div>
                <h3 className="text-3xl font-bold text-white mb-4">{t('original.cta.readyTitle')}</h3>
                <p className="text-gray-200 text-lg mb-4">{t('original.cta.joinCustomers')}</p>
                <ul className="space-y-2 mb-6">
                  {[t('original.cta.freePickup'), t('original.cta.turnaround'), t('original.cta.satisfaction')].map((item, idx) => (
                    <li key={idx} className="flex items-center text-gray-200"><CheckCircle className="w-5 h-5 mr-2" style={{ color: theme.accent }} />{item}</li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="text-white shadow-lg" style={{ backgroundColor: theme.accent }} onClick={onBookNow}><Truck className="w-5 h-5 mr-2" />{t('original.cta.bookNewOrder')}</Button>
                  <Link href="https://wa.me/919876543210" target="_blank"><Button size="lg" className="bg-green-500 hover:bg-green-600 text-white shadow-lg"><Phone className="w-5 h-5 mr-2" />{t('original.cta.chatWhatsApp')}</Button></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Services Grid */}
      <section id="services" className="py-20 transition-colors duration-300" style={{ backgroundColor: theme.sectionBg }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="font-semibold mb-2" style={{ color: theme.accentText }}>{t('original.services.sectionTitle')}</p>
            <h2 className="text-4xl font-bold mb-4" style={{ color: theme.textPrimary }}>{t('original.services.sectionSubtitle')}</h2>
            <p className="font-semibold max-w-4xl mx-auto" style={{ color: theme.textSecondary }}>{t('original.services.sectionDesc')}</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            {services.map((service, idx) => (
              <div key={idx} className="rounded-xl p-6 hover:shadow-lg transition-all text-center" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}>
                <div className="mb-4 w-16 h-16 rounded-xl flex items-center justify-center mx-auto" style={{ backgroundColor: theme.accentLight }}><service.icon className="w-8 h-8" style={{ color: theme.accent }} /></div>
                <h3 className="text-base font-semibold mb-2" style={{ color: theme.textPrimary }}>{service.title}</h3>
                <p className="text-sm mb-4 min-h-[40px]" style={{ color: theme.textSecondary }}>{service.desc}</p>
                <Button size="sm" className="text-white px-6" style={{ backgroundColor: theme.accent }} onClick={onBookNow}>Book Now</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scroll Banner with Gallery */}
      <ScrollBannerSection isAuthenticated={isAuthenticated} onGalleryVisible={handleGalleryVisible} colors={colors} themeColor={themeColor} onBookNow={onBookNow} />

      {/* Testimonials */}
      <section className="py-20 transition-colors duration-300" style={{ backgroundColor: theme.sectionBgAlt }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="font-semibold mb-2" style={{ color: theme.accentText }}>{t('original.testimonials.subtitle')}</p>
            <h2 className="text-3xl font-bold" style={{ color: theme.textPrimary }}>{t('testimonials.title')}</h2>
          </div>
          <TestimonialsCarousel colors={colors} theme={theme} />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 transition-colors duration-300" style={{ backgroundColor: theme.footerBg }}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.accent }}><Sparkles className="w-5 h-5 text-white" /></div>
                <span className="text-xl font-bold" style={{ color: theme.footerText }}>LaundryPro</span>
              </div>
              <p className="text-sm" style={{ color: `${theme.footerText}99` }}>{t('footer.desc')}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: theme.footerText }}>{t('footer.services')}</h4>
              <ul className="space-y-2 text-sm" style={{ color: `${theme.footerText}99` }}>
                <li><Link href="/services" className="hover:opacity-80">{t('services.washFold')}</Link></li>
                <li><Link href="/services" className="hover:opacity-80">{t('services.dryCleaning')}</Link></li>
                <li><Link href="/services" className="hover:opacity-80">{t('original.footer.ironing')}</Link></li>
                <li><Link href="/services" className="hover:opacity-80">{t('original.footer.premiumServices')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: theme.footerText }}>{t('original.footer.company')}</h4>
              <ul className="space-y-2 text-sm" style={{ color: `${theme.footerText}99` }}>
                <li><Link href="/pricing" className="hover:opacity-80">{t('nav.pricing')}</Link></li>
                <li><Link href="/help" className="hover:opacity-80">{t('nav.help')}</Link></li>
                <li><Link href="/help" className="hover:opacity-80">{t('footer.contact')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: theme.footerText }}>{t('original.footer.contact')}</h4>
              <ul className="space-y-2 text-sm" style={{ color: `${theme.footerText}99` }}>
                <li className="flex items-center gap-2"><Phone className="w-4 h-4" />+91 98765 43210</li>
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" />support@laundrypro.com</li>
              </ul>
              <div className="flex gap-3 mt-4">
                <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-colors" style={{ backgroundColor: `${theme.footerText}20`, color: theme.footerText }}><Instagram className="w-4 h-4" /></a>
                <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-colors" style={{ backgroundColor: `${theme.footerText}20`, color: theme.footerText }}><Facebook className="w-4 h-4" /></a>
                <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-colors" style={{ backgroundColor: `${theme.footerText}20`, color: theme.footerText }}><Twitter className="w-4 h-4" /></a>
              </div>
            </div>
          </div>
          <div className="pt-8 text-center text-sm" style={{ borderTop: `1px solid ${theme.footerText}20`, color: `${theme.footerText}70` }}>
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>

      {/* Settings Panel */}
      <SettingsPanel 
        themeColor={themeColor}
        currentLanguage={language}
        currentScheme={scheme}
        currentTemplate={currentTemplate}
        onColorChange={onColorChange}
        onLanguageChange={onLanguageChange}
        onSchemeChange={handleSchemeChange}
        onTemplateChange={onTemplateChange}
      />
    </div>
  )
}
