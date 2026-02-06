import { create } from 'zustand';
import { AuthState, User } from '../types';

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: '1',
    username: 'Demo User',
    email: 'demo@3play.cz',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    subscribers: 0,
    isVerified: false,
    createdAt: new Date().toISOString(),
    chatColor: '#000000',
    twoFactorEnabled: false
  }, // Default mock user for development
  isAuthenticated: true,
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
}));
