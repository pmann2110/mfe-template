# UI Component Library

The shared UI lives in **`@repo/ui`** and includes design tokens, primitives, and composite components.

## Design System

- **Tokens**: Defined in `packages/ui/src/globals.css` (colors, radius, shadows, duration, ease).
- **Dark mode**: `.dark` class with refined contrast; optional smooth theme transition. Use **ThemeToggle** (light/dark/system) and **ThemeScript** (inline script to prevent flash) from `@repo/ui`.
- **Animations**: `animations`, `durations`, `animationClass()` from `@repo/ui` (e.g. `fadeIn`, `slideInFromTop`).

## Components

### Layout & structure

- **Card**, **Separator**, **Tabs** (TabsList, TabsTrigger, TabsContent), **Breadcrumb**.
- **Sheet** (slide-out panel): `Sheet`, `SheetContent` (side: top | right | bottom | left), `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`. Use for mobile nav drawers.
- **AppSidebar**: `logo?`, `children` (nav content). Use inside a fixed container or inside Sheet for mobile.
- **AppHeader**: `left?`, `right?` slots; or pass `children` for custom layout. Min height and focus styles for a11y.
- **AppFooter**: `brand?`, `columns?`, `copyright?`. Link columns with optional placeholder styling for `href="#"`.

### Theme

- **ThemeToggle**: Dropdown (light / dark / system), persists to `localStorage`, sets `class="dark"` on `document.documentElement`. Use in shell headers. Min tap target 44px, `aria-label="Toggle theme"`.
- **ThemeScript**: Inline script component; add to root layout body to apply stored/system theme before paint and avoid flash.

### Forms

- **Button** (variants, sizes, `loading` state), **Input**, **Label**, **Textarea**, **Select**, **Switch**, **Checkbox**, **RadioGroup**.

### Data display

- **Table** (base), **DataTable** (sortable columns, pagination, keyExtractor, empty message).
- **Badge**: variants include `default`, `secondary`, `destructive`, `outline`, **`admin`**, **`member`** (semantic role colors).
- **Skeleton**, **Progress**, **Spinner**, **EmptyState**.

### Feedback & overlay

- **Dialog**, **DropdownMenu**, **Alert**, **Toast**.
- **ErrorBoundary**, **ErrorState** (with optional retry).
- **NotFoundView**: 404 layout (icon, title, description, optional CTA via `actionHref`, `onAction`, or `actionAsChild`).
- **AccessDeniedView**: Card layout (icon, title, description, optional body, CTA via `actionHref`, `onAction`, or `actionAsChild`).

## DataTable

Use for sortable, paginated tables:

- `columns`: `DataTableColumn<T>[]` (id, header, accessor, sortable?, className?).
- `data`, `keyExtractor`, `pageSize`, `sortColumn`, `sortDirection`, `onSort`, `emptyMessage`.

Accessor can be a key of `T` or a function `(row: T) => ReactNode` for custom cells.

## Theming

- Use CSS variables (e.g. `var(--primary)`, `var(--muted-foreground)`).
- Prefer semantic tokens (e.g. `background`, `foreground`, `destructive`) over raw colors.

## Auth (shared)

- **LoginForm** (from **`@repo/auth-next`**): Shared credential login card. Props: `title`, `description`, `redirectPath`, `mockHint?`, `emailPlaceholder?`. Use in admin-shell and web-shell with different copy and redirect paths.
