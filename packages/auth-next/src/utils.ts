import type { Session } from 'next-auth';
import type { Session as CoreSession } from '@repo/auth-core';

/**
 * Convert next-auth session to core Session type for remotes
 */
export function toCoreSession(session: Session | null): CoreSession | null {
  if (!session?.user) return null;

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      roles: session.user.roles || [],
      permissions: session.user.permissions || [],
    },
    token: session.accessToken,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // Default 7 days
  };
}
