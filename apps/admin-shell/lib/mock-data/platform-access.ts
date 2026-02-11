/**
 * Platform (admin-shell) access: only users in the system org may access admin.
 * Must stay in sync with identity-remote mock-identity memberships for system org.
 */
const PLATFORM_USER_IDS = ['1'];

export function isUserInSystemOrg(userId: string | undefined | null): boolean {
  return Boolean(userId && PLATFORM_USER_IDS.includes(userId));
}
