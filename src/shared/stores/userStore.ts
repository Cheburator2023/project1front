import { create } from 'zustand';

interface UserStoreState {
  username: string;
  setUsername: (username: string) => void;
}

export const useUserStore = create<UserStoreState>((set) => ({
  username: null,
  setUsername: (username: string) => set({ username }),
}));

