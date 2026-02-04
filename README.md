# Microfrontends Module Federation
## Overview
This project is a **Vercel Microfrontends Module Federation** example. It demonstrates how to build a modular, scalable frontend architecture using **Module Federation** with **Next.js** and **Vite**. The project is structured as a monorepo managed by **Turborepo** and **pnpm**, enabling efficient development and deployment of multiple interconnected applications.

---

## Project Structure

### Monorepo Architecture
The project is organized into two main directories:

1. **`apps/`**: Contains the main applications:
   - `admin-shell`: Next.js 15 application serving as the admin dashboard shell (Port: 3001).
   - `web-shell`: Next.js 15 application serving as the public web shell (Port: 3000).
   - `users-remote`: Vite 6-based remote application for managing users (Port: 6517).

2. **`packages/`**: Contains shared libraries and utilities:
   - `api-contracts`: Defines API interfaces, routing types, and data models.
   - `auth-core`: Core authentication logic, session management, and types.
   - `auth-next`: Next.js-specific authentication utilities (NextAuth.js v5).
   - `rbac`: Role-Based Access Control (RBAC) utilities and permission checking.
   - `remote-utils`: Utilities for remote applications (RouterSync, StandaloneAuthProvider).
   - `stores`: Global state management using Zustand (singleton pattern).
   - `ts-config`: Shared TypeScript configurations.
   - `ui`: Shared UI components and styles (Tailwind CSS v4, Radix UI).
   - `eslint-config-custom`: Shared ESLint configuration.

### Key Components

#### 1. **Module Federation Setup**
- **`apps/users-remote/vite.config.ts`**: Configures Module Federation for the users remote application. Exposes `App.tsx` component and shares React 19, ReactDOM, `@repo/ui`, and `@repo/stores` as singletons. Supports standalone mode via `STANDALONE_MODE=true`.
- **`apps/admin-shell/lib/module-federation-loader.ts`**: Implements a runtime loader for dynamically loading remote modules at runtime (Turbopack compatible). Handles initialization, caching, error recovery with exponential backoff, and dev HMR health checks.
- **`apps/admin-shell/components/remotes/ModuleFederationRemote.tsx`**: A React component that loads and renders remote modules dynamically.
- **`apps/admin-shell/public/config/remote-configs.json`**: Environment-specific remote configuration (development, staging, production).

#### 2. **Authentication and Authorization**
- **`packages/auth-core`**: Provides core authentication logic, session types, and shell store integration.
- **`packages/auth-next`**: NextAuth.js v5 configuration with JWT strategy, credentials provider, and callbacks (jwt, session).
- **`packages/rbac`**: Implements Role-Based Access Control (RBAC) utilities with extensible permission model. Currently enforces `admin:access` and `user:read` permissions.
- **`apps/admin-shell/middleware.ts`**: Route-based permission checking middleware for protected admin routes.

#### 3. **State Management**
- **`packages/stores`**: Implements a global shell store using Zustand (vanilla store) with singleton pattern. Manages authentication, tenant, UI notifications, and remote loading status.
- **Singleton Pattern**: Store attached to `globalThis.__SHELL_STORE__` and `window.__SHELL_STORE__` for cross-module sharing.

**Which store to use:** Use **`@repo/stores`** (initShellStore / getShellStore) when the shell or remotes need shared state (session, notifications, remote loading). Use **`@repo/auth-core`**’s `createShellStore` only for non–Next.js shells or standalone remotes that need their own auth client (login/logout/can). The admin-shell uses NextAuth + `@repo/stores`; do not use `createShellStore` in Next.js shells that use auth-next. See [State and Auth](docs/STATE_AND_AUTH.md) for details.

#### 4. **API Contracts**
- **`packages/api-contracts`**: Defines interfaces for users API, routing types (`RoutingProps`), and data models.

**Auth vs domain entities:** `@repo/auth-core` defines `AuthUser` and `Session` for the authenticated identity (roles, permissions). Use these for session and RBAC. `@repo/api-contracts` defines `User` types for domain entities (e.g. user list/detail, API payloads). Use auth types for “who is logged in”; use api-contracts types for “data about users.”

#### 5. **UI Components**
- **`packages/ui`**: Contains shared UI components built with Tailwind CSS v4 and Radix UI primitives. CSS variables defined in `globals.css` for consistent theming.

#### 6. **Remote Utilities**
- **`packages/remote-utils`**: Provides utilities for remote applications including `RouterSync` for navigation synchronization and `StandaloneAuthProvider` for standalone mode development.

---

## Tech Stack

### Core Technologies
- **Framework**: Next.js 15 (for shells), Vite 6 (for remotes)
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS 4.1
- **State Management**: Zustand 5
- **Authentication**: NextAuth.js v5 (JWT strategy)
- **Module Federation**: `@module-federation/vite` 1.2
- **Build Tool**: Turborepo 2.5
- **Package Manager**: pnpm 9.4
- **Runtime**: Node.js 20.x

### Dependencies
- **React**: ^19.1.0
- **ReactDOM**: ^19.1.0
- **Next.js**: ^15.1.6
- **Vite**: ^6.4.1
- **Zustand**: ^5.0.2
- **Tailwind CSS**: ^4.1.18
- **NextAuth.js**: ^5.0.0-beta.25
- **@module-federation/vite**: ^1.2.7

### Dev Dependencies
- **Turborepo**: 2.5.2-canary.0
- **TypeScript**: 5.7.3
- **ESLint**: Custom configuration (`@repo/eslint-config-custom`)
- **Prettier**: ^3.4.2

