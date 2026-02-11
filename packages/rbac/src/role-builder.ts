import type { OrgPermission } from './permission-matrix';
import { isOrgPermission, ORG_PERMISSIONS } from './permission-matrix';

/**
 * Validate that a list of permission strings are all valid org permissions.
 */
export function validateOrgPermissions(permissions: string[]): OrgPermission[] {
  const valid: OrgPermission[] = [];
  for (const p of permissions) {
    if (isOrgPermission(p)) valid.push(p);
  }
  return valid;
}

/**
 * Build a validated set of org permissions from a string array.
 * Invalid entries are filtered out.
 */
export function buildOrgRolePermissions(permissions: string[]): OrgPermission[] {
  return validateOrgPermissions(permissions);
}

/**
 * Check if a permission string is in the org permission registry.
 */
export function isAllowedOrgPermission(value: string): boolean {
  return isOrgPermission(value);
}

/**
 * Get all org permission identifiers (for UI dropdowns/checkboxes).
 */
export function getAllOrgPermissions(): readonly OrgPermission[] {
  return ORG_PERMISSIONS;
}
