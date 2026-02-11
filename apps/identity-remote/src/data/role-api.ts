import type { OrgRole, CreateOrgRoleRequest, UpdateOrgRoleRequest } from '@repo/api-contracts';
import { MOCK_ROLES } from './mock-identity';

let roles: OrgRole[] = [...MOCK_ROLES];

export const roleApi = {
  async list(organizationId: string): Promise<OrgRole[]> {
    return roles.filter((r) => r.organizationId === organizationId);
  },
  async get(organizationId: string, roleId: string): Promise<OrgRole> {
    const r = roles.find((x) => x.organizationId === organizationId && x.id === roleId);
    if (!r) throw new Error('Role not found');
    return r;
  },
  async create(organizationId: string, data: CreateOrgRoleRequest): Promise<OrgRole> {
    const newRole: OrgRole = {
      id: `role-${Date.now()}`,
      organizationId,
      name: data.name,
      slug: data.slug,
      description: data.description,
      permissions: data.permissions,
    };
    roles.push(newRole);
    return newRole;
  },
  async update(
    organizationId: string,
    roleId: string,
    data: UpdateOrgRoleRequest
  ): Promise<OrgRole> {
    const idx = roles.findIndex((r) => r.organizationId === organizationId && r.id === roleId);
    if (idx === -1) throw new Error('Role not found');
    const prev = roles[idx]!;
    const updated: OrgRole = {
      id: prev.id,
      organizationId: prev.organizationId,
      name: data.name ?? prev.name,
      slug: data.slug ?? prev.slug,
      description: data.description !== undefined ? data.description : prev.description,
      permissions: data.permissions ?? prev.permissions,
      isSystemRole: prev.isSystemRole,
      createdAt: prev.createdAt,
      updatedAt: prev.updatedAt,
    };
    roles[idx] = updated;
    return updated;
  },
  async delete(organizationId: string, roleId: string): Promise<void> {
    roles = roles.filter(
      (r) => !(r.organizationId === organizationId && r.id === roleId)
    );
  },
};
