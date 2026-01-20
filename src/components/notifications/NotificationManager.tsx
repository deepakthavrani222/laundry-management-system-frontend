'use client'

import React, { useState, useCallback, useEffect } from 'react'
import SlideNotification from './SlideNotification'

export interface NotificationData {
  id: string
  title: string
  message: string
  type: 'permission_update' | 'order_update' | 'customer_update' | 'system_alert' | 'role_change' | 'info' | 'success' | 'warning' | 'error'
  duration?: number
  actionText?: string
  onAction?: () => void
  timestamp: number
}

interface NotificationManagerProps {
  maxNotifications?: number
}

const NotificationManager: React.FC<NotificationManagerProps> = ({ 
  maxNotifications = 5 
}) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([])

  // Add notification function
  const addNotification = useCallback((notification: Omit<NotificationData, 'id' | 'timestamp'>) => {
    const newNotification: NotificationData = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    }

    setNotifications(prev => {
      // Remove oldest if exceeding max
      const updated = [newNotification, ...prev].slice(0, maxNotifications)
      return updated
    })

    // Play notification sound
    playNotificationSound(notification.type)
  }, [maxNotifications])

  // Remove notification function
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Play notification sound based on type
  const playNotificationSound = (type: NotificationData['type']) => {
    try {
      // Create audio context for different sounds
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Different frequencies for different notification types
      const frequencies = {
        permission_update: 800,
        order_update: 600,
        customer_update: 700,
        system_alert: 400,
        role_change: 900,
        success: 800,
        warning: 600,
        error: 400,
        info: 700
      }

      const frequency = frequencies[type] || 700
      
      // Create oscillator for sound
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      oscillator.type = 'sine'
      
      // Sound envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.log('Audio not supported or blocked')
    }
  }

  // Expose addNotification globally for WebSocket integration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__addSlideNotification = addNotification
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__addSlideNotification
      }
    }
  }, [addNotification])

  return (
    <div className="fixed top-0 right-0 z-50 pointer-events-none">
      <div className="flex flex-col gap-2 p-4">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className="pointer-events-auto"
            style={{
              transform: `translateY(${index * 10}px)`,
              zIndex: 50 - index
            }}
          >
            <SlideNotification
              {...notification}
              onClose={removeNotification}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default NotificationManager