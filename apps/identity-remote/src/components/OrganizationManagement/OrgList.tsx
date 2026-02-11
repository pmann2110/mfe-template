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
        <div>
          <h1 className="text-2xl font-bold">Organizations</h1>
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
                  className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent/50 ${
                    isCurrent ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <Building2 className="h-8 w-8 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{org.name}</p>
                    {org.slug && (
                      <p className="text-xs text-muted-foreground">{org.slug}</p>
                    )}
                  </div>
                  {isCurrent && (
                    <span className="text-xs font-medium text-primary">Current</span>
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

      <Card>
        <CardHeader>
          <CardTitle>Create organization</CardTitle>
          <CardDescription>Create a new organization (mock: not persisted)</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" disabled>
            Create organization (coming soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
