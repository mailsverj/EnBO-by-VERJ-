import { create } from 'zustand';
import { Role, mockUsers } from '@/data/mock';

interface AuthState {
  user: typeof mockUsers[0];
  setUser: (user: typeof mockUsers[0]) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: mockUsers[0], // Default to Super Admin
  setUser: (user) => set({ user }),
}));
