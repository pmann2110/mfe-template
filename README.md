# Microfrontends Module Federation
## Overview
This project is a **Vercel Microfrontends Module Federation** example. It demonstrates how to build a modular, scalable frontend architecture using **Module Federation** with **Next.js** and **Vite**. The project is structured as a monorepo managed by **Turborepo** and **pnpm**, enabling efficient development and deployment of multiple interconnected applications.

---

## Project Structure

### Monorepo Architecture
The project is organized into two main directories:

1. **`apps/`**: Contains the main applications:
   - `admin-shell`: Next.js application serving as the admin dashboard shell.
   - `web-shell`: Next.js application serving as the web shell.
   - `products-remote`: Vite-based remote application for managing products.
   - `users-remote`: Vite-based remote application for managing users.

2. **`packages/`**: Contains shared libraries and utilities:
   - `api-contracts`: Defines API interfaces and data models.
   - `auth-core`: Core authentication logic and session management.
   - `auth-next`: Next.js-specific authentication utilities.
   - `rbac`: Role-Based Access Control (RBAC) utilities.
   - `stores`: Global state management for the shell.
   - `ts-config`: Shared TypeScript configurations.
   - `ui`: Shared UI components and styles.

### Key Components

#### 1. **Module Federation Setup**
- **`apps/products-remote/vite.config.ts`** and **`apps/users-remote/vite.config.ts`**: Configure Module Federation for the remote applications. Each remote exposes its `App.tsx` component and shares React and ReactDOM as singletons.
- **`apps/admin-shell/lib/module-federation-loader.ts`**: Implements a runtime loader for dynamically loading remote modules. It handles initialization, caching, and error recovery for remote modules.
- **`apps/admin-shell/components/remotes/ModuleFederationRemote.tsx`**: A React component that loads and renders remote modules dynamically.

#### 2. **Authentication and Authorization**
- **`packages/auth-core`**: Provides core authentication logic, including a mock authentication client and session management.
- **`packages/auth-next`**: Extends authentication for Next.js applications.
- **`packages/rbac`**: Implements Role-Based Access Control (RBAC) utilities for permission checking.

#### 3. **State Management**
- **`packages/stores`**: Implements a global shell store using Zustand for managing authentication, tenant, and UI state.
- **`packages/auth-core/src/shell-store.ts`**: Provides a shell-specific store for managing authentication state and permissions.

#### 4. **API Contracts**
- **`packages/api-contracts`**: Defines interfaces for products and users, including CRUD operations and data models.

#### 5. **UI Components**
- **`packages/ui`**: Contains shared UI components built with Tailwind CSS and Radix UI primitives.

---

## Tech Stack

### Core Technologies
- **Framework**: Next.js (for shells), Vite (for remotes)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Authentication**: NextAuth.js
- **Module Federation**: `@module-federation/vite`
- **Build Tool**: Turborepo
- **Package Manager**: pnpm

### Dependencies
- **React**: ^19.1.0
- **ReactDOM**: ^19.1.0
- **Next.js**: ^15.1.6
- **Vite**: ^6.4.1
- **Zustand**: ^5.0.2
- **Tailwind CSS**: ^4.1.18
- **NextAuth.js**: ^5.0.0-beta.25

### Dev Dependencies
- **Turborepo**: 2.5.2-canary.0
- **TypeScript**: 5.7.3
- **ESLint**: Custom configuration
- **Prettier**: ^3.4.2

---

## Infrastructure and Build Setup

### Build and Development
- **Turborepo**: Manages the monorepo build pipeline, enabling efficient caching and parallel execution of tasks.
- **pnpm**: Handles dependency management and workspace organization.
- **Vite**: Used for building remote applications with Module Federation support.
- **Next.js**: Used for building shell applications with server-side rendering and static site generation capabilities.

### Module Federation Configuration
- **Remote Applications**: Configured to expose their `App.tsx` component and share React and ReactDOM as singletons.
- **Shell Applications**: Dynamically load remote modules at runtime using the `ModuleFederationRemote` component.

### Environment Configuration
- **Development**: Remote modules are loaded from localhost ports (e.g., `http://localhost:6517` for users-remote).
- **Production**: Remote modules are loaded from production URLs (e.g., `https://users-remote.example.com`).

---

## Features

### 1. **Dynamic Module Loading**
- The `ModuleFederationRemote` component dynamically loads remote modules at runtime, enabling seamless integration of remote applications into the shell.
- Supports fallback UI and error handling for failed remote loads.

### 2. **Authentication and Authorization**
- **Mock Authentication**: Provides a mock authentication client for development and testing.
- **Session Management**: Manages user sessions and authentication state across the application.
- **RBAC**: Implements role-based access control for managing user permissions.

### 3. **State Management**
- **Global Shell Store**: Manages authentication, tenant, and UI state using Zustand.
- **Singleton Store**: Ensures a single source of truth for the shell state across the application.

### 4. **API Contracts**
- **Products API**: Defines interfaces for managing products, including CRUD operations.
- **Users API**: Defines interfaces for managing users, including CRUD operations.

### 5. **UI Components**
- **Shared UI Library**: Provides reusable UI components built with Tailwind CSS and Radix UI primitives.

---

## Conclusion

This project demonstrates a robust implementation of **Microfrontends using Module Federation** with **Next.js** and **Vite**. It provides a solid foundation for building scalable, modular frontend applications. However, there are several areas for improvement, including error handling, performance optimization, authentication, state management, and testing. Addressing these areas will enhance the project's robustness, scalability, and maintainability.
