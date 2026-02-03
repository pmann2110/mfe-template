import type { Permission } from '@repo/rbac';

/**
 * Single source of truth for admin routes and permissions.
 * Used by middleware (permission checks) and layout-client (nav items, preload).
 *
 * - path: route path (used for middleware longest-prefix match and nav links)
 * - permission: required permission for the route; null = no check (e.g. Dashboard)
 * - remoteName: when set, this route loads a federated remote; used for preload and must match remote-configs.json key
 */
export const ADMIN_ROUTES = [
  {
    path: '/admin',
    permission: null as Permission | null,
    label: 'Dashboard',
    icon: 'dashboard' as const,
    remoteName: null as string | null,
  },
  {
    path: '/admin/users',
    permission: 'user:read' as Permission,
    label: 'Users',
    icon: 'users' as const,
    remoteName: 'users' as string | null,
  },
] as const;

export type AdminRouteIcon = (typeof ADMIN_ROUTES)[number]['icon'];
