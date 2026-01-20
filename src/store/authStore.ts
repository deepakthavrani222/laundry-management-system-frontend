import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type UserRole = 'customer' | 'admin' | 'branch_admin' | 'staff' | 'superadmin'

interface User {
  _id: string
  name: string
  email: string
  phone: string
  role: UserRole
  isActive: boolean
  isVIP?: boolean
  assignedBranch?: string
  permissions?: Record<string, Record<string, boolean>>
  features?: Record<string, boolean | number> // Features from tenancy subscription
  tenancy?: {
    _id?: string
    subscription?: {
      plan?: string
      status?: string
      features?: Record<string, boolean | number>
      trialEndsAt?: string
    }
  }
  subscription?: {
    plan?: string
    status?: string
    features?: Record<string, boolean | number>
    trialEndsAt?: string
  }
}

interface AuthState {
  user: User | null
  token: string | null  // Keep for backward compatibility, but cookie is primary
  isAuthenticated: boolean
  _hasHydrated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  setHasHydrated: (state: boolean) => void
  refreshUserData: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setAuth: (user, token) => {
        console.log('🔥 Setting auth in store with user:', {
          name: user.name,
          email: user.email,
          supportPermissions: user.permissions?.support
        })
        
        console.log('🔥 Full user permissions being set:', JSON.stringify(user.permissions, null, 2))
        
        // Token is now stored in HTTP-only cookie by backend
        // We keep token in state for backward compatibility but cookie is primary
        set({ user, token, isAuthenticated: true })
        
        console.log('🔥 Auth set complete, checking store state...')
        const currentState = get()
        console.log('🔥 Current store support permissions:', currentState.user?.permissions?.support)
      },
      logout: () => {
        // Cookie will be cleared by backend on logout API call
        set({ user: null, token: null, isAuthenticated: false })
      },
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),
      setHasHydrated: (state) => {
        set({ _hasHydrated: state })
      },
      refreshUserData: async () => {
        try {
          console.log('🔄 Refreshing user data...');
          
          // Call permission sync API to get latest user data
          const response = await fetch('/api/permissions/sync', {
            method: 'GET',
            credentials: 'include', // Include cookies
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            if (response.status === 401) {
              console.log('🔐 Authentication expired during refresh');
              // Don't throw error, just log it
              return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          
          if (data.success && data.data.user) {
            const updatedUser = data.data.user;
            console.log('✅ User data refreshed:', {
              name: updatedUser.name,
              email: updatedUser.email,
              permissionModules: Object.keys(updatedUser.permissions || {}).length,
              featureCount: Object.keys(updatedUser.features || {}).length
            });
            
            // Update user in store
            set((state) => ({
              user: state.user ? { ...state.user, ...updatedUser } : updatedUser
            }));
            
            console.log('🔄 User data updated in store');
          } else {
            throw new Error(data.message || 'Failed to refresh user data');
          }
        } catch (error) {
          console.error('❌ Failed to refresh user data:', error);
          
          // Don't throw error if it's a network issue or auth issue
          if (error instanceof TypeError && error.message.includes('fetch')) {
            console.log('🌐 Network error during refresh, will retry later');
            return;
          }
          
          throw error;
        }
      }
    }),
    {
      name: 'laundry-auth',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        console.log('🔥 Auth store rehydrated with state:', {
          hasUser: !!state?.user,
          userEmail: state?.user?.email,
          supportPermissions: state?.user?.permissions?.support
        })
        state?.setHasHydrated(true)
      }
    }
  )
)
