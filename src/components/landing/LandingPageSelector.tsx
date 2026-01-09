'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import ThemeCustomizer, { TemplateType, ThemeColor } from './ThemeCustomizer'
import { Language } from '@/lib/translations'
import MinimalTemplate from './templates/MinimalTemplate'
import FreshSpinTemplate from './templates/FreshSpinTemplate'
import LaundryMasterTemplate from './templates/LaundryMasterTemplate'
import BookingModal from '@/components/BookingModal'
import PublicHeader from '@/components/layout/PublicHeader'

// Dynamic import for Original page to avoid circular dependency
import dynamic from 'next/dynamic'
const OriginalPage = dynamic(() => import('./templates/OriginalTemplate'), { ssr: false })

const STORAGE_KEY_TEMPLATE = 'landing_template'
const STORAGE_KEY_COLOR = 'landing_color'
const STORAGE_KEY_LANGUAGE = 'landing_language'

export default function LandingPageSelector() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  
  // State for template, color, and language - default to 'original'
  const [currentTemplate, setCurrentTemplate] = useState<TemplateType>('original')
  const [currentColor, setCurrentColor] = useState<ThemeColor>('teal')
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en')
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load saved preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTemplate = localStorage.getItem(STORAGE_KEY_TEMPLATE) as TemplateType
      const savedColor = localStorage.getItem(STORAGE_KEY_COLOR) as ThemeColor
      const savedLanguage = localStorage.getItem(STORAGE_KEY_LANGUAGE) as Language
      
      // Set template - default to 'original' if not saved or invalid
      if (savedTemplate && ['original', 'minimal', 'freshspin', 'starter'].includes(savedTemplate)) {
        setCurrentTemplate(savedTemplate)
      } else {
        // Force original template as default
        setCurrentTemplate('original')
        localStorage.setItem(STORAGE_KEY_TEMPLATE, 'original')
      }
      
      if (savedColor && ['teal', 'blue', 'purple', 'orange'].includes(savedColor)) {
        setCurrentColor(savedColor)
      } else {
        setCurrentColor('teal')
        localStorage.setItem(STORAGE_KEY_COLOR, 'teal')
      }
      
      if (savedLanguage && ['en', 'es', 'hi'].includes(savedLanguage)) {
        setCurrentLanguage(savedLanguage)
      } else {
        setCurrentLanguage('en')
        localStorage.setItem(STORAGE_KEY_LANGUAGE, 'en')
      }
      
      setIsLoaded(true)
    }
  }, [])

  // Save preferences to localStorage
  const handleTemplateChange = (template: TemplateType) => {
    console.log('🎨 LandingPageSelector - Template changing to:', template)
    setCurrentTemplate(template)
    localStorage.setItem(STORAGE_KEY_TEMPLATE, template)
    console.log('🎨 LandingPageSelector - Saved to localStorage:', localStorage.getItem(STORAGE_KEY_TEMPLATE))
  }

  const handleColorChange = (color: ThemeColor) => {
    setCurrentColor(color)
    localStorage.setItem(STORAGE_KEY_COLOR, color)
  }

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language)
    localStorage.setItem(STORAGE_KEY_LANGUAGE, language)
  }

  // Handle booking
  const handleBookNow = () => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/?openBooking=true')
      return
    }
    setShowBookingModal(true)
  }

  const handleLoginRequired = () => {
    setShowBookingModal(false)
    router.push('/auth/login?redirect=/?openBooking=true')
  }

  // Check URL params to auto-open booking modal after login
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('openBooking') === 'true' && isAuthenticated) {
        setShowBookingModal(true)
        window.history.replaceState({}, '', '/')
      }
    }
  }, [isAuthenticated])

  // Don't render until loaded to prevent hydration mismatch
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  // Check if template needs its own header (Original has its own nav)
  const needsHeader = !['original', 'freshspin', 'starter', 'minimal'].includes(currentTemplate)

  // Render the selected template
  const renderTemplate = () => {
    const baseProps = {
      themeColor: currentColor,
      language: currentLanguage,
      isAuthenticated,
      onBookNow: handleBookNow,
    }

    switch (currentTemplate) {
      case 'original':
        return <OriginalPage 
          {...baseProps} 
          user={user}
          onColorChange={handleColorChange} 
          onLanguageChange={handleLanguageChange}
          onTemplateChange={(t) => handleTemplateChange(t as TemplateType)}
          currentTemplate={currentTemplate}
        />
      case 'minimal':
        return <MinimalTemplate 
          {...baseProps} 
          onColorChange={handleColorChange} 
          onLanguageChange={handleLanguageChange}
          onTemplateChange={(t) => handleTemplateChange(t as TemplateType)}
          currentTemplate={currentTemplate}
        />
      case 'freshspin':
        return <FreshSpinTemplate 
          {...baseProps} 
          onColorChange={handleColorChange} 
          onLanguageChange={handleLanguageChange}
          onTemplateChange={(t) => handleTemplateChange(t as TemplateType)}
          currentTemplate={currentTemplate}
        />
      case 'starter':
        return <LaundryMasterTemplate 
          {...baseProps} 
          onColorChange={handleColorChange} 
          onLanguageChange={handleLanguageChange}
          onTemplateChange={(t) => handleTemplateChange(t as TemplateType)}
          currentTemplate={currentTemplate}
        />
      default:
        return <OriginalPage 
          {...baseProps} 
          user={user}
          onColorChange={handleColorChange} 
          onLanguageChange={handleLanguageChange}
          onTemplateChange={(t) => handleTemplateChange(t as TemplateType)}
          currentTemplate={currentTemplate}
        />
    }
  }

  return (
    <>
      {/* Public Header - Only show for templates that don't have their own */}
      {needsHeader && <PublicHeader />}

      {/* Selected Template */}
      <div className={needsHeader ? 'pt-16' : ''}>
        {renderTemplate()}
      </div>

      {/* Theme Customizer - Hidden for all templates with built-in settings */}
      {false && (
        <ThemeCustomizer
          currentTemplate={currentTemplate}
          currentColor={currentColor}
          currentLanguage={currentLanguage}
          onTemplateChange={handleTemplateChange}
          onColorChange={handleColorChange}
          onLanguageChange={handleLanguageChange}
        />
      )}

      {/* Booking Modal */}
      <BookingModal 
        isOpen={showBookingModal} 
        onClose={() => setShowBookingModal(false)}
        onLoginRequired={handleLoginRequired}
      />
    </>
  )
}
