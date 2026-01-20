'use client'

import React, { useState, useEffect } from 'react'
import { Bell, X, Shield, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

interface SlideNotificationProps {
  id: string
  title: string
  message: string
  type: 'permission_update' | 'order_update' | 'customer_update' | 'system_alert' | 'role_change' | 'info' | 'success' | 'warning' | 'error'
  duration?: number
  onClose: (id: string) => void
  onAction?: () => void
  actionText?: string
}

const SlideNotification: React.FC<SlideNotificationProps> = ({
  id,
  title,
  message,
  type,
  duration = 5000,
  onClose,
  onAction,
  actionText
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  // Show notification with slide-in animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Auto-hide after duration
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose(id)
    }, 300) // Match animation duration
  }

  const getNotificationStyles = () => {
    const baseStyles = "flex items-start gap-3 p-4 rounded-lg shadow-lg border-l-4 backdrop-blur-sm"
    
    switch (type) {
      case 'permission_update':
        return `${baseStyles} bg-yellow-50 border-yellow-400 text-yellow-800`
      case 'order_update':
        return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800`
      case 'customer_update':
        return `${baseStyles} bg-green-50 border-green-400 text-green-800`
      case 'system_alert':
        return `${baseStyles} bg-red-50 border-red-400 text-red-800`
      case 'role_change':
        return `${baseStyles} bg-purple-50 border-purple-400 text-purple-800`
      case 'success':
        return `${baseStyles} bg-green-50 border-green-400 text-green-800`
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-400 text-yellow-800`
      case 'error':
        return `${baseStyles} bg-red-50 border-red-400 text-red-800`
      default:
        return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800`
    }
  }

  const getIcon = () => {
    const iconClass = "w-6 h-6 flex-shrink-0 mt-0.5"
    
    switch (type) {
      case 'permission_update':
        return <Bell className={`${iconClass} text-yellow-600`} />
      case 'order_update':
        return <Bell className={`${iconClass} text-blue-600`} />
      case 'customer_update':
        return <Bell className={`${iconClass} text-green-600`} />
      case 'system_alert':
        return <AlertTriangle className={`${iconClass} text-red-600`} />
      case 'role_change':
        return <Shield className={`${iconClass} text-purple-600`} />
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-600`} />
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-yellow-600`} />
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-600`} />
      default:
        return <Info className={`${iconClass} text-blue-600`} />
    }
  }

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isExiting 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }
      `}
      style={{
        animation: isVisible && !isExiting 
          ? 'slideInRight 0.3s ease-out' 
          : isExiting 
          ? 'slideOutRight 0.3s ease-in' 
          : undefined
      }}
    >
      <div className={getNotificationStyles()}>
        {/* Icon */}
        {getIcon()}
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm mb-1">
            {title}
          </div>
          <div className="text-sm opacity-90 leading-relaxed">
            {message}
          </div>
          
          {/* Action Button */}
          {onAction && actionText && (
            <button
              onClick={onAction}
              className="mt-2 px-3 py-1 text-xs font-medium rounded-md bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
            >
              {actionText}
            </button>
          )}
        </div>
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default SlideNotification