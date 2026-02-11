'use client';

import { Link, useLocation } from 'react-router-dom';
import { Users, Shield, Building2 } from 'lucide-react';
import { cn } from '@repo/ui';

const navItems = [
  { path: '/orgs', label: 'Orgs', icon: Building2 },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/roles', label: 'Roles', icon: Shield },
] as const;

export function IdentityNav() {
  const { pathname } = useLocation();

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/');

  return (
    <nav className="mb-6 flex gap-1 rounded-lg bg-muted/50 p-1" aria-label="Identity sections">
      {navItems.map(({ path, label, icon: Icon }) => (
        <Link
          key={path}
          to={path}
          className={cn(
            'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            isActive(path)
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
