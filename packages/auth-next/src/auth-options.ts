import type { NextAuthConfig } from 'next-auth';
import type { Permission } from '@repo/auth-core';
import CredentialsProvider from 'next-auth/providers/credentials';
import { jwtCallback, sessionCallback } from './callbacks';
import type { AppUser } from './types';

/**
 * Maps credentials to roles and permissions. Admin role receives admin:access so
 * RBAC canWithPermissions() treats them as full access without checking roles.
 */
async function validateCredentials(
  email: string,
  _password: string,
): Promise<AppUser | null> {
  let roles: readonly ['admin', 'manager'] | readonly ['manager'] | readonly ['viewer'];
  if (email.includes('admin')) {
    roles = ['admin', 'manager'] as const;
  } else if (email.includes('manager')) {
    roles = ['manager'] as const;
  } else {
    roles = ['viewer'] as const;
  }

  let permissions: Permission[];
  if (email.includes('admin')) {
    permissions = [
      'admin:access',
      'user:read',
      'user:write',
    ];
  } else if (email.includes('manager')) {
    permissions = ['admin:access', 'user:read'];
  } else {
    permissions = ['user:read'];
  }

  await Promise.resolve();
  return {
    id: `user-${String(Date.now())}`,
    email,
    name: email.split('@')[0] ?? 'Unknown User',
    roles: [...roles],
    permissions: [...permissions],
  };
}

if (process.env.NODE_ENV === 'production') {
  if (!process.env.NEXTAUTH_SECRET || !process.env.NEXTAUTH_URL) {
    throw new Error(
      'NEXTAUTH_SECRET and NEXTAUTH_URL are required in production. Set them in your environment.',
    );
  }
} else {
  if (!process.env.NEXTAUTH_SECRET) {
    // eslint-disable-next-line no-console -- env validation at startup
    console.warn('⚠️  NEXTAUTH_SECRET is not set. Using fallback secret for development only.');
  }
  if (!process.env.NEXTAUTH_URL) {
    // eslint-disable-next-line no-console -- env validation at startup
    console.warn('⚠️  NEXTAUTH_URL is not set. Using http://localhost:3000 as default.');
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // NextAuth types may allow undefined credentials; guard for runtime safety
          /* eslint-disable @typescript-eslint/no-unnecessary-condition */
          const email = credentials?.email;
          const password = credentials?.password;
          /* eslint-enable @typescript-eslint/no-unnecessary-condition */
          if (typeof email !== 'string' || typeof password !== 'string') {
            return null;
          }

          const user = await validateCredentials(email, password);

          if (!user) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            roles: user.roles,
            permissions: user.permissions,
            sub: user.id,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // Cast needed: our authorize() returns AppUser; NextAuth types expect User | AdapterUser
    jwt: jwtCallback as NonNullable<NextAuthConfig['callbacks']>['jwt'],
    session: sessionCallback,
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isOnLogin = nextUrl.pathname === '/login';
      if (isOnLogin) {
        if (isLoggedIn) {
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
    error: '/login',
    verifyRequest: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET ?? 'fallback-secret-for-development',
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development',
  events: {
    async signIn() {
      await Promise.resolve();
    },
    async signOut() {
      await Promise.resolve();
    },
  },
};

export function createAuthOptions(): NextAuthConfig {
  return authConfig;
}
