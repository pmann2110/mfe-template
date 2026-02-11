'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@repo/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@repo/ui';
import { Bell, X, LogOut, LayoutDashboard, UserCog, Building2, Users, Shield } from 'lucide-react';
import Link from 'next/link';
import type { Session } from 'next-auth';
import { initShellStore, useNotifications, useShellActions } from '@repo/stores';
import { toCoreSession } from '@repo/auth-next';
import { preloadRemote } from '../../lib/module-federation-loader';
import { ADMIN_ROUTES, canAccessRoute, type AdminRouteIcon } from '../../lib/admin-routes';

const ICON_MAP: Record<AdminRouteIcon, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  accounts: UserCog,
};

const ACCOUNTS_CHILD_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  '/admin/accounts/orgs': Building2,
  '/admin/accounts/users': Users,
  '/admin/accounts/roles': Shield,
};

interface AdminLayoutClientProps {
  children: React.ReactNode;
  session: Session;
}

export function AdminLayoutClient({ children, session }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const notifications = useNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const { markNotificationRead, removeNotification, clearNotifications } = useShellActions();

  useEffect(() => {
    const coreSession = toCoreSession(session);
    initShellStore({
      auth: { session: coreSession },
    });
  }, [session]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const navItems = ADMIN_ROUTES.filter((item) =>
    canAccessRoute(session.user.permissions ?? [], item),
  );

  return (
    <div className="flex h-screen">
      {/* Left sidebar */}
      <aside className="flex w-56 flex-col border-r bg-card">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <span className="font-semibold text-foreground">Admin Portal</span>
        </div>
        <nav className="flex-1 space-y-0.5 p-2">
          {navItems.map((item) => {
            const Icon = ICON_MAP[item.icon];
            const hasChildren = 'children' in item && item.children;
            const isAccountsActive =
              item.path === '/admin/accounts' && pathname.startsWith('/admin/accounts');
            const isActive =
              item.path === '/admin/accounts'
                ? isAccountsActive
                : pathname === item.path;

            if (hasChildren && item.path === '/admin/accounts') {
              return (
                <div key={item.path}>
                  <div
                    className={`rounded-md px-3 py-2 text-sm font-medium ${
                      isAccountsActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                  </div>
                  <div className="ml-3 mt-0.5 space-y-0.5 border-l border-border pl-2">
                    {item.children.map((child) => {
                      const ChildIcon =
                        ACCOUNTS_CHILD_ICONS[child.path] ?? UserCog;
                      const isChildActive =
                        pathname === child.path ||
                        (child.path !== '/admin/accounts/orgs' &&
                          pathname.startsWith(child.path + '/'));
                      return (
                        <Link
                          key={child.path}
                          href={child.path}
                          className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                            isChildActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          }`}
                          onMouseEnter={() =>
                            item.remoteName && preloadRemote(item.remoteName)
                          }
                          onFocus={() =>
                            item.remoteName && preloadRemote(item.remoteName)
                          }
                        >
                          <ChildIcon className="h-3.5 w-3.5" />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
                onMouseEnter={() =>
                  item.remoteName && preloadRemote(item.remoteName)
                }
                onFocus={() =>
                  item.remoteName && preloadRemote(item.remoteName)
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main: header + content */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 shrink-0 items-center justify-end gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between p-3 border-b">
                <h4 className="font-semibold">Notifications</h4>
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearNotifications}
                    className="h-auto px-2 text-xs"
                  >
                    <X className="mr-1 h-3 w-3" />
                    Clear all
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="mb-2 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    No new notifications
                  </p>
                </div>
              ) : (
                <div className="max-h-[320px] overflow-y-auto">
                  {notifications.slice(0, 10).map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                        !notification.read ? 'bg-accent/50' : ''
                      }`}
                      onClick={() => markNotificationRead(notification.id)}
                    >
                      <div className="flex w-full items-start justify-between gap-2">
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <span className="text-xs font-medium capitalize text-muted-foreground">
                            {notification.type}
                          </span>
                          <p className="text-sm font-medium leading-tight">
                            {notification.title}
                          </p>
                          {notification.message && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {notification.message}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2 py-1.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              {session.user.email?.charAt(0).toUpperCase() ?? 'A'}
            </div>
            <span className="max-w-[140px] truncate text-sm text-foreground">
              {session.user.email}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </header>
        <main className="flex-1 overflow-auto bg-muted/30">
          <div className="container py-6 px-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
