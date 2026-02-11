'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import { ORG_PERMISSION_CATEGORIES, ORG_PERMISSION_DESCRIPTIONS } from '@repo/rbac';
import type { OrgPermission } from '@repo/rbac';

interface RolePermissionMatrixProps {
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
}

export function RolePermissionMatrix({
  selectedPermissions,
  onChange,
  disabled = false,
}: RolePermissionMatrixProps) {
  const set = new Set(selectedPermissions);

  const toggle = (perm: OrgPermission) => {
    if (disabled) return;
    const next = set.has(perm)
      ? selectedPermissions.filter((p) => p !== perm)
      : [...selectedPermissions, perm];
    onChange(next);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissions</CardTitle>
        <CardDescription>
          Select the permissions granted by this role. Permissions are grouped by category.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(ORG_PERMISSION_CATEGORIES).map(([category, perms]) => (
          <div key={category}>
            <h4 className="mb-2 text-sm font-medium text-foreground">{category}</h4>
            <div className="flex flex-wrap gap-3">
              {perms.map((perm) => {
                const checked = set.has(perm);
                const label = ORG_PERMISSION_DESCRIPTIONS[perm] ?? perm;
                return (
                  <label
                    key={perm}
                    className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                      checked ? 'border-primary bg-primary/10' : 'border-input hover:bg-accent'
                    } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(perm)}
                      disabled={disabled}
                      className="h-4 w-4 rounded border-input"
                      aria-label={label}
                    />
                    <span>{label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
