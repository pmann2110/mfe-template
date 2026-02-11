import type { Session as CoreSession } from '@repo/auth-core';

/**
 * Creates a mock session for standalone development mode
 * Provides full user management permissions for local development
 */
export function createMockSession(): CoreSession {
  return {
    user: {
      id: 'standalone-user',
      email: 'dev@localhost',
      name: 'Development User',
      roles: ['admin'],
      permissions: ['user:read', 'user:write'],
    },
    expiresAt: Date.now() + 86400000, // 24 hours
  };
}
