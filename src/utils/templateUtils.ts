/**
 * Utility functions for handling template-specific features
 */

export type LandingPageTemplate = 'original' | 'minimal' | 'freshspin' | 'starter'

/**
 * Get the current template from URL or localStorage
 */
export function getCurrentTemplate(): LandingPageTemplate {
  if (typeof window === 'undefined') return 'original'
  
  // Check if we're on a tenant page
  const pathname = window.location.pathname
  const tenantMatch = pathname.match(/^\/([^\/]+)/)
  
  if (tenantMatch && tenantMatch[1] !== 'auth' && tenantMatch[1] !== 'admin') {
    // We're on a tenant page, template should be determined by tenant data
    // For now, return original as default - this will be overridden by tenant context
    return 'original'
  }
  
  // Check localStorage for template selection (using the correct key)
  const storedTemplate = localStorage.getItem('landing_template')
  if (storedTemplate && ['original', 'minimal', 'freshspin', 'starter'].includes(storedTemplate)) {
    return storedTemplate as LandingPageTemplate
  }
  
  return 'original'
}

/**
 * Get template-specific colors and styling
 */
export function getTemplateTheme(template: LandingPageTemplate) {
  const themes = {
    original: {
      primary: 'teal',
      secondary: 'cyan',
      accent: 'blue',
      gradient: 'from-teal-50 via-cyan-50 to-blue-50',
      cardGradient: 'from-teal-500 to-cyan-600',
      buttonGradient: 'from-teal-500 to-cyan-600',
      hoverGradient: 'from-teal-600 to-cyan-700',
    },
    minimal: {
      primary: 'gray',
      secondary: 'slate',
      accent: 'indigo',
      gradient: 'from-gray-50 via-slate-50 to-indigo-50',
      cardGradient: 'from-gray-600 to-slate-700',
      buttonGradient: 'from-indigo-500 to-purple-600',
      hoverGradient: 'from-indigo-600 to-purple-700',
    },
    freshspin: {
      primary: 'emerald',
      secondary: 'green',
      accent: 'lime',
      gradient: 'from-emerald-50 via-green-50 to-lime-50',
      cardGradient: 'from-emerald-500 to-green-600',
      buttonGradient: 'from-emerald-500 to-green-600',
      hoverGradient: 'from-emerald-600 to-green-700',
    },
    starter: {
      primary: 'purple',
      secondary: 'violet',
      accent: 'pink',
      gradient: 'from-purple-50 via-violet-50 to-pink-50',
      cardGradient: 'from-purple-500 to-violet-600',
      buttonGradient: 'from-purple-500 to-pink-600',
      hoverGradient: 'from-purple-600 to-pink-700',
    },
  }
  
  return themes[template]
}

/**
 * Get template-specific content and messaging
 */
export function getTemplateContent(template: LandingPageTemplate) {
  const content = {
    original: {
      brandName: 'LaundryLobby',
      tagline: 'Premium laundry service at your doorstep',
      loginTitle: 'Welcome Back!',
      loginSubtitle: 'Sign in to manage your orders and enjoy hassle-free laundry.',
      registerTitle: 'Join LaundryLobby',
      registerSubtitle: 'Create your account and experience premium laundry service.',
    },
    minimal: {
      brandName: 'CleanSpace',
      tagline: 'Simple. Clean. Efficient.',
      loginTitle: 'Sign In',
      loginSubtitle: 'Access your clean space.',
      registerTitle: 'Get Started',
      registerSubtitle: 'Join the clean revolution.',
    },
    freshspin: {
      brandName: 'FreshSpin',
      tagline: 'Fresh clothes, fresh you!',
      loginTitle: 'Welcome Back, Fresh Friend!',
      loginSubtitle: 'Ready for another fresh experience?',
      registerTitle: 'Join the Fresh Revolution!',
      registerSubtitle: 'Get ready for the freshest laundry experience ever!',
    },
    starter: {
      brandName: 'LaundryMaster',
      tagline: 'Master of clean, expert in care',
      loginTitle: 'Welcome Back, Master!',
      loginSubtitle: 'Access your premium laundry management dashboard.',
      registerTitle: 'Become a LaundryMaster',
      registerSubtitle: 'Join the elite circle of premium laundry service.',
    },
  }
  
  return content[template]
}