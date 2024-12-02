import { create } from 'zustand';
import { Role, UserRoles } from '../types';

interface UserStoreState {
  username: string | null;
  groups: string[];
  roles: UserRoles;
  setUsername: (username: string) => void;
  setGroups: (roles: string[]) => void;
  setRoles: (role: UserRoles) => void;
  hasRole: (role: Role) => boolean;
}

export const useUserStore = create<UserStoreState>((set) => ({
  username: null,
  groups: [],
  roles: [],
  setUsername: (username: string) => set({ username }),
  setGroups: (groups: string[]) => set({ groups }),
  setRoles: (roles: UserRoles) => set({ roles }),
  hasRole: (role: Role) => {
    const { roles } = useUserStore.getState();
    return roles.includes(role);
  },
}));

