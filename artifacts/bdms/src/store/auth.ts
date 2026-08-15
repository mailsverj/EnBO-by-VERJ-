import { create } from 'zustand';
import { UserRecord, mockUsers } from '@/data/mock';

interface AuthState {
  user: UserRecord;
  setUser: (user: UserRecord) => void;
  hasRole: (role: string) => boolean;
  canSeePrices: () => boolean;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: mockUsers[0],
  setUser: (user) => set({ user }),
  hasRole: (role) => get().user.roles.includes(role as any),
  canSeePrices: () => {
    const roles = get().user.roles;
    return roles.includes('Chief Admin') || roles.includes('Super Admin') || roles.includes('Sales') || roles.includes('Sales Admin') || roles.includes('Finance') || roles.includes('Management');
  },
}));