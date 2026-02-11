import { setUserRoleInOrg } from './mock-identity';

/**
 * Set or update a user's role in an organization (membership).
 * Used when saving user form in org-scoped context.
 */
export async function setUserRoleInOrganization(
  userId: string,
  organizationId: string,
  roleId: string
): Promise<void> {
  setUserRoleInOrg(userId, organizationId, roleId);
}
