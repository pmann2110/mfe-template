# UI Component Library

The shared UI lives in **`@repo/ui`** and includes design tokens, primitives, and composite components.

## Design System

- **Tokens**: Defined in `packages/ui/src/globals.css` (colors, radius, shadows, duration, ease).
- **Dark mode**: `.dark` class with refined contrast; optional smooth theme transition.
- **Animations**: `animations`, `durations`, `animationClass()` from `@repo/ui` (e.g. `fadeIn`, `slideInFromTop`).

## Components

### Layout & structure

- **Card**, **Separator**, **Tabs** (TabsList, TabsTrigger, TabsContent), **Breadcrumb**, **Sheet** (slide-out panel).

### Forms

- **Button** (variants, sizes, `loading` state), **Input**, **Label**, **Textarea**, **Select**, **Switch**, **Checkbox**, **RadioGroup**.

### Data display

- **Table** (base), **DataTable** (sortable columns, pagination, keyExtractor, empty message).
- **Badge**, **Skeleton**, **Progress**, **Spinner**, **EmptyState**.

### Feedback & overlay

- **Dialog**, **DropdownMenu**, **Alert**, **Toast**.
- **ErrorBoundary**, **ErrorState** (with optional retry).

## DataTable

Use for sortable, paginated tables:

- `columns`: `DataTableColumn<T>[]` (id, header, accessor, sortable?, className?).
- `data`, `keyExtractor`, `pageSize`, `sortColumn`, `sortDirection`, `onSort`, `emptyMessage`.

Accessor can be a key of `T` or a function `(row: T) => ReactNode` for custom cells.

## Theming

- Use CSS variables (e.g. `var(--primary)`, `var(--muted-foreground)`).
- Prefer semantic tokens (e.g. `background`, `foreground`, `destructive`) over raw colors.
