# Identity Remote

Vite-based federated app for **Identity & Access Management**: users, organizations, roles, and permissions. Loaded by the admin shell at `/admin/users`.

## How to manage org, roles, and permissions

### 1. Open the identity area

- In **admin-shell**: click **Users** in the nav (or go to `/admin/users`).
- You’ll see the identity remote with three main sections in the top nav: **Users**, **Roles**, **Organization**.

### 2. **Users**

- **Path:** `/admin/users` (or `/admin/users/`)
- **What:** List, create, edit, delete users. Search, sort, bulk delete.
- **Permissions:** `user:read` to see the list; `user:write` to create/edit/delete.
- **Detail:** Click a user row or link to open `/admin/users/<id>`.

### 3. **Roles**

- **Path:** `/admin/users/roles`
- **What:** List org roles, create/edit roles, assign permissions via the permission matrix.
- **Permissions:** Uses **org-level** permissions from the current tenant: `role:read` to view, `role:write` to create/edit/delete. Requires an org to be selected (see Organization).
- **Flow:** Select an organization (Organization tab or org switcher), then open Roles to manage that org’s roles and their permissions.

### 4. **Organization**

Three sub-views, with links between them:

| Path | What |
|------|------|
| `/admin/users/org` | **Overview** – current org stats (members, roles, recent activity). Links to “All organizations” and “Settings”. |
| `/admin/users/org/list` | **All organizations** – list of orgs you can access, switch current org, placeholder “Create organization”. Links to Overview and Settings. |
| `/admin/users/org/settings` | **Settings** – current org name/slug (read-only for now), placeholder “Invite members”. Links to Overview and All organizations. |

- **Org switcher:** Use **Organization → All organizations** to switch the current org. The current org drives **Roles** (which org’s roles you see) and **Organization** overview/settings.
- **Permissions:** Org views use the same tenant context; permission checks use `currentOrgPermissions` from the shell store (e.g. `org-settings:read` / `org-settings:write` when implemented).

### 5. **Permissions (concepts)**

- **System permissions** (e.g. `user:read`, `admin:access`): from session, checked by the shell for route access. Stored in auth/session.
- **Org permissions** (e.g. `role:read`, `role:write`, `user:read`, `org-settings:read`): from the **current org** and your role in it. Stored in the shell store as `currentOrgPermissions` after you select an org (e.g. via Organization → All organizations or the org switcher).
- **Role management** in identity-remote lets you define which org permissions each org role has (permission matrix). That data is then used (e.g. by a backend) to compute `currentOrgPermissions` when a user switches org.

### 6. **Quick reference URLs (when hosted at admin-shell)**

| Section | URL |
|--------|-----|
| Users list | `/admin/users` |
| User detail | `/admin/users/<userId>` |
| Roles | `/admin/users/roles` |
| Org overview | `/admin/users/org` |
| Org list | `/admin/users/org/list` |
| Org settings | `/admin/users/org/settings` |

### 7. **Standalone mode**

Run the remote alone (no shell):

```bash
pnpm --filter identity-remote local
```

Uses mock auth and the same routes (`/`, `/roles`, `/org`, `/org/list`, `/org/settings`, `/:id`). Use the top nav to switch between Users, Roles, and Organization.
