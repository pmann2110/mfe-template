/**
 * Next.js instrumentation hook. Optional: add error reporting (e.g. Sentry) here when needed.
 */

export async function register() {
  // No-op. Add Sentry or other tooling when you need server/edge instrumentation.
}

export async function onRequestError(
  _error: unknown,
  _request: { path: string; method: string; headers: Record<string, string | string[] | undefined> },
  _context: { routerKind: string; routePath: string; routeType: string; renderSource?: string },
): Promise<void> {
  // No-op. Add error reporting when needed.
}
