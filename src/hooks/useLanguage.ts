'use client'

import { useState, useEffect, useCallback } from 'react'
import { Language, getTranslation } from '@/lib/translations'

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('en')
  const [isLoaded, setIsLoaded] = useState(false)

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('landing_language') as Language
      if (savedLanguage && ['en', 'es', 'hi'].includes(savedLanguage)) {
        setLanguage(savedLanguage)
      }
      setIsLoaded(true)
    }
  }, [])

  // Listen for language changes from other components (like TemplateHeader)
  useEffect(() => {
    const handleLanguageChange = (e: CustomEvent<{ language: Language }>) => {
      const newLang = e.detail.language
      if (['en', 'es', 'hi'].includes(newLang)) {
        setLanguage(newLang)
      }
    }
    
    window.addEventListener('languageChange', handleLanguageChange as EventListener)
    return () => window.removeEventListener('languageChange', handleLanguageChange as EventListener)
  }, [])

  // Change language function
  const changeLanguage = useCallback((newLang: Language) => {
    setLanguage(newLang)
    localStorage.setItem('landing_language', newLang)
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: newLang } }))
  }, [])

  // Translation helper
  const t = useCallback((key: string) => {
    return getTranslation(language, key)
  }, [language])

  return {
    language,
    setLanguage: changeLanguage,
    t,
    isLoaded
  }
}
