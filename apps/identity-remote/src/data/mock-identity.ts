/**
 * Single source of truth for mock identity data: orgs, users, memberships, roles.
 * Used to derive "my orgs", "users in org", "my permissions", and platform access.
 */
import type { User } from '@repo/api-contracts';
import type { OrgRole } from '@repo/api-contracts';

export const SYSTEM_ORG_ID = 'system';

export interface MockOrganization {
  id: string;
  name: string;
  slug?: string;
  isSystemOrg?: boolean;
}

export interface MockMembership {
  userId: string;
  organizationId: string;
  roleId: string;
}

export const MOCK_ORGANIZATIONS: MockOrganization[] = [
  { id: SYSTEM_ORG_ID, name: 'Platform', slug: 'platform', isSystemOrg: true },
  { id: 'org-1', name: 'Acme Corp', slug: 'acme' },
  { id: 'org-2', name: 'Beta Inc', slug: 'beta' },
];

export const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Platform Admin',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'john@example.com',
    name: 'John Doe',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'jane@example.com',
    name: 'Jane Smith',
    role: 'manager',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    email: 'bob@example.com',
    name: 'Bob Johnson',
    role: 'viewer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/** userId -> organizationId -> roleId (mutable copy for setUserRoleInOrg). Use role ids that belong to that org (org-1: role-1, role-2; org-2: role-3, role-4). */
const MUTABLE_MEMBERSHIPS: MockMembership[] = [
  { userId: '1', organizationId: SYSTEM_ORG_ID, roleId: 'role-system-admin' },
  { userId: '2', organizationId: 'org-1', roleId: 'role-1' },
  { userId: '2', organizationId: 'org-2', roleId: 'role-3' },
  { userId: '3', organizationId: 'org-1', roleId: 'role-2' },
  { userId: '4', organizationId: 'org-2', roleId: 'role-4' },
];

function getMemberships(): MockMembership[] {
  return MUTABLE_MEMBERSHIPS;
}

export const MOCK_ROLES: OrgRole[] = [
  {
    id: 'role-system-admin',
    organizationId: SYSTEM_ORG_ID,
    name: 'System Admin',
    slug: 'system-admin',
    description: 'Platform administration',
    permissions: ['user:read', 'user:write', 'role:read', 'role:write', 'org-settings:read', 'org-settings:write'],
    isSystemRole: true,
  },
  {
    id: 'role-1',
    organizationId: 'org-1',
    name: 'Admin',
    slug: 'admin',
    description: 'Full access',
    permissions: ['user:read', 'user:write', 'role:read', 'role:write', 'org-settings:read', 'org-settings:write'],
    isSystemRole: true,
  },
  {
    id: 'role-2',
    organizationId: 'org-1',
    name: 'Member',
    slug: 'member',
    description: 'Standard member',
    permissions: ['user:read', 'project:read', 'project:write'],
  },
  {
    id: 'role-3',
    organizationId: 'org-2',
    name: 'Admin',
    slug: 'admin',
    description: 'Full access',
    permissions: ['user:read', 'user:write', 'role:read', 'role:write'],
  },
  {
    id: 'role-4',
    organizationId: 'org-2',
    name: 'Member',
    slug: 'member',
    description: 'Standard member',
    permissions: ['user:read'],
  },
];

/** User's role in the given org (from memberships + roles). Returns null if no membership. */
export function getRoleInOrg(
  userId: string,
  organizationId: string
): { roleId: string; roleName: string } | null {
  const membership = getMemberships().find(
    (m) => m.userId === userId && m.organizationId === organizationId
  );
  if (!membership) return null;
  let role = MOCK_ROLES.find(
    (r) => r.organizationId === organizationId && r.id === membership.roleId
  );
  if (!role) {
    role = MOCK_ROLES.find((r) => r.id === membership.roleId);
  }
  if (!role) return { roleId: membership.roleId, roleName: '—' };
  return { roleId: role.id, roleName: role.name };
}

/** Set or update user's role in an org (mutates membership list). */
export function setUserRoleInOrg(
  userId: string,
  organizationId: string,
  roleId: string
): void {
  const memberships = getMemberships();
  const idx = memberships.findIndex(
    (m) => m.userId === userId && m.organizationId === organizationId
  );
  if (idx >= 0) {
    memberships[idx] = { userId, organizationId, roleId };
  } else {
    memberships.push({ userId, organizationId, roleId });
  }
}

/** Orgs the user is a member of (from memberships). */
export function getOrgsForUser(userId: string): MockOrganization[] {
  const orgIds = [...new Set(getMemberships().filter((m) => m.userId === userId).map((m) => m.organizationId))];
  return MOCK_ORGANIZATIONS.filter((o) => orgIds.includes(o.id));
}

/** User IDs that are members of the given org. */
export function getMemberIdsInOrg(organizationId: string): string[] {
  return [...new Set(getMemberships().filter((m) => m.organizationId === organizationId).map((m) => m.userId))];
}

/** Current user's permissions in the given org (from membership -> role -> permissions). */
export function getCurrentUserPermissions(userId: string, organizationId: string): string[] {
  const membership = getMemberships().find((m) => m.userId === userId && m.organizationId === organizationId);
  if (!membership) return [];
  const role = MOCK_ROLES.find(
    (r) => r.organizationId === organizationId && r.id === membership.roleId
  );
  return role?.permissions ?? [];
}

/** True if user is a member of the system/platform org (can access admin-shell). */
export function isUserInSystemOrg(userId: string): boolean {
  return getMemberships().some((m) => m.userId === userId && m.organizationId === SYSTEM_ORG_ID);
}

/** Users that are members of the given org (from memberships). */
export function getUsersInOrg(organizationId: string): User[] {
  const ids = getMemberIdsInOrg(organizationId);
  return MOCK_USERS.filter((u) => ids.includes(u.id));
}

/** TenantMetadata shape for shell store / API. */
export function getOrgAsTenantMetadata(org: MockOrganization): {
  id: string;
  name: string;
  slug?: string;
  isSystemOrg?: boolean;
} {
  return { id: org.id, name: org.name, slug: org.slug, isSystemOrg: org.isSystemOrg };
}
