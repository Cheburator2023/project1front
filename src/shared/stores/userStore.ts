import { StoreApi, UseBoundStore, create } from 'zustand';
import { Permission, UserPermissions, Role, UserRoles } from '../types';

const NO_ROLES = process.env.NO_ROLES;

interface UserStoreState {
  username: string | null;
  groups: string[];
  roles: UserRoles;
  permissions: UserPermissions;
  setUsername: (username: string) => void;
  setGroups: (roles: string[]) => void;
  setRoles: (role: UserRoles) => void;
  setPermissions: (permissions: UserPermissions) => void;
  hasRole: (role: Role) => boolean;
  hasPermission: (permission: Permission) => boolean;
}

export const useUserStore: UseBoundStore<StoreApi<UserStoreState>> = create<UserStoreState>(
  (set) => ({
    username: null,
    groups: [],
    roles: [],
    permissions: [],
    setUsername: (username: string) => set({ username }),
    setGroups: (groups: string[]) => set({ groups }),
    setRoles: (roles: UserRoles) => set({ roles }),
    setPermissions: (permissions: UserPermissions) => set({ permissions }),
    hasRole: (role: Role) => {
      const { roles } = useUserStore.getState();
      return roles.includes(role);
    },
    hasPermission: (permission: Permission) => {
      const { permissions } = useUserStore.getState();
      return NO_ROLES ? true : permissions.includes(permission);
    },
  }),
);
