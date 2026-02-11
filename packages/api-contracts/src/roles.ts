/** Org role: permissions are validated against @repo/rbac ORG_PERMISSIONS. */
export interface OrgRole {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description?: string;
  permissions: string[];
  isSystemRole?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** System role definition: permissions are validated against @repo/rbac SYSTEM_PERMISSIONS. */
export interface SystemRoleDefinition {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface CreateOrgRoleRequest {
  name: string;
  slug: string;
  description?: string;
  permissions: string[];
}

export interface UpdateOrgRoleRequest {
  name?: string;
  slug?: string;
  description?: string;
  permissions?: string[];
}

export interface OrgRoleApi {
  list: (organizationId: string) => Promise<OrgRole[]>;
  get: (organizationId: string, roleId: string) => Promise<OrgRole>;
  create: (organizationId: string, data: CreateOrgRoleRequest) => Promise<OrgRole>;
  update: (
    organizationId: string,
    roleId: string,
    data: UpdateOrgRoleRequest
  ) => Promise<OrgRole>;
  delete: (organizationId: string, roleId: string) => Promise<void>;
}
