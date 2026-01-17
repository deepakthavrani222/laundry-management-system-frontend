'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Phone, Mail, Clock, Truck, Sparkles, CheckCircle, Shield, Award, Zap, Star,
  Instagram, Facebook, Twitter, Linkedin, Youtube, MapPin, ChevronLeft, ChevronRight, Package, Shirt, Waves,
  User, LogOut, ShoppingBag, ChevronDown, Settings, Sun, Moon, X
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { ThemeColor } from '../ThemeCustomizer'
import { Language, getTranslation } from '@/lib/translations'
import { useAuthStore } from '@/store/authStore'
import TemplateHeader from '@/components/layout/TemplateHeader'
import { useLanguage } from '@/hooks/useLanguage'

interface FreshSpinTemplateProps {
  themeColor: ThemeColor
  language?: Language
  isAuthenticated: boolean
  onBookNow: () => void
  onColorChange?: (color: ThemeColor) => void
  onLanguageChange?: (language: Language) => void
  onTemplateChange?: (template: string) => void
  currentTemplate?: string
  isTenantPage?: boolean
  user?: any
  tenantName?: string
  tenantLogo?: string
  tenancyId?: string
  tenantBusinessName?: string
  tenantTagline?: string
  tenantSlogan?: string
  tenantSocialMedia?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
    youtube?: string
    whatsapp?: string
  }
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
  testimonialBg: string
  navBg: string
  footerBg: string
  footerText: string
}

// Light Mode Palettes - Clean & Professional
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
    testimonialBg: '#e0f2f1',
    navBg: '#14b8a6',
    footerBg: '#134e4a',
    footerText: '#ffffff',
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
    testimonialBg: '#dbeafe',
    navBg: '#3b82f6',
    footerBg: '#1e3a8a',
    footerText: '#ffffff',
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
    testimonialBg: '#fce7f3',
    navBg: '#8b5cf6',
    footerBg: '#581c87',
    footerText: '#ffffff',
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
    testimonialBg: '#ffedd5',
    navBg: '#f97316',
    footerBg: '#9a3412',
    footerText: '#ffffff',
  },
}

// Dark Mode Palettes - Rich & Elegant
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
    testimonialBg: '#1e293b',
    navBg: '#14b8a6',
    footerBg: '#020617',
    footerText: '#f1f5f9',
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
    testimonialBg: '#1e293b',
    navBg: '#3b82f6',
    footerBg: '#020617',
    footerText: '#f1f5f9',
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
    testimonialBg: '#2d1a2d',
    navBg: '#8b5cf6',
    footerBg: '#0a0510',
    footerText: '#fdf4ff',
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
    testimonialBg: '#292018',
    navBg: '#f97316',
    footerBg: '#0c0a09',
    footerText: '#fef3c7',
  },
}

// Get theme based on scheme mode
const getThemeColors = (colorName: ThemeColor, scheme: SchemeMode): ThemeColors => {
  if (scheme === 'dark') return darkPalettes[colorName]
  if (scheme === 'light') return lightPalettes[colorName]
  // Auto - check system preference
  if (typeof window !== 'undefined') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? darkPalettes[colorName] : lightPalettes[colorName]
  }
  return lightPalettes[colorName]
}

