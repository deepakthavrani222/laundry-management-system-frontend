'use client'

import { useState, useEffect } from 'react'
import { Settings, X, Sun, Moon, Monitor, RotateCcw, CheckCircle } from 'lucide-react'

export type ThemeColor = 'teal' | 'blue' | 'purple' | 'orange'
export type SchemeMode = 'light' | 'dark' | 'auto'
export type Language = 'en' | 'es' | 'hi'

// Professional Theme Colors Interface
export interface ThemeColors {
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

// Light Mode Palettes
export const lightPalettes: Record<ThemeColor, ThemeColors> = {
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

// Dark Mode Palettes
export const darkPalettes: Record<ThemeColor, ThemeColors> = {
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
export const getThemeColors = (colorName: ThemeColor, scheme: SchemeMode): ThemeColors => {
  if (scheme === 'dark') return darkPalettes[colorName]
  if (scheme === 'light') return lightPalettes[colorName]
  // Auto - check system preference
  if (typeof window !== 'undefined') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? darkPalettes[colorName] : lightPalettes[colorName]
  }
  return lightPalettes[colorName]
}

interface SettingsPanelProps {
  themeColor: ThemeColor
  currentLanguage: Language
  currentScheme: SchemeMode
  onColorChange?: (color: ThemeColor) => void
  onLanguageChange?: (language: Language) => void
  onSchemeChange?: (scheme: SchemeMode) => void
}

export default function SettingsPanel({ 
  themeColor,
  currentLanguage,
  currentScheme,
  onColorChange,
  onLanguageChange,
  onSchemeChange,
}: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { id: 'en', name: 'English', flag: '🇺🇸' },
    { id: 'es', name: 'Español', flag: '🇪🇸' },
    { id: 'hi', name: 'हिंदी', flag: '🇮🇳' },
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
          <h2 className="text-xl font-bold text-gray-800">Settings</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-60px)]">
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
        </div>
      </div>
    </>
  )
}
