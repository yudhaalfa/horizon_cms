import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'ADMIN' | 'MERCHANT';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  storeName?: string;
}

interface AuthState {
  user: User | null;
  usersDatabase: User[];
  login: (email: string, pass: string) => boolean;
  register: (data: Omit<User, 'id'>) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null as User | null,

      usersDatabase: [
        {
          id: 'ADM-001',
          name: 'Super Admin',
          email: 'admin@srg.com',
          password: '123',
          role: 'ADMIN',
        },
      ],

      login: (email, pass) => {
        const foundUser = get().usersDatabase.find(
          (u) => u.email === email && u.password === pass,
        );

        if (foundUser) {
          set({ user: foundUser });
          return true;
        }
        return false;
      },

      register: (userData) => {
        const { usersDatabase } = get();

        const emailExists = usersDatabase.some(
          (u) => u.email === userData.email,
        );
        if (emailExists) return false;

        const newUser: User = {
          ...userData,
          id: `MERCH-${Math.floor(1000 + Math.random() * 9000)}`,
          role: 'MERCHANT',
        };

        set({
          usersDatabase: [...usersDatabase, newUser],
          user: newUser,
        });

        return true;
      },

      logout: () => set({ user: null as User | null }),
    }),
    {
      name: 'auth-storage',
    },
  ),
);