// Hero Carousel with Infinite Smooth Sliding Animation
function HeroCarousel({ onBookNow, t, theme, tenantTagline }: { onBookNow: () => void; t: (key: string) => string; theme: ThemeColors; tenantTagline?: string }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [translateX, setTranslateX] = useState(0)
  
  const slides = [
    {
      image: '/images/hero-slide-1.jpg',
      title: t('hero.title'),
      subtitle: t('hero.badge'),
    },
    {
      image: '/images/heroslide2.jpg',
      title: t('services.dryCleaning'),
      subtitle: t('services.dryCleaningDesc'),
    },
    {
      image: '/images/hero-slide-3.jpg',
      title: t('about.title'),
      subtitle: t('about.desc1'),
    },
  ]

  // Create extended slides array for infinite effect (clone first and last)
  const extendedSlides = [slides[slides.length - 1], ...slides, slides[0]]

  // Auto-slide every 4 seconds with smooth infinite scroll
  useEffect(() => {
    const timer = setInterval(() => {
      goToNext()
    }, 4000)
    return () => clearInterval(timer)
  }, [currentSlide])

  // Handle infinite loop transition
  useEffect(() => {
    if (isTransitioning) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false)
        // Reset position without animation when reaching clone slides
        if (currentSlide >= slides.length) {
          setCurrentSlide(0)
          setTranslateX(100) // Jump to real first slide
        } else if (currentSlide < 0) {
          setCurrentSlide(slides.length - 1)
          setTranslateX(slides.length * 100) // Jump to real last slide
        }
      }, 700) // Match transition duration
      return () => clearTimeout(timeout)
    }
  }, [isTransitioning, currentSlide, slides.length])

  // Update translateX when currentSlide changes
  useEffect(() => {
    setTranslateX((currentSlide + 1) * 100) // +1 because of prepended clone
  }, [currentSlide])

  const goToNext = () => {
    setIsTransitioning(true)
    setCurrentSlide((prev) => prev + 1)
  }

  const goToPrev = () => {
    setIsTransitioning(true)
    setCurrentSlide((prev) => prev - 1)
  }

  const goToSlide = (index: number) => {
    setIsTransitioning(true)
    setCurrentSlide(index)
  }

  // Get actual slide index for content display
  const actualSlideIndex = ((currentSlide % slides.length) + slides.length) % slides.length

  return (
    <section className="relative min-h-[420px] flex items-center justify-center overflow-hidden rounded-none lg:rounded-2xl mx-0 lg:mx-8">
      {/* Sliding Background Images Container */}
      <div 
        className={`absolute inset-0 flex ${isTransitioning ? 'transition-transform duration-700 ease-in-out' : ''}`}
        style={{ 
          width: `${extendedSlides.length * 100}%`,
          transform: `translateX(-${translateX / extendedSlides.length}%)`
        }}
      >
        {extendedSlides.map((slide, index) => (
          <div
            key={index}
            className="relative flex-shrink-0"
            style={{ width: `${100 / extendedSlides.length}%` }}
          >
            <img 
              src={slide.image} 
              alt={slide.title}
              className="w-full h-[420px] object-cover"
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-all"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button 
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-all"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-3xl">
        <p className="text-xl md:text-2xl font-medium mb-4 font-serif animate-fade-in" key={`subtitle-${actualSlideIndex}`}>
          {slides[actualSlideIndex].subtitle}
        </p>
        <h1 className="text-4xl md:text-6xl font-bold mb-8 font-serif leading-tight" key={`title-${actualSlideIndex}`}>
          {slides[actualSlideIndex].title}
        </h1>
        
        {/* Tagline Display */}
        {tenantTagline && (
          <p className="text-2xl md:text-3xl font-semibold mb-6 flex items-center justify-center gap-2 text-white animate-fade-in">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8" />
            {tenantTagline}
          </p>
        )}
        
        <Button 
          size="lg" 
          className="bg-white text-gray-900 hover:bg-gray-100 px-10 py-6 text-lg rounded-full font-semibold"
          onClick={onBookNow}
        >
          {t('nav.bookNow')}
        </Button>
      </div>

      {/* Slide Indicators with Progress Animation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-3 rounded-full transition-all overflow-hidden ${
              actualSlideIndex === index 
                ? 'w-10' 
                : 'w-3 bg-white/50 hover:bg-white/80'
            }`}
            style={actualSlideIndex === index ? { backgroundColor: theme.accent } : {}}
          >
            {actualSlideIndex === index && (
              <div 
                className="h-full bg-white/40 animate-progress"
                style={{ 
                  animation: 'progress 4s linear infinite',
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* CSS for progress animation */}
      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 4s linear;
        }
      `}</style>
    </section>
  )
}

// Testimonials Section with Profile Images and Scrollable Reviews
function TestimonialsSection({ theme, onBookNow, t }: { theme: ThemeColors; onBookNow: () => void; t: (key: string) => string }) {
  const [activeIndex, setActiveIndex] = useState(2) // Middle one selected by default
  
  const testimonials = [
    { 
      name: 'Thomas Willimas', 
      role: t('services.washFold'),
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      review: t('about.desc1')
    },
    { 
      name: 'Leslie Alexander', 
      role: t('services.dryCleaning'),
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      review: t('about.desc1')
    },
    { 
      name: 'Darlene Robertson', 
      role: t('services.steamPress'),
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      review: t('about.desc1')
    },
    { 
      name: 'Jennifer Nguyen', 
      role: t('services.express'),
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      review: t('about.desc1')
    },
    { 
      name: 'Alex Deo', 
      role: t('services.steamPress'),
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      review: t('about.desc1')
    },
  ]

  return (
    <section 
      className="transition-colors duration-300"
      style={{ backgroundColor: theme.sectionBg, paddingTop: '4rem', paddingBottom: '4rem' }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title - on theme background */}
        <div className="text-center mb-8">
          <p className="font-medium mb-2" style={{ color: theme.accent }}>{t('testimonials.subtitle')}</p>
          <h2 className="text-2xl md:text-3xl font-bold italic" style={{ fontFamily: 'Georgia, serif', color: theme.textPrimary }}>
            {t('testimonials.title')}
          </h2>
        </div>

        {/* Grey section with profiles and testimonials */}
        <div className="rounded-t-3xl pt-8 pb-4" style={{ backgroundColor: theme.testimonialBg }}>
          {/* Profile Images Row */}
          <div className="flex justify-center items-center gap-3 mb-6 -mt-16">
            {testimonials.map((testimonial, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`rounded-full overflow-hidden transition-all duration-300 ${
                  activeIndex === idx 
                    ? 'w-16 h-16 ring-2 ring-offset-2 shadow-lg' 
                    : 'w-14 h-14 opacity-80 hover:opacity-100'
                }`}
                style={{ 
                  backgroundColor: theme.cardBg,
                  ringColor: activeIndex === idx ? theme.accent : 'transparent',
                }}
              >
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Scrollable Testimonials */}
          <div className="max-h-[400px] overflow-y-auto px-4 scrollbar-thin">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="text-center py-6 border-b last:border-b-0" style={{ borderColor: `${theme.accent}30` }}>
                <p className="mb-4 leading-relaxed max-w-2xl mx-auto" style={{ color: theme.textSecondary }}>
                  {testimonial.review}
                </p>
                <h4 className="font-bold text-lg" style={{ color: theme.textPrimary }}>
                  {testimonial.name}
                </h4>
                <p style={{ color: theme.accent }} className="font-medium text-sm">
                  {testimonial.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Settings Panel Component for FreshSpin - Only Language selector
function SettingsPanel({ 
  currentLanguage,
  onLanguageChange,
}: { 
  currentLanguage: Language
  onLanguageChange?: (language: Language) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { id: 'en', name: 'English', flag: '🇺🇸' },
    { id: 'es', name: 'Español', flag: '🇪🇸' },
    { id: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  ]

  return (
    <>
      {/* Settings Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-white shadow-lg rounded-l-xl p-3 hover:bg-gray-50 transition-colors border border-r-0 border-gray-200"
      >
        <Settings className="w-5 h-5 text-gray-600" style={{ animation: 'spin 3s linear infinite' }} />
      </button>

      {/* Settings Panel Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setIsOpen(false)}>
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}

      {/* Settings Panel */}
      <div 
        className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Settings</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-60px)] scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Language Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Language</h3>
            <div className="space-y-2">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => onLanguageChange?.(lang.id as Language)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    currentLanguage === lang.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className={`font-medium ${currentLanguage === lang.id ? 'text-blue-600' : 'text-gray-700'}`}>
                    {lang.name}
                  </span>
                  {currentLanguage === lang.id && (
                    <CheckCircle className="w-5 h-5 text-blue-500 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function FreshSpinTemplate({ 
  themeColor, 
  isAuthenticated, 
  onBookNow, 
  onColorChange, 
  onLanguageChange, 
  onTemplateChange, 
  currentTemplate, 
  isTenantPage = false,
  user,
  tenantName,
  tenantLogo,
  tenancyId,
  tenantBusinessName,
  tenantTagline,
  tenantSlogan,
  tenantSocialMedia,
}: FreshSpinTemplateProps) {
  // Use language hook for reactive translations
  const { language, t } = useLanguage()
  const [scheme, setScheme] = useState<SchemeMode>('light')

  // Get computed theme colors based on scheme
  const theme = getThemeColors(themeColor, scheme)
  
  // Check if dark mode
  const isDark = scheme === 'dark' || (scheme === 'auto' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

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

  const services = [
    { icon: Shirt, title: t('services.washFold'), desc: t('services.washFoldDesc') },
    { icon: Sparkles, title: t('services.dryCleaning'), desc: t('services.dryCleaningDesc') },
    { icon: Zap, title: t('services.express'), desc: t('services.expressDesc') },
    { icon: Shield, title: t('services.premiumCare'), desc: t('services.premiumCareDesc') },
  ]

  const features = [
    { icon: Clock, title: t('about.feature2'), desc: t('about.quickPickup') },
    { icon: Truck, title: t('about.feature1'), desc: t('about.noExtraCharges') },
    { icon: Award, title: t('services.qualityCare'), desc: t('services.qualityCareDesc') },
  ]

  const whyChooseUs = [
    t('whyChoose.household'),
    t('whyChoose.corporate'), 
    t('whyChoose.allItems'),
    t('whyChoose.dryCleanWashFold'),
    t('about.feature3'),
    t('services.washFold'),
  ]


  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.pageBg }}>
      {/* Shared Header Component */}
      <TemplateHeader />

      {/* Hero Banner with Carousel */}
      <div className="pt-20">
        <div className="max-w-screen-2xl mx-auto w-full relative">
          <HeroCarousel onBookNow={onBookNow} t={t} theme={theme} tenantTagline={tenantTagline} />
        </div>
      </div>

      {/* Welcome Section - 2 Columns */}
      <section 
        className="pt-16 pb-12 transition-colors duration-300"
        style={{ backgroundColor: theme.sectionBg }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left - Image with Circular Overlay */}
            <div className="relative pt-12 pl-4">
              {/* Circular Overlay Image - Top Right of Main Image */}
              <div className="absolute -top-2 right-0 lg:right-12 xl:right-20 z-10">
                <div 
                  className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden shadow-2xl"
                  style={{ border: `3px solid ${theme.accent}`, backgroundColor: theme.cardBg }}
                >
                  <img 
                    src="/images/welcome-circle.png" 
                    alt="Fresh Clothes"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Main Washing Machine Image */}
              <div className="relative">
                <img 
                  src="/images/welcome-laundry.jpg" 
                  alt="Laundry Service"
                  className="rounded-xl shadow-xl w-full max-w-md"
                />
                {/* Years Badge - Bottom Left */}
                <div 
                  className="absolute bottom-4 left-4 text-white p-3 rounded-lg shadow-2xl"
                  style={{ backgroundColor: theme.accent }}
                >
                  <div className="text-center">
                    <p className="text-2xl font-bold">10+</p>
                    <p className="text-xs">{t('about.yearsExp')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Content */}
            <div>
              <p className="font-semibold text-base mb-1 font-serif" style={{ color: theme.accentText }}>{t('about.subtitle')}</p>
              <h2 className="text-3xl font-bold mb-4 font-serif leading-tight" style={{ color: theme.textPrimary }}>
                {t('about.title')}
              </h2>
              <p className="mb-3 text-sm" style={{ color: theme.textSecondary }}>
                {t('about.desc1')}
              </p>
              <p className="mb-6 text-sm" style={{ color: theme.textSecondary }}>
                {t('about.desc2')}
              </p>

              {/* Checklist */}
              <ul className="space-y-2 mb-6">
                {whyChooseUs.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: theme.accent }} />
                    <span className="font-medium text-sm" style={{ color: theme.textPrimary }}>{item}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="text-white px-6 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: theme.accent }}
                onClick={onBookNow}
              >
                <Truck className="w-5 h-5 mr-2" />
                Schedule Pickup
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section 
        className="pt-12 pb-20 transition-colors duration-300"
        style={{ backgroundColor: theme.sectionBgAlt }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left - Content */}
            <div>
              <p className="font-semibold text-lg mb-2 font-serif" style={{ color: theme.accentText }}>{t('services.subtitle')}</p>
              <h2 className="text-4xl font-bold mb-6 font-serif leading-tight" style={{ color: theme.textPrimary }}>
                {t('services.title')}
              </h2>
              <p className="mb-8" style={{ color: theme.textSecondary }}>
                {t('about.desc1')}
              </p>

              {/* Feature Icons */}
              <div className="flex gap-8 mb-8">
                {features.map((f, idx) => (
                  <div key={idx} className="text-center">
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 border-4 shadow-lg transition-colors duration-300"
                      style={{ backgroundColor: theme.accentLight, borderColor: theme.cardBg }}
                    >
                      <f.icon className="w-8 h-8" style={{ color: theme.accent }} />
                    </div>
                    <h4 className="font-semibold" style={{ color: theme.textPrimary }}>{f.title}</h4>
                    <p className="text-sm" style={{ color: theme.textMuted }}>{f.desc}</p>
                  </div>
                ))}
              </div>

              <Button 
                size="lg" 
                className="text-white px-8 py-4 rounded-full font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: theme.accent }}
                onClick={onBookNow}
              >
                {t('hero.exploreServices')}
              </Button>
            </div>

            {/* Right - Service Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
              {services.map((service, idx) => {
                const cardColor = idx % 2 === 0 ? theme.accent : theme.accentSecondary
                return (
                  <div 
                    key={idx}
                    className="rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all cursor-pointer group"
                    style={{ backgroundColor: theme.cardBg }}
                    onClick={onBookNow}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = cardColor}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.cardBg}
                  >
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors"
                      style={{ backgroundColor: theme.accentLight }}
                    >
                      <service.icon className="w-8 h-8 group-hover:text-white transition-colors" style={{ color: theme.accent }} />
                    </div>
                    <h4 className="font-semibold mb-2 group-hover:text-white transition-colors" style={{ color: theme.textPrimary }}>{service.title}</h4>
                    <p className="text-sm group-hover:text-white/80 transition-colors" style={{ color: theme.textMuted }}>{service.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>


      {/* How It Works */}
      <section 
        className="py-20 transition-colors duration-300"
        style={{ backgroundColor: theme.sectionBg }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="font-semibold text-lg mb-2 font-serif" style={{ color: theme.accentText }}>{t('process.subtitle')}</p>
            <h2 className="text-4xl font-bold font-serif" style={{ color: theme.textPrimary }}>{t('process.title')}</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { num: '01', title: t('process.step1.title'), desc: t('process.step1.desc'), icon: Package },
              { num: '02', title: t('process.step2.title'), desc: t('process.step2.desc'), icon: Truck },
              { num: '03', title: t('process.step3.title'), desc: t('process.step3.desc'), icon: Sparkles },
              { num: '04', title: t('about.feature1'), desc: t('about.feature2'), icon: CheckCircle },
            ].map((step, idx) => (
              <div key={idx} className="text-center relative">
                {idx < 3 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5" style={{ backgroundColor: theme.border }}></div>
                )}
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10 shadow-lg"
                  style={{ backgroundColor: theme.accent }}
                >
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <span className="text-sm font-bold" style={{ color: theme.accentText }}>{step.num}</span>
                <h4 className="font-bold mt-2 mb-1" style={{ color: theme.textPrimary }}>{step.title}</h4>
                <p className="text-sm" style={{ color: theme.textMuted }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Cleaning System Section */}
      <section 
        className="py-16 relative overflow-hidden transition-colors duration-300"
        style={{ backgroundColor: theme.sectionBgAlt }}
      >
        {/* Top decorative line */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: `${theme.accent}30` }}></div>
        
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-end">
            {/* Left - Image with circular background */}
            <div className="relative">
              {/* Circular teal background */}
              <div 
                className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full -z-10"
                style={{ backgroundColor: theme.accentLight }}
              ></div>
              <img 
                src="/images/cleanstaff.jpg" 
                alt="Professional Cleaning Staff"
                className="relative z-10 max-h-[500px] w-auto object-contain"
              />
            </div>

            {/* Right - Content */}
            <div className="pb-8">
              <p className="font-semibold text-lg mb-2 italic" style={{ color: theme.accent }}>
                {t('services.subtitle')}
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 leading-tight" style={{ color: theme.textPrimary }}>
                {t('about.title')}
              </h2>
              
              {/* Description with left border */}
              <div className="border-l-4 pl-4 mb-8" style={{ borderColor: theme.accent }}>
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                  {t('about.desc1')}
                </p>
              </div>

              {/* Checklist */}
              <ul className="space-y-2 mb-8">
                {[
                  t('about.feature1'),
                  t('about.feature2'),
                  t('about.feature3'),
                  t('about.feature4'),
                  t('services.washFold'),
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" style={{ color: theme.accent }} />
                    <span className="font-medium italic" style={{ color: theme.textSecondary }}>{item}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Button 
                  size="lg" 
                  className="text-white px-8 py-5 rounded-full font-semibold hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: theme.accent }}
                  onClick={onBookNow}
                >
                  {t('nav.bookNow')}
                </Button>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${theme.accent}15` }}
                  >
                    <Phone className="w-5 h-5" style={{ color: theme.accent }} />
                  </div>
                  <span className="font-semibold" style={{ color: theme.textPrimary }}>+91 98765 43210</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection theme={theme} onBookNow={onBookNow} t={t} />

      {/* CTA Banner - Refer a Friend */}
      <section className="py-16 px-4" style={{ backgroundColor: theme.pageBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl relative min-h-[280px] flex items-center" style={{ backgroundColor: theme.footerBg }}>
            {/* Left - Image */}
            <div className="absolute left-8 lg:left-20 bottom-0 top-0 flex items-end">
              <img 
                src="/images/cta-refer.png" 
                alt="Refer a Friend"
                className="h-[300px] w-auto object-contain"
              />
            </div>
            
            {/* Decorative Bubbles */}
            <div className="absolute top-8 left-[260px] lg:left-[320px] w-6 h-6 rounded-full border-2 border-white/30"></div>
            <div className="absolute top-16 left-[300px] lg:left-[360px] w-4 h-4 rounded-full border-2 border-white/20"></div>
            <div className="absolute bottom-16 left-[220px] lg:left-[280px] w-10 h-10 rounded-full border-2 border-white/20"></div>
            <div className="absolute top-20 left-[330px] lg:left-[390px] w-3 h-3 rounded-full bg-white/10"></div>
            
            {/* Right - Content */}
            <div className="w-full py-10 px-8 lg:py-12 lg:px-16 text-center lg:text-left lg:ml-[320px] xl:ml-[380px]">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 font-serif" style={{ color: theme.footerText }}>
                {t('cta.title')} <span style={{ color: theme.accent }}>15%</span>
              </h2>
              <p className="mb-6" style={{ color: `${theme.footerText}99` }}>
                {t('cta.desc')}
              </p>
              <Button 
                size="lg" 
                className="text-white px-8 py-5 rounded-full font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: theme.accent }}
                onClick={onBookNow}
              >
                {t('cta.callNow')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section with Contact Card */}
      <section className="relative">
        <div className="max-w-screen-2xl mx-auto w-full relative">
          <div className="relative h-[400px] mx-0 lg:mx-8 rounded-none lg:rounded-2xl overflow-hidden">
            {/* Google Map Embed */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.11976397304603!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sin!4v1699000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale"
            ></iframe>

            {/* Contact Card Overlay */}
            <div 
              className="absolute top-1/2 right-8 md:right-16 -translate-y-1/2 p-6 md:p-8 rounded-lg shadow-2xl max-w-sm"
              style={{ backgroundColor: theme.footerBg }}
            >
              <h3 className="text-xl font-bold mb-3" style={{ color: theme.accent }}>{t('hero.badge')}</h3>
              <p className="text-sm mb-6" style={{ color: `${theme.footerText}99` }}>
                Professional laundry services at your doorstep
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: theme.accent }}
                  >
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm" style={{ color: theme.footerText }}>20+ Cities across India</span>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: theme.accent }}
                  >
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm" style={{ color: theme.footerText }}>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: theme.accent }}
                  >
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm" style={{ color: theme.footerText }}>support@LaundryLobby.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 transition-colors duration-300" style={{ backgroundColor: theme.footerBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* About */}
            <div>
              <h3 className="text-xl font-bold mb-6 pb-4 border-b-2 border-b-transparent relative" style={{ color: theme.footerText }}>
                {tenantBusinessName || tenantName || t('about.subtitle')}
                <span className="absolute bottom-0 left-0 w-16 h-0.5" style={{ backgroundColor: theme.accent }}></span>
              </h3>
              <p className="mb-6" style={{ color: `${theme.footerText}99` }}>
                {tenantSlogan || t('footer.desc')}
              </p>
              <div className="flex gap-3">
                {tenantSocialMedia?.facebook && (
                  <a 
                    href={tenantSocialMedia.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity" 
                    style={{ backgroundColor: `${theme.footerText}20`, color: theme.footerText }}
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {tenantSocialMedia?.twitter && (
                  <a 
                    href={tenantSocialMedia.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity" 
                    style={{ backgroundColor: `${theme.footerText}20`, color: theme.footerText }}
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {tenantSocialMedia?.linkedin && (
                  <a 
                    href={tenantSocialMedia.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity" 
                    style={{ backgroundColor: `${theme.footerText}20`, color: theme.footerText }}
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {tenantSocialMedia?.instagram && (
                  <a 
                    href={tenantSocialMedia.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity" 
                    style={{ backgroundColor: `${theme.footerText}20`, color: theme.footerText }}
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {tenantSocialMedia?.youtube && (
                  <a 
                    href={tenantSocialMedia.youtube} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity" 
                    style={{ backgroundColor: `${theme.footerText}20`, color: theme.footerText }}
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
                {tenantSocialMedia?.whatsapp && (
                  <a 
                    href={`https://wa.me/${tenantSocialMedia.whatsapp.replace(/\D/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity" 
                    style={{ backgroundColor: '#25D366', color: '#ffffff' }}
                  >
                    <Phone className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-xl font-bold mb-6 pb-4 border-b-2 border-b-transparent relative" style={{ color: theme.footerText }}>
                {t('footer.services')}
                <span className="absolute bottom-0 left-0 w-16 h-0.5" style={{ backgroundColor: theme.accent }}></span>
              </h3>
              <ul className="space-y-3" style={{ color: `${theme.footerText}99` }}>
                <li><Link href="/services" className="hover:opacity-80 transition-opacity" style={{ color: `${theme.footerText}99` }}>{t('services.washFold')}</Link></li>
                <li><Link href="/services" className="hover:opacity-80 transition-opacity" style={{ color: `${theme.footerText}99` }}>{t('services.dryCleaning')}</Link></li>
                <li><Link href="/services" className="hover:opacity-80 transition-opacity" style={{ color: `${theme.footerText}99` }}>{t('services.steamPress')}</Link></li>
                <li><Link href="/services" className="hover:opacity-80 transition-opacity" style={{ color: `${theme.footerText}99` }}>{t('services.express')}</Link></li>
                <li><Link href="/services" className="hover:opacity-80 transition-opacity" style={{ color: `${theme.footerText}99` }}>{t('about.feature3')}</Link></li>
                <li><Link href="/pricing" className="hover:opacity-80 transition-opacity" style={{ color: `${theme.footerText}99` }}>{t('nav.pricing')}</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-xl font-bold mb-6 pb-4 border-b-2 border-b-transparent relative" style={{ color: theme.footerText }}>
                {t('footer.contact')}
                <span className="absolute bottom-0 left-0 w-16 h-0.5" style={{ backgroundColor: theme.accent }}></span>
              </h3>
              <ul className="space-y-4" style={{ color: `${theme.footerText}99` }}>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5" />
                  +91 98765 43210
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5" />
                  support@LaundryLobby.com
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" />
                  {t('coverage.desc')}
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="w-5 h-5" />
                  {t('about.feature2')}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="py-4" style={{ backgroundColor: theme.accent }}>
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-between items-center text-white">
              <p>{t('footer.copyright')}</p>
              <p>{t('hero.badge')}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}