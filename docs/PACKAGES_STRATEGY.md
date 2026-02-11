# Packages Strategy

This document outlines the shared packages in the monorepo, how they are used, and how to manage versioning and publishing.

## Table of Contents

- [Current Project Structure](#current-project-structure)
- [Publishing Shared Packages](#publishing-shared-packages)
- [Versioning Strategy](#versioning-strategy)
- [Consuming Versioned Packages](#consuming-versioned-packages)

## Current Project Structure

The project is a pnpm workspace monorepo. Shared packages live under `packages/` and are referenced with `workspace:*`. The repo uses [Changesets](https://github.com/changesets/changesets) for versioning (run `pnpm changeset` to add a changeset).

### Shared packages (full list)

| Package | Purpose | Used by |
|--------|---------|---------|
| `@repo/api-contracts` | API interfaces, routing types, data models (e.g. `User`, `UserApi`, `RemoteConfig`, `ApiResult`) | Shells, remotes, api-client |
| `@repo/api-client` | Shared API client implementation (e.g. `createUserApiClient`) using fetch and `API_BASE_URL` | Remotes (e.g. users-remote when not using mock) |
| `@repo/auth-core` | Core auth types, session, auth client, optional `createShellStore` for non–Next.js shells | Shells, remotes, auth-next, rbac |
| `@repo/auth-next` | NextAuth.js v5 config (authOptions, callbacks) for Next.js shells | admin-shell, web-shell |
| `@repo/rbac` | Role-based access control (permissions, `canWithPermissions`) | Shells, remotes |
| `@repo/remote-utils` | RouterSync, StandaloneAuthProvider for remotes | Remotes (e.g. users-remote) |
| `@repo/stores` | Global shell store (Zustand singleton): session snapshot, notifications, remote loading state | Shells, remotes |
| `@repo/ui` | Shared UI components and `globals.css` design tokens (Tailwind v4, Radix) | All apps |
| `@repo/tailwind-config` | Shared Tailwind base config (theme, dark mode, plugins) | All apps |
| `@repo/ts-config` | Shared TypeScript base config | All packages/apps |
| `@repo/logger` | Logging utilities | Optional in apps |
| `@repo/eslint-config-custom` | Shared ESLint configuration | All packages/apps |

## Publishing Shared Packages

To publish packages to a private registry (e.g. GitHub Packages, npm private registry):

### 1. Update `package.json`

- Remove `private: true` for packages you want to publish.
- Set `name` to your registry scope (e.g. `@your-org/api-contracts`).

### 2. Configure authentication

- **pnpm** uses `.npmrc`. For a private registry:
  ```ini
  @your-org:registry=https://npm.pkg.github.com
  //npm.pkg.github.com/:_authToken=${NPM_TOKEN}
  ```

### 3. Publish

- With Changesets: run `pnpm version-packages` then `pnpm release` (or your pipeline).
- Manual publish with pnpm:
  ```bash
  cd packages/api-contracts
  pnpm publish --no-git-checks
  ```
- For GitHub Packages, ensure `.npmrc` or publish config points to the correct registry.

## Versioning Strategy

- Use **semantic versioning** (MAJOR.MINOR.PATCH): breaking = MAJOR, new features = MINOR, fixes = PATCH.
- Prefer **Changesets**: add a changeset with `pnpm changeset`, then use `pnpm version-packages` and `pnpm release` in CI or locally.
- Manually: update `version` in `package.json` or use `pnpm version patch|minor|major` in the package directory.

## Consuming Versioned Packages

- **Inside the monorepo:** Keep `workspace:*` so you always use the local workspace version.
- **Outside the monorepo:** Depend on the published version (e.g. `"@your-org/api-contracts": "^1.0.0"`) and run `pnpm install`. Replace `@repo` with your org scope when publishing.

## Additional Notes

- **Scope:** The repo uses `@repo` as the workspace scope; replace with your organization scope when publishing.
- **Registry:** Ensure `.npmrc` and any CI secrets (e.g. `NPM_TOKEN`) are set for the registry you use.
