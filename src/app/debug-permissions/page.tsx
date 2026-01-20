'use client'

import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { useState } from 'react'

export default function DebugPermissions() {
  const { user, setAuth, logout } = useAuthStore()
  const [apiResponse, setApiResponse] = useState<any>(null)

  const testLoginAPI = async () => {
    try {
      const response = await api.post('/auth/login', {
        email: 'shkrkand@gmail.com',
        password: 'admin123'
      })
      
      setApiResponse(response.data.data)
      console.log('🔍 Fresh login API response:', response.data.data)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const clearCacheAndReload = () => {
    localStorage.clear()
    window.location.reload()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Permissions</h1>
      
      <div className="space-y-6">
        {/* Current Store State */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Current Store State</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify({
              hasUser: !!user,
              userEmail: user?.email,
              userRole: user?.role,
              supportPermissions: user?.permissions?.support
            }, null, 2)}
          </pre>
        </div>

        {/* Full Permissions */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">All User Permissions</h2>
          <pre className="text-sm overflow-auto max-h-64">
            {JSON.stringify(user?.permissions, null, 2)}
          </pre>
        </div>

        {/* API Test */}
        <div className="bg-blue-50 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Test Fresh Login API</h2>
          <Button onClick={testLoginAPI} className="mb-4">
            Test Login API
          </Button>
          
          {apiResponse && (
            <div>
              <h3 className="font-medium mb-2">API Response Support Permissions:</h3>
              <pre className="text-sm bg-white p-2 rounded">
                {JSON.stringify(apiResponse.user.permissions.support, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-red-50 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Actions</h2>
          <div className="space-x-2">
            <Button onClick={clearCacheAndReload} variant="outline">
              Clear Cache & Reload
            </Button>
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </div>

        {/* LocalStorage Debug */}
        <div className="bg-yellow-50 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">LocalStorage Data</h2>
          <pre className="text-sm overflow-auto">
            {typeof window !== 'undefined' ? 
              JSON.stringify(JSON.parse(localStorage.getItem('laundry-auth') || '{}'), null, 2) : 
              'Loading...'
            }
          </pre>
        </div>
      </div>
    </div>
  )
}