# Runbook – Common Incidents and Fixes

This document describes how to diagnose and fix common production and development issues.

---

## Remote fails to load (admin-shell)

**Symptoms:** Admin shell shows "Failed to load users remote" (or similar), "Cannot connect to remote server", or a Retry button where the remote content should be.

**Checks:**

1. **Remote URL and config**
   - Confirm `apps/admin-shell/public/config/remote-configs.json` has the correct URL for the environment (development/staging/production).
   - In production, the remote entry URL must be reachable from the browser (same origin or CORS allowed).

2. **Remote server is up**
   - Ensure the remote app (e.g. users-remote) is built and deployed and its URL returns 200 for `remoteEntry.js`.
   - Use the shell’s **Retry** button after the remote is back; no full page reload required.

3. **CORS and allowed origins**
   - In production, set `NEXT_PUBLIC_ALLOWED_REMOTE_ORIGINS` on the admin shell to a comma-separated list of remote origins (e.g. `https://users.example.com`). The loader skips remotes whose origin is not in this list.
   - Ensure the remote serves `remoteEntry.js` (and assets) with CORS headers that allow the admin shell origin.

4. **Browser console**
   - Look for `[MF]` logs: "origin not in NEXT_PUBLIC_ALLOWED_REMOTE_ORIGINS", "Failed to fetch", or "Please call init first". The latter can occur in dev after a remote dev server restart; a full page reload usually fixes it.

**Development:** If the remote runs locally (e.g. `pnpm run dev` in users-remote), ensure it is on the port in `remote-configs.json` (e.g. 6517). Only localhost/127.0.0.1 are allowed in dev.

---

## Auth redirect loops

**Symptoms:** User is sent to `/login` repeatedly, or bounces between login and a protected route (e.g. `/admin`).

**Checks:**

1. **NEXTAUTH_URL**
   - Must match the URL users see in the browser (scheme, host, port). A mismatch (e.g. `http` vs `https`, or wrong port) can break cookies and cause redirect loops.
   - In production, set `NEXTAUTH_URL` to the canonical app URL (e.g. `https://admin.example.com`).

2. **NEXTAUTH_SECRET**
   - Must be set in production (app throws at startup if missing). Use a stable secret; changing it invalidates existing sessions.

3. **Cookies and domain**
   - Ensure the app is served over HTTPS in production if using secure cookies. NextAuth uses `useSecureCookies` in production.
   - If the shell is behind a proxy, ensure it forwards the correct `Host` and that cookies are not stripped.

4. **Middleware and session**
   - Admin shell middleware (`apps/admin-shell/middleware.ts`) redirects unauthenticated users to `/login` for `/admin/*`. If the session is not available (e.g. cookie not sent or invalid), every request to `/admin` will redirect to login.
   - Verify the session in the browser (e.g. check that the session cookie is present and that `/api/auth/session` returns a valid session when called from the same origin).

5. **Permission / unauthorized**
   - If the user is authenticated but lacks permission for a route, they are redirected to `/admin/unauthorized`, not to login. A loop between login and `/admin` is typically missing or invalid session, not RBAC.

**Development:** Use the same `NEXTAUTH_URL` as the dev server (e.g. `http://localhost:3001` for admin-shell). Avoid mixing ports (e.g. opening `http://127.0.0.1:3001` when `NEXTAUTH_URL` is `http://localhost:3001`) to prevent cookie issues.

---

## Health checks

- **Admin shell:** `GET /api/health` returns `{ status: 'ok', service: 'admin-shell', timestamp }`.
- **Web shell:** `GET /api/health` returns `{ status: 'ok', service: 'web-shell', timestamp }`.

Use these endpoints for load balancer health checks or readiness probes.
