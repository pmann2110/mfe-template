/**
 * Single source of truth for admin route protection. All permission checks for
 * /admin/* routes are enforced here using ADMIN_ROUTES. Page-level canWithPermissions
 * checks are optional defense-in-depth only.
 *
 * Uses NextAuth v5 auth() as a wrapper so session is available as req.auth in Edge
 * (calling await auth() directly in middleware can return null on Edge).
 */
import { auth } from '@repo/auth-next';
import { NextResponse } from 'next/server';
import { canWithPermissions } from '@repo/rbac';
import { ADMIN_ROUTES } from './lib/admin-routes';

export default auth((req) => {
  const session = req.auth;
  const path = req.nextUrl.pathname;

  // Skip for login page and API routes (matcher already limits to /admin/*, but be explicit)
  if (path === '/login' || path.startsWith('/api')) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!session) {
    if (path.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login', req.nextUrl));
    }
    return NextResponse.next();
  }

  // Permission check from single source of truth (longest prefix match: /admin/users/123 -> user:read)
  const routesWithPermission = ADMIN_ROUTES.filter((r) => path.startsWith(r.path) && r.permission != null);
  const route = routesWithPermission.length
    ? routesWithPermission.sort((a, b) => b.path.length - a.path.length)[0]
    : undefined;
  if (route?.permission && session.user) {
    const permissions = (session.user as { permissions?: string[] }).permissions ?? [];
    if (!canWithPermissions(route.permission, permissions)) {
      return NextResponse.redirect(new URL('/admin/unauthorized', req.nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*'],
};
