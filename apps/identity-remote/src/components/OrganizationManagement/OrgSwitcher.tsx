'use client';

import { useMemo, useState } from 'react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Input,
} from '@repo/ui';
import { Building2, Check, ChevronsUpDown } from 'lucide-react';
import { useShellStore, useShellActions } from '@repo/stores';
import type { TenantMetadata } from '@repo/stores';
import { useIdentityMode } from '../../context/IdentityModeContext';
import { MOCK_ORGANIZATIONS, getOrgAsTenantMetadata, getCurrentUserPermissions, isUserInSystemOrg } from '../../data/mock-identity';

const PLATFORM_ADMIN_ORG_PERMISSIONS = [
  'user:read', 'user:write', 'role:read', 'role:write', 'org-settings:read', 'org-settings:write',
];

const DEFAULT_ORGS: TenantMetadata[] = MOCK_ORGANIZATIONS.map(getOrgAsTenantMetadata);

export function OrgSwitcher() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const tenantId = useShellStore((s) => s.tenant.tenantId);
  const tenantMetadata = useShellStore((s) => s.tenant.tenantMetadata);
  const availableTenants = useShellStore((s) => s.tenant.availableTenants);
  const { setTenantId, setCurrentOrgPermissions, setTenantMetadata, setAvailableTenants } =
    useShellActions();

  const tenants = availableTenants.length > 0 ? availableTenants : DEFAULT_ORGS;
  const filteredTenants = useMemo(() => {
    if (!search.trim()) return tenants;
    const q = search.trim().toLowerCase();
    return tenants.filter(
      (t) => t.name.toLowerCase().includes(q) || (t.slug && t.slug.toLowerCase().includes(q))
    );
  }, [tenants, search]);

  const session = useShellStore((s) => s.auth.session);
  const identityMode = useIdentityMode();
  const currentName = tenantMetadata?.name ?? tenants.find((t) => t.id === tenantId)?.name ?? 'Select org';

  const handleSelect = (org: TenantMetadata) => {
    setTenantId(org.id);
    setTenantMetadata(org);
    if (identityMode === 'platform' && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('identity-selected-org', org.id);
    }
    let permissions: string[];
    if (
      identityMode === 'platform' &&
      session?.user?.id != null &&
      isUserInSystemOrg(session.user.id)
    ) {
      permissions = PLATFORM_ADMIN_ORG_PERMISSIONS;
    } else if (session?.user?.id != null) {
      permissions = getCurrentUserPermissions(session.user.id, org.id);
    } else {
      permissions = ['user:read', 'user:write', 'role:read', 'org-settings:read'];
    }
    setCurrentOrgPermissions(permissions);
    setOpen(false);
    setSearch('');
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select organization"
          className="min-w-[200px] justify-between gap-2 transition-all hover:bg-accent/50"
        >
          <span className="flex items-center gap-2 truncate">
            <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{currentName}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] p-0"
        align="start"
        sideOffset={4}
      >
        <div className="border-b p-2">
          <Input
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
            aria-label="Search organizations"
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto py-1">
          {filteredTenants.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No organization found.</p>
          ) : (
            filteredTenants.map((org) => {
              const isSelected = tenantId === org.id;
              return (
                <button
                  key={org.id}
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent"
                  onClick={() => handleSelect(org)}
                >
                  {isSelected ? (
                    <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  ) : (
                    <span className="h-4 w-4 shrink-0" aria-hidden />
                  )}
                  <span className="truncate">{org.name}</span>
                </button>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
