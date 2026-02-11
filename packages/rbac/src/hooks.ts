'use client';

import { useMemo } from 'react';
import type { Session } from '@repo/auth-core';
import type { SystemPermission } from './permission-matrix';
import { canSystem, canWithSystemPermissions } from './permissions';
import { getSystemPermissionsFromRoles, SYSTEM_PERMISSIONS } from './permission-matrix';

/**
 * Hook for system-level permission check. Pass session (e.g. from useSession).
 */
export function useSystemPermission(
  permission: SystemPermission,
  session: Session | null
): boolean {
  return useMemo(() => canSystem(permission, session), [permission, session]);
}

/**
 * Hook for org-level permission check. Pass currentOrgPermissions from shell store.
 */
export function useOrgPermission(
  permission: string,
  orgPermissions: string[] | null | undefined
): boolean {
  return useMemo(() => {
    if (!orgPermissions || orgPermissions.length === 0) return false;
    return orgPermissions.includes(permission);
  }, [permission, orgPermissions]);
}

/**
 * Get effective system permissions for the given session.
 */
export function useSystemPermissions(session: Session | null): SystemPermission[] {
  return useMemo(() => {
    if (!session) return [];
    const fromRoles = getSystemPermissionsFromRoles(session.user.roles ?? []);
    const fromPerms = (session.user.permissions ?? []).filter((p) =>
      (SYSTEM_PERMISSIONS as readonly string[]).includes(p),
    ) as unknown as SystemPermission[];
    const set = new Set<SystemPermission>([...fromRoles, ...fromPerms]);
    return [...set];
  }, [session]);
}

/**
 * Universal permission hook: pass scope 'system' or 'org' and the appropriate context.
 */
export function useCanAccess(
  permission: string,
  scope: 'system' | 'org',
  context: { session: Session | null } | { orgPermissions: string[] | null | undefined }
): boolean {
  return useMemo(() => {
    if (scope === 'system') {
      const session = 'session' in context ? context.session : null;
      return canSystem(permission as SystemPermission, session);
    }
    const orgPermissions = 'orgPermissions' in context ? context.orgPermissions : null;
    if (!orgPermissions || orgPermissions.length === 0) return false;
    return orgPermissions.includes(permission);
  }, [permission, scope, context]);
}
