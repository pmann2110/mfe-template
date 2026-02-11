'use client';

import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useShellStore, useShellActions } from '@repo/stores';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input } from '@repo/ui';
import { Building2, LayoutDashboard, Settings } from 'lucide-react';
import type { TenantMetadata } from '@repo/stores';
import { useIdentityMode } from '../../context/IdentityModeContext';
import { MOCK_ORGANIZATIONS, getOrgAsTenantMetadata, getCurrentUserPermissions, isUserInSystemOrg } from '../../data/mock-identity';

const PLATFORM_ADMIN_ORG_PERMISSIONS = [
  'user:read', 'user:write', 'role:read', 'role:write', 'org-settings:read', 'org-settings:write',
];

const DEFAULT_ORGS: TenantMetadata[] = MOCK_ORGANIZATIONS.map(getOrgAsTenantMetadata);

export function OrgList() {
  const [search, setSearch] = useState('');
  const session = useShellStore((s) => s.auth.session);
  const tenantId = useShellStore((s) => s.tenant.tenantId);
  const availableTenants = useShellStore((s) => s.tenant.availableTenants);
  const { setTenantId, setTenantMetadata, setCurrentOrgPermissions } = useShellActions();

  const identityMode = useIdentityMode();
  const orgs = availableTenants.length > 0 ? availableTenants : DEFAULT_ORGS;
  const filtered = useMemo(() => {
    if (!search.trim()) return orgs;
    const q = search.trim().toLowerCase();
    return orgs.filter(
      (t) => t.name.toLowerCase().includes(q) || (t.slug && t.slug.toLowerCase().includes(q))
    );
  }, [orgs, search]);

  const handleSwitch = (org: TenantMetadata) => {
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
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">Switch or manage your organizations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/orgs/overview">
              <LayoutDashboard className="mr-1 h-4 w-4" />
              Overview
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/orgs/settings">
              <Settings className="mr-1 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your organizations</CardTitle>
          <CardDescription>Select an organization to work in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
            aria-label="Search organizations"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            {filtered.map((org) => {
              const isCurrent = tenantId === org.id;
              return (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => handleSwitch(org)}
                  className={`group flex items-center gap-4 rounded-lg border p-4 text-left transition-all hover:shadow-md hover:border-primary/50 ${
                    isCurrent
                      ? 'border-primary/50 bg-primary/5 shadow-sm ring-1 ring-primary/20'
                      : 'border-border/60 hover:bg-accent/30'
                  }`}
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    isCurrent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary'
                  }`}>
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{org.name}</p>
                    {org.slug && (
                      <p className="text-xs text-muted-foreground mt-0.5">{org.slug}</p>
                    )}
                  </div>
                  {isCurrent && (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      Current
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No organization found.
            </p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
