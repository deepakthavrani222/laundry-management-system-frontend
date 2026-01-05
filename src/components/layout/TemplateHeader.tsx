'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Sparkles, ChevronDown, ShoppingBag, MapPin, User, LogOut, Menu, X, 
  Phone, Waves, Mail, Clock, Sun, Moon, Globe, Check
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Language, getTranslation } from '@/lib/translations'
import { useTenant } from '@/contexts/TenantContext'

type ThemeColor = 'teal' | 'blue' | 'purple' | 'orange'
type TemplateType = 'original' | 'minimal' | 'freshspin' | 'starter'
type SchemeMode = 'light' | 'dark'

const languageOptions = [
  { code: 'en' as Language, label: 'English', flag: '🇺🇸' },
  { code: 'es' as Language, label: 'Español', flag: '🇪🇸' },
  { code: 'hi' as Language, label: 'हिंदी', flag: '🇮🇳' },
]

const colorClasses = {
  teal: { 
    primary: 'bg-teal-500', hover: 'hover:bg-teal-600', text: 'text-teal-500', 
    border: 'border-teal-500', hoverText: 'hover:text-teal-500', lightBg: 'hover:bg-teal-50',
    light: 'bg-teal-50', accent: '#14b8a6'
  },
  blue: { 
    primary: 'bg-blue-500', hover: 'hover:bg-blue-600', text: 'text-blue-500', 
    border: 'border-blue-500', hoverText: 'hover:text-blue-500', lightBg: 'hover:bg-blue-50',
    light: 'bg-blue-50', accent: '#3b82f6'
  },
  purple: { 
    primary: 'bg-purple-500', hover: 'hover:bg-purple-600', text: 'text-purple-500', 
    border: 'border-purple-500', hoverText: 'hover:text-purple-500', lightBg: 'hover:bg-purple-50',
    light: 'bg-purple-50', accent: '#8b5cf6'
  },
  orange: { 
    primary: 'bg-orange-500', hover: 'hover:bg-orange-600', text: 'text-orange-500', 
    border: 'border-orange-500', hoverText: 'hover:text-orange-500', lightBg: 'hover:bg-orange-50',
    light: 'bg-orange-50', accent: '#f97316'
  },
}

