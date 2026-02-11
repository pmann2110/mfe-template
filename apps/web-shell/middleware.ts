import { auth } from '@repo/auth-next';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    const session = await auth();
    const path = request.nextUrl.pathname;

    // Skip middleware for login page and API routes
    if (path === '/login' || path.startsWith('/api')) {
      return NextResponse.next();
    }

    // Protect /account routes (tenant context is validated in layout when needed)
    if (path.startsWith('/account') && !session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Tenant-scoped routes (/account/org/*): auth enforced above; tenantId and
    // currentOrgPermissions are enforced in layout (OrgLayoutClient).
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/account/:path*'],
};
