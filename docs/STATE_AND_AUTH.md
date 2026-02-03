# State and Auth: Which Store to Use

This document clarifies when to use **`@repo/stores`** (shell store) vs **`@repo/auth-core`**’s **`createShellStore`** so you don’t mix the two patterns.

## Summary

| Context | Use | Reason |
|--------|-----|--------|
| **Next.js shell (e.g. admin-shell)** | `@repo/stores` only | Shell gets session from NextAuth and passes it into `initShellStore`. No separate auth client. |
| **Federated remotes (hosted in shell)** | `@repo/stores` | Remotes receive session via props and use `getShellStore()` for notifications, remote state. Same singleton as shell. |
| **Standalone remotes (dev without shell)** | `@repo/remote-utils` `StandaloneAuthProvider` + optional `createShellStore` | Remotes need a mock session; provider wraps the app. `createShellStore` is for custom auth clients. |
| **Non–Next.js shell or custom auth** | `createShellStore` from `@repo/auth-core` | When there is no NextAuth (e.g. different framework or custom login). Provides login, logout, rehydrate, and `can(permission)`. |

## @repo/stores (shell store)

- **Purpose:** Single global store for the **host shell and all federated remotes**: session snapshot, tenant, UI notifications, per-remote loading/error state.
- **Initialization:** The **Next.js shell** calls `initShellStore({ auth: { session: toCoreSession(session) } })` after auth. Remotes call `getShellStore()` (auto-inits if missing).
- **Where:** Used by admin-shell (layout-client), users-remote (notifications, etc.), and the module-federation loader (remote loading state).
- **Do not** use `createShellStore` from auth-core in a Next.js shell that already uses NextAuth and `@repo/stores`; you would have two sources of auth state.

## @repo/auth-core createShellStore

- **Purpose:** Auth-only store for environments **without NextAuth**: login, logout, rehydrate, and `can(permission)`. Uses an `AuthClient` (e.g. `MockAuthClient` for standalone).
- **When to use:** Non–Next.js shells, or any app that needs its own auth client and is not receiving session from a Next.js host.
- **Not used by:** admin-shell or web-shell (they use NextAuth + `@repo/stores`).

## Adding a new remote

1. **Hosted in admin-shell:** The remote receives `session` and `routingProps` from the shell. Use `getShellStore()` from `@repo/stores` for shared state (e.g. notifications). Do not create a separate auth store.
2. **Standalone (e.g. dev without shell):** Wrap the app in `StandaloneAuthProvider` from `@repo/remote-utils` so the remote gets a mock session. Still use `getShellStore()` for UI state if the store is initialized (e.g. by a dev harness).
