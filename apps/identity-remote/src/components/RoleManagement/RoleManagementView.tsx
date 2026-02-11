'use client';

import { useEffect, useState } from 'react';
import { useShellStore } from '@repo/stores';
import { canInOrg } from '@repo/rbac';
import { roleApi } from '../../data/role-api';
import type { OrgRole } from '@repo/api-contracts';
import { RoleList } from './RoleList';
import { RoleForm } from './RoleForm';
import { getShellStore } from '@repo/stores';

export function RoleManagementView() {
  const tenantId = useShellStore((s) => s.tenant.tenantId);
  const currentOrgPermissions = useShellStore((s) => s.tenant.currentOrgPermissions);
  const [roles, setRoles] = useState<OrgRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<OrgRole | null>(null);

  const canWrite = canInOrg('role:write', currentOrgPermissions);
  const canRead = canInOrg('role:read', currentOrgPermissions);

  useEffect(() => {
    if (!tenantId) {
      setRoles([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    roleApi
      .list(tenantId)
      .then((data) => {
        if (!cancelled) setRoles(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  const handleCreate = () => {
    setEditingRole(null);
    setFormOpen(true);
  };

  const handleEdit = (role: OrgRole) => {
    setEditingRole(role);
    setFormOpen(true);
  };

  const handleDelete = async (role: OrgRole) => {
    if (!tenantId || !confirm(`Delete role "${role.name}"?`)) return;
    try {
      await roleApi.delete(tenantId, role.id);
      getShellStore().getState().addNotification({
        type: 'success',
        title: 'Role deleted',
        message: `Role "${role.name}" has been removed.`,
      });
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (data: {
    name: string;
    slug: string;
    description?: string;
    permissions: string[];
  }) => {
    if (!tenantId) return;
    if (editingRole) {
      await roleApi.update(tenantId, editingRole.id, data);
      getShellStore().getState().addNotification({
        type: 'success',
        title: 'Role updated',
        message: `Role "${data.name}" has been updated.`,
      });
    } else {
      await roleApi.create(tenantId, data);
      getShellStore().getState().addNotification({
        type: 'success',
        title: 'Role created',
        message: `Role "${data.name}" has been created.`,
      });
    }
    const list = await roleApi.list(tenantId);
    setRoles(list);
  };

  if (!tenantId) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Select an organization to manage roles.
      </div>
    );
  }

  if (!canRead) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        You don&apos;t have permission to view roles.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Loading roles…
      </div>
    );
  }

  return (
    <>
      <RoleList
        roles={roles}
        canWrite={canWrite}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />
      <RoleForm
        open={formOpen}
        onOpenChange={setFormOpen}
        role={editingRole}
        organizationId={tenantId}
        onSubmit={handleSubmit}
      />
    </>
  );
}
