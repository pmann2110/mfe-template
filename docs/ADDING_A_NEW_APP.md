# Adding a New App

This document describes how to add a new application to the monorepo. The repo supports two kinds of front-end apps: **MFE remotes** (federated modules loaded by a shell) and **standalone web apps** (normal Next.js or Vite apps that do not use Module Federation).

## App taxonomy

- **Shell**: A Next.js app that hosts remotes (e.g. `admin-shell`). Uses the module-federation loader and `remote-configs.json`. Other Next.js apps that do not load remotes are not shells.
- **Remote**: A federated app (e.g. Vite-based `users-remote`) that is exposed via Module Federation and loaded at runtime by a shell.
- **Standalone (normal web app)**: A Next.js or Vite app with no Module Federation. Uses shared packages for auth, UI, and state. **Use `web-shell` as the reference** for new standalone apps; there is no separate template app.

## Adding a new standalone (normal) web app

1. **Use web-shell as the template**: Copy or scaffold from [apps/web-shell](apps/web-shell). Same structure: Next.js, `@repo/auth-next`, `@repo/rbac`, `@repo/ui`, `@repo/stores`, `@repo/tailwind-config`.
2. **Do not add** the module-federation loader, `remote-configs.json`, or any remote loading code.
3. Add the new app under `apps/<your-app>` and add it to the Turborepo pipeline (it will be picked up by `turbo.json` if it has standard `build`/`dev`/`lint`/`typecheck` scripts).
4. Dependencies to include: `@repo/auth-next`, `@repo/auth-core` (if needed), `@repo/rbac`, `@repo/ui`, `@repo/stores`, `@repo/tailwind-config`, `@repo/api-contracts` (if you use API types).

## Adding a new MFE remote

1. Use `users-remote` as the reference: Vite + `@module-federation/vite`, expose a single default export (React component) that accepts [RemoteAppProps](packages/api-contracts/src/routing.ts) (`session`, `routingProps?`).
2. Implement the **remote contract**: one default export (e.g. from `./src/App.tsx`) receiving `session` and optional `routingProps`. When `routingProps` is undefined, the remote is in standalone mode (e.g. dev).
3. Shared dependencies: `react`, `react-dom`, `@repo/ui`, `@repo/stores`, `@repo/auth-core`, `@repo/api-contracts`, `@repo/remote-utils` (RouterSync, StandaloneAuth).
4. Add the remote to the shell’s [remote-configs.json](apps/admin-shell/public/config/remote-configs.json) (development, staging, production) and add a route + `ModuleFederationRemote` usage in the shell.

## Adding a new shell

1. Shells are Next.js apps that load remotes at runtime. Use `admin-shell` as the reference.
2. You need: the [module-federation loader](apps/admin-shell/lib/module-federation-loader.ts), [remote-configs.json](apps/admin-shell/public/config/remote-configs.json), and components that use `loadRemoteComponent` / `ModuleFederationRemote`.
3. Only shells need the loader and remote config; standalone apps do not.

## Shared packages (summary)

| Package              | Shells | Remotes | Standalone |
|----------------------|--------|---------|------------|
| @repo/auth-core      | ✓      | ✓       | optional   |
| @repo/auth-next      | ✓      | —       | ✓          |
| @repo/rbac           | ✓      | ✓       | ✓          |
| @repo/api-contracts  | ✓      | ✓       | optional   |
| @repo/ui             | ✓      | ✓       | ✓          |
| @repo/stores         | ✓      | ✓       | ✓          |
| @repo/remote-utils   | —      | ✓       | —          |
| @repo/tailwind-config| ✓      | ✓       | ✓          |

## Remote contract (reference)

Federated remotes expose a **single default export**: a React component that accepts:

- `session: TSession | null` (e.g. from `@repo/auth-core`).
- `routingProps?: RoutingProps` — when undefined, the app is in **standalone mode** (e.g. dev without shell). When provided with `mode: 'hosted'`, the shell controls the URL and provides `onNavigate`.

See [packages/api-contracts/src/routing.ts](packages/api-contracts/src/routing.ts) for `RemoteAppProps` and `RoutingProps`.
