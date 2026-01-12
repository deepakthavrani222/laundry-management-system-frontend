'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Phone, Mail, Clock, Truck, Sparkles, CheckCircle, Shield, Award, Zap, Star,
  Instagram, Facebook, Twitter, MapPin, ChevronLeft, ChevronRight, Package, Shirt,
  Users, Building2, ArrowRight, Play, User, LogOut, ShoppingBag, ChevronDown,
  Settings, Sun, Moon, Monitor, RotateCcw, X
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { ThemeColor } from '../ThemeCustomizer'
import { Language, getTranslation } from '@/lib/translations'
import { useAuthStore } from '@/store/authStore'
import { useLanguage } from '@/hooks/useLanguage'

interface LaundryMasterTemplateProps {
  themeColor: ThemeColor
  language?: Language
  isAuthenticated: boolean
  onBookNow: () => void
  onColorChange?: (color: ThemeColor) => void
  onLanguageChange?: (language: Language) => void
  onTemplateChange?: (template: string) => void
  currentTemplate?: string
  isTenantPage?: boolean
  tenantName?: string
}

// Professional Color Palettes - Harmonious combinations
type SchemeMode = 'light' | 'dark' | 'auto'

interface ThemeColors {
  // Base colors
  pageBg: string
  cardBg: string
  headerBg: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  border: string
  // Accent colors (from color palette)
  accent: string
  accentSecondary: string  // Secondary accent for gradients/alternating
  accentHover: string
  accentLight: string
  accentText: string
  // Section backgrounds
  sectionBg: string
  sectionBgAlt: string
  testimonialBg: string
  // Footer
  footerBg: string
  footerText: string
}

// Light mode palettes - soft, clean, professional
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
    accentSecondary: '#06b6d4', // Cyan
    accentHover: '#0d9488',
    accentLight: '#ccfbf1',
    accentText: '#14b8a6',
    sectionBg: '#f0fdfa',
    sectionBgAlt: '#e6fffa',
    testimonialBg: '#e0f2f1',
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
    accentSecondary: '#6366f1', // Indigo
    accentHover: '#2563eb',
    accentLight: '#dbeafe',
    accentText: '#3b82f6',
    sectionBg: '#eff6ff',
    sectionBgAlt: '#dbeafe',
    testimonialBg: '#dbeafe',
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
    accentSecondary: '#ec4899', // Pink
    accentHover: '#7c3aed',
    accentLight: '#fce7f3', // Pink light
    accentText: '#8b5cf6',
    sectionBg: '#fdf4ff',
    sectionBgAlt: '#fce7f3',
    testimonialBg: '#fce7f3',
    footerBg: '#831843', // Pink dark
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
    accentSecondary: '#ef4444', // Red
    accentHover: '#ea580c',
    accentLight: '#ffedd5',
    accentText: '#f97316',
    sectionBg: '#fff7ed',
    sectionBgAlt: '#ffedd5',
    testimonialBg: '#ffedd5',
    footerBg: '#9a3412',
    footerText: '#ffffff',
  },
}

// Dark mode palettes - rich, elegant, easy on eyes
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
    accentSecondary: '#22d3ee', // Cyan
    accentHover: '#14b8a6',
    accentLight: '#134e4a',
    accentText: '#2dd4bf',
    sectionBg: '#1e293b',
    sectionBgAlt: '#0f172a',
    testimonialBg: '#1e293b',
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
    accentSecondary: '#818cf8', // Indigo
    accentHover: '#3b82f6',
    accentLight: '#1e3a8a',
    accentText: '#60a5fa',
    sectionBg: '#1e293b',
    sectionBgAlt: '#0f172a',
    testimonialBg: '#1e293b',
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
    accentSecondary: '#f472b6', // Pink
    accentHover: '#8b5cf6',
    accentLight: '#701a75',
    accentText: '#f472b6', // Pink as main text accent
    sectionBg: '#2d1a2d',
    sectionBgAlt: '#1a0a1a',
    testimonialBg: '#2d1a2d',
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
    accentSecondary: '#f87171', // Red
    accentHover: '#f97316',
    accentLight: '#7c2d12',
    accentText: '#fb923c',
    sectionBg: '#292018',
    sectionBgAlt: '#1c1410',
    testimonialBg: '#292018',
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

