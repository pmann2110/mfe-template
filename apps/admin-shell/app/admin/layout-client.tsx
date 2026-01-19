'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@repo/ui';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@repo/ui';
import { Bell, X, LogOut, LayoutDashboard, Users as UsersIcon } from 'lucide-react';
import Link from 'next/link';
import type { Session } from 'next-auth';
import { initShellStore, useNotifications, useShellActions } from '@repo/stores';
import { toCoreSession } from '@repo/auth-next';
import { preloadRemote } from '../../lib/module-federation-loader';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  session: Session;
}

export function AdminLayoutClient({
  children,
  session,
}: AdminLayoutClientProps) {
  const pathname = usePathname();
  const notifications = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;
  const { markNotificationRead, removeNotification, clearNotifications } = useShellActions();

  // Initialize the global shell store with the authenticated session
  useEffect(() => {
    const coreSession = toCoreSession(session);
    initShellStore({
      auth: {
        session: coreSession,
      },
    });
  }, [session]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    {
      path: '/admin/users',
      label: 'Users',
      icon: UsersIcon,
      permission: 'user:read' as const,
    },
  ].filter(
    (item) =>
      !item.permission ||
      session.user.permissions?.includes(item.permission),
  );

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b bg-gradient-to-r from-primary/5 via-background to-primary/5 backdrop-blur-sm shadow-sm">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-md">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Admin Portal
                </h1>
              </div>
            </div>
            <nav className="flex gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                const remoteName = item.path.includes('users') ? 'users' : null;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`group flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-sm'
                    }`}
                    onMouseEnter={() => remoteName && preloadRemote(remoteName)}
                    onFocus={() => remoteName && preloadRemote(remoteName)}
                  >
                    <Icon className={`h-4 w-4 transition-transform ${isActive ? '' : 'group-hover:scale-110'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-accent">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold shadow-lg animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-96 shadow-xl">
                <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-primary/5 p-3">
                  <h4 className="font-semibold text-foreground">Notifications</h4>
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearNotifications}
                      className="text-xs hover:bg-destructive/20 h-auto px-2"
                    >
                      <X className="mr-1 h-3 w-3" />
                      Clear all
                    </Button>
                  )}
                </div>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Bell className="mb-2 h-10 w-10 text-muted-foreground/30" />
                    <p className="text-sm font-medium text-muted-foreground">No new notifications</p>
                    <p className="text-xs text-muted-foreground/60">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.slice(0, 10).map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={`flex flex-col items-start p-3 cursor-pointer hover:bg-accent/70 transition-colors ${
                          !notification.read ? 'bg-accent/40 border-l-4 border-primary' : ''
                        }`}
                        onClick={() => markNotificationRead(notification.id)}
                      >
                        <div className="flex items-start justify-between w-full">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm ${
                                notification.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                notification.type === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                                notification.type === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                                'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                              }`}>
                                {notification.type}
                              </span>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                              )}
                            </div>
                            <p className={`text-sm leading-relaxed ${
                              !notification.read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'
                            }`}>
                              {notification.title}
                            </p>
                            {notification.message && (
                              <p className="text-xs text-muted-foreground">
                                {notification.message}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="h-6 w-6 p-0 ml-2 hover:bg-destructive/20"
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
            <div className="flex items-center gap-2 rounded-lg bg-accent/50 px-3 py-2 shadow-sm">
              <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-xs font-bold text-primary-foreground shadow-md">
                {session.user.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="text-sm font-medium text-foreground max-w-[150px] truncate">
                {session.user.email}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="gap-2 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-accent/5 to-background">
        <div className="container py-8 px-6">{children}</div>
      </main>
    </div>
  );
}
