export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  banner?: string;
  description?: string;
  subscribers: number;
  isVerified: boolean;
  createdAt: string;
  chatColor?: string;
  twoFactorEnabled?: boolean;
  socialAccounts?: {
    google?: string;
    facebook?: string;
    microsoft?: string;
    seznam?: string;
    tiktok?: string;
    instagram?: string;
    telegram?: string;
    whatsapp?: string;
    snapchat?: string;
    apple?: string;
    oneplay?: string;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  verify2FA: (code: string) => Promise<boolean>;
}
