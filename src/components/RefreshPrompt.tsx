'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface RefreshPromptProps {
  onRefresh: () => void
  onDismiss: () => void
}

export default function RefreshPrompt({ onRefresh, onDismiss }: RefreshPromptProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleRefresh = () => {
    setIsVisible(false)
    onRefresh()
  }

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss()
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] animate-in slide-in-from-top duration-300">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 min-w-[400px] max-w-[500px]">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xl">🔄</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Changes Detected
            </h3>
            <p className="text-sm text-gray-600">
              Please refresh to see new changes in sidebar.
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex gap-2 justify-end">
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Later
          </button>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors shadow-sm"
          >
            Refresh Now
          </button>
        </div>
      </div>
    </div>
  )
}
