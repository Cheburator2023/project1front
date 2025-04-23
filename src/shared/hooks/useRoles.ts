import { useUserStore } from '../stores';
import { Role } from '../types';

export const useRoles = () => {
  const { roles } = useUserStore();
  const { hasRole } = useUserStore();

  return {
    roles,
    hasRole,
    isAdmin: hasRole(Role.ADMIN_IT) || hasRole(Role.ADMIN_IT_LEAD),
    isDs: hasRole(Role.DS),
    isDsLead: hasRole(Role.DS_LEAD),
    isValidatorLead: hasRole(Role.VALIDATOR_LEAD),
    isValidator: hasRole(Role.VALIDATOR),
    isBusinessCustomer: hasRole(Role.BUSINESS_CUSTOMER),
  };
};

