/**
 * Fine-grained permission matrix: single source of truth for system and org permissions.
 * - System: permission names and system role → system permissions live in code.
 * - Org: permission names in code; org role → permissions is data per org (OrgRole.permissions).
 */

/** System-level permissions (platform scope, no org context). */
export const SYSTEM_PERMISSIONS = [
  'org:read',
  'org:write',
  'org:delete',
  'org:invite',
  'org:create',
  'org:update',
  'org:manage_members',
  'billing:read',
  'billing:write',
  'billing:manage_subscriptions',
  'subscription:manage',
  'system:admin',
  'system:audit',
  'system:config',
] as const;

export type SystemPermission = (typeof SYSTEM_PERMISSIONS)[number];

/** Org-level permissions (evaluated in org context via currentOrgPermissions). */
export const ORG_PERMISSIONS = [
  'user:read',
  'user:write',
  'user:create',
  'user:update',
  'user:delete',
  'user:invite',
  'project:read',
  'project:write',
  'project:create',
  'project:update',
  'project:delete',
  'project:manage',
  'org-settings:read',
  'org-settings:write',
  'org-settings:manage',
  'role:read',
  'role:write',
  'role:create',
  'role:update',
  'role:delete',
  'role:assign',
] as const;

export type OrgPermission = (typeof ORG_PERMISSIONS)[number];

/** System role identifiers. */
export const SYSTEM_ROLES = [
  'system:super_admin',
  'system:admin',
  'system:support',
  'system:billing',
] as const;

export type SystemRole = (typeof SYSTEM_ROLES)[number];

/**
 * System role → system permissions map (in code).
 * Used to resolve system permissions from session.user.systemRoles or session.user.permissions.
 */
export const SYSTEM_ROLE_MATRIX: Record<SystemRole, readonly SystemPermission[]> = {
  'system:super_admin': [...SYSTEM_PERMISSIONS],
  'system:admin': [
    'org:read',
    'org:write',
    'org:delete',
    'org:invite',
    'org:create',
    'org:update',
    'org:manage_members',
    'billing:read',
    'billing:write',
    'billing:manage_subscriptions',
    'subscription:manage',
    'system:admin',
    'system:audit',
    'system:config',
  ],
  'system:support': ['org:read'],
  'system:billing': ['billing:read', 'billing:write', 'billing:manage_subscriptions', 'subscription:manage'],
};

/**
 * Resolve system permissions from system roles using the matrix.
 */
export function getSystemPermissionsFromRoles(roles: string[]): SystemPermission[] {
  const set = new Set<SystemPermission>();
  for (const role of roles) {
    const perms = SYSTEM_ROLE_MATRIX[role as SystemRole];
    if (perms) {
      for (const p of perms) set.add(p);
    }
  }
  return [...set];
}

/** Check if a string is a valid org permission (from registry). */
export function isOrgPermission(value: string): value is OrgPermission {
  return (ORG_PERMISSIONS as readonly string[]).includes(value);
}

/** Human-readable descriptions for system permissions. */
export const SYSTEM_PERMISSION_DESCRIPTIONS: Record<SystemPermission, string> = {
  'org:read': 'View organizations',
  'org:write': 'Edit organization details',
  'org:delete': 'Delete organizations',
  'org:invite': 'Invite members to organizations',
  'org:create': 'Create new organizations',
  'org:update': 'Update organization settings',
  'org:manage_members': 'Manage organization membership',
  'billing:read': 'View billing information',
  'billing:write': 'Edit billing details',
  'billing:manage_subscriptions': 'Manage subscriptions',
  'subscription:manage': 'Manage subscription plans',
  'system:admin': 'Full system administration',
  'system:audit': 'View audit logs',
  'system:config': 'Manage system configuration',
};

/** Human-readable descriptions for org permissions. */
export const ORG_PERMISSION_DESCRIPTIONS: Record<OrgPermission, string> = {
  'user:read': 'View users in the organization',
  'user:write': 'Edit user details',
  'user:create': 'Create new users',
  'user:update': 'Update user profiles',
  'user:delete': 'Remove users',
  'user:invite': 'Invite users to the organization',
  'project:read': 'View projects',
  'project:write': 'Edit project details',
  'project:create': 'Create projects',
  'project:update': 'Update projects',
  'project:delete': 'Delete projects',
  'project:manage': 'Full project management',
  'org-settings:read': 'View organization settings',
  'org-settings:write': 'Edit organization settings',
  'org-settings:manage': 'Manage all organization settings',
  'role:read': 'View roles',
  'role:write': 'Edit role permissions',
  'role:create': 'Create roles',
  'role:update': 'Update roles',
  'role:delete': 'Delete roles',
  'role:assign': 'Assign roles to users',
};

/** Group system permissions by domain for UI. */
export const SYSTEM_PERMISSION_CATEGORIES: Record<string, SystemPermission[]> = {
  Organization: [
    'org:read',
    'org:write',
    'org:delete',
    'org:invite',
    'org:create',
    'org:update',
    'org:manage_members',
  ],
  Billing: ['billing:read', 'billing:write', 'billing:manage_subscriptions', 'subscription:manage'],
  System: ['system:admin', 'system:audit', 'system:config'],
};

/** Group org permissions by domain for UI. */
export const ORG_PERMISSION_CATEGORIES: Record<string, OrgPermission[]> = {
  Users: ['user:read', 'user:write', 'user:create', 'user:update', 'user:delete', 'user:invite'],
  Projects: [
    'project:read',
    'project:write',
    'project:create',
    'project:update',
    'project:delete',
    'project:manage',
  ],
  'Org settings': [
    'org-settings:read',
    'org-settings:write',
    'org-settings:manage',
  ],
  Roles: ['role:read', 'role:write', 'role:create', 'role:update', 'role:delete', 'role:assign'],
};
