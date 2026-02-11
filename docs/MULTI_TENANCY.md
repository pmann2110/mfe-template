# Multi-Tenancy Guide

## Overview

The platform supports **multi-tenancy** via an organization (tenant) context. Users can belong to multiple organizations and switch between them. Tenant context is stored in the shell store and used for permission checks and API scoping.

## Architecture

- **Shell store** (`@repo/stores`): Holds `tenantId`, `tenantMetadata`, `currentOrgPermissions`, and `availableTenants`.
- **Tenant context** (`TenantProvider` / `useTenantContext`): React context for tenant operations and tenant-scoped API calls.
- **API contracts** (`@repo/api-contracts`): `TenantMetadata`, `UserTenantMembership`, `TenantApi` for listing tenants and resolving permissions.
- **API client** (`@repo/api-client`): Optional `getTenantId` in `UserApiClientOptions`; sends `X-Tenant-Id` header on requests when set.

## Key Types

- **TenantMetadata**: `id`, `name`, `slug?`, `createdAt?`, `updatedAt?`
- **AvailableTenant**: Same shape as TenantMetadata; used for the list of orgs the user can access.

## Shell Store Tenant State

| Field | Type | Description |
|-------|------|-------------|
| `tenantId` | `string \| null` | Current organization ID. |
| `tenantMetadata` | `TenantMetadata \| null` | Name, slug, etc. for the current org. |
| `currentOrgPermissions` | `string[] \| null` | User's permissions in the current org (for `canInOrg`). |
| `availableTenants` | `AvailableTenant[]` | Orgs the user can switch to. |

Actions: `setTenantId`, `setTenantMetadata`, `setCurrentOrgPermissions`, `setAvailableTenants`.

## Tenant Switching

1. **Org switcher** (e.g. in identity-remote): User picks an org from a dropdown; shell actions update `tenantId`, `tenantMetadata`, and `currentOrgPermissions` (from API or mock).
2. **API**: Call `GET /api/tenants` (admin-shell) for the list; call `GET /api/org-permissions?tenantId=...` (web-shell) to resolve permissions when switching.

## Middleware

- **admin-shell**: Platform-level; tenant context is optional (e.g. for org-scoped admin pages).
- **web-shell**: Tenant-scoped routes can validate tenant and permissions in layout; middleware does not enforce tenant (handled in layout/client).

## Best Practices

- Always pass or read `tenantId` when making org-scoped API calls.
- Use `canInOrg(permission, currentOrgPermissions)` for UI and route guards inside an org.
- Use the API client's `getTenantId` option so all requests automatically include `X-Tenant-Id`.
