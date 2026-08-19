import { create } from 'zustand';
import { api, type SafeUser } from '@/lib/api';

interface AuthState {
  user: SafeUser | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<SafeUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  canSeePrices: () => boolean;
  hasRole: (role: string) => boolean;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,

  login: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const { user } = await api.auth.login(email, password);
      set({ user, loading: false, initialized: true });
      return user;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: async () => {
    await api.auth.logout();
    set({ user: null, initialized: true });
  },

  refresh: async () => {
    set({ loading: true });
    try {
      const { user } = await api.auth.me();
      set({ user, loading: false, initialized: true });
    } catch {
      set({ user: null, loading: false, initialized: true });
    }
  },

  canSeePrices: () => {
    const roles = get().user?.roles ?? [];
    const priceRoles = ['Chief Admin', 'Super Admin', 'Sales', 'Sales Admin', 'Finance', 'Management'];
    return roles.some(r => priceRoles.includes(r));
  },

  hasRole: (role: string) => {
    return get().user?.roles?.includes(role) ?? false;
  },
}));
