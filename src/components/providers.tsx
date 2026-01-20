'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'
import { TenancyThemeProvider } from '@/contexts/TenancyThemeContext'
import { PermissionSyncProvider } from './PermissionSyncProvider'
import NotificationManager from './notifications/NotificationManager'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <TenancyThemeProvider>
        <PermissionSyncProvider>
          {children}
        </PermissionSyncProvider>
      </TenancyThemeProvider>
      <NotificationManager />
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#374151',
            borderRadius: '8px',
            padding: '12px 16px',
            border: '1px solid #e5e7eb',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          success: {
            style: {
              background: '#f0fdf4',
              color: '#166534',
              border: '1px solid #22c55e',
            },
            iconTheme: {
              primary: '#22c55e',
              secondary: '#f0fdf4',
            },
          },
          error: {
            style: {
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #f87171',
            },
            iconTheme: {
              primary: '#f87171',
              secondary: '#fef2f2',
            },
          },
        }}
      />
    </QueryClientProvider>
  )
}
