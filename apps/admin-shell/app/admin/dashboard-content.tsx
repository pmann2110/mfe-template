'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  animationClass,
} from '@repo/ui';
import { Users, Shield, Building2, Activity } from 'lucide-react';
import type { Session } from 'next-auth';
import { canWithPermissions } from '@repo/rbac';
import type { Permission } from '@repo/rbac';
import { MOCK_ACTIVITY, type MockActivityItem } from '@/lib/mock-data/tenants';

interface DashboardContentProps {
  session: Session;
}

export function DashboardContent({ session }: DashboardContentProps) {
  const can = (permission: Permission) =>
    canWithPermissions(permission, session.user.permissions || []);

  const stats = [
    {
      title: 'Users',
      value: '0',
      description: 'Total users in current org',
      permission: 'user:read' as const,
      icon: Users,
    },
    {
      title: 'Permissions',
      value: session.user.permissions?.length.toString() || '0',
      description: 'Your active permissions',
      icon: Shield,
    },
    {
      title: 'Organizations',
      value: '—',
      description: 'Switch org in header',
      permission: undefined,
      icon: Building2,
    },
  ].filter((stat) => !stat.permission || can(stat.permission));

  const permissionList = (session.user.permissions ?? []) as string[];
  const quickActions = [
    { label: 'Manage users', href: '/admin/accounts/users', permission: 'user:read' },
    { label: 'Manage roles', href: '/admin/accounts/roles', permission: 'role:read' },
    { label: 'Manage orgs', href: '/admin/accounts/orgs', permission: 'user:read' },
  ].filter((a) => permissionList.includes(a.permission));

  return (
    <div className="space-y-6">
      <div className={animationClass('fadeIn', 'normal')}>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user.name || 'Admin'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className={`group transition-all hover:shadow-lg hover:-translate-y-0.5 ${animationClass('fadeIn', 'normal')}`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className="rounded-lg bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {quickActions.length > 0 && (
          <Card className={animationClass('fadeIn', 'normal')}>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>Shortcuts to common tasks</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {quickActions.map((a) => (
                <Button key={a.href} variant="secondary" asChild>
                  <Link href={a.href}>{a.label}</Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className={animationClass('fadeIn', 'normal')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent activity
            </CardTitle>
            <CardDescription>Latest events in your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {MOCK_ACTIVITY.map((item: MockActivityItem) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0"
                >
                  <span className="text-sm">{item.action}</span>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className={animationClass('fadeIn', 'normal')}>
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
