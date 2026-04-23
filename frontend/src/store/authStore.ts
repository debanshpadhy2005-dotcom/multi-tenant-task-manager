import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginCredentials, RegisterData } from '../types';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        try {
          set({ isLoading: true });
          const response = await authService.login(credentials);
          
          const { user, tokens } = response;
          
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
          
          set({ user, isAuthenticated: true, isLoading: false });
          toast.success('Welcome back!');
        } catch (error: any) {
          set({ isLoading: false });
          const errorMsg = error.response?.data?.error || 'Login failed';
          toast.error(errorMsg);
          throw error;
        }
      },

      register: async (data) => {
        try {
          set({ isLoading: true });
          const response = await authService.register(data);
          
          const { user, tokens } = response;
          
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
          
          set({ user, isAuthenticated: true, isLoading: false });
          toast.success('Account created successfully!');
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('auth-storage');
          set({ user: null, isAuthenticated: false });
          toast.success('Logged out successfully');
        }
      },

      loadUser: async () => {
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) {
            set({ isAuthenticated: false, user: null });
            return;
          }

          const user = await authService.getProfile();
          set({ user, isAuthenticated: true });
        } catch (error) {
          set({ isAuthenticated: false, user: null });
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('auth-storage');
        }
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
