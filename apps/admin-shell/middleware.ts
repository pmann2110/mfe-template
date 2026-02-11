/**
 * Single source of truth for admin route protection. Permission checks for
 * /admin/* are enforced here when session is available.
 * Admin-shell is platform-only; tenant context is not required for these routes.
 *
 * IMPORTANT: In NextAuth v5, auth() and the auth() wrapper can return null / run
 * authorized() with null in Edge middleware even when the user has a valid JWT.
 * So we do NOT redirect to /login from middleware when session is null—we let
 * the admin layout (server component, Node.js) do that. That way navigation to
 * /admin/accounts works; the layout's auth() sees the session and renders.
 * When we do have a session here, we enforce permission and redirect to
 * /admin/unauthorized when needed.
 *
 * CORS (production): For /config and /api, we set Access-Control-Allow-Origin
 * to the request Origin when it is in NEXT_PUBLIC_ALLOWED_REMOTE_ORIGINS.
 */
import { auth } from '@repo/auth-next';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { canWithPermissions } from '@repo/rbac';
import { ADMIN_ROUTES } from './lib/admin-routes';

function getProductionCorsResponse(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin');
  if (!origin) return response;
  const allowed =
    (process.env.NEXT_PUBLIC_ALLOWED_REMOTE_ORIGINS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  if (!allowed.includes(origin)) return response;
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path === '/login' || path.startsWith('/api')) {
    const res = NextResponse.next();
    if (process.env.NODE_ENV === 'production' && (path.startsWith('/api') || path.startsWith('/config'))) {
      return getProductionCorsResponse(request, res);
    }
    return res;
  }

  if (path.startsWith('/config')) {
    const res = NextResponse.next();
    if (process.env.NODE_ENV === 'production') {
      return getProductionCorsResponse(request, res);
    }
    return res;
  }

  const session = await auth();

  // Do not redirect to login from Edge when session is null; layout will do it.
  // (Session is often null in Edge despite valid JWT, which caused redirect loop.)
  if (!session) {
    return NextResponse.next();
  }

  // Permission check from single source of truth (longest prefix match)
  const routesWithPermission = ADMIN_ROUTES.filter((r) => path.startsWith(r.path) && r.permission != null);
  const route = routesWithPermission.length
    ? routesWithPermission.sort((a, b) => b.path.length - a.path.length)[0]
    : undefined;
  if (route?.permission && session.user) {
    const permissions = session.user.permissions ?? [];
    if (!canWithPermissions(route.permission, permissions)) {
      return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*', '/config/:path*'],
};
