'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Truck, ChevronDown, ShoppingBag, MapPin, User, LogOut, Menu, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const colorClasses = {
  teal: { 
    primary: 'bg-teal-500', hover: 'hover:bg-teal-600', text: 'text-teal-500', 
    border: 'border-teal-500', hoverText: 'hover:text-teal-500', lightBg: 'hover:bg-teal-50'
  },
  blue: { 
    primary: 'bg-blue-500', hover: 'hover:bg-blue-600', text: 'text-blue-500', 
    border: 'border-blue-500', hoverText: 'hover:text-blue-500', lightBg: 'hover:bg-blue-50'
  },
  purple: { 
    primary: 'bg-purple-500', hover: 'hover:bg-purple-600', text: 'text-purple-500', 
    border: 'border-purple-500', hoverText: 'hover:text-purple-500', lightBg: 'hover:bg-purple-50'
  },
  orange: { 
    primary: 'bg-orange-500', hover: 'hover:bg-orange-600', text: 'text-orange-500', 
    border: 'border-orange-500', hoverText: 'hover:text-orange-500', lightBg: 'hover:bg-orange-50'
  },
}

type ThemeColor = 'teal' | 'blue' | 'purple' | 'orange'

export default function PublicHeader() {
  const { user, isAuthenticated } = useAuthStore()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [themeColor, setThemeColor] = useState<ThemeColor>('teal')

  // Load theme color from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedColor = localStorage.getItem('landing_color') as ThemeColor
      if (savedColor && ['teal', 'blue', 'purple', 'orange'].includes(savedColor)) {
        setThemeColor(savedColor)
      }
    }
  }, [])

  // Listen for theme color changes
  useEffect(() => {
    const handleThemeChange = (e: CustomEvent<{ color: ThemeColor }>) => {
      setThemeColor(e.detail.color)
    }
    window.addEventListener('themeColorChange', handleThemeChange as EventListener)
    return () => window.removeEventListener('themeColorChange', handleThemeChange as EventListener)
  }, [])

  const colors = colorClasses[themeColor]
  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className={`w-10 h-10 ${colors.primary} rounded-full flex items-center justify-center`}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">LaundryLobby</span>
          </Link>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`${isActive('/') ? `${colors.text} font-medium` : 'text-gray-600'} ${colors.hoverText} transition-colors`}
            >
              Home
            </Link>
            <Link 
              href="/services" 
              className={`${isActive('/services') ? `${colors.text} font-medium` : 'text-gray-600'} ${colors.hoverText} transition-colors`}
            >
              Services
            </Link>
            <Link 
              href="/pricing" 
              className={`${isActive('/pricing') ? `${colors.text} font-medium` : 'text-gray-600'} ${colors.hoverText} transition-colors`}
            >
              Pricing
            </Link>
            <Link 
              href="/help" 
              className={`${isActive('/help') ? `${colors.text} font-medium` : 'text-gray-600'} ${colors.hoverText} transition-colors`}
            >
              Help
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Dashboard Button */}
                <Link href="/customer/dashboard">
                  <Button className={`${colors.primary} ${colors.hover} text-white`}>
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <div className="relative group">
                  <button className={`flex items-center space-x-2 text-gray-700 ${colors.hoverText} py-2`}>
                    <div className={`w-8 h-8 ${colors.primary} rounded-full flex items-center justify-center`}>
                      <span className="text-white text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link href="/customer/dashboard" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                        <User className="w-4 h-4 mr-3" />
                        Dashboard
                      </Link>
                      <Link href="/customer/orders" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                        <ShoppingBag className="w-4 h-4 mr-3" />
                        My Orders
                      </Link>
                      <Link href="/customer/addresses" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                        <MapPin className="w-4 h-4 mr-3" />
                        Addresses
                      </Link>
                      <Link href="/customer/profile" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50">
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </Link>
                      <hr className="my-2" />
                      <button 
                        onClick={() => {
                          useAuthStore.getState().logout()
                          window.location.href = '/'
                        }}
                        className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/login">
                  <Button variant="outline" className={`${colors.border} ${colors.text} ${colors.lightBg}`}>
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className={`${colors.primary} ${colors.hover} text-white`}>
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t mt-4 pt-4 pb-2">
            <div className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className={`${isActive('/') ? `${colors.text} font-medium` : 'text-gray-600'} ${colors.hoverText} py-2`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/services" 
                className={`${isActive('/services') ? `${colors.text} font-medium` : 'text-gray-600'} ${colors.hoverText} py-2`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                href="/pricing" 
                className={`${isActive('/pricing') ? `${colors.text} font-medium` : 'text-gray-600'} ${colors.hoverText} py-2`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                href="/help" 
                className={`${isActive('/help') ? `${colors.text} font-medium` : 'text-gray-600'} ${colors.hoverText} py-2`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Help
              </Link>
              
              {isAuthenticated ? (
                <>
                  <hr className="my-2" />
                  <Link 
                    href="/customer/dashboard" 
                    className={`text-gray-600 ${colors.hoverText} py-2`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/customer/orders" 
                    className={`text-gray-600 ${colors.hoverText} py-2`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <Link 
                    href="/customer/addresses" 
                    className={`text-gray-600 ${colors.hoverText} py-2`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Addresses
                  </Link>
                  <Link 
                    href="/customer/profile" 
                    className={`text-gray-600 ${colors.hoverText} py-2`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button 
                    onClick={() => {
                      useAuthStore.getState().logout()
                      setMobileMenuOpen(false)
                      window.location.href = '/'
                    }}
                    className="text-left text-red-600 hover:text-red-700 py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className={`w-full ${colors.border} ${colors.text} ${colors.lightBg}`}>
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className={`w-full ${colors.primary} ${colors.hover} text-white`}>
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
