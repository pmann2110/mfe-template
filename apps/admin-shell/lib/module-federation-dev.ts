/**
 * Dev-only helpers for Module Federation: cache busting, runtime health check, retry/reload.
 * Import and use only when NODE_ENV === 'development' so production bundles stay minimal.
 */

export const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

const DEV_IMPORT_NONCE =
  typeof window !== 'undefined' ? Date.now().toString(36) : '';

export function withDevCacheBust(url: string, nonce?: string): string {
  if (!isDev) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('mf_t', nonce ?? DEV_IMPORT_NONCE);
    return u.toString();
  } catch {
    return url;
  }
}

export function getDevNonce(): string {
  return Date.now().toString(36);
}

/**
 * Start a periodic check of federation runtime globals; re-init if stale (e.g. after dev server restart).
 * Call only in development. Cleans up interval on beforeunload.
 */
export function startDevRuntimeHealthCheck(initFederationRuntime: () => void): void {
  if (!isDev || typeof window === 'undefined') return;
  const checkInterval = setInterval(() => {
    const w = window as unknown as Record<string, unknown>;
    const healthy =
      !!w.__federation_shared__ &&
      (w.__federation_shared__ as Record<string, unknown>)?.default &&
      !!w.__webpack_share_scopes__ &&
      !!w.__FEDERATION__;

    if (!w.__federation_runtime_init__ || !healthy) {
      try {
        delete (w as Record<string, unknown>).__federation_runtime_init__;
        delete (w as Record<string, unknown>).__webpack_share_scopes__;
        delete (w as Record<string, unknown>).__FEDERATION__;
        delete (w as Record<string, unknown>).__federation_shared__;
      } catch {
        // ignore
      }
      initFederationRuntime();
    }
  }, 5000);
  window.addEventListener('beforeunload', () => clearInterval(checkInterval));
}

/** Returns true if caller should return (caller should clear caches and retry instead of reload). */
export function handleDevContainerInstanceChange(
  _remoteName: string,
  cached: unknown,
  container: unknown,
): boolean {
  if (!isDev || cached === container) return false;
  return true;
}

/** Returns true if caller should return (caller should clear caches and retry instead of reload). */
export function handleDevInitFirstError(remoteName: string, getErrMsg: string): boolean {
  if (!isDev || !getErrMsg.includes('Please call init first')) return false;
  return true;
}

const DEV_RETRY_MAX = 5;
const DEV_RETRY_BASE_MS = 2000;
const DEV_RETRY_MAX_MS = 8000;

/**
 * Run an async function with exponential backoff retries (dev-only). In production, runs once.
 */
export async function runWithDevRetry<T>(
  remoteName: string,
  fn: () => Promise<T>,
  onRetry?: (attempt: number, delay: number, err: unknown) => void,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (!isDev) throw err;
    for (let attempt = 0; attempt < DEV_RETRY_MAX; attempt++) {
      const delay = Math.min(
        DEV_RETRY_BASE_MS * Math.pow(2, attempt) + Math.random() * 1000,
        DEV_RETRY_MAX_MS,
      );
      onRetry?.(attempt + 1, delay, err);
      await new Promise((r) => setTimeout(r, delay));
      try {
        return await fn();
      } catch (retryErr) {
        if (attempt === DEV_RETRY_MAX - 1) throw retryErr;
      }
    }
    throw err;
  }
}
