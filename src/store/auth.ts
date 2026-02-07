import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '../types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null, // Start with no user to force login or rely on persisted state
      isAuthenticated: false,
      isLoading: false,
      login: (user: User) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUser: (updates: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      verify2FA: async (code: string) => {
        // Mock verification
        console.log('Verifying code:', code);
        return code === '123456';
      }
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
    }
  )
);
