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
          
          // Call profile API to get latest user data (includes tenancy features)
          const response = await fetch('/api/auth/profile', {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          console.log('🔄 Profile API response status:', response.status);

          if (!response.ok) {
            if (response.status === 401) {
              console.log('🔐 Authentication expired during refresh');
              // Don't throw error, just log it
              return;
            }
            
            const errorText = await response.text();
            console.log('❌ Profile API error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
          }

          const data = await response.json();
          console.log('🔄 Profile API response data:', {
            success: data.success,
            hasData: !!data.data,
            dataKeys: data.data ? Object.keys(data.data) : []
          });
          
          if (data.success && data.data) {
            const updatedUserData = data.data;
            console.log('✅ User data refreshed:', {
              id: updatedUserData.id,
              email: updatedUserData.email,
              permissionModules: Object.keys(updatedUserData.permissions || {}).length,
              featureCount: Object.keys(updatedUserData.features || {}).length,
              tenancyId: updatedUserData.tenancy?._id,
              tenancyName: updatedUserData.tenancy?.name
            });
            
            // Update user in store with the complete data structure
            set((state) => ({
              user: state.user ? { 
                ...state.user, 
                permissions: updatedUserData.permissions || {},
                features: updatedUserData.features || {},
                tenancy: updatedUserData.tenancy,
                // Update other fields that might have changed
                name: updatedUserData.name,
                phone: updatedUserData.phone,
                isEmailVerified: updatedUserData.isEmailVerified,
                phoneVerified: updatedUserData.phoneVerified
              } : null
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
          
          // If it's a 401, don't throw - let the auth guard handle it
          if (error.message && error.message.includes('401')) {
            console.log('🔐 Authentication error during refresh, auth guard will handle');
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
        
        // Expose updateUser function globally for WebSocket access
        if (typeof window !== 'undefined') {
          (window as any).__updateAuthStore = (userData: Partial<User>) => {
            console.log('🔥 Global auth store update called with:', userData);
            state?.updateUser(userData);
          };
          console.log('🌐 Exposed __updateAuthStore globally');
        }
      }
    }
  )
)