const colorClasses = {
  teal: { 
    primary: 'bg-teal-500', hover: 'hover:bg-teal-600', text: 'text-teal-500', 
    light: 'bg-teal-50', border: 'border-teal-500', gradient: 'from-teal-500 to-cyan-500',
    darkGradient: 'from-teal-600 to-teal-800',
    accent: '#14b8a6', sectionBg: 'bg-teal-50/50', sectionBgAlt: 'bg-teal-100/40',
    testimonialBg: '#e0f2f1', darkBg: '#134e4a', footerBg: '#0f2928'
  },
  blue: { 
    primary: 'bg-blue-500', hover: 'hover:bg-blue-600', text: 'text-blue-500', 
    light: 'bg-blue-50', border: 'border-blue-500', gradient: 'from-blue-500 to-indigo-500',
    darkGradient: 'from-blue-600 to-blue-800',
    accent: '#3b82f6', sectionBg: 'bg-blue-50/50', sectionBgAlt: 'bg-blue-100/40',
    testimonialBg: '#dbeafe', darkBg: '#1e3a5f', footerBg: '#0f172a'
  },
  purple: { 
    primary: 'bg-purple-500', hover: 'hover:bg-purple-600', text: 'text-purple-500', 
    light: 'bg-purple-50', border: 'border-purple-500', gradient: 'from-purple-500 to-pink-500',
    darkGradient: 'from-purple-600 to-purple-800',
    accent: '#8b5cf6', sectionBg: 'bg-purple-50/50', sectionBgAlt: 'bg-purple-100/40',
    testimonialBg: '#ede9fe', darkBg: '#3b1f5f', footerBg: '#1e1033'
  },
  orange: { 
    primary: 'bg-orange-500', hover: 'hover:bg-orange-600', text: 'text-orange-500', 
    light: 'bg-orange-50', border: 'border-orange-500', gradient: 'from-orange-500 to-red-500',
    darkGradient: 'from-orange-600 to-orange-800',
    accent: '#f97316', sectionBg: 'bg-orange-50/50', sectionBgAlt: 'bg-orange-100/40',
    testimonialBg: '#ffedd5', darkBg: '#7c2d12', footerBg: '#431407'
  },
}

// Animated Counter Component
function AnimatedCounter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return
    let start = 0
    const increment = end / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [isVisible, end, duration])

  return <div ref={ref}>{count}{suffix}</div>
}

