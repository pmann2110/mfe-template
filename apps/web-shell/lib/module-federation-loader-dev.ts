/**
 * Dev-only helpers for the Module Federation loader: cache-busting and runtime health check.
 * Imported and used only when NODE_ENV === 'development' so production bundles stay minimal.
 */

function isDev(): boolean {
  return process.env.NODE_ENV === 'development';
}

/** Cache-bust token for the lifetime of this page load in development. */
export function getDevImportNonce(): string {
  return typeof window !== 'undefined' ? Date.now().toString(36) : '';
}

/** Append cache-bust query param in development; no-op in production. */
export function withDevCacheBust(url: string, nonce?: string): string {
  if (!isDev()) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('mf_t', nonce ?? getDevImportNonce());
    return u.toString();
  } catch {
    return url;
  }
}

/** Start interval that checks federation runtime health and re-inits if stale (e.g. after dev server restart). */
export function startDevRuntimeHealthCheck(reinit: () => void): void {
  if (!isDev() || typeof window === 'undefined') return;

  const checkInterval = setInterval(() => {
    const w = window as unknown as Record<string, unknown>;
    const shared = w.__federation_shared__ as Record<string, unknown> | undefined;
    const shareScopes = w.__webpack_share_scopes__ as Record<string, unknown> | undefined;
    const fed = w.__FEDERATION__ as Record<string, unknown> | undefined;
    const healthy =
      !!shared?.default &&
      !!shareScopes?.default &&
      !!fed?.shared;

    if (!w.__federation_runtime_init__ || !healthy) {
      console.warn('[MF] Federation runtime became unhealthy, re-initializing...');
      try {
        delete w.__federation_runtime_init__;
        delete w.__webpack_share_scopes__;
        delete w.__FEDERATION__;
        delete w.__federation_shared__;
      } catch {
        // ignore
      }
      reinit();
    }
  }, 5000);
  window.addEventListener('beforeunload', () => clearInterval(checkInterval));
}
