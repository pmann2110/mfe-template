export type Permission =
  | 'admin:access'
  | 'user:read'
  | 'user:write'
  | 'product:read'
  | 'product:write';

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions?: Permission[]; // Optional for backward compatibility
}

export interface Session {
  user: User;
  token?: string;
  expiresAt: number;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
