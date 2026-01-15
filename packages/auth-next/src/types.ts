import type { Permission } from '@repo/auth-core';

export type Role = 'admin' | 'manager' | 'viewer';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  roles: Role[];
  permissions: Permission[];
}

export interface AppSession {
  user: AppUser;
  accessToken?: string;
  expires: string;
}

// Extend next-auth types
declare module 'next-auth' {
  interface Session {
    user: AppUser;
    accessToken?: string;
    expires?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
    sub?: string; // Standard JWT subject
    email?: string; // Standard JWT email
    name?: string; // Standard JWT name
    roles: Role[];
    permissions: Permission[];
    accessToken?: string;
    exp?: number; // Expiration time
  }
}
