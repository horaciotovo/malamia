import { create } from 'zustand';
import { User } from '../types';
import { authApi } from '../services/api';

interface AdminAuthState {
  admin: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AdminAuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initFromStorage: () => void;
  setAuthFromUser: (user: User) => void;
  clearError: () => void;
}

export const useAdminAuthStore = create<AdminAuthState & AdminAuthActions>((set) => ({
  admin: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initFromStorage: () => {
    const token = localStorage.getItem('adminToken');
    const adminJson = localStorage.getItem('adminUser');
    if (token && adminJson) {
      try {
        const admin = JSON.parse(adminJson) as User;
        set({ admin, isAuthenticated: true });
      } catch {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.adminLogin(email, password);
      const { user, accessToken } = data.data;
      localStorage.setItem('adminToken', accessToken);
      localStorage.setItem('adminUser', JSON.stringify(user));
      set({ admin: user, isAuthenticated: true, error: null });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Login failed. Check your credentials.';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    set({ admin: null, isAuthenticated: false });
  },

  setAuthFromUser: (user: User) => {
    set({ admin: user, isAuthenticated: true });
  },

  clearError: () => set({ error: null }),
}));
