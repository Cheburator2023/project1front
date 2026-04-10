import { Role } from '../types';

/**
 * Maps Keycloak groups to app roles. Test users use the same group names as production
 * (business_customer, ds_lead, validator_lead, …).
 */
export function keycloakGroupsToRoles(groups: string[] | undefined): Role[] {
  if (!groups?.length) {
    return [];
  }

  const roles = new Set<Role>();
  const roleValues = new Set<string>(Object.values(Role));

  groups.forEach((group) => {
    if (roleValues.has(group)) {
      roles.add(group as Role);
    }
  });

  return Array.from(roles);
}
