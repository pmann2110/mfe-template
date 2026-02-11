'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from '@repo/ui';
import type { OrgRole } from '@repo/api-contracts';
import { Shield, Plus, Pencil, Trash2 } from 'lucide-react';
import { useShellStore } from '@repo/stores';
import { useIdentityMode } from '../../context/IdentityModeContext';
import { isUserInSystemOrg, SYSTEM_ORG_ID } from '../../data/mock-identity';

interface RoleListProps {
  roles: OrgRole[];
  canWrite: boolean;
  onEdit: (role: OrgRole) => void;
  onDelete: (role: OrgRole) => void;
  onCreate: () => void;
}

export function RoleList({
  roles,
  canWrite,
  onEdit,
  onDelete,
  onCreate,
}: RoleListProps) {
  const session = useShellStore((s) => s.auth.session);
  const identityMode = useIdentityMode();
  // Edit is shown for non-system roles; system roles are editable only in platform mode by system-org users.
  const canEditSystemRole =
    identityMode === 'platform' &&
    session?.user?.id != null &&
    isUserInSystemOrg(session.user.id);

  const showEditDelete = (role: OrgRole) =>
    canWrite &&
    (!role.isSystemRole ||
      (canEditSystemRole && role.organizationId === SYSTEM_ORG_ID));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Roles
          </CardTitle>
          <CardDescription>
            {roles.length} role{roles.length !== 1 ? 's' : ''} in this organization
          </CardDescription>
        </div>
        {canWrite && (
          <Button onClick={onCreate} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add role
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {roles.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No roles yet.</p>
          ) : (
            roles.map((role) => (
              <div
                key={role.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{role.name}</span>
                    {role.isSystemRole && (
                      <span className="rounded bg-muted px-2 py-0.5 text-xs">System</span>
                    )}
                  </div>
                  {role.description && (
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {showEditDelete(role) && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(role)}
                      className="gap-1 text-primary"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(role)}
                      className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
