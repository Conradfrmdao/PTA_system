import { create } from 'zustand';
import type { ApiUser } from '@/types/api';

type AuthState = {
  user: ApiUser | null;
  accessToken: string | null;
  isRestoring: boolean;
  setSession: (user: ApiUser, accessToken: string) => void;
  setRestoring: (isRestoring: boolean) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isRestoring: true,
  setSession: (user, accessToken) => set({ user, accessToken, isRestoring: false }),
  setRestoring: (isRestoring) => set({ isRestoring }),
  clearSession: () => set({ user: null, accessToken: null, isRestoring: false }),
}));
