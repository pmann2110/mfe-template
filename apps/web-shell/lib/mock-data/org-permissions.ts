/**
 * Mock org permissions per tenant for development.
 * In production, resolve from membership + role in the backend.
 */
export function getMockOrgPermissions(_tenantId: string): string[] {
  return ['user:read', 'user:write', 'role:read', 'org-settings:read'];
}
