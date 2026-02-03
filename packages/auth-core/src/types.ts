export type Permission =
  | 'admin:access'
  | 'user:read'
  | 'user:write';

/** Authenticated identity (roles, permissions). Use for session and RBAC. */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions?: Permission[]; // Optional for backward compatibility
}

export interface Session {
  user: AuthUser;
  token?: string;
  expiresAt: number;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
