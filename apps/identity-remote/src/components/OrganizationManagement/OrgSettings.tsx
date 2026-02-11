'use client';

import { Link } from 'react-router-dom';
import { useShellStore } from '@repo/stores';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label } from '@repo/ui';
import { LayoutDashboard, List } from 'lucide-react';

export function OrgSettings() {
  const tenantId = useShellStore((s) => s.tenant.tenantId);
  const tenantMetadata = useShellStore((s) => s.tenant.tenantMetadata);

  if (!tenantId) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed p-8">
        <p className="text-muted-foreground">Select an organization to edit settings.</p>
      </div>
    );
  }

  const name = tenantMetadata?.name ?? 'Organization';
  const slug = tenantMetadata?.slug ?? '';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Organization settings</h1>
          <p className="text-muted-foreground">General and security settings for {name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/orgs/overview">
              <LayoutDashboard className="mr-1 h-4 w-4" />
              Overview
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/orgs">
              <List className="mr-1 h-4 w-4" />
              All organizations
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Display name and slug (mock: not persisted)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization name</Label>
            <Input id="org-name" defaultValue={name} disabled className="max-w-sm" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-slug">Slug</Label>
            <Input id="org-slug" defaultValue={slug} disabled className="max-w-sm" />
          </div>
          <Button disabled>Save changes (coming soon)</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Member management</CardTitle>
          <CardDescription>Invite and manage members (coming soon)</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" disabled>
            Invite members
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