export default function TemplateHeader() {
  const { user, isAuthenticated } = useAuthStore()
  const { tenant, isTenantPage } = useTenant()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [themeColor, setThemeColor] = useState<ThemeColor>('teal')
  const [template, setTemplate] = useState<TemplateType>('original')
  const [language, setLanguage] = useState<Language>('en')
  const [isLoaded, setIsLoaded] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)

  // Translation helper
  const t = (key: string) => getTranslation(language, key)
  
  // Get display name and logo from tenant or default
  const displayName = tenant?.name || 'LaundryPro'
  const logoUrl = tenant?.logo
  
  // Use tenant template if on tenant page, otherwise use localStorage
  const activeTemplate = (isTenantPage && tenant?.landingPageTemplate) 
    ? tenant.landingPageTemplate as TemplateType 
    : template

  // Handle language change
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('landing_language', lang)
    window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: lang } }))
    setShowLangMenu(false)
  }
  // Helper to generate tenant-aware URLs
  const getLink = (path: string) => {
    if (isTenantPage && tenant?.slug) {
      // For tenant pages, keep URLs within tenant space
      if (path === '/') return `/${tenant.slug}`
      return `/${tenant.slug}${path}`
    }
    return path
  }

  // Handle Book Now click
  const handleBookNow = () => {
    if (isTenantPage && tenant?.slug) {
      // On tenant pages, redirect to tenant landing with openBooking param
      // This works on all tenant pages (help, services, pricing, etc.)
      window.location.href = `/${tenant.slug}?openBooking=true`
    } else {
      // Regular flow - redirect to orders page
      if (isAuthenticated) {
        window.location.href = '/customer/orders/new'
      } else {
        window.location.href = '/auth/login?redirect=/customer/orders/new'
      }
    }
  }

  // Handle Logout - redirect to tenant page if on tenant, otherwise to home
  const handleLogout = () => {
    useAuthStore.getState().logout()
    if (isTenantPage && tenant?.slug) {
      window.location.href = `/${tenant.slug}`
    } else {
      window.location.href = '/'
    }
  }

  // Dark mode toggle handler
  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem('landing_scheme', newMode ? 'dark' : 'light')
    // Dispatch event for templates to listen
    window.dispatchEvent(new CustomEvent('schemeChange', { detail: { scheme: newMode ? 'dark' : 'light' } }))
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedColor = localStorage.getItem('landing_color') as ThemeColor
      const savedTemplate = localStorage.getItem('landing_template') as TemplateType
      const savedLanguage = localStorage.getItem('landing_language') as Language
      const savedScheme = localStorage.getItem('landing_scheme')
      
      if (savedColor && ['teal', 'blue', 'purple', 'orange'].includes(savedColor)) {
        setThemeColor(savedColor)
      }
      if (savedScheme === 'dark') {
        setIsDarkMode(true)
      }
      if (savedTemplate) {
        setTemplate(savedTemplate)
      }
      if (savedLanguage && ['en', 'es', 'hi'].includes(savedLanguage)) {
        setLanguage(savedLanguage)
      }
      setIsLoaded(true)
    }
  }, [])

  // Listen for theme color changes from PageThemeCustomizer
  useEffect(() => {
    const handleThemeChange = (e: CustomEvent<{ color: ThemeColor }>) => {
      setThemeColor(e.detail.color)
    }
    window.addEventListener('themeColorChange', handleThemeChange as EventListener)
    return () => window.removeEventListener('themeColorChange', handleThemeChange as EventListener)
  }, [])

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (e: CustomEvent<{ language: Language }>) => {
      setLanguage(e.detail.language)
    }
    window.addEventListener('languageChange', handleLanguageChange as EventListener)
    return () => window.removeEventListener('languageChange', handleLanguageChange as EventListener)
  }, [])

  const colors = colorClasses[themeColor]
  const isActive = (path: string) => pathname === path

  // Dark mode classes for header
  const headerBg = isDarkMode ? 'bg-gray-900' : 'bg-white'
  const headerBorder = isDarkMode ? 'border-gray-700' : 'border-gray-100'
  const textColor = isDarkMode ? 'text-gray-100' : 'text-gray-800'
  const textMuted = isDarkMode ? 'text-gray-300' : 'text-gray-600'
  const hoverBg = isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
  const dropdownBg = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  const dropdownHover = isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'

  // Don't render until loaded to prevent hydration mismatch
  if (!isLoaded) {
    return <div className="h-16 bg-white" />
  }

  // FreshSpin Template Header (Landing Page 3)
  if (activeTemplate === 'freshspin') {
    return (
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Top Bar - Contact Info */}
        <div className={`${headerBg} py-2 border-b ${headerBorder}`}>
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-between items-center text-sm">
              <div className="flex flex-wrap items-center gap-6">
                <div className={`flex items-center gap-2 ${textMuted}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center`} style={{ backgroundColor: colors.accent }}>
                    <Phone className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-xs">+91 98765 43210</span>
                </div>
                <div className={`flex items-center gap-2 ${textMuted}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center`} style={{ backgroundColor: colors.accent }}>
                    <Mail className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-xs">support@laundrypro.com</span>
                </div>
                <div className={`hidden md:flex items-center gap-2 ${textMuted}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center`} style={{ backgroundColor: colors.accent }}>
                    <Clock className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-xs">{t('about.feature2')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Header */}
        <header className={`${headerBg} py-3 shadow-sm`}>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href={isTenantPage ? `/${tenant?.slug}` : '/'} className="flex items-center gap-2">
                {logoUrl ? (
                  <img src={logoUrl} alt={displayName} className="w-10 h-10 rounded-lg object-contain" />
                ) : (
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: colors.accent }}
                  >
                    <Waves className="w-5 h-5 text-white" />
                  </div>
                )}
                <span className={`text-xl font-bold ${textColor}`}>{displayName}</span>
              </Link>

              {/* Navigation - Rounded Pill Shape */}
              <div className="hidden md:flex items-center">
                <nav 
                  className="flex items-center gap-1 px-2 py-1.5 rounded-full"
                  style={{ backgroundColor: colors.accent }}
                >
                <Link href={getLink('/')} className={`text-white font-medium px-4 py-1.5 text-sm rounded-full hover:bg-white/20 transition-colors ${pathname === '/' || pathname === `/${tenant?.slug}` ? 'bg-white/20' : ''}`}>{t('nav.home')}</Link>
                <Link href={getLink('/services')} className={`text-white font-medium px-4 py-1.5 text-sm rounded-full hover:bg-white/20 transition-colors ${pathname?.includes('/services') ? 'bg-white/20' : ''}`}>{t('nav.services')}</Link>
                <Link href={getLink('/pricing')} className={`text-white font-medium px-4 py-1.5 text-sm rounded-full hover:bg-white/20 transition-colors ${pathname?.includes('/pricing') ? 'bg-white/20' : ''}`}>{t('nav.pricing')}</Link>
                <Link href={getLink('/help')} className={`text-white font-medium px-4 py-1.5 text-sm rounded-full hover:bg-white/20 transition-colors ${pathname?.includes('/help') ? 'bg-white/20' : ''}`}>{t('nav.help')}</Link>
              </nav>
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              
              {isAuthenticated ? (
                <>
                  <Link href={isTenantPage && tenant?.slug ? `/${tenant.slug}/dashboard` : '/customer/dashboard'}>
                    <Button 
                      variant="outline"
                      className={`rounded-full px-4 h-8 text-sm ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                    >
                      <User className="w-4 h-4 mr-1" />
                      {t('nav.dashboard')}
                    </Button>
                  </Link>
                  <Button 
                    className="text-white rounded-full px-4 h-8 text-sm"
                    style={{ backgroundColor: colors.accent }}
                    onClick={handleBookNow}
                  >
                    {t('nav.bookNow')}
                  </Button>
                  <div className="relative group">
                    <button className={`flex items-center gap-2 py-2 ${textMuted}`}>
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: colors.accent }}
                      >
                        <span className="text-white text-sm font-medium">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className={`absolute right-0 top-full mt-1 w-56 rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 ${dropdownBg}`}>
                      <div className="py-2">
                        <Link href={isTenantPage && tenant?.slug ? `/${tenant.slug}/dashboard` : '/customer/dashboard'} className={`flex items-center px-4 py-2 ${textMuted} ${dropdownHover}`}>
                          <User className="w-4 h-4 mr-3" />{t('nav.dashboard')}
                        </Link>
                        <Link href="/customer/orders" className={`flex items-center px-4 py-2 ${textMuted} ${dropdownHover}`}>
                          <ShoppingBag className="w-4 h-4 mr-3" />{t('nav.myOrders')}
                        </Link>
                        <Link href="/customer/addresses" className={`flex items-center px-4 py-2 ${textMuted} ${dropdownHover}`}>
                          <MapPin className="w-4 h-4 mr-3" />{t('nav.addresses')}
                        </Link>
                        <hr className={`my-2 ${isDarkMode ? 'border-gray-700' : ''}`} />
                        <div className="px-4 py-2">
                          <p className={`text-xs font-medium mb-2 ${textMuted}`}><Globe className="w-3 h-3 inline mr-1" />Language</p>
                          <div className="flex gap-1">
                            {languageOptions.map(opt => (
                              <button key={opt.code} onClick={() => handleLanguageChange(opt.code)} className={`flex-1 px-2 py-1 text-xs rounded ${language === opt.code ? 'text-white' : textMuted}`} style={language === opt.code ? { backgroundColor: colors.accent } : {}}>{opt.flag}</button>
                            ))}
                          </div>
                        </div>
                        <hr className={`my-2 ${isDarkMode ? 'border-gray-700' : ''}`} />
                        <button 
                          onClick={handleLogout} 
                          className={`flex items-center w-full px-4 py-2 text-red-600 ${isDarkMode ? 'hover:bg-red-900/30' : 'hover:bg-red-50'}`}
                        >
                          <LogOut className="w-4 h-4 mr-3" />{t('nav.logout')}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/auth/login">
                    <Button variant="outline" className={`${colors.border} ${colors.text} h-8 text-sm`}>
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Button 
                    className="text-white rounded-full h-8 text-sm"
                    style={{ backgroundColor: colors.accent }}
                    onClick={handleBookNow}
                  >
                    {t('nav.bookNow')}
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile: Dark Mode Toggle + Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <button 
                className={`p-2 rounded-lg ${hoverBg}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className={`w-6 h-6 ${textColor}`} /> : <Menu className={`w-6 h-6 ${textColor}`} />}
              </button>
            </div>
          </div>
        </div>
      </header>
      </div>
    )
  }

  // Starter/LaundryMaster Template Header (Landing Page 4)
  if (activeTemplate === 'starter') {
    return (
      <header className={`fixed top-0 left-0 right-0 z-50 ${headerBg} shadow-sm py-4`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href={getLink('/')} className="flex items-center gap-3 flex-shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt={displayName} className="w-10 h-10 rounded-lg object-contain" />
              ) : (
                <div className={`w-10 h-10 border-2 ${colors.border} rounded-lg flex items-center justify-center`}>
                  <Sparkles className={`w-5 h-5 ${colors.text}`} />
                </div>
              )}
              <span className={`text-xl font-bold ${textColor}`}>{displayName}</span>
            </Link>

            {/* Navigation - Center */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link href={getLink('/')} className={`font-medium ${pathname === '/' || pathname === `/${tenant?.slug}` ? colors.text : textMuted} ${colors.hoverText}`}>{t('nav.home')}</Link>
              <Link href={getLink('/services')} className={`font-medium ${pathname?.includes('/services') ? colors.text : textMuted} ${colors.hoverText}`}>{t('nav.services')}</Link>
              <Link href={getLink('/pricing')} className={`font-medium ${pathname?.includes('/pricing') ? colors.text : textMuted} ${colors.hoverText}`}>{t('nav.pricing')}</Link>
              <Link href={getLink('/help')} className={`font-medium ${pathname?.includes('/help') ? colors.text : textMuted} ${colors.hoverText}`}>{t('nav.help')}</Link>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${hoverBg} transition-colors`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className={`w-5 h-5 ${textMuted}`} />
                )}
              </button>
              
              {isAuthenticated ? (
                <>
                  <Link href={isTenantPage && tenant?.slug ? `/${tenant.slug}/dashboard` : '/customer/dashboard'}>
                    <Button 
                      variant="outline"
                      className={`${colors.border} ${colors.text} px-4 py-2 rounded-md font-medium hidden sm:flex`}
                    >
                      <User className="w-4 h-4 mr-1" />
                      {t('nav.dashboard')}
                    </Button>
                  </Link>
                  <Button 
                    className={`${colors.primary} ${colors.hover} text-white px-5 py-2 rounded-md font-medium hidden sm:flex`}
                    onClick={handleBookNow}
                  >
                    {t('hero.schedulePickup')}
                  </Button>
                  <div className="relative group">
                    <button className={`flex items-center gap-2 py-2 ${textMuted}`}>
                      <div className={`w-9 h-9 ${colors.primary} rounded-full flex items-center justify-center`}>
                        <span className="text-white text-sm font-medium">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className={`absolute right-0 top-full mt-1 w-56 rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 ${dropdownBg}`}>
                      <div className="py-2">
                        <Link href={isTenantPage && tenant?.slug ? `/${tenant.slug}/dashboard` : '/customer/dashboard'} className={`flex items-center px-4 py-2 ${textMuted} ${dropdownHover}`}>
                          <User className="w-4 h-4 mr-3" />{t('nav.dashboard')}
                        </Link>
                        <Link href="/customer/orders" className={`flex items-center px-4 py-2 ${textMuted} ${dropdownHover}`}>
                          <ShoppingBag className="w-4 h-4 mr-3" />{t('nav.myOrders')}
                        </Link>
                        <Link href="/customer/addresses" className={`flex items-center px-4 py-2 ${textMuted} ${dropdownHover}`}>
                          <MapPin className="w-4 h-4 mr-3" />{t('nav.addresses')}
                        </Link>
                        <hr className={`my-2 ${isDarkMode ? 'border-gray-700' : ''}`} />
                        <div className="px-4 py-2">
                          <p className={`text-xs font-medium mb-2 ${textMuted}`}><Globe className="w-3 h-3 inline mr-1" />Language</p>
                          <div className="flex gap-1">
                            {languageOptions.map(opt => (
                              <button key={opt.code} onClick={() => handleLanguageChange(opt.code)} className={`flex-1 px-2 py-1 text-xs rounded ${language === opt.code ? 'text-white' : textMuted}`} style={language === opt.code ? { backgroundColor: colors.accent } : {}}>{opt.flag}</button>
                            ))}
                          </div>
                        </div>
                        <hr className={`my-2 ${isDarkMode ? 'border-gray-700' : ''}`} />
                        <button 
                          onClick={handleLogout} 
                          className={`flex items-center w-full px-4 py-2 text-red-600 ${isDarkMode ? 'hover:bg-red-900/30' : 'hover:bg-red-50'}`}
                        >
                          <LogOut className="w-4 h-4 mr-3" />{t('nav.logout')}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/auth/login">
                    <Button variant="outline" className={`${colors.border} ${colors.text}`}>
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className={`${colors.primary} ${colors.hover} text-white`}>
                      {t('nav.signup')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile: Dark Mode Toggle + Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <button 
                className={`p-2 rounded-lg ${hoverBg}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className={`w-6 h-6 ${textColor}`} /> : <Menu className={`w-6 h-6 ${textColor}`} />}
              </button>
            </div>
          </div>
        </div>
      </header>
    )
  }

  // Minimal Template Header (Landing Page 2)
  if (activeTemplate === 'minimal') {
    return (
      <header className={`fixed top-0 left-0 right-0 z-50 ${headerBg} shadow-sm py-3`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href={getLink('/')} className="flex items-center gap-2">
              {logoUrl ? (
                <img src={logoUrl} alt={displayName} className="w-10 h-10 rounded-xl object-contain" />
              ) : (
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: colors.accent }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              )}
              <span className={`text-2xl font-bold ${textColor}`}>{displayName}</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link href={getLink('/')} className={`font-medium transition-colors hover:opacity-80 ${isActive('/') || pathname === `/${tenant?.slug}` ? colors.text : textMuted}`}>
                {t('nav.home')}
              </Link>
              <Link href={getLink('/services')} className={`font-medium transition-colors hover:opacity-80 ${pathname?.includes('/services') ? colors.text : textMuted}`}>
                {t('nav.services')}
              </Link>
              <Link href={getLink('/pricing')} className={`font-medium transition-colors hover:opacity-80 ${pathname?.includes('/pricing') ? colors.text : textMuted}`}>
                {t('nav.pricing')}
              </Link>
              <Link href={getLink('/help')} className={`font-medium transition-colors hover:opacity-80 ${pathname?.includes('/help') ? colors.text : textMuted}`}>
                {t('nav.help')}
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${hoverBg} transition-colors`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className={`w-5 h-5 ${textMuted}`} />
                )}
              </button>
              
              {isAuthenticated ? (
                <>
                  <Link href={isTenantPage && tenant?.slug ? `/${tenant.slug}/dashboard` : '/customer/dashboard'}>
                    <Button 
                      variant="outline"
                      className={`px-5 py-2.5 rounded-full font-medium ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                    >
                      <User className="w-4 h-4 mr-1" />
                      {t('nav.dashboard')}
                    </Button>
                  </Link>
                  <Button 
                    className="text-white px-6 py-2.5 rounded-full font-medium hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: colors.accent }}
                    onClick={handleBookNow}
                  >
                    {t('nav.bookNow')}
                  </Button>
                  <div className="relative group">
                    <button className={`flex items-center gap-2 ${textMuted}`}>
                      <div 
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: colors.accent }}
                      >
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className={`absolute right-0 top-full mt-2 w-56 rounded-xl shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 ${dropdownBg}`}>
                      <div className="py-2">
                        <Link href={isTenantPage && tenant?.slug ? `/${tenant.slug}/dashboard` : '/customer/dashboard'} className={`flex items-center px-4 py-2.5 ${textMuted} ${dropdownHover}`}>
                          <User className="w-4 h-4 mr-3" />{t('nav.dashboard')}
                        </Link>
                        <Link href="/customer/orders" className={`flex items-center px-4 py-2.5 ${textMuted} ${dropdownHover}`}>
                          <ShoppingBag className="w-4 h-4 mr-3" />{t('nav.myOrders')}
                        </Link>
                        <Link href="/customer/addresses" className={`flex items-center px-4 py-2.5 ${textMuted} ${dropdownHover}`}>
                          <MapPin className="w-4 h-4 mr-3" />{t('nav.addresses')}
                        </Link>
                        <hr className={`my-2 ${isDarkMode ? 'border-gray-700' : ''}`} />
                        <div className="px-4 py-2">
                          <p className={`text-xs font-medium mb-2 ${textMuted}`}><Globe className="w-3 h-3 inline mr-1" />Language</p>
                          <div className="flex gap-1">
                            {languageOptions.map(opt => (
                              <button key={opt.code} onClick={() => handleLanguageChange(opt.code)} className={`flex-1 px-2 py-1 text-xs rounded ${language === opt.code ? 'text-white' : textMuted}`} style={language === opt.code ? { backgroundColor: colors.accent } : {}}>{opt.flag}</button>
                            ))}
                          </div>
                        </div>
                        <hr className={`my-2 ${isDarkMode ? 'border-gray-700' : ''}`} />
                        <button 
                          onClick={handleLogout} 
                          className={`flex items-center w-full px-4 py-2.5 text-red-500 ${isDarkMode ? 'hover:bg-red-900/30' : 'hover:bg-red-50'}`}
                        >
                          <LogOut className="w-4 h-4 mr-3" />{t('nav.logout')}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className={`font-medium ${textMuted} transition-colors hover:opacity-80`}>
                    {t('nav.login')}
                  </Link>
                  <Button 
                    className="text-white px-6 py-2.5 rounded-full font-medium hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: colors.accent }}
                    onClick={handleBookNow}
                  >
                    {t('nav.bookNow')}
                  </Button>
                </>
              )}
            </div>

            {/* Mobile: Dark Mode Toggle + Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <button 
                className="p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className={`w-6 h-6 ${textColor}`} /> : <Menu className={`w-6 h-6 ${textColor}`} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className={`md:hidden mt-4 pb-4 rounded-xl shadow-lg p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex flex-col gap-4">
                <Link href={getLink('/')} className={`font-medium ${textMuted}`}>{t('nav.home')}</Link>
                <Link href={getLink('/services')} className={`font-medium ${textMuted}`}>{t('nav.services')}</Link>
                <Link href={getLink('/pricing')} className={`font-medium ${textMuted}`}>{t('nav.pricing')}</Link>
                <Link href={getLink('/help')} className={`font-medium ${textMuted}`}>{t('nav.help')}</Link>
                <hr className={isDarkMode ? 'border-gray-700' : ''} />
                <Button 
                  className="text-white rounded-full font-medium w-full hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: colors.accent }}
                >
                  {t('nav.bookNow')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>
    )
  }

  // Default Header (for other templates)
  return (
    <nav className={`${headerBg} shadow-sm border-b ${headerBorder} fixed top-0 left-0 right-0 z-50`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href={getLink('/')} className="flex items-center space-x-2">
            {logoUrl ? (
              <img src={logoUrl} alt={displayName} className="w-10 h-10 rounded-full object-contain" />
            ) : (
              <div className={`w-10 h-10 ${colors.primary} rounded-full flex items-center justify-center`}>
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            )}
            <span className={`text-2xl font-bold ${textColor}`}>{displayName}</span>
          </Link>
          
          {/* Mobile: Dark Mode Toggle + Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <button 
              className={`p-2 rounded-lg ${hoverBg}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className={`w-6 h-6 ${textColor}`} /> : <Menu className={`w-6 h-6 ${textColor}`} />}
            </button>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href={getLink('/')} className={`${pathname === '/' || pathname === `/${tenant?.slug}` ? `${colors.text} font-medium` : textMuted} ${colors.hoverText} transition-colors`}>{t('nav.home')}</Link>
            <Link href={getLink('/services')} className={`${pathname?.includes('/services') ? `${colors.text} font-medium` : textMuted} ${colors.hoverText} transition-colors`}>{t('nav.services')}</Link>
            <Link href={getLink('/pricing')} className={`${pathname?.includes('/pricing') ? `${colors.text} font-medium` : textMuted} ${colors.hoverText} transition-colors`}>{t('nav.pricing')}</Link>
            <Link href={getLink('/help')} className={`${pathname?.includes('/help') ? `${colors.text} font-medium` : textMuted} ${colors.hoverText} transition-colors`}>{t('nav.help')}</Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                  title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                <Link href={isTenantPage && tenant?.slug ? `/${tenant.slug}/dashboard` : '/customer/dashboard'}>
                  <Button className={`${colors.primary} ${colors.hover} text-white`}>
                    <User className="w-4 h-4 mr-2" />{t('nav.dashboard')}
                  </Button>
                </Link>
                <div className="relative group">
                  <button className={`flex items-center space-x-2 ${textMuted} ${colors.hoverText} py-2`}>
                    <div className={`w-8 h-8 ${colors.primary} rounded-full flex items-center justify-center`}>
                      <span className="text-white text-sm font-medium">{user?.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="font-medium">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className={`absolute right-0 top-full mt-1 w-56 rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 ${dropdownBg}`}>
                    <div className="py-2">
                      <Link href={isTenantPage && tenant?.slug ? `/${tenant.slug}/dashboard` : '/customer/dashboard'} className={`flex items-center px-4 py-2 ${textMuted} ${dropdownHover}`}>
                        <User className="w-4 h-4 mr-3" />{t('nav.dashboard')}
                      </Link>
                      <Link href="/customer/orders" className={`flex items-center px-4 py-2 ${textMuted} ${dropdownHover}`}>
                        <ShoppingBag className="w-4 h-4 mr-3" />{t('nav.myOrders')}
                      </Link>
                      <Link href="/customer/addresses" className={`flex items-center px-4 py-2 ${textMuted} ${dropdownHover}`}>
                        <MapPin className="w-4 h-4 mr-3" />{t('nav.addresses')}
                      </Link>
                      <hr className={`my-2 ${isDarkMode ? 'border-gray-700' : ''}`} />
                      <div className="px-4 py-2">
                        <p className={`text-xs font-medium mb-2 ${textMuted}`}><Globe className="w-3 h-3 inline mr-1" />Language</p>
                        <div className="flex gap-1">
                          {languageOptions.map(opt => (
                            <button key={opt.code} onClick={() => handleLanguageChange(opt.code)} className={`flex-1 px-2 py-1 text-xs rounded ${language === opt.code ? 'text-white' : textMuted}`} style={language === opt.code ? { backgroundColor: colors.accent } : {}}>{opt.flag}</button>
                          ))}
                        </div>
                      </div>
                      <hr className={`my-2 ${isDarkMode ? 'border-gray-700' : ''}`} />
                      <button 
                        onClick={handleLogout}
                        className={`flex items-center w-full px-4 py-2 text-red-600 ${isDarkMode ? 'hover:bg-red-900/30' : 'hover:bg-red-50'}`}
                      >
                        <LogOut className="w-4 h-4 mr-3" />{t('nav.logout')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                  title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                <Link href="/auth/login">
                  <Button variant="outline" className={`${colors.border} ${colors.text} ${colors.lightBg}`}>{t('nav.login')}</Button>
                </Link>
                <Link href="/auth/register">
                  <Button className={`${colors.primary} ${colors.hover} text-white`}>{t('nav.signup')}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

