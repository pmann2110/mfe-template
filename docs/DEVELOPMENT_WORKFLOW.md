# Development Workflow

## Overview

This document covers **coding standards**, **testing strategy**, **code review**, and **CI**. For **branch strategy**, **running checks**, and **adding a new remote**, see [CONTRIBUTING.md](../CONTRIBUTING.md).

---

## Prerequisites

- Node.js v20.x
- pnpm v9.4.0 (see root `packageManager`)
- Git, VSCode (recommended)

---

## Coding Standards

### TypeScript

- Use strict types; avoid `any`.
- Use interfaces for object shapes and type aliases for complex types.

### React

- Use functional components and hooks.
- Use proper prop types and error boundaries for critical components.

### Module Federation

- Expose components via the `exposes` configuration; share common deps as singletons.
- Implement error handling for remote loading. The host loads remote URLs from [remote-configs.json](../apps/admin-shell/public/config/remote-configs.json).

### State Management

- Use the global shell store (`@repo/stores`) for shared state; avoid duplication.
- See [STATE_AND_AUTH.md](STATE_AND_AUTH.md) for when to use stores vs auth-core.
- For tenant context and org permissions, see [MULTI_TENANCY.md](MULTI_TENANCY.md) and [PERMISSIONS_GUIDE.md](PERMISSIONS_GUIDE.md).

---

## Testing

### Strategy

- **Unit / integration:** Vitest (used in [packages/rbac](packages/rbac)); other packages may add Vitest over time.
- **E2E:** Not yet configured; consider Playwright or Cypress for login and remote-load flows later.

### Running tests

```bash
# Run all workspace tests (Turbo runs test in every package that has a test script)
pnpm run test

# Run tests for a specific package (e.g. rbac)
pnpm --filter @repo/rbac test

# Watch mode (only in packages that define test:watch, e.g. rbac)
pnpm --filter @repo/rbac test:watch
```

### Writing tests

- Use **Vitest** for unit and integration tests.
- Use React Testing Library for component tests when added.
- Add a `test` script in package `package.json` so `pnpm run test` includes the package.

---

## Code Reviews

- Aim for at least one approval before merge.
- Focus on: code quality, architecture, performance, security, test coverage.
- Checklist: conventions, error handling, tests for new code, docs updated, no unintended breaking changes.

---

## Continuous Integration

The project uses [GitHub Actions](../.github/workflows/ci-cd.yml):

1. **Lint** and **typecheck** and **test** run for all workspaces that define those scripts.
2. **Build** runs after lint, typecheck, and test pass.
3. **Deploy** runs on push to `main` or `develop` (Vercel prebuilt).

Branch strategy and deployment details are in [CONTRIBUTING.md](../CONTRIBUTING.md) and [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

---

## Troubleshooting

1. **Module Federation not working:** Ensure remotes are running and remote URLs in config are correct; check browser console and [RUNBOOK.md](RUNBOOK.md).
2. **TypeScript errors:** Run `pnpm run typecheck`; ensure dependencies are typed.
3. **Build failures:** Clear Turbo cache: `rm -rf .turbo` (or run `pnpm run clean` if added). Reinstall with `pnpm install`. Confirm Node.js 20.
4. **Test failures:** Run the failing package in isolation (`pnpm --filter <package> test`); check test env and mocks.

---

## Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
