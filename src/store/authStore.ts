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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setAuth: (user, token) => {
        // console.log('🔥 Setting auth in store:', { user, token: token ? 'present' : 'none' })
        // Token is now stored in HTTP-only cookie by backend
        // We keep token in state for backward compatibility but cookie is primary
        set({ user, token, isAuthenticated: true })
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
      }
    }),
    {
      name: 'laundry-auth',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // console.log('🔥 Auth store rehydrated:', state)
        state?.setHasHydrated(true)
      }
    }
  )
)
