import { Role } from '../types';

/** Keycloak test realm groups → canonical Role (same as backend artefact_source_roles). */
const TEST_GROUP_TO_ROLE: Record<string, Role> = {
  test_business_customer: Role.BUSINESS_CUSTOMER,
  test_validator_lead: Role.VALIDATOR_LEAD,
  test_validator: Role.VALIDATOR,
  test_ds_lead: Role.DS_LEAD,
  test_ds: Role.DS,
  test_de: Role.DE,
  test_de_lead: Role.DE_LEAD,
  test_admin_it: Role.ADMIN_IT,
  test_admin_it_lead: Role.ADMIN_IT_LEAD,
};

/**
 * Maps Keycloak groups to app roles. Test groups (test_*_) are aligned with production
 * roles so ModelForm / useRoles match backend permission flags.
 */
export function keycloakGroupsToRoles(groups: string[] | undefined): Role[] {
  if (!groups?.length) {
    return [];
  }

  const roles = new Set<Role>();
  const roleValues = new Set<string>(Object.values(Role));

  groups.forEach((group) => {
    const mapped = TEST_GROUP_TO_ROLE[group];
    if (mapped) {
      roles.add(mapped);
      return;
    }
    if (roleValues.has(group)) {
      roles.add(group as Role);
    }
  });

  return Array.from(roles);
}
