'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import type { OrgRole } from '@repo/api-contracts';
import { Shield } from 'lucide-react';
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
          <button
            type="button"
            onClick={onCreate}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Add role
          </button>
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
                    <button
                      type="button"
                      onClick={() => onEdit(role)}
                      className="text-sm text-primary hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(role)}
                      className="text-sm text-destructive hover:underline"
                    >
                      Delete
                    </button>
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
