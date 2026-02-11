'use client';

import { Link, useLocation } from 'react-router-dom';
import { Users, Shield, Building2 } from 'lucide-react';
import { cn } from '@repo/ui';
import { useShellStore } from '@repo/stores';
import { canInOrg } from '@repo/rbac';

const navItems = [
  { path: '/orgs', label: 'Orgs', icon: Building2, permission: null as string | null },
  { path: '/users', label: 'Users', icon: Users, permission: 'user:read' },
  { path: '/roles', label: 'Roles', icon: Shield, permission: 'role:read' },
] as const;

/** Orgs is shown if user has any identity permission (so they can switch org). */
function canSeeOrgs(permissions: string[]): boolean {
  return (
    canInOrg('user:read', permissions) ||
    canInOrg('role:read', permissions) ||
    canInOrg('org-settings:read', permissions)
  );
}

export function IdentityNav() {
  const { pathname } = useLocation();
  const currentOrgPermissions = useShellStore((s) => s.tenant.currentOrgPermissions);
  const sessionPermissions = useShellStore((s) => s.auth.session?.user?.permissions ?? null);

  const effectivePermissions = currentOrgPermissions ?? sessionPermissions ?? [];

  const visibleItems = navItems.filter((item) => {
    if (item.permission === null) return canSeeOrgs(effectivePermissions);
    return canInOrg(item.permission, effectivePermissions);
  });

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/');

  if (visibleItems.length === 0) return null;

  return (
    <nav
      className="mb-8 flex flex-wrap gap-2 border-b border-border/60 pb-4"
      aria-label="Identity sections"
    >
      {visibleItems.map(({ path, label, icon: Icon }) => (
        <Link
          key={path}
          to={path}
          className={cn(
            'inline-flex min-h-[44px] items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            isActive(path)
              ? 'bg-primary/10 text-primary border-b-2 border-primary -mb-[17px] pb-[17px] font-semibold'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
