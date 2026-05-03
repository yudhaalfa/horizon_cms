import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

export type Role = 'admin' | 'merchant' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthState {
  user: User;
  token: string | null;
  isAuthenticated: boolean;
  role: Role;

  login: (userData: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        role: 'guest',

        login: (userData, token) =>
          set(
            {
              user: userData,
              token: token,
              isAuthenticated: true,
              role: userData.role,
            },
            false,
            'auth/login',
          ),

        logout: () =>
          set(
            {
              user: null,
              token: null,
              isAuthenticated: false,
              role: 'guest',
            },
            false,
            'auth/logout',
          ),
      }),
      {
        name: 'cms-auth-storage',
      },
    ),
    { name: 'AuthStore' },
  ),
);