---

## Infrastructure and Build Setup

### Build and Development
- **Turborepo**: Manages the monorepo build pipeline, enabling efficient caching and parallel execution of tasks.
- **pnpm**: Handles dependency management and workspace organization.
- **Vite**: Used for building remote applications with Module Federation support.
- **Next.js**: Used for building shell applications with server-side rendering and static site generation capabilities.

### Module Federation Configuration
- **Remote Applications**: Configured to expose `App.tsx` component and share React 19, ReactDOM, `@repo/ui`, and `@repo/stores` as singletons with version requirements.
- **Shell Applications**: Dynamically load remote modules at runtime using the `ModuleFederationRemote` component. No webpack plugin required (Turbopack compatible).
- **Runtime Loading**: Uses `module-federation-loader.ts` to dynamically import `remoteEntry.js` files with cache-busting in development.
- **Configuration**: Remote URLs loaded from `/config/remote-configs.json` with environment-specific configurations.

### Environment Configuration
- **Development**: 
  - Admin Shell: `http://localhost:3001`
  - Web Shell: `http://localhost:3000`
  - Users Remote: `http://localhost:6517/remoteEntry.js`
- **Production**: Remote modules loaded from production URLs configured in `remote-configs.json` with optional CSS URLs. In production, `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are required (app fails to start if missing). Set `NEXT_PUBLIC_ALLOWED_REMOTE_ORIGINS` (comma-separated origins, e.g. `https://users.example.com`) so the admin shell only loads remotes from allowed origins.
- **Standalone Mode**: Users remote supports `STANDALONE_MODE=true` for independent development without federation.

---

## Features

### 1. **Dynamic Module Loading**
- The `ModuleFederationRemote` component dynamically loads remote modules at runtime, enabling seamless integration of remote applications into the shell.
- Supports fallback UI and comprehensive error handling with exponential backoff retry logic (5 retries, max 8s delay).
- Dev mode cache-busting and HMR runtime health checks for reliable development experience.
- Production CSS loading support for optimized remote module styling.

### 2. **Authentication and Authorization**
- **NextAuth.js v5**: JWT-based session management with 30-day sessions and 24-hour update age.
- **Mock Authentication**: Development credentials provider with role-based user generation (admin, manager, viewer).
- **RBAC**: Extensible role-based access control with permission checking. Currently enforces `admin:access` and `user:read`.
- **Route Protection**: Middleware-based route protection with automatic redirects to login/unauthorized pages.

### 3. **State Management**
- **Global Shell Store**: Manages authentication, tenant, UI notifications, and remote loading status using Zustand.
- **Singleton Pattern**: Store attached to global scope (`__SHELL_STORE__`) ensuring single source of truth across shell and remote modules.
- **Real-time Synchronization**: State changes in shell or remotes are immediately reflected across all modules.

### 4. **API Contracts**
- **Users API**: Defines interfaces for managing users with routing integration.
- **Routing Types**: `RoutingProps` interface for consistent navigation between shell and remotes.

### 5. **UI Components**
- **Shared UI Library**: Reusable UI components built with Tailwind CSS v4 and Radix UI primitives.
- **CSS Variables**: Centralized design tokens in `@repo/ui/globals.css` for consistent theming across all apps.
- **Dark Mode**: Built-in dark mode support via CSS variables.

### 6. **Remote Development**
- **Standalone Mode**: Remotes can run independently with `STANDALONE_MODE=true` for isolated development.
- **RouterSync**: Automatic navigation synchronization between shell and remote applications.
- **StandaloneAuthProvider**: Mock authentication provider for standalone remote development.

---

## Getting Started

### Prerequisites
- Node.js 20.x
- pnpm 9.4.0

### Installation
```bash
# Install dependencies
pnpm install

# Start all applications in development mode
pnpm run dev
```

This will start:
- Admin Shell: `http://localhost:3001`
- Web Shell: `http://localhost:3000`
- Users Remote: `http://localhost:6517`

### Documentation
- **[Setup Guide](docs/SETUP_GUIDE.md)**: Detailed setup and installation instructions
- **[Development Workflow](docs/DEVELOPMENT_WORKFLOW.md)**: Development practices and guidelines
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)**: Deployment strategies and configurations
- **[Packages Strategy](docs/PACKAGES_STRATEGY.md)**: Shared package management and versioning
- **[CSS Configuration](docs/CSS_CONFIGURATION_STRATEGY.md)**: CSS and Tailwind setup
- **[State and Auth](docs/STATE_AND_AUTH.md)**: When to use `@repo/stores` vs `auth-core`’s `createShellStore`
- **[Runbook](docs/RUNBOOK.md)**: Common incidents (remote fails to load, auth redirect loops) and fixes
- **[Architecture Diagrams](docs/MFE.drawio.xml)**: Visual architecture documentation

## Conclusion

This project demonstrates a robust implementation of **Microfrontends using Module Federation** with **Next.js 15** and **Vite 6**. It provides a solid foundation for building scalable, modular frontend applications with:

- ✅ Runtime Module Federation (Turbopack compatible)
- ✅ Comprehensive error handling and retry logic
- ✅ NextAuth.js v5 authentication with RBAC
- ✅ Singleton state management across modules
- ✅ Standalone mode support for remote development
- ✅ Production-ready CSS loading and optimization
- ✅ Type-safe API contracts and routing integration

The architecture is designed to be extensible, allowing easy addition of new remote applications and shared packages while maintaining consistency and type safety across the monorepo.
