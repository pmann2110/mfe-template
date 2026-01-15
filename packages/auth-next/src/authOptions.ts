import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { jwtCallback, sessionCallback } from './callbacks';
import type { AppUser } from './types';
import type { Permission } from '@repo/auth-core';

// Mock user database (replace with real API/DB call)
async function validateCredentials(
  email: string,
  password: string,
): Promise<AppUser | null> {
  // Mock validation - accept any credentials
  // In production, call your auth API or database
  const roles = email.includes('admin')
    ? (['admin', 'manager'] as const)
    : email.includes('manager')
      ? (['manager'] as const)
      : (['viewer'] as const);

  const permissions: Permission[] = email.includes('admin')
    ? [
        'admin:access',
        'user:read',
        'user:write',
        'product:read',
        'product:write',
      ]
    : email.includes('manager')
      ? ['admin:access', 'user:read', 'product:read', 'product:write']
      : ['user:read', 'product:read'];

  return {
    id: `user-${Date.now()}`,
    email,
    name: email.split('@')[0] || 'Unknown User',
    roles: [...roles], // Convert readonly array to mutable array
    permissions: [...permissions], // Convert readonly array to mutable array
  };
}

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  console.warn('⚠️  NEXTAUTH_SECRET is not set. Using fallback secret for development only.');
}
if (!process.env.NEXTAUTH_URL) {
  console.warn('⚠️  NEXTAUTH_URL is not set. Using http://localhost:3000 as default.');
}

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        try {
          console.log('🔐 AUTHORIZE FUNCTION CALLED!');
          console.log('🔐 Credentials received:', JSON.stringify(credentials, null, 2));
          console.log('🔐 Request headers:', request?.headers);

          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Missing credentials - returning null');
            return null;
          }
  
          console.log('🔍 Calling validateCredentials...');
          const user = await validateCredentials(
            credentials.email as string,
            credentials.password as string,
          );

          if (!user) {
            console.log('❌ Invalid credentials for:', credentials.email);
            return null;
          }

          console.log('✅ User authenticated successfully:', user.email);
          
          // Create user object with all required properties
          const userObject = {
            id: user.id,
            email: user.email,
            name: user.name,
            roles: user.roles,
            permissions: user.permissions,
            // Add standard JWT properties for proper session handling
            sub: user.id,
          };
          
          console.log('🔄 Returning user object:', JSON.stringify(userObject, null, 2));
          return userObject;
        } catch (error) {
          console.error('❌ Authorization error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: jwtCallback,
    session: sessionCallback,
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname === '/login';
      if (isOnLogin) {
        if (isLoggedIn) {
          // Redirect authenticated users to admin dashboard
          return Response.redirect(new URL('/admin', nextUrl));
        }
        return true;
      }
      if (isLoggedIn) return true;
      return false;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', // Redirect to login page on auth errors
    verifyRequest: '/login', // Redirect after email verification
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  trustHost: true, // Trust localhost for development
  // Add CSRF protection
  useSecureCookies: process.env.NODE_ENV === 'production',
  // Debug settings for development
  debug: process.env.NODE_ENV === 'development',
  // Additional security settings
  events: {
    async signIn(message) {
      console.log('🔐 SignIn event:', message);
    },
    async signOut(message) {
      console.log('🔐 SignOut event:', message);
    },
  },
};

// Legacy export for compatibility
export function createAuthOptions() {
  return authConfig;
}
