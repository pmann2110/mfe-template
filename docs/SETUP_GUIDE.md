# Microfrontends Module Federation - Setup Guide

## Overview
This guide provides step-by-step instructions for setting up the Microfrontends Module Federation project for development and production environments.

---

## Prerequisites

### System Requirements
- Node.js v20.x (required)
- pnpm v9.4.0 (required)
- Git
- Operating System: macOS, Linux, or Windows (WSL recommended for Windows)

### Required Tools
- VSCode (recommended IDE)
- Docker (for containerized development, optional)
- Vercel CLI (for deployment, optional)

---

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/mfe-module-federation.git
cd mfe-module-federation
```

### 2. Install Dependencies
```bash
# Install project dependencies
pnpm install
```

### 3. Set Up Environment Variables
This repo does not ship `.env.example` files. Create `.env.local` files per app as needed.

Minimum required variables:
- `NEXTAUTH_URL`: Base URL for NextAuth.js callbacks (e.g. `http://localhost:3000` or `http://localhost:3001`)
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js (generate with `openssl rand -base64 32`)

Notes:
- The current auth implementation is **mock credentials** (see `packages/auth-next/src/auth-options.ts`). If you add a real backend, you can introduce an `API_BASE_URL` (or similar) and wire it into `validateCredentials()`.
- `users-remote` can run in **federated mode** (default) or **standalone mode** using `STANDALONE_MODE=true`.
- **users-remote API source:** Set `VITE_USE_MOCK_API=false` and `VITE_API_BASE_URL=<base URL>` to use the shared API client (real backend). Default is mock (`VITE_USE_MOCK_API=true` or unset).

---

## Development Workflow

### Running the Development Servers

The project uses Turborepo for managing the monorepo. To start all applications:

```bash
# Start all applications in development mode
pnpm run dev
```

This will start:
- Web Shell: `http://localhost:3000`
- Admin Shell: `http://localhost:3001`
- Users Remote: `http://localhost:6517`

### Running Individual Applications

To run specific applications:

```bash
# Admin Shell
pnpm --filter admin-shell dev

# Web Shell
pnpm --filter web-shell dev

# Users Remote
pnpm --filter users-remote dev

# Users Remote (standalone mode - federation disabled)
pnpm --filter users-remote local
```

### Building for Production

```bash
# Build all applications
pnpm run build

# Build specific application
pnpm --filter admin-shell build
```

### Running Tests

There is no dedicated automated test suite configured in this repo yet.
Use the standard checks instead:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm checks` (build + lint + typecheck across the monorepo)

---

## Project Structure

```
/
├── apps/
│   ├── admin-shell/          # Next.js admin dashboard shell
│   ├── web-shell/             # Next.js web shell
│   └── users-remote/          # Vite-based users remote application
├── packages/
│   ├── api-contracts/         # API interfaces and data models
│   ├── auth-core/             # Core authentication logic
│   ├── auth-next/             # Next.js-specific authentication utilities
│   ├── rbac/                  # Role-Based Access Control utilities
│   ├── remote-utils/          # Remote helpers (routing sync, standalone auth provider)
│   ├── stores/                # Global state management
│   ├── ts-config/             # Shared TypeScript configurations
│   └── ui/                    # Shared UI components
├── docs/                     # Documentation
└── plans/                    # Project plans and analysis
```

---

## Development Best Practices

### Code Style and Formatting
- The project uses ESLint and Prettier for code formatting
- Run formatting before committing:
  ```bash
  pnpm run format
  ```

### TypeScript
- All code should be type-safe
- Use proper TypeScript interfaces and types
- Avoid using `any` type

### Module Federation
- Remote modules should expose their components via the `exposes` configuration
- Shared dependencies should be marked as singletons when appropriate
- Use the `preloadRemote` function for better performance
- The host (`admin-shell`) loads environment-specific remote URLs from `apps/admin-shell/public/config/remote-configs.json`

### State Management
- Use the global shell store for shared state
- Avoid duplicating state across modules
- Use Zustand for local component state when needed

---

## Deployment

### Vercel Deployment

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Link your project to Vercel:
   ```bash
   vercel link
   ```

3. Deploy the applications:
   ```bash
   # Deploy admin-shell
   vercel --prod --scope your-team-name
   
   # Deploy web-shell
   vercel --prod --scope your-team-name
   
   # Deploy users-remote
   vercel --prod --scope your-team-name
   ```

### Environment Configuration for Production

Ensure the following environment variables are set in your production environment:

```
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
API_BASE_URL=https://your-api-domain.com
NODE_ENV=production
```

### CI/CD Configuration

The project includes a GitHub Actions workflow for CI/CD. The workflow:
- Runs tests on push to main branch
- Builds and deploys applications on push to production branch
- Runs linting and formatting checks

#### Optional CI/CD secrets

Configure these in your repository secrets when needed:

| Secret | Used by | Purpose |
|--------|---------|--------|
| `TURBO_TOKEN` | Turbo (CI) | Remote cache (optional; speeds builds). |
| `TURBO_TEAM` | Turbo (CI) | Team id for remote cache. |
| `VERCEL_TOKEN` | Deploy job | Vercel CLI auth for prebuilt deploys. |
| `VERCEL_ORG_ID` | Deploy job | Vercel organization id. |
| `VERCEL_PROJECT_ID` / `VERCEL_ADMIN_SHELL_PROJECT_ID` etc. | Deploy job | Per-app Vercel project ids. |
| `SLACK_WEBHOOK` | Notify job | Optional Slack notifications on build/deploy (uses `rtCamp/action-slack-notify`). |

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for production env vars and deployment steps.

---

## Troubleshooting

### Common Issues

1. **Module Federation Loading Errors**:
   - Ensure all remote applications are running
   - Check the browser console for detailed error messages
   - Verify the remote URLs in `module-federation-loader.ts`

2. **Authentication Issues**:
   - Verify the `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are correctly configured
   - Check the session management in `shell-store.ts`

3. **TypeScript Errors**:
   - Run `pnpm run typecheck` to identify type errors
   - Ensure all dependencies are properly typed

4. **Build Failures**:
   - Clear the Turbo cache: `pnpm run clean` (removes `.turbo`).
   - Reinstall dependencies: `pnpm install`

---

## Additional Resources

- [Module Federation Documentation](https://module-federation.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Turborepo Documentation](https://turbo.build/repo)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

---

## Support

For issues and questions, please open a GitHub issue or contact the maintainers.