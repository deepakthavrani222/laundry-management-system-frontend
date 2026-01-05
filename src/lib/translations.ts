import enMessages from '../../messages/en.json'
import esMessages from '../../messages/es.json'
import hiMessages from '../../messages/hi.json'

export type Language = 'en' | 'es' | 'hi'

export const languages = [
  { id: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { id: 'es' as Language, name: 'Español', flag: '🇪🇸' },
  { id: 'hi' as Language, name: 'हिंदी', flag: '🇮🇳' },
]

// Type for nested translation object
type TranslationValue = string | { [key: string]: TranslationValue }
type TranslationMessages = { [key: string]: TranslationValue }

// Load messages from JSON files
const messages: Record<Language, TranslationMessages> = {
  en: enMessages,
  es: esMessages,
  hi: hiMessages,
}

// Helper function to get nested value from object using dot notation
function getNestedValue(obj: TranslationMessages, path: string): string | undefined {
  const keys = path.split('.')
  let current: TranslationValue | undefined = obj
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as TranslationMessages)[key]
    } else {
      return undefined
    }
  }
  
  return typeof current === 'string' ? current : undefined
}

// Convert flat key (e.g., 'nav.home') to nested path
export function getTranslation(lang: Language, key: string): string {
  // Try to get from nested structure first
  const value = getNestedValue(messages[lang], key)
  if (value) return value
  
  // Fallback to English
  const fallback = getNestedValue(messages['en'], key)
  if (fallback) return fallback
  
  // Return key if not found
  return key
}

// Export translations object for backward compatibility (flattened)
function flattenMessages(obj: TranslationMessages, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {}
  
  for (const key in obj) {
    const value = obj[key]
    const newKey = prefix ? `${prefix}.${key}` : key
    
    if (typeof value === 'string') {
      result[newKey] = value
    } else if (typeof value === 'object') {
      Object.assign(result, flattenMessages(value as TranslationMessages, newKey))
    }
  }
  
  return result
}

// Flattened translations for backward compatibility
export const translations: Record<Language, Record<string, string>> = {
  en: flattenMessages(messages.en),
  es: flattenMessages(messages.es),
  hi: flattenMessages(messages.hi),
}
