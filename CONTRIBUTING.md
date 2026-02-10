# Contributing to MFE Module Federation

Thank you for contributing. This document covers branch strategy, how to add a new remote, and how to run checks locally.

---

## Branch strategy

- **`main`** – production-ready; deployable.
- **`develop`** – integration branch; CI runs on push/PR to `main` and `develop`.
- Use feature branches off `develop` (or `main` for small fixes). Open PRs into `develop` or `main` as appropriate.

---

## Running checks locally

- **Lint:** `pnpm run lint`
- **Typecheck:** `pnpm run typecheck`
- **Tests:** `pnpm run test` (Turbo runs test in all workspaces that define a `test` script)
- **Full checks (build + lint + typecheck):** `pnpm run checks`
- **Format:** `pnpm run format`

Pre-commit runs format via lint-staged. Consider running `pnpm run typecheck` before pushing to catch type regressions.

---

## Adding a new remote

1. **Create the remote app** (e.g. under `apps/my-remote/`) with Vite and `@module-federation/vite`. Expose the main component (e.g. `./app` → `./src/App.tsx`). Share React, ReactDOM, `@repo/ui`, `@repo/stores` as singletons.

2. **Add remote config** in `apps/admin-shell/public/config/remote-configs.json` for each environment (development, staging, production) with `url`, `scope`, `module`, and optional `cssUrl`.

3. **Register the route** in `apps/admin-shell/lib/admin-routes.ts`: add an entry with `path`, `permission` (or `null`), `label`, `icon`, and `remoteName` matching the key in `remote-configs.json`.

4. **Wire the remote in the shell** so the route’s `remoteName` is passed to the module-federation loader and the remote component is rendered (see how `users` remote is loaded in the admin layout).

5. **Document** any new env vars (e.g. `VITE_*` for the remote) in SETUP_GUIDE or README.

See [docs/ADDING_A_NEW_APP.md](docs/ADDING_A_NEW_APP.md) and [docs/STATE_AND_AUTH.md](docs/STATE_AND_AUTH.md) for store/auth usage in remotes.

---

## Code style

- ESLint and Prettier are enforced. Run `pnpm run format` before committing.
- Use TypeScript strictly; avoid `any` where possible.
- For shared types and API contracts, use `packages/api-contracts` and the shared API client (`@repo/api-client`) when calling a real backend.

---

## Questions

Open a GitHub issue or contact the maintainers.
