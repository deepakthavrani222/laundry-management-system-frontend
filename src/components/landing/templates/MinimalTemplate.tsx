'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Truck, Clock, Star, Phone, ArrowRight, Sparkles, Package, ChevronRight, Shield, Award, Zap, CheckCircle, Mail, Instagram, Facebook, Twitter, MapPin, ChevronLeft, Shirt, Play, Users, Building2, Droplets, Wind, ArrowDown, Heart, Leaf, Timer, BadgeCheck, ChevronDown, User, LogOut, ShoppingBag, Menu, X, Settings, Sun, Moon, Monitor, RotateCcw
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { ThemeColor } from '../ThemeCustomizer'
import { Language, getTranslation } from '@/lib/translations'
import { useAuthStore } from '@/store/authStore'
import TemplateHeader from '@/components/layout/TemplateHeader'
import { useLanguage } from '@/hooks/useLanguage'

interface MinimalTemplateProps {
  themeColor: ThemeColor
  language?: Language
  isAuthenticated: boolean
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
    footerBg: '#111827',
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
    footerBg: '#111827',
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
    footerBg: '#111827',
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
    footerBg: '#111827',
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
          <h2 className="text-xl font-bold text-gray-800">{getTranslation(currentLanguage, 'original.settings.title')}</h2>
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
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{getTranslation(currentLanguage, 'original.settings.scheme')}</h3>
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
              <h3 className="text-sm font-semibold text-gray-700">{getTranslation(currentLanguage, 'original.settings.colorCustomizer')}</h3>
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
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{getTranslation(currentLanguage, 'theme.language')}</h3>
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
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{getTranslation(currentLanguage, 'original.settings.landingPage')}</h3>
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

export default function MinimalTemplate({ themeColor, isAuthenticated, onBookNow, onColorChange, onLanguageChange, onTemplateChange, currentTemplate }: MinimalTemplateProps) {
  // Use language hook for reactive translations
  const { language, t } = useLanguage()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Features data for the interactive carousel - Only 3 features
  const features = [
    {
      title: t('minimal.features.feature1.title'),
      desc: t('minimal.features.feature1.desc'),
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80',
    },
    {
      title: t('minimal.features.feature2.title'),
      desc: t('minimal.features.feature2.desc'),
      image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&q=80',
    },
    {
      title: t('minimal.features.feature3.title'),
      desc: t('minimal.features.feature3.desc'),
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    },
  ]

  const nextFeature = () => setActiveFeature((prev) => (prev + 1) % features.length)
  const prevFeature = () => setActiveFeature((prev) => (prev - 1 + features.length) % features.length)
  
  // Get indices for the 3 visible boxes
  const getVisibleIndices = () => {
    const left = activeFeature
    const middle = (activeFeature + 1) % features.length
    const right = (activeFeature + 2) % features.length
    return { left, middle, right }
  }

  // All services with actual pricing data (6 services)
  const allServices = [
    {
      id: 'wash_fold',
      name: 'Wash & Fold',
      items: [
        { name: "Men's Shirt", price: '₹25', icon: '👔' },
        { name: "Women's Shirt", price: '₹25', icon: '👚' },
        { name: 'T-Shirt', price: '₹20', icon: '👕' },
        { name: 'Trousers/Pants', price: '₹30', icon: '👖' },
        { name: 'Jeans', price: '₹35', icon: '👖' },
        { name: 'Bed Sheet (Single)', price: '₹40', icon: '🛏️' },
      ]
    },
    {
      id: 'wash_iron',
      name: 'Wash & Iron',
      items: [
        { name: "Men's Shirt", price: '₹35', icon: '👔' },
        { name: "Women's Shirt", price: '₹35', icon: '👚' },
        { name: 'T-Shirt', price: '₹25', icon: '👕' },
        { name: 'Trousers/Pants', price: '₹40', icon: '👖' },
        { name: 'Jeans', price: '₹45', icon: '👖' },
        { name: 'Dress', price: '₹50', icon: '👗' },
      ]
    },
    {
      id: 'dry_clean',
      name: 'Dry Clean',
      items: [
        { name: 'Formal Shirt', price: '₹60', icon: '👔' },
        { name: 'Suit (2-piece)', price: '₹250', icon: '🤵' },
        { name: 'Blazer/Jacket', price: '₹180', icon: '🧥' },
        { name: 'Saree (Cotton)', price: '₹100', icon: '👘' },
        { name: 'Saree (Silk)', price: '₹150', icon: '👘' },
        { name: 'Coat/Overcoat', price: '₹220', icon: '🧥' },
      ]
    },
    {
      id: 'steam_press',
      name: 'Steam Press',
      items: [
        { name: 'Shirt', price: '₹15', icon: '👔' },
        { name: 'Trousers', price: '₹20', icon: '👖' },
        { name: 'Saree', price: '₹40', icon: '👘' },
        { name: 'Suit (2-piece)', price: '₹60', icon: '🤵' },
        { name: 'Dress', price: '₹30', icon: '👗' },
        { name: 'Kurti', price: '₹20', icon: '👚' },
      ]
    },
    {
      id: 'premium_laundry',
      name: 'Premium Laundry',
      items: [
        { name: 'Silk Shirt', price: '₹80', icon: '👔' },
        { name: 'Silk Saree', price: '₹150', icon: '👘' },
        { name: 'Woolen Sweater', price: '₹100', icon: '🧥' },
        { name: 'Cashmere Item', price: '₹200', icon: '🧣' },
        { name: 'Linen Shirt', price: '₹70', icon: '👔' },
        { name: 'Designer Dress', price: '₹180', icon: '👗' },
      ]
    },
    {
      id: 'starching',
      name: 'Starching',
      items: [
        { name: 'Cotton Shirt', price: '₹25', icon: '👔' },
        { name: 'Cotton Saree', price: '₹50', icon: '👘' },
        { name: 'Dhoti', price: '₹30', icon: '🩱' },
        { name: 'Kurta', price: '₹30', icon: '👕' },
        { name: 'Bed Sheet', price: '₹45', icon: '🛏️' },
        { name: 'Table Cloth', price: '₹35', icon: '🍽️' },
      ]
    },
  ]

  const whyLoveUs = [
    { 
      icon: Truck, 
      title: t('minimal.whyLove.freePickup'), 
      desc: t('minimal.whyLove.freePickupDesc'),
    },
    { 
      icon: Timer, 
      title: t('minimal.whyLove.turnaround'), 
      desc: t('minimal.whyLove.turnaroundDesc'),
    },
    { 
      icon: Shield, 
      title: t('minimal.whyLove.quality'), 
      desc: t('minimal.whyLove.qualityDesc'),
    },
    { 
      icon: Leaf, 
      title: t('minimal.whyLove.eco'), 
      desc: t('minimal.whyLove.ecoDesc'),
    },
  ]

  const guarantees = [
    { icon: BadgeCheck, text: t('minimal.guarantee.satisfaction') },
    { icon: Shield, text: t('minimal.guarantee.damage') },
    { icon: Timer, text: t('minimal.guarantee.onTime') },
    { icon: Heart, text: t('minimal.guarantee.customers') },
  ]


  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.pageBg }}>
      {/* Shared Header Component */}
      <TemplateHeader />

      {/* Hero Section - Increased Height for Full Video */}
      <section className="relative h-[75vh] min-h-[500px] max-h-[700px] flex items-center overflow-hidden pt-16">
        <div className="max-w-screen-2xl mx-auto w-full relative">
          {/* Video Background - Contained */}
          <div className="absolute inset-0 z-0 rounded-none lg:rounded-2xl overflow-hidden mx-0 lg:mx-8">
            <video 
              autoPlay 
              muted 
              loop 
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/images/landingpage2.mp4" type="video/mp4" />
            </video>
            {/* Light Overlay - Only on right side for text readability */}
            <div 
              className="absolute inset-0"
              style={{ 
                background: `linear-gradient(270deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.6) 35%, rgba(255,255,255,0.1) 60%, transparent 100%)`
              }}
            />
          </div>

          {/* Content - Right Side */}
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-14 pb-8 h-[75vh] min-h-[500px] max-h-[700px] flex items-center">
            <div className="max-w-md ml-auto">
              {/* Badge */}
              <div 
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3"
                style={{ backgroundColor: `${theme.accent}15`, color: theme.accent }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span 
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: theme.accent }}
                  />
                  <span 
                    className="relative inline-flex rounded-full h-1.5 w-1.5"
                    style={{ backgroundColor: theme.accent }}
                  />
                </span>
                {t('minimal.hero.badge')}
              </div>

              {/* Main Heading */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-3 text-gray-900">
                {t('minimal.hero.title')}
              </h1>
              
              {/* Subheading */}
              <p className="text-sm md:text-base mb-5 leading-relaxed max-w-sm text-gray-600">
                {t('minimal.hero.subtitle')}
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={onBookNow}
                  className="text-white px-5 py-2.5 text-sm rounded-full font-medium shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 hover:opacity-90"
                  style={{ backgroundColor: theme.accent }}
                >
                  {t('hero.schedulePickup')}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
                <Link href="/pricing">
                  <Button 
                    variant="outline"
                    className="px-5 py-2.5 text-sm rounded-full font-medium border-2 border-gray-400 hover:border-gray-600 bg-white/50 backdrop-blur-sm text-gray-800"
                  >
                    {t('minimal.viewPricing')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - All Services */}
      <section className="py-20 transition-colors duration-300" style={{ backgroundColor: theme.pageBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: theme.textPrimary }}>
                {t('minimal.pricing.title')}
              </h2>
              <p className="text-xl" style={{ color: theme.textSecondary }}>
                {t('minimal.pricing.subtitle')}
              </p>
            </div>

            {/* All Services Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allServices.map((service) => (
                <div 
                  key={service.id} 
                  className="rounded-2xl p-6 transition-colors duration-300"
                  style={{ backgroundColor: theme.sectionBg }}
                >
                  <h3 className="text-xl font-bold mb-4 pb-3" style={{ color: theme.textPrimary, borderBottom: `1px solid ${theme.border}` }}>
                    {service.name}
                  </h3>
                  <div className="space-y-3">
                    {service.items.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.icon}</span>
                          <span style={{ color: theme.textSecondary }}>{item.name}</span>
                        </div>
                        <span className="font-semibold" style={{ color: theme.accent }}>
                          {item.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* View All Link */}
            <div className="text-center mt-10">
              <Link 
                href="/pricing" 
                className="inline-flex items-center gap-2 font-medium hover:gap-3 transition-all"
                style={{ color: theme.accent }}
              >
                {t('minimal.pricing.viewAll')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Why You'll Love Us - Rinse Style 3-Box Sliding Carousel */}
      <section className="py-20 overflow-hidden transition-colors duration-300" style={{ backgroundColor: theme.pageBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: theme.textPrimary }}>
              {t('minimal.whyLove.title')}
            </h2>
          </div>

          <div className="max-w-7xl mx-auto">
            {/* 3-Box Layout - Asymmetric sizes */}
            <div className="flex gap-6 items-start">
              
              {/* Box 1 - Large Active Box (Left) - 45% width */}
              <div className="w-full lg:w-[45%] flex-shrink-0">
                <div className="relative">
                  {/* Image Container with Slide Animation */}
                  <div className="relative overflow-hidden rounded-2xl aspect-[4/3] mb-6">
                    {features.map((feature, idx) => {
                      const diff = idx - activeFeature
                      const normalizedDiff = ((diff % features.length) + features.length) % features.length
                      const translateX = normalizedDiff === 0 ? 0 : normalizedDiff === 1 ? 100 : -100
                      
                      return (
                        <div
                          key={idx}
                          className="absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                          style={{
                            transform: `translateX(${translateX}%)`,
                            opacity: normalizedDiff === 0 ? 1 : 0,
                          }}
                        >
                          <img 
                            src={feature.image}
                            alt={feature.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Content - Fixed height container */}
                  <div className="relative h-[160px] overflow-hidden">
                    {features.map((feature, idx) => (
                      <div
                        key={idx}
                        className={`absolute inset-0 transition-all duration-500 ease-out ${
                          idx === activeFeature 
                            ? 'opacity-100 translate-y-0' 
                            : 'opacity-0 translate-y-4 pointer-events-none'
                        }`}
                      >
                        <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: theme.textPrimary }}>
                          {feature.title}
                        </h3>
                        <p className="text-lg leading-relaxed" style={{ color: theme.textSecondary }}>
                          {feature.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Button - Outside content, fixed position */}
                  <Button 
                    onClick={onBookNow}
                    className="text-white px-6 py-3 rounded-full font-medium mt-4 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: theme.accent }}
                  >
                    {t('minimal.features.getOff')}
                  </Button>
                </div>
              </div>

              {/* Box 2 - Smaller Size (Middle) - 22% width */}
              <div className="hidden lg:block w-[22%] flex-shrink-0">
                <div className="relative overflow-hidden rounded-xl aspect-square">
                  {features.map((feature, idx) => {
                    const targetIdx = (activeFeature + 1) % features.length
                    const diff = idx - targetIdx
                    const normalizedDiff = ((diff % features.length) + features.length) % features.length
                    const translateX = normalizedDiff === 0 ? 0 : normalizedDiff === 1 ? 100 : -100
                    
                    return (
                      <div
                        key={idx}
                        className="absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                        style={{
                          transform: `translateX(${translateX}%)`,
                          opacity: normalizedDiff === 0 ? 1 : 0,
                        }}
                      >
                        <img 
                          src={feature.image}
                          alt={feature.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )
                  })}
                </div>
                <h4 className="mt-3 font-semibold text-base" style={{ color: theme.textPrimary }}>
                  {features[(activeFeature + 1) % features.length].title}
                </h4>
              </div>

              {/* Box 3 - Smaller Size (Right) - 22% width */}
              <div className="hidden lg:block w-[22%] flex-shrink-0">
                <div className="relative overflow-hidden rounded-xl aspect-square">
                  {features.map((feature, idx) => {
                    const targetIdx = (activeFeature + 2) % features.length
                    const diff = idx - targetIdx
                    const normalizedDiff = ((diff % features.length) + features.length) % features.length
                    const translateX = normalizedDiff === 0 ? 0 : normalizedDiff === 1 ? 100 : -100
                    
                    return (
                      <div
                        key={idx}
                        className="absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                        style={{
                          transform: `translateX(${translateX}%)`,
                          opacity: normalizedDiff === 0 ? 1 : 0,
                        }}
                      >
                        <img 
                          src={feature.image}
                          alt={feature.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )
                  })}
                </div>
                <h4 className="mt-3 font-semibold text-sm" style={{ color: theme.textSecondary }}>
                  {features[(activeFeature + 2) % features.length].title}
                </h4>

                {/* Navigation Arrows - Square buttons */}
                <div className="flex items-center gap-3 mt-5">
                  <button 
                    onClick={prevFeature}
                    className="w-10 h-10 rounded-md border-2 flex items-center justify-center hover:opacity-80 transition-all group"
                    style={{ borderColor: theme.border }}
                  >
                    <ChevronLeft className="w-5 h-5" style={{ color: theme.textSecondary }} />
                  </button>
                  <button 
                    onClick={nextFeature}
                    className="w-10 h-10 rounded-md border-2 flex items-center justify-center hover:opacity-80 transition-all group"
                    style={{ borderColor: theme.border }}
                  >
                    <ChevronRight className="w-5 h-5" style={{ color: theme.textSecondary }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex lg:hidden items-center justify-center gap-3 mt-8">
              <button 
                onClick={prevFeature}
                className="w-10 h-10 rounded-md border-2 flex items-center justify-center hover:opacity-80 transition-all"
                style={{ borderColor: theme.border }}
              >
                <ChevronLeft className="w-5 h-5" style={{ color: theme.textSecondary }} />
              </button>
              <div className="flex gap-2">
                {features.map((_, idx) => (
                  <div 
                    key={idx}
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{ backgroundColor: idx === activeFeature ? theme.accent : theme.border }}
                  />
                ))}
              </div>
              <button 
                onClick={nextFeature}
                className="w-12 h-12 rounded-full border-2 flex items-center justify-center hover:opacity-80 transition-all"
                style={{ borderColor: theme.border }}
              >
                <ChevronRight className="w-5 h-5" style={{ color: theme.textSecondary }} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Simple Icons */}
      <section className="py-16 transition-colors duration-300" style={{ backgroundColor: theme.sectionBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {whyLoveUs.map((item, idx) => (
              <div key={idx} className="text-center">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: theme.accentLight }}
                >
                  <item.icon className="w-8 h-8" style={{ color: theme.accent }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: theme.textPrimary }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: theme.textSecondary }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Clean Steps */}
      <section className="py-20 transition-colors duration-300" style={{ backgroundColor: theme.pageBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: theme.textPrimary }}>
              {t('minimal.howItWorks.title')}
            </h2>
            <p className="text-xl" style={{ color: theme.textSecondary }}>
              {t('minimal.howItWorks.subtitle')}
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12">
              {[
                { 
                  step: '1', 
                  title: t('minimal.howItWorks.step1.title'), 
                  desc: t('minimal.howItWorks.step1.desc'),
                  image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80'
                },
                { 
                  step: '2', 
                  title: t('minimal.howItWorks.step2.title'), 
                  desc: t('minimal.howItWorks.step2.desc'),
                  image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=400&q=80'
                },
                { 
                  step: '3', 
                  title: t('minimal.howItWorks.step3.title'), 
                  desc: t('minimal.howItWorks.step3.desc'),
                  image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80'
                },
              ].map((item, idx) => (
                <div key={idx} className="text-center group">
                  <div className="relative mb-6 rounded-2xl overflow-hidden aspect-[4/3]">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div 
                      className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: theme.accent }}
                    >
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: theme.textPrimary }}>{item.title}</h3>
                  <p style={{ color: theme.textSecondary }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Clean Cards */}
      <section className="py-20 transition-colors duration-300" style={{ backgroundColor: theme.sectionBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: theme.textPrimary }}>
              {t('minimal.testimonials.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { 
                name: 'Priya Sharma', 
                role: 'Fashion Designer',
                review: "I've been using LaundryPro for 6 months now. The quality is consistently excellent, and the convenience is unmatched. My designer pieces always come back perfect!",
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face'
              },
              { 
                name: 'Rahul Verma', 
                role: 'Business Executive',
                review: "As a busy professional, I don't have time for laundry. LaundryPro has been a lifesaver. Pickup and delivery is always on time, and my shirts look brand new.",
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'
              },
              { 
                name: 'Anita Desai', 
                role: 'Working Mom',
                review: "With two kids and a full-time job, laundry was my biggest headache. LaundryPro changed that. Now I have more time for what matters - my family.",
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face'
              },
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="rounded-2xl p-8 shadow-sm transition-colors duration-300"
                style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold" style={{ color: theme.textPrimary }}>{item.name}</h4>
                    <p className="text-sm" style={{ color: theme.textMuted }}>{item.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="leading-relaxed" style={{ color: theme.textSecondary }}>"{item.review}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Guarantee Section */}
      <section className="py-20 transition-colors duration-300" style={{ backgroundColor: theme.pageBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div 
              className="rounded-3xl p-10 md:p-16 text-center transition-colors duration-300"
              style={{ backgroundColor: theme.sectionBgAlt }}
            >
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: theme.accentLight }}
              >
                <Shield className="w-10 h-10" style={{ color: theme.accent }} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: theme.textPrimary }}>
                {t('minimal.guarantee.title')}
              </h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: theme.textSecondary }}>
                {t('minimal.guarantee.desc')}
              </p>
              
              <div className="flex flex-wrap justify-center gap-6">
                {guarantees.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2" style={{ color: theme.textSecondary }}>
                    <item.icon className="w-5 h-5" style={{ color: theme.accent }} />
                    <span className="font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4" style={{ backgroundColor: theme.pageBg }}>
        <div 
          className="max-w-6xl mx-auto py-12 px-8 text-center"
          style={{ backgroundColor: theme.accent }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('minimal.cta.title')}
          </h2>
          <p className="text-lg text-white/80 mb-6 max-w-xl mx-auto">
            {t('minimal.cta.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg"
              onClick={onBookNow}
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-5 text-base rounded-none font-semibold shadow-lg"
            >
              {t('minimal.cta.schedulePickup')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Link href="https://wa.me/919876543210" target="_blank">
              <Button 
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-5 text-base rounded-none font-semibold"
              >
                <Phone className="w-5 h-5 mr-2" />
                {t('minimal.cta.whatsapp')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 transition-colors duration-300" style={{ backgroundColor: theme.footerBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: theme.accent }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold" style={{ color: theme.footerText }}>LaundryPro</span>
              </div>
              <p className="mb-6" style={{ color: `${theme.footerText}99` }}>
                {t('minimal.footer.desc')}
              </p>
              <div className="flex gap-4">
                {[Facebook, Instagram, Twitter].map((Icon, i) => (
                  <a 
                    key={i} 
                    href="#" 
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-colors"
                    style={{ backgroundColor: `${theme.footerText}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: `${theme.footerText}99` }} />
                  </a>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold mb-6" style={{ color: theme.footerText }}>{t('minimal.footer.services')}</h4>
              <ul className="space-y-3" style={{ color: `${theme.footerText}99` }}>
                <li><Link href="/services" className="hover:opacity-80 transition-colors">{t('minimal.footer.dryCleaning')}</Link></li>
                <li><Link href="/services" className="hover:opacity-80 transition-colors">{t('minimal.footer.washFold')}</Link></li>
                <li><Link href="/services" className="hover:opacity-80 transition-colors">{t('minimal.footer.steamPress')}</Link></li>
                <li><Link href="/services" className="hover:opacity-80 transition-colors">{t('minimal.footer.expressService')}</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-6" style={{ color: theme.footerText }}>{t('minimal.footer.company')}</h4>
              <ul className="space-y-3" style={{ color: `${theme.footerText}99` }}>
                <li><Link href="/pricing" className="hover:opacity-80 transition-colors">{t('minimal.footer.pricing')}</Link></li>
                <li><Link href="/help" className="hover:opacity-80 transition-colors">{t('minimal.footer.helpCenter')}</Link></li>
                <li><Link href="/about" className="hover:opacity-80 transition-colors">{t('minimal.footer.aboutUs')}</Link></li>
                <li><Link href="/contact" className="hover:opacity-80 transition-colors">{t('minimal.footer.contactUs')}</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-6" style={{ color: theme.footerText }}>{t('minimal.footer.contact')}</h4>
              <ul className="space-y-3" style={{ color: `${theme.footerText}99` }}>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5" style={{ color: theme.accent }} />
                  +91 98765 43210
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5" style={{ color: theme.accent }} />
                  support@laundrypro.com
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" style={{ color: theme.accent }} />
                  {t('minimal.footer.cities')}
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-wrap justify-between items-center gap-4" style={{ borderTop: `1px solid ${theme.footerText}20` }}>
            <p className="text-sm" style={{ color: `${theme.footerText}70` }}>
              {t('minimal.footer.copyright')}
            </p>
            <div className="flex gap-6 text-sm" style={{ color: `${theme.footerText}70` }}>
              <Link href="/privacy" className="hover:opacity-80 transition-colors">{t('minimal.footer.privacy')}</Link>
              <Link href="/terms" className="hover:opacity-80 transition-colors">{t('minimal.footer.terms')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
