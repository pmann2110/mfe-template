# CSS Configuration Strategy

## Overview
This document outlines the CSS configuration strategy used across all apps in the project. The goal is to maintain consistency and ensure a unified approach to styling.

## Current Setup

### 1. **CSS Variables (`globals.css`)**
- The `globals.css` file in `packages/ui/src/globals.css` defines CSS variables for theming, including colors and border radius, for both light and dark modes.
- These variables are referenced in the `tailwind.config.js` files of each app to ensure a consistent design system.

### 2. **Tailwind Configuration (`tailwind.config.js`)**
- Each app (`admin-shell`, `products-remote`, `users-remote`, `web-shell`) has its own `tailwind.config.js` file.
- These files are now identical in structure and content, ensuring consistency across all apps.
- The configuration extends Tailwind's theme to use the CSS variables defined in `globals.css`.

### 3. **Hybrid Approach**
- All apps use a hybrid approach where `globals.css` provides the design tokens (CSS variables), and `tailwind.config.js` extends Tailwind's theme to use these tokens.
- This approach allows for a consistent design system while leveraging the power of Tailwind CSS for utility classes.

## Key Features

### CSS Variables
The `globals.css` file defines the following CSS variables:

- **Colors:**
  - `--background`, `--foreground`
  - `--card`, `--card-foreground`
  - `--popover`, `--popover-foreground`
  - `--primary`, `--primary-foreground`
  - `--secondary`, `--secondary-foreground`
  - `--muted`, `--muted-foreground`
  - `--accent`, `--accent-foreground`
  - `--destructive`, `--destructive-foreground`
  - `--border`, `--input`, `--ring`

- **Border Radius:**
  - `--radius`

### Tailwind Configuration
The `tailwind.config.js` files include:

- **Dark Mode:** Enabled via the `class` strategy.
- **Content Paths:** Includes paths to the app's source files and the shared UI package.
- **Theme Extension:** Extends Tailwind's theme to use the CSS variables defined in `globals.css`.
- **Plugins:** Uses the `tailwindcss-animate` plugin for animations.

## Best Practices

1. **Consistency:** Ensure all `tailwind.config.js` files remain identical in structure and content.
2. **Documentation:** Keep this document updated with any changes to the CSS configuration strategy.
3. **Testing:** Test changes to the CSS configuration in all apps to ensure consistency.

## Future Considerations

- **Shared Configuration:** Consider extracting the `tailwind.config.js` file into a shared package to avoid duplication.
- **Automation:** Automate the synchronization of `tailwind.config.js` files across apps to prevent drift.

## Conclusion
The current CSS configuration strategy ensures consistency across all apps by using a hybrid approach of CSS variables and Tailwind CSS. This strategy leverages the strengths of both approaches to provide a robust and maintainable design system.