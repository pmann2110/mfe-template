# Permissions Guide

## Two-Layer RBAC

The platform uses **system-level** and **organization-level** permissions.

### System permissions

- Stored on the session (from roles/permissions in auth).
- Checked with `canSystem(permission, session)` or `canWithSystemPermissions(permission, systemPermissions)`.
- Used for platform-wide actions (e.g. `org:create`, `system:admin`, `billing:read`).

### Organization permissions

- Resolved per tenant from the user's membership and role in that org.
- Stored in the shell store as `currentOrgPermissions` when a tenant is selected.
- Checked with `canInOrg(permission, currentOrgPermissions)`.
- Used for org-scoped actions (e.g. `user:read`, `user:write`, `role:read`, `role:write`, `org-settings:read`).

## Permission Matrix

- **System permissions**: See `SYSTEM_PERMISSIONS` and `SYSTEM_PERMISSION_CATEGORIES` in `@repo/rbac` (`permission-matrix.ts`).
- **Org permissions**: See `ORG_PERMISSIONS` and `ORG_PERMISSION_CATEGORIES`.
- Descriptions: `SYSTEM_PERMISSION_DESCRIPTIONS`, `ORG_PERMISSION_DESCRIPTIONS`.

## React Hooks

- `useSystemPermission(permission)`: System permission check (uses session from store/auth).
- `useOrgPermission(permission, orgPermissions)`: Org permission check.
- `useSystemPermissions(session)`: List of effective system permissions.
- `useCanAccess(permission, context)`: Universal hook; context is `{ session }` or `{ orgPermissions }`.

## Role Management

- **Org roles** are defined in `@repo/api-contracts` (`OrgRole`); permissions are `string[]` (org permission slugs).
- **Role builder** (`@repo/rbac`): `validateOrgPermissions`, `buildOrgRolePermissions`, `getAllOrgPermissions`.
- Role management UI lives in **identity-remote** (RoleList, RoleForm, RolePermissionMatrix); uses `canInOrg('role:read' | 'role:write')`.

## Usage in Remotes

1. Read `tenantId` and `currentOrgPermissions` from the shell store.
2. Use `canInOrg(permission, currentOrgPermissions)` to guard actions and routes.
3. Use `useOrgPermission(permission, currentOrgPermissions)` in components.
4. When creating/editing roles, use the permission matrix and role builder to validate and assign permissions.
