'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import type { Session } from 'next-auth';
import { canWithPermissions } from '@repo/rbac';

interface DashboardContentProps {
  session: Session;
}

export function DashboardContent({ session }: DashboardContentProps) {
  const can = (permission: string) =>
    canWithPermissions(permission as any, session.user.permissions || []);

  const stats = [
    {
      title: 'Users',
      value: '0',
      description: 'Total users',
      permission: 'user:read' as const,
    },
    {
      title: 'Products',
      value: '0',
      description: 'Total products',
      permission: 'product:read' as const,
    },
    {
      title: 'Permissions',
      value: session.user.permissions?.length.toString() || '0',
      description: 'Active permissions',
    },
  ].filter((stat) => !stat.permission || can(stat.permission));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user.name || 'Admin'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Permissions</CardTitle>
          <CardDescription>
            Current roles and permissions assigned to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {session.user.permissions?.map((permission) => (
              <span
                key={permission}
                className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary"
              >
                {permission}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
