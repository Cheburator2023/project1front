import { useUserStore } from '../stores';
import { Permission, Role } from '../types';

export const usePermissions = () => {
  const { permissions, hasPermission } = useUserStore();

  return {
    permissions,
    hasPermission,
    isAddModelEnabled: hasPermission(Permission.ADD_MODEL),
    isEditModelEnabled: hasPermission(Permission.EDIT_MODEL),
    isAddPublicTemplateEnabled: hasPermission(Permission.ADD_PUBLIC_TEMPLATE),
    isEditAllocationEnabled: hasPermission(Permission.EDIT_ALLOCATION),
  };
};
