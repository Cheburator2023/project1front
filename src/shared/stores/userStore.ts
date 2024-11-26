import { create } from 'zustand';

interface UserStoreState {
  username: string;
  roles: string[];
  setUsername: (username: string) => void;
  setRoles: (roles: string[]) => void;
}

export const useUserStore = create<UserStoreState>((set) => ({
  username: null,
  roles: [],
  setUsername: (username: string) => set({ username }),
  setRoles: (roles: string[]) => set({ roles }),
}));

