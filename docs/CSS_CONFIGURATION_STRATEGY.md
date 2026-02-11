# CSS Configuration Strategy

## Overview

This document outlines the CSS configuration strategy used across all apps. The goal is a single source of truth for design tokens and theme, with per-app content paths only.

## Current Setup

### 1. Shared base: `@repo/tailwind-config`

- The monorepo uses a **shared Tailwind base** in [packages/tailwind-config/tailwind.config.base.js](packages/tailwind-config/tailwind.config.base.js).
- It defines: `darkMode: ['class']`, theme extension (colors, radius, keyframes, animations), and the `tailwindcss-animate` plugin.
- All theme values use CSS variables (e.g. `hsl(var(--primary))`) so theming stays consistent.

### 2. Per-app config

- Each app has a small config that **extends the base** and only sets **content** paths:
  - [apps/admin-shell/tailwind.config.mjs](apps/admin-shell/tailwind.config.mjs)
  - [apps/web-shell/tailwind.config.js](apps/web-shell/tailwind.config.js)
  - [apps/identity-remote/tailwind.config.js](apps/identity-remote/tailwind.config.js)
- Apps spread `...baseConfig` and add their own `content` arrays (app source + `../../packages/ui/src/**/*.{ts,tsx}`).

### 3. Design tokens: `packages/ui/src/globals.css`

- [packages/ui/src/globals.css](packages/ui/src/globals.css) defines CSS variables for theming (light/dark):
  - Colors: `--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`
  - Border radius: `--radius`
- The shared base config maps Tailwind theme keys to these variables (e.g. `background: 'hsl(var(--background))'`).

## Summary

| Layer            | Location                    | Role                                      |
|-----------------|-----------------------------|-------------------------------------------|
| Design tokens   | `packages/ui/src/globals.css` | CSS variables (colors, radius)           |
| Shared theme    | `@repo/tailwind-config`     | Dark mode, theme extension, plugins      |
| App config      | Each app's tailwind.config  | Extend base + set `content` paths only   |

## Best practices

1. **Do not duplicate theme in apps.** Change tokens in `globals.css` or the base config; apps only set `content`.
2. **Adding a new app:** Add a new Tailwind config that imports `@repo/tailwind-config`, spreads it, and sets `content` for that app and `packages/ui`.
3. **Testing:** After changing tokens or base config, run the app and optionally check other apps for visual consistency.
