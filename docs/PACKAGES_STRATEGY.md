# Packages Strategy

This document outlines the strategy for managing shared packages in the project, including versioning, publishing to private repositories, and consuming versioned packages.

## Table of Contents

- [Current Project Structure](#current-project-structure)
- [Publishing Shared Packages](#publishing-shared-packages)
- [Versioning Strategy](#versioning-strategy)
- [Consuming Versioned Packages](#consuming-versioned-packages)
- [Example Workflow](#example-workflow)

## Current Project Structure

The project is structured as a monorepo using pnpm workspaces. Shared packages are located in the `packages` directory and are currently marked as `private: true` in their `package.json` files. These packages are referenced in other parts of the project using the `workspace:*` syntax.

### Shared Packages

1. **`@repo/api-contracts`**: Contains API contracts and types for products and users.
2. **`@repo/auth-core`**: Provides authentication logic and types.
3. **`@repo/ui`**: Contains UI components and styles.

## Publishing Shared Packages

To publish shared packages to a private repository (e.g., GitHub Packages, npm private registry, or an alternative like Verdaccio), follow these steps:

### 1. Update `package.json`

- Remove the `private: true` field from the `package.json` of the packages you want to publish.
- Ensure the `name` field follows the naming convention of your private registry (e.g., `@your-org/package-name`).

### 2. Configure Authentication

- For npm private registry, configure authentication in `.npmrc`:
  ```ini
  //registry.npmjs.org/:_authToken=your-token
  ```

- For GitHub Packages, configure authentication in `.npmrc`:
  ```ini
  @your-org:registry=https://npm.pkg.github.com
  //npm.pkg.github.com/:_authToken=your-github-token
  ```

### 3. Publish the Package

- Run the following command to publish the package:
  ```bash
  npm publish
  ```

- For GitHub Packages, use:
  ```bash
  npm publish --registry=https://npm.pkg.github.com
  ```

## Versioning Strategy

Versioning is critical for managing shared packages. Here’s how it works:

### 1. Semantic Versioning

- Use semantic versioning (`MAJOR.MINOR.PATCH`) to indicate the type of changes:
  - `MAJOR`: Breaking changes.
  - `MINOR`: New features (backward-compatible).
  - `PATCH`: Bug fixes (backward-compatible).

### 2. Updating Version

- Manually update the `version` field in `package.json` or use tools like `npm version`:
  ```bash
  npm version patch
  npm version minor
  npm version major
  ```

### 3. Changelog

- Maintain a changelog to document changes for each version.

## Consuming Versioned Packages

To use versioned packages in your project:

### 1. Update Dependencies

- Replace the `workspace:*` reference in `package.json` with the specific version of the package:
  ```json
  "@your-org/api-contracts": "^1.0.0"
  ```

### 2. Install the Package

- Run `pnpm install` to fetch the versioned package from the private registry.

### 3. Verify Installation

- Ensure the package is correctly installed and resolved in `node_modules`.

## Example Workflow

### 1. Publish a Package

- Update the version in `packages/api-contracts/package.json` to `1.0.0`.
- Run `npm publish` to push it to the private registry.

### 2. Use the Published Package

- In another project or app, update the dependency:
  ```json
  "@your-org/api-contracts": "^1.0.0"
  ```
- Run `pnpm install` to fetch and use the published package.

## Additional Notes

- **Authentication**: Ensure that the token in `.npmrc` has the necessary permissions to read and publish packages.
- **Scope**: Replace `@repo` with your organization's scope (e.g., `@your-org`) when publishing to a private repository.
- **Registry Configuration**: Ensure that the `.npmrc` file is correctly configured to point to the private repository's registry endpoint.

By following these steps, you can effectively manage versioning and distribution of shared packages in a private repository.