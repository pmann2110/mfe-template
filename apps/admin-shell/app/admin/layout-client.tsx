'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Button,
  ThemeToggle,
  AppSidebar,
  AppHeader,
  Sheet,
  SheetContent,
  Breadcrumb,
  type BreadcrumbItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@repo/ui';
import {
  Bell,
  X,
  LogOut,
  LayoutDashboard,
  UserCog,
  Building2,
  Users,
  Shield,
  Menu,
} from 'lucide-react';
import Link from 'next/link';
import type { Session } from 'next-auth';
import { initShellStore, useNotifications, useShellActions } from '@repo/stores';
import { toCoreSession } from '@repo/auth-next';
import { preloadRemote } from '../../lib/module-federation-loader';
import {
  ADMIN_ROUTES,
  canAccessRoute,
  type AdminRouteIcon,
} from '../../lib/admin-routes';

const ICON_MAP: Record<
  AdminRouteIcon,
  React.ComponentType<{ className?: string }>
> = {
  dashboard: LayoutDashboard,
  accounts: UserCog,
};

const ACCOUNTS_CHILD_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  '/admin/accounts/orgs': Building2,
  '/admin/accounts/users': Users,
  '/admin/accounts/roles': Shield,
};

function getBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: 'Admin', href: '/admin' }];
  if (pathname.startsWith('/admin/accounts')) {
    items.push({ label: 'Accounts', href: '/admin/accounts/orgs' });
    if (pathname.includes('/orgs') && !pathname.includes('/overview') && !pathname.includes('/settings')) {
      items.push({ label: 'Organizations' });
    } else if (pathname.includes('/users')) {
      items.push({ label: 'Users' });
    } else if (pathname.includes('/roles')) {
      items.push({ label: 'Roles & Permissions' });
    } else if (pathname.includes('/overview')) {
      items.push({ label: 'Overview' });
    } else if (pathname.includes('/settings')) {
      items.push({ label: 'Settings' });
    }
  }
  return items;
}

interface AdminNavContentProps {
  pathname: string;
  navItems: ReadonlyArray<(typeof ADMIN_ROUTES)[number]>;
  onLinkClick?: () => void;
}

function AdminNavContent({
  pathname,
  navItems,
  onLinkClick,
}: AdminNavContentProps) {
  return (
    <>
      {navItems.map((item) => {
        const Icon = ICON_MAP[item.icon];
        const hasChildren =
          'children' in item && item.children;
        const isAccountsActive =
          item.path === '/admin/accounts' &&
          pathname.startsWith('/admin/accounts');
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
                      className={`flex min-h-[44px] items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isChildActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:translate-x-0.5'
                      }`}
                      onMouseEnter={() =>
                        item.remoteName && preloadRemote(item.remoteName)
                      }
                      onFocus={() =>
                        item.remoteName && preloadRemote(item.remoteName)
                      }
                      onClick={onLinkClick}
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
            className={`flex min-h-[44px] items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:translate-x-0.5'
            }`}
            onMouseEnter={() =>
              item.remoteName && preloadRemote(item.remoteName)
            }
            onFocus={() =>
              item.remoteName && preloadRemote(item.remoteName)
            }
            onClick={onLinkClick}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

interface AdminLayoutClientProps {
  children: React.ReactNode;
  session: Session;
}

export function AdminLayoutClient({ children, session }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifications = useNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const {
    markNotificationRead,
    removeNotification,
    clearNotifications,
  } = useShellActions();

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

  const breadcrumbItems = getBreadcrumbItems(pathname);
  const showBreadcrumb = pathname.startsWith('/admin/accounts');

  const logo = (
    <>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <LayoutDashboard className="h-5 w-5" aria-hidden />
      </div>
      <span className="font-semibold tracking-tight text-foreground">Admin Portal</span>
    </>
  );

  const navContent = (
    <AdminNavContent
      pathname={pathname}
      navItems={navItems}
      onLinkClick={() => setMobileMenuOpen(false)}
    />
  );

  return (
    <div className="flex h-screen">
      <a
        href="#main-content"
        className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[2147483647] focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      {/* Desktop sidebar: show on laptop+ (lg) to match web-shell */}
      <div className="hidden lg:block">
        <AppSidebar logo={logo}>{navContent}</AppSidebar>
      </div>

      {/* Mobile menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-56 p-0">
          <div className="flex h-14 items-center gap-2 border-b border-border px-4">
            {logo}
          </div>
          <div className="space-y-0.5 p-2">
            {navContent}
          </div>
        </SheetContent>
      </Sheet>

      {/* Main: header + content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          left={
            showBreadcrumb && breadcrumbItems.length > 0 ? (
              <Breadcrumb items={breadcrumbItems} />
            ) : null
          }
          right={
            <>
              <div className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="min-h-[44px] min-w-[44px]"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative min-h-[44px] min-w-[44px]"
                    aria-label={
                      unreadCount > 0
                        ? `Notifications (${unreadCount} unread)`
                        : 'Notifications'
                    }
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between border-b p-3">
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
                      <Bell
                        className="mb-2 h-8 w-8 text-muted-foreground/50"
                        aria-hidden
                      />
                      <p className="text-sm text-muted-foreground">
                        No new notifications
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[320px] overflow-y-auto">
                      {notifications.slice(0, 10).map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className={`flex cursor-pointer flex-col items-start gap-1 p-3 ${
                            !notification.read ? 'bg-accent/50' : ''
                          }`}
                          onClick={() =>
                            markNotificationRead(notification.id)
                          }
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
                                <p className="line-clamp-2 text-xs text-muted-foreground">
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
                              aria-label="Dismiss notification"
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
                className="min-h-[44px] gap-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          }
        />
        <main id="main-content" className="flex-1 overflow-auto bg-muted/30">
          <div className="container px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
