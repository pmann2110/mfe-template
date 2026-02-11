import type { Session, Permission } from '@repo/auth-core';
import {
  type SystemPermission,
  SYSTEM_PERMISSIONS,
  getSystemPermissionsFromRoles,
} from './permission-matrix';

/**
 * Check permission using session (roles + permissions).
 * Prefer session.user.permissions when available; fall back to admin role for full access.
 */
export function can(permission: Permission, session: Session | null): boolean {
  if (!session) return false;

  // Admin role has all permissions
  if (session.user.roles.includes('admin')) return true;

  // Use permissions array when present (e.g. NextAuth session)
  const permissions = session.user.permissions;
  if (Array.isArray(permissions) && permissions.length > 0) {
    if (permissions.includes('admin:access')) return true;
    return permissions.includes(permission);
  }

  return false;
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

/**
 * Resolve effective system permissions for a session (from roles matrix + permissions array).
 */
function getEffectiveSystemPermissions(session: Session | null): SystemPermission[] {
  if (!session) return [];
  const fromRoles = getSystemPermissionsFromRoles(session.user.roles ?? []);
  const fromPerms = (session.user.permissions ?? []).filter((p) =>
    (SYSTEM_PERMISSIONS as readonly string[]).includes(p),
  ) as unknown as SystemPermission[];
  const set = new Set<SystemPermission>([...fromRoles, ...fromPerms]);
  return [...set];
}

/**
 * Check system-level permission using session (platform scope, no org context).
 */
export function canSystem(
  permission: SystemPermission,
  session: Session | null,
): boolean {
  const perms = getEffectiveSystemPermissions(session);
  return perms.includes(permission);
}

/**
 * Check system permission using a resolved system permissions array.
 */
export function canWithSystemPermissions(
  permission: SystemPermission,
  systemPermissions: string[] | null | undefined,
): boolean {
  if (!systemPermissions || systemPermissions.length === 0) return false;
  return systemPermissions.includes(permission);
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

/**
 * Check org-level permission using the current org permissions (from tenant context).
 * Use when the user has selected an org and currentOrgPermissions are in the store.
 */
export function canInOrg(
  permission: string,
  orgPermissions: string[] | null | undefined,
): boolean {
  if (!orgPermissions || orgPermissions.length === 0) return false;
  return orgPermissions.includes(permission);
}
