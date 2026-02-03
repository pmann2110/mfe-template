import { auth } from '@repo/auth-next';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { canWithPermissions, type Permission } from '@repo/rbac';

export async function middleware(request: NextRequest) {
  try {
    const session = await auth();
    const path = request.nextUrl.pathname;

    // Skip middleware for login page and API routes
    if (path === '/login' || path.startsWith('/api')) {
      return NextResponse.next();
    }

    // Redirect to login if not authenticated
    if (!session) {
      if (path.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      return NextResponse.next();
    }

    // Map route prefixes to required permissions (prefix match so /admin/users/123 is protected)
    const routePermissionPrefixes: { prefix: string; permission: Permission }[] = [
      { prefix: '/admin/users', permission: 'user:read' },
    ];

    const entry = routePermissionPrefixes.find((e) => path.startsWith(e.prefix));
    const requiredPermission = entry?.permission;
    if (requiredPermission && session.user) {
      const permissions = session.user.permissions || [];
      if (!canWithPermissions(requiredPermission, permissions)) {
        return NextResponse.redirect(
          new URL('/admin/unauthorized', request.url),
        );
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // If middleware fails, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
