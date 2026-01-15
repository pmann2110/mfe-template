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

    // Protect /account routes
    if (path.startsWith('/account') && !session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // If middleware fails, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/account/:path*'],
};
