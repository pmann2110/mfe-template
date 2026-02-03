import type { Session, Permission } from '@repo/auth-core';

export function can(permission: Permission, session: Session | null): boolean {
  if (!session) return false;

  // Admin has all permissions
  if (session.user.roles.includes('admin')) return true;

  // Check if user has the specific permission as a role
  return session.user.roles.includes(permission);
}

/**
 * Check permission using permissions array directly (for next-auth compatibility).
 * Uses only permission strings (e.g. admin:access, user:read). Admin role is mapped
 * to admin:access in auth-options when building the session.
 */
export function canWithPermissions(
  permission: Permission,
  permissions: string[] | null | undefined,
): boolean {
  if (!permissions || permissions.length === 0) return false;

  if (permissions.includes('admin:access')) return true;

  return permissions.includes(permission);
}

export function hasAnyPermission(
  permissions: Permission[],
  session: Session | null,
): boolean {
  return permissions.some((p) => can(p, session));
}

export function hasAllPermissions(
  permissions: Permission[],
  session: Session | null,
): boolean {
  return permissions.every((p) => can(p, session));
}