// Modern Testimonials Section
function TestimonialsCarousel({ colors }: { colors: any }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const testimonials = [
    { 
      name: 'Thomas Williams', 
      role: 'Restroom Cleaner',
      review: 'The best dry clean company ever, they always come on time, very easy to place your order any time in the day, very trusted company. I would recommend digital dry clean for everyone.', 
      rating: 5, 
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' 
    },
    { 
      name: 'Leslie Alexander', 
      role: 'Waste Collector',
      review: 'Excellent service! My clothes always come back fresh and perfectly pressed. The pickup and delivery is so convenient for my busy schedule.', 
      rating: 5, 
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face' 
    },
    { 
      name: 'Darlene Robertson', 
      role: 'Laundry Attendant',
      review: 'I have been using this service for 2 years now. Their quality is consistent and prices are very reasonable. Highly recommended!', 
      rating: 5, 
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' 
    },
    { 
      name: 'Jennifer Nguyen', 
      role: 'Commercial Cleaner',
      review: 'Amazing experience every time! They handle my delicate fabrics with such care. The app makes booking so easy.', 
      rating: 5, 
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' 
    },
    { 
      name: 'Alex Deo', 
      role: 'Laundry Attendant',
      review: 'Professional service with great attention to detail. My suits always look brand new after their dry cleaning.', 
      rating: 5, 
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' 
    },
  ]
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentIndex((prev) => (prev + 1) % testimonials.length), 5000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Images Row */}
      <div className="flex justify-center items-center gap-3 mb-10">
        {testimonials.map((t, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`rounded-full overflow-hidden transition-all duration-300 ${
              currentIndex === i 
                ? 'w-16 h-16 ring-2 ring-offset-2 shadow-lg' 
                : 'w-12 h-12 opacity-60 hover:opacity-100'
            }`}
            style={{ 
              ringColor: currentIndex === i ? colors.accent || '#3b82f6' : 'transparent',
            }}
          >
            <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      
      {/* Testimonial Content */}
      <div className="text-center bg-gray-50 rounded-2xl p-8 md:p-12">
        <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
          {testimonials[currentIndex].review}
        </p>
        <h4 className="font-bold text-gray-800 text-xl mb-1">
          {testimonials[currentIndex].name}
        </h4>
        <p className={`${colors.text} font-medium`}>
          {testimonials[currentIndex].role}
        </p>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-2 rounded-full transition-all ${
              currentIndex === i 
                ? `w-8 ${colors.primary}` 
                : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// Settings Panel Component
function SettingsPanel({ 
  colors, 
  themeColor,
  currentLanguage,
  currentScheme,
  onColorChange,
  onLanguageChange,
  onSchemeChange,
  onTemplateChange,
  currentTemplate
}: { 
  colors: any
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
      {/* Settings Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-white shadow-lg rounded-l-xl p-3 hover:bg-gray-50 transition-colors border border-r-0 border-gray-200"
      >
        <Settings className="w-5 h-5 text-gray-600 animate-spin-slow" style={{ animation: 'spin 3s linear infinite' }} />
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
          {/* Scheme Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Scheme</h3>
            <div className="flex gap-2">
              <button
                onClick={() => onSchemeChange?.('auto')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 transition-all ${
                  currentScheme === 'auto' 
                    ? 'border-blue-500 bg-blue-50 text-blue-600' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span className="text-sm font-medium">Auto</span>
              </button>
              <button
                onClick={() => onSchemeChange?.('dark')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 transition-all ${
                  currentScheme === 'dark' 
                    ? 'border-blue-500 bg-blue-50 text-blue-600' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span className="text-sm font-medium">Dark</span>
              </button>
              <button
                onClick={() => onSchemeChange?.('light')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 transition-all ${
                  currentScheme === 'light' 
                    ? 'border-blue-500 bg-blue-50 text-blue-600' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span className="text-sm font-medium">Light</span>
              </button>
            </div>
          </div>

          {/* Color Customizer Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Color Customizer</h3>
              <button 
                onClick={resetColors}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Reset to default"
              >
                <RotateCcw className="w-4 h-4 text-blue-500" />
              </button>
            </div>
            <div className="flex gap-3 flex-wrap">
              {/* Teal */}
              <button
                onClick={() => onColorChange?.('teal')}
                className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all hover:scale-110 ${
                  themeColor === 'teal' ? 'border-gray-800 ring-2 ring-offset-2 ring-teal-400' : 'border-gray-200'
                }`}
                title="Teal Theme"
              >
                <div className="w-full h-full flex">
                  <div className="w-1/2 h-full bg-teal-500" />
                  <div className="w-1/2 h-full bg-cyan-400" />
                </div>
              </button>
              
              {/* Blue */}
              <button
                onClick={() => onColorChange?.('blue')}
                className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all hover:scale-110 ${
                  themeColor === 'blue' ? 'border-gray-800 ring-2 ring-offset-2 ring-blue-400' : 'border-gray-200'
                }`}
                title="Blue Theme"
              >
                <div className="w-full h-full flex">
                  <div className="w-1/2 h-full bg-blue-500" />
                  <div className="w-1/2 h-full bg-indigo-500" />
                </div>
              </button>
              
              {/* Purple */}
              <button
                onClick={() => onColorChange?.('purple')}
                className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all hover:scale-110 ${
                  themeColor === 'purple' ? 'border-gray-800 ring-2 ring-offset-2 ring-purple-400' : 'border-gray-200'
                }`}
                title="Purple Theme"
              >
                <div className="w-full h-full flex">
                  <div className="w-1/2 h-full bg-purple-500" />
                  <div className="w-1/2 h-full bg-pink-500" />
                </div>
              </button>
              
              {/* Orange */}
              <button
                onClick={() => onColorChange?.('orange')}
                className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all hover:scale-110 ${
                  themeColor === 'orange' ? 'border-gray-800 ring-2 ring-offset-2 ring-orange-400' : 'border-gray-200'
                }`}
                title="Orange Theme"
              >
                <div className="w-full h-full flex">
                  <div className="w-1/2 h-full bg-orange-500" />
                  <div className="w-1/2 h-full bg-red-400" />
                </div>
              </button>
            </div>
            
            {/* Current Color Label */}
            <p className="text-xs text-gray-500 mt-2 capitalize">
              Current: {themeColor}
            </p>
          </div>

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

          {/* Landing Page Selector */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Landing Page</h3>
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onTemplateChange?.(template.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    currentTemplate === template.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className={`font-medium ${currentTemplate === template.id ? 'text-blue-600' : 'text-gray-700'}`}>
                    {template.name}
                  </span>
                  {currentTemplate === template.id && (
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

export default function LaundryMasterTemplate({ themeColor, isAuthenticated, onBookNow, onColorChange, onLanguageChange, onTemplateChange, currentTemplate, isTenantPage, tenantName }: LaundryMasterTemplateProps) {
  // Use language hook for reactive translations
  const { language, t } = useLanguage()
  const colors = colorClasses[themeColor]
  const [isScrolled, setIsScrolled] = useState(false)
  const [scheme, setScheme] = useState<SchemeMode>('light')
  
  // Handle logout - redirect to tenant page if on tenant, otherwise to home
  const handleLogout = () => {
    useAuthStore.getState().logout()
    if (isTenantPage && tenantName) {
      const pathParts = window.location.pathname.split('/')
      if (pathParts.length > 1 && pathParts[1]) {
        window.location.href = `/${pathParts[1]}`
        return
      }
    }
    window.location.href = '/'
  }
  
  // Get login URL with tenant redirect if on tenant page
  const getLoginUrl = () => {
    if (isTenantPage) {
      const pathParts = window.location.pathname.split('/')
      if (pathParts.length > 1 && pathParts[1]) {
        return `/auth/login?redirect=${encodeURIComponent(`/${pathParts[1]}`)}`
      }
    }
    return '/auth/login'
  }
  
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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const processSteps = [
    { icon: Package, title: t('process.step1.title'), desc: t('process.step1.desc') },
    { icon: Sparkles, title: t('process.step2.title'), desc: t('process.step2.desc') },
    { icon: Truck, title: t('process.step3.title'), desc: t('process.step3.desc') },
  ]

  const services = [
    { title: t('services.washFold'), desc: t('services.washFoldDesc'), image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&q=80', icon: Shirt },
    { title: t('services.dryCleaning'), desc: t('services.dryCleaningDesc'), image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&q=80', icon: Sparkles },
    { title: t('services.steamPress'), desc: t('services.steamPressDesc'), image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=600&q=80', icon: Zap },
    { title: t('services.express'), desc: t('services.expressDesc'), image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', icon: Clock },
  ]

  const stats = [
    { value: 50000, suffix: '+', label: t('stats.customers') },
    { value: 20, suffix: '+', label: t('stats.cities') },
    { value: 98, suffix: '%', label: t('stats.satisfaction') },
  ]

  // Dynamic styles based on theme
  const isDark = scheme === 'dark' || (scheme === 'auto' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.pageBg }}>
      {/* Fixed Header */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 shadow-sm py-4 transition-colors duration-300"
        style={{ backgroundColor: theme.headerBg, borderBottom: `1px solid ${theme.border}` }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ border: `2px solid ${theme.accent}` }}
              >
                <Sparkles className="w-5 h-5" style={{ color: theme.accent }} />
              </div>
              <span className="text-xl font-bold" style={{ color: theme.textPrimary }}>LaundryPro</span>
            </div>

            {/* Navigation - Center */}
            <nav className="hidden lg:flex items-center gap-8">
              {[
                { label: t('nav.home'), href: '/' },
                { label: t('nav.services'), href: '/services' },
                { label: t('nav.pricing'), href: '/pricing' },
                { label: t('nav.help'), href: '/help' },
              ].map((item) => (
                <Link 
                  key={item.label} 
                  href={item.href}
                  className="font-medium transition-colors hover:opacity-80"
                  style={{ color: theme.textSecondary }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {isAuthenticated ? (
                <>
                  <Button 
                    className="px-5 py-2 rounded-md font-medium hidden sm:flex text-white transition-colors"
                    style={{ backgroundColor: theme.accent }}
                    onClick={onBookNow}
                  >
                    {t('hero.schedulePickup')}
                  </Button>
                  <div className="relative group">
                    <button className="flex items-center gap-2 py-2" style={{ color: theme.textSecondary }}>
                      <div 
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: theme.accent }}
                      >
                        <span className="text-white text-sm font-medium">
                          {useAuthStore.getState().user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div 
                      className="absolute right-0 top-full mt-1 w-48 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50"
                      style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
                    >
                      <div className="py-2">
                        <Link href="/customer/dashboard" className="flex items-center px-4 py-2 hover:opacity-80" style={{ color: theme.textSecondary }}>
                          <User className="w-4 h-4 mr-3" />{t('nav.dashboard')}
                        </Link>
                        <Link href="/customer/orders" className="flex items-center px-4 py-2 hover:opacity-80" style={{ color: theme.textSecondary }}>
                          <ShoppingBag className="w-4 h-4 mr-3" />{t('nav.myOrders')}
                        </Link>
                        <Link href="/customer/addresses" className="flex items-center px-4 py-2 hover:opacity-80" style={{ color: theme.textSecondary }}>
                          <MapPin className="w-4 h-4 mr-3" />{t('nav.addresses')}
                        </Link>
                        <hr style={{ borderColor: theme.border }} className="my-2" />
                        <button 
                          onClick={handleLogout} 
                          className="flex items-center w-full px-4 py-2 text-red-500 hover:bg-red-50/10"
                        >
                          <LogOut className="w-4 h-4 mr-3" />{t('nav.logout')}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href={getLoginUrl()}>
                    <Button 
                      variant="outline" 
                      style={{ borderColor: theme.accent, color: theme.accentText }}
                    >
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button 
                      className="text-white"
                      style={{ backgroundColor: theme.accent }}
                    >
                      {t('nav.signup')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Balanced Height */}
      <section className="relative flex items-center overflow-hidden pt-16">
        <div className="max-w-screen-2xl mx-auto w-full">
          {/* Background Image - Full width, increased height */}
          <div className="w-full h-[70vh] min-h-[500px] max-h-[700px] mx-0 lg:mx-8 rounded-none lg:rounded-2xl overflow-hidden">
            <div className="relative h-full">
              <img 
                src="/images/image.png" 
                alt="Laundry Service"
                className="w-full h-full object-cover object-center"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40"></div>
              
              {/* Content positioned over image */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="max-w-2xl">
                    <div 
                      className="inline-flex items-center gap-2 text-white px-3 py-1.5 rounded-full text-xs font-medium mb-4"
                      style={{ backgroundColor: theme.accent }}
                    >
                      <Sparkles className="w-3 h-3" />
                      {t('hero.badge')}
                    </div>
                    
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight italic" style={{ fontFamily: 'Georgia, serif' }}>
                      {t('hero.title')}
                    </h1>
                    
                    <p className="text-base md:text-lg text-white/90 mb-6 max-w-xl">
                      {t('hero.subtitle')}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <Button 
                        size="lg" 
                        className="text-white px-6 py-3 text-base rounded-full font-semibold transition-all hover:opacity-90"
                        style={{ backgroundColor: theme.accent }}
                        onClick={onBookNow}
                      >
                        <Truck className="w-4 h-4 mr-2" />
                        {t('hero.schedulePickup')}
                      </Button>
                      <Link href="/services">
                        <Button 
                          size="lg" 
                          variant="outline"
                          className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-6 py-3 text-base rounded-full font-semibold bg-transparent"
                        >
                          {t('hero.exploreServices')}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section 
        className="py-24 relative transition-colors duration-300"
        style={{ backgroundColor: theme.sectionBg }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="font-semibold text-lg" style={{ color: theme.accentText }}>{t('process.subtitle')}</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-2" style={{ color: theme.textPrimary }}>{t('process.title')}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {processSteps.map((step, idx) => (
              <div key={idx} className="text-center group">
                <div 
                  className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform relative"
                  style={{ backgroundColor: theme.accentLight }}
                >
                  <step.icon className="w-12 h-12" style={{ color: theme.accentText }} />
                  <div 
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: theme.accent }}
                  >
                    {idx + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: theme.textPrimary }}>{step.title}</h3>
                <p style={{ color: theme.textSecondary }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid - Checkerboard Style */}
      <section className="py-20 transition-colors duration-300" style={{ backgroundColor: theme.pageBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold italic" style={{ fontFamily: 'Georgia, serif', color: theme.textPrimary }}>
              {t('services.title')}
            </h2>
          </div>

          {/* Grid Layout - 2x2 Checkerboard - Wider */}
          <div className="grid grid-cols-2 max-w-6xl mx-auto">
            {/* Row 1 */}
            <div className="aspect-[4/3]">
              <img 
                src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&q=80" 
                alt="Cloth Folding"
                className="w-full h-full object-cover"
              />
            </div>
            <div 
              className="aspect-[4/3] flex flex-col items-center justify-center p-8 text-center"
              style={{ backgroundColor: theme.accent }}
            >
              <div className="w-16 h-16 border-2 border-white/50 rounded-lg flex items-center justify-center mb-4">
                <Shirt className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t('services.washFold')}</h3>
              <p className="text-white/80 text-sm">
                {t('services.washFoldDesc')}
              </p>
            </div>

            {/* Row 2 - Secondary Color */}
            <div 
              className="aspect-[4/3] flex flex-col items-center justify-center p-8 text-center"
              style={{ backgroundColor: theme.accentSecondary }}
            >
              <div className="w-16 h-16 border-2 border-white/50 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t('services.steamPress')}</h3>
              <p className="text-white/80 text-sm">
                {t('services.steamPressDesc')}
              </p>
            </div>
            <div className="aspect-[4/3]">
              <img 
                src="https://images.unsplash.com/photo-1489274495757-95c7c837b101?w=600&q=80" 
                alt="Cloth Ironing"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Row 3 */}
            <div className="aspect-[4/3]">
              <img 
                src="https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=600&q=80" 
                alt="Cloth Laundry"
                className="w-full h-full object-cover"
              />
            </div>
            <div 
              className="aspect-[4/3] flex flex-col items-center justify-center p-8 text-center"
              style={{ backgroundColor: theme.accent }}
            >
              <div className="w-16 h-16 border-2 border-white/50 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t('services.dryCleaning')}</h3>
              <p className="text-white/80 text-sm">
                {t('services.dryCleaningDesc')}
              </p>
            </div>

            {/* Row 4 - Secondary Color */}
            <div 
              className="aspect-[4/3] flex flex-col items-center justify-center p-8 text-center"
              style={{ backgroundColor: theme.accentSecondary }}
            >
              <div className="w-16 h-16 border-2 border-white/50 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t('services.express')}</h3>
              <p className="text-white/80 text-sm">
                {t('services.expressDesc')}
              </p>
            </div>
            <div className="aspect-[4/3]">
              <img 
                src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&q=80" 
                alt="Express Service"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>


      {/* CTA Banner - Dark with Circles */}
      <section className="py-8 px-4" style={{ backgroundColor: theme.pageBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl relative overflow-hidden py-12 px-8 md:px-16" style={{ backgroundColor: isDark ? theme.cardBg : theme.footerBg }}>
            {/* Decorative Circles */}
            <div className="absolute top-4 right-32 w-4 h-4 rounded-full border border-white/20"></div>
            <div className="absolute top-8 right-48 w-2 h-2 rounded-full bg-white/10"></div>
            <div className="absolute bottom-6 left-16 w-3 h-3 rounded-full border border-white/20"></div>
            <div className="absolute top-1/2 right-64 w-20 h-20 rounded-full bg-white/5"></div>
            <div className="absolute top-1/2 right-52 w-12 h-12 rounded-full bg-white/5 -translate-y-4"></div>
            <div className="absolute bottom-4 right-80 w-6 h-6 rounded-full border border-white/10"></div>
            
            <div className="flex flex-wrap items-center justify-between gap-8 relative z-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {t('cta.title')}
                </h2>
                <p className="text-white/60">
                  {t('cta.desc')}
                </p>
              </div>
              <Button 
                className="text-white px-8 py-5 rounded-full font-medium flex items-center gap-2 transition-all hover:opacity-90"
                style={{ backgroundColor: theme.accent }}
                onClick={onBookNow}
              >
                <Phone className="w-5 h-5" />
                {t('cta.callNow')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section 
        className="py-16 transition-colors duration-300"
        style={{ backgroundColor: theme.sectionBgAlt }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <div className="text-center mb-8">
            <p className="font-medium mb-2" style={{ color: theme.accentText }}>{t('testimonials.subtitle')}</p>
            <h2 className="text-2xl md:text-3xl font-bold italic" style={{ fontFamily: 'Georgia, serif', color: theme.textPrimary }}>
              {t('testimonials.title')}
            </h2>
          </div>

          {/* Testimonials section */}
          <div className="rounded-t-3xl pt-8 pb-4" style={{ backgroundColor: theme.testimonialBg }}>
            {/* Profile Images Row */}
            <div className="flex justify-center items-center gap-3 mb-6 -mt-16">
              {[
                { image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
                { image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face' },
                { image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
                { image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
                { image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="w-14 h-14 rounded-full overflow-hidden border-2 shadow-lg"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBg }}
                >
                  <img 
                    src={item.image} 
                    alt="Customer"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Scrollable Testimonials */}
            <div className="max-h-[400px] overflow-y-auto px-4">
              {[
                { name: 'Thomas Willimas', role: t('services.washFold'), review: t('about.desc1') },
                { name: 'Leslie Alexander', role: t('services.dryCleaning'), review: t('about.desc1') },
                { name: 'Darlene Robertson', role: t('services.steamPress'), review: t('about.desc1') },
                { name: 'Jennifer Nguyen', role: t('services.express'), review: t('about.desc1') },
                { name: 'Alex Deo', role: t('services.steamPress'), review: t('about.desc1') },
              ].map((item, idx) => (
                <div key={idx} className="text-center py-6 border-b last:border-b-0" style={{ borderColor: `${theme.accent}30` }}>
                  <p className="mb-4 leading-relaxed max-w-2xl mx-auto" style={{ color: theme.textSecondary }}>
                    {item.review}
                  </p>
                  <h4 className="font-bold text-lg" style={{ color: theme.textPrimary }}>
                    {item.name}
                  </h4>
                  <p style={{ color: theme.accentText }} className="font-medium text-sm">
                    {item.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section 
        className="py-24 transition-colors duration-300"
        style={{ backgroundColor: theme.sectionBgAlt }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Video */}
            <div className="relative">
              <video 
                autoPlay 
                muted 
                loop 
                playsInline
                className="rounded-3xl shadow-2xl w-full"
              >
                <source src="/images/hoodi.mp4" type="video/mp4" />
              </video>
              {/* Floating Card */}
              <div 
                className="absolute -bottom-8 -right-8 text-white p-6 rounded-2xl shadow-xl"
                style={{ backgroundColor: theme.accent }}
              >
                <p className="text-4xl font-bold">10+</p>
                <p className="text-white/80">{t('about.yearsExp')}</p>
              </div>
            </div>

            {/* Content */}
            <div>
              <span className="font-semibold text-lg" style={{ color: theme.accentText }}>{t('about.subtitle')}</span>
              <h2 className="text-4xl font-bold mt-2 mb-6" style={{ color: theme.textPrimary }}>{t('about.title')}</h2>
              <p className="mb-4" style={{ color: theme.textSecondary }}>
                {t('about.desc1')}
              </p>
              <p className="mb-8" style={{ color: theme.textSecondary }}>
                {t('about.desc2')}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[t('about.feature1'), t('about.feature2'), t('about.feature3'), t('about.feature4')].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" style={{ color: theme.accentText }} />
                    <span style={{ color: theme.textSecondary }}>{item}</span>
                  </div>
                ))}
              </div>

              <Button 
                size="lg" 
                className="text-white px-8 py-4 rounded-full font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: theme.accent }}
                onClick={onBookNow}
              >
                {t('about.learnMore')}
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
              className={isDark ? '' : 'grayscale'}
            ></iframe>

            {/* Contact Card Overlay */}
            <div 
              className="absolute top-1/2 right-8 md:right-16 -translate-y-1/2 text-white p-6 md:p-8 rounded-lg shadow-2xl max-w-sm"
              style={{ backgroundColor: theme.footerBg }}
            >
              <h3 className="text-xl font-bold mb-3" style={{ color: theme.accentText }}>{t('hero.badge')}</h3>
              <p className="text-gray-300 text-sm mb-6">
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
                  <span className="text-sm text-gray-200">20+ Cities across India</span>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: theme.accent }}
                  >
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-200">+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: theme.accent }}
                  >
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-200">support@laundrypro.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-20 pb-8 transition-colors duration-300" style={{ backgroundColor: theme.footerBg, color: theme.footerText }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: theme.accent }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">LaundryPro</span>
              </div>
              <p className="text-gray-400 mb-6">
                {t('footer.desc')}
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:opacity-80 transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:opacity-80 transition-colors"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:opacity-80 transition-colors"><Instagram className="w-5 h-5" /></a>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-bold mb-6">{t('footer.services')}</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/services" className="hover:text-white">- {t('services.washFold')}</Link></li>
                <li><Link href="/services" className="hover:text-white">- {t('services.dryCleaning')}</Link></li>
                <li><Link href="/services" className="hover:text-white">- {t('services.steamPress')}</Link></li>
                <li><Link href="/services" className="hover:text-white">- {t('services.express')}</Link></li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-6">{t('footer.quickLinks')}</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/pricing" className="hover:text-white">- {t('nav.pricing')}</Link></li>
                <li><Link href="/help" className="hover:text-white">- {t('nav.help')}</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-bold mb-6">{t('footer.contact')}</h4>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5" style={{ color: theme.accentText }} />
                  +91 98765 43210
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5" style={{ color: theme.accentText }} />
                  support@laundrypro.com
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" style={{ color: theme.accentText }} />
                  20+ Cities across India
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500">{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}


