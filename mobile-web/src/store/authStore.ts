import { create } from 'zustand'
import { User } from '../types'
import { authApi } from '../services/api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  initFromStorage: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initFromStorage: () => {
    const token = localStorage.getItem('userToken')
    const userJson = localStorage.getItem('userData')
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User
        set({ user, isAuthenticated: true })
      } catch {
        localStorage.removeItem('userToken')
        localStorage.removeItem('userData')
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await authApi.login(email, password)
      const { user, accessToken } = data.data
      localStorage.setItem('userToken', accessToken)
      localStorage.setItem('userData', JSON.stringify(user))
      set({ user, isAuthenticated: true, error: null })
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Login failed'
      set({ error: message })
      throw new Error(message)
    } finally {
      set({ isLoading: false })
    }
  },

  logout: () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('userData')
    set({ user: null, isAuthenticated: false })
  },

  clearError: () => set({ error: null }),
}))
