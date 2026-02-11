import type { TenantMetadata } from '@repo/api-contracts';

/**
 * Mock tenant/organization list for development.
 * Includes system org for platform access; keep in sync with identity-remote mock-identity.
 * In production, replace with data from user memberships API.
 */
export const MOCK_TENANTS: TenantMetadata[] = [
  { id: 'system', name: 'Platform', slug: 'platform' },
  { id: 'org-1', name: 'Acme Corp', slug: 'acme' },
  { id: 'org-2', name: 'Beta Inc', slug: 'beta' },
];

export interface MockActivityItem {
  id: string;
  action: string;
  time: string;
  type: 'auth' | 'user' | 'role' | 'org';
}

export const MOCK_ACTIVITY: MockActivityItem[] = [
  { id: '1', action: 'User signed in', time: 'Just now', type: 'auth' },
  { id: '2', action: 'Role "Admin" updated', time: '2 hours ago', type: 'role' },
  { id: '3', action: 'New user invited', time: 'Yesterday', type: 'user' },
];
