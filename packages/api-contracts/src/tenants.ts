/**
 * Tenant/organization context and membership contracts.
 * Used by shells and remotes for tenant switching and permission resolution.
 */

export interface TenantMetadata {
  id: string;
  name: string;
  slug?: string;
  /** When true, this org represents the platform (admin-shell access). */
  isSystemOrg?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserTenantMembership {
  userId: string;
  organizationId: string;
  orgRoleId: string;
  joinedAt: string;
}

export interface TenantPermissionsResult {
  organizationId: string;
  permissions: string[];
}

export interface TenantApi {
  /** List tenants/organizations the current user can access */
  getUserTenants: () => Promise<TenantMetadata[]>;
  /** Get metadata for a specific tenant */
  getTenantMetadata: (tenantId: string) => Promise<TenantMetadata>;
  /** Get current user's permissions in the given tenant */
  getTenantPermissions: (tenantId: string) => Promise<string[]>;
}
