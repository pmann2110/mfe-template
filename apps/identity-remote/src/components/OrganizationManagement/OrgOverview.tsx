'use client';

import { Link } from 'react-router-dom';
import { useShellStore } from '@repo/stores';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@repo/ui';
import { Users, Shield, Activity, List, Settings } from 'lucide-react';

/** Mock stats for current org. Replace with API in production. */
function useOrgStats(tenantId: string | null) {
  if (!tenantId) return { memberCount: 0, roleCount: 0, recentCount: 0 };
  return { memberCount: 12, roleCount: 3, recentCount: 5 };
}

export function OrgOverview() {
  const tenantId = useShellStore((s) => s.tenant.tenantId);
  const tenantMetadata = useShellStore((s) => s.tenant.tenantMetadata);
  const stats = useOrgStats(tenantId);

  if (!tenantId) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed p-8">
        <p className="text-muted-foreground">Select an organization to view its overview.</p>
      </div>
    );
  }

  const name = tenantMetadata?.name ?? 'Organization';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{name}</h1>
          <p className="text-muted-foreground">Overview and quick stats</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/orgs">
              <List className="mr-1 h-4 w-4" />
              All organizations
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.memberCount}</div>
            <p className="text-xs text-muted-foreground">Total members in this org</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.roleCount}</div>
            <p className="text-xs text-muted-foreground">Custom roles defined</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentCount}</div>
            <p className="text-xs text-muted-foreground">Events in the last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Latest events in this organization</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>User role updated</li>
            <li>New member invited</li>
            <li>Settings changed</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
