/**
 * Runtime Module Federation Loader for Turbopack compatibility
 *
 * This loader dynamically loads remote modules at runtime without requiring
 * webpack's ModuleFederationPlugin, making it compatible with Turbopack.
 */

interface RemoteConfig {
  url: string;
  scope: string;
  module: string;
}

interface RemoteConfigExtended extends RemoteConfig {
  cssUrl?: string;
}

const remoteConfigs: Record<string, RemoteConfigExtended> = {
  users: {
    url: process.env.NODE_ENV === 'production'
      ? 'https://users-remote.example.com/_users/remoteEntry.js'
      : 'http://localhost:6517/_users/remoteEntry.js',
    // In dev mode, Vite injects CSS via JS modules, so we don't need a separate CSS URL
    cssUrl: process.env.NODE_ENV === 'production'
      ? 'https://users-remote.example.com/_users/assets/style.css'
      : undefined,
    scope: 'users',
    module: './app',
  },
  products: {
    url: process.env.NODE_ENV === 'production'
      ? 'https://products-remote.example.com/_products/remoteEntry.js'
      : 'http://localhost:3529/_products/remoteEntry.js',
    // In dev mode, Vite injects CSS via JS modules, so we don't need a separate CSS URL
    cssUrl: process.env.NODE_ENV === 'production'
      ? 'https://products-remote.example.com/_products/assets/style.css'
      : undefined,
    scope: 'products',
    module: './app',
  },
};

// Cache for loaded remotes
const remoteCache = new Map<string, any>();
// Track loading to prevent duplicates
const loading = new Map<string, Promise<void>>();
// Track loaded CSS to prevent duplicates
const loadedCss = new Set<string>();

function loadRemoteCSS(cssUrl: string, remoteName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (loadedCss.has(cssUrl)) {
      resolve();
      return;
    }

    // Check if link already exists in DOM
    const existing = document.querySelector(`link[data-remote-css="${remoteName}"]`);
    if (existing) {
      loadedCss.add(cssUrl);
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssUrl;
    link.setAttribute('data-remote-css', remoteName);

    link.onload = () => {
      loadedCss.add(cssUrl);
      resolve();
    };

    link.onerror = () => {
      console.warn(`Failed to load CSS for remote ${remoteName} from ${cssUrl}`);
      // Resolve anyway to not block remote loading
      resolve();
    };

    document.head.appendChild(link);
  });
}

type RemoteContainer = {
  init?: (shareScope: any, initScope?: any) => void | Promise<void>;
  get?: (module: string) => Promise<() => any> | (() => any);
};

// Cache for shared modules
let cachedReactNs: any | null = null;
let cachedReactDomNs: any | null = null;

// Keep a stable cache-bust token for the lifetime of this page load in development.
// This helps avoid odd first-navigation caching / partial-module evaluation issues in dev,
// while still allowing the browser to cache within the same page session.
const DEV_IMPORT_NONCE =
  typeof window !== 'undefined' ? Date.now().toString(36) : '';

function withDevCacheBust(url: string, nonce?: string): string {
  if (process.env.NODE_ENV === 'production') return url;
  try {
    const u = new URL(url);
    u.searchParams.set('mf_t', nonce ?? DEV_IMPORT_NONCE);
    return u.toString();
  } catch {
    return url;
  }
}

// Initialize the federation runtime share scope
function initFederationRuntime(): void {
  if (typeof window === 'undefined') return;

  const w = window as any;

  // Check if already initialized to prevent re-initialization
  if (w.__federation_runtime_init__) return;

  // Initialize federation shared scope with pre-loaded modules
  ensureFederationShareScope();

  // Initialize webpack share scopes (fallback for webpack-based remotes)
  if (!w.__webpack_share_scopes__) {
    w.__webpack_share_scopes__ = {};
  }
  if (!w.__webpack_share_scopes__.default) {
    w.__webpack_share_scopes__.default = w.__federation_shared__.default;
  }

  // Mark as initialized
  w.__federation_runtime_init__ = true;

  console.log('[MF] Federation runtime initialized', {
    sharedScope: Object.keys(w.__federation_shared__.default),
    react: !!w.__federation_shared__.default.react,
    reactDom: !!w.__federation_shared__.default['react-dom'],
  });
}

// Initialize federation runtime immediately when this module is imported (client-side only)
if (typeof window !== 'undefined') {
  initFederationRuntime();
}

export { initFederationRuntime };

function ensureFederationShareScope() {
  const w = window as any;

  // Initialize federation shared scope
  w.__federation_shared__ = w.__federation_shared__ || {};
  w.__federation_shared__.default = w.__federation_shared__.default || {};

  // Initialize webpack share scopes for compatibility
  w.__webpack_share_scopes__ = w.__webpack_share_scopes__ || {};
  w.__webpack_share_scopes__.default = w.__webpack_share_scopes__.default || w.__federation_shared__.default;

  // Set up React sharing
  if (!w.__federation_shared__.default.react) {
    w.__federation_shared__.default.react = {
      '19.1.0': {
        get: async () => {
          if (!cachedReactNs) {
            cachedReactNs = await import('react');
          }
          return () => cachedReactNs;
        },
        loaded: false,
        shareScope: 'default',
      },
    };
  }

  // Set up ReactDOM sharing
  if (!w.__federation_shared__.default['react-dom']) {
    w.__federation_shared__.default['react-dom'] = {
      '19.1.0': {
        get: async () => {
          if (!cachedReactDomNs) {
            cachedReactDomNs = await import('react-dom');
          }
          return () => cachedReactDomNs;
        },
        loaded: false,
        shareScope: 'default',
      },
    };
  }

  return w.__federation_shared__.default;
}

async function ensureRemoteContainerInitialized(
  remoteName: string,
  container: RemoteContainer,
): Promise<void> {
  if (!container?.init) {
    throw new Error(`Remote ${remoteName} did not expose init()`);
  }

  // Ensure our (host) share scope exists before remote init runs.
  initFederationRuntime();
  const shareScope = ensureFederationShareScope();

  // Important: In Vite dev (HMR / optimized deps reload), the remote's federation
  // runtime module may be re-evaluated (new ?v= hash), resetting its internal
  // singleton instance. Calling container.init again is safe/idempotent and
  // guarantees loadShare() won't throw "Please call init first".
  await container.init(shareScope, []);
}

async function dynamicImportByUrl(url: string) {
  // Avoid bundler static analysis (Turbopack/webpack) by constructing import at runtime
  // eslint-disable-next-line no-new-func
  const importer = new Function('u', 'return import(u)') as (u: string) => Promise<any>;
  return importer(url);
}

async function awaitViteTla(maybeModule: any): Promise<void> {
  // Vite uses a `__tla` promise to represent completion of top-level await evaluation.
  // If present, awaiting it makes module initialization ordering deterministic.
  if (maybeModule && maybeModule.__tla) {
    await Promise.resolve(maybeModule.__tla);
  }
}

function formatImportErr(importErr: unknown): string {
  if (!importErr) return '';
  if (importErr instanceof Error) return ` Import error: ${importErr.message}`;
  return ` Import error: ${String(importErr)}`;
}

async function importRemoteContainer(
  url: string,
  importNonce?: string,
): Promise<{ container?: RemoteContainer; importErr?: unknown }> {
  try {
    const mod = await dynamicImportByUrl(withDevCacheBust(url, importNonce));
    await awaitViteTla(mod);

    const maybe = (mod?.default ?? mod) as RemoteContainer;
    await awaitViteTla(maybe);

    if (maybe?.get && maybe?.init) {
      return { container: maybe };
    }
    return { importErr: new Error('Remote entry did not expose init/get') };
  } catch (importErr) {
    return { importErr };
  }
}

/**
 * Initialize a remote module using Module Federation runtime
 */
async function initRemote(remoteName: string, importNonce?: string): Promise<void> {
  const config = remoteConfigs[remoteName];
  if (!config) {
    throw new Error(`Unknown remote: ${remoteName}`);
  }

  // Initialize federation runtime before loading remotes
  initFederationRuntime();

  // If we already have a cached container, re-run init defensively (dev/HMR safe).
  const cached = remoteCache.get(remoteName) as RemoteContainer | undefined;
  if (cached?.init && cached?.get) {
    await ensureRemoteContainerInitialized(remoteName, cached);
    return;
  }

  // Load CSS for the remote if specified
  if (config.cssUrl) {
    await loadRemoteCSS(config.cssUrl, remoteName);
  }

  // Check if already loading
  if (loading.has(remoteName)) {
    await loading.get(remoteName);
    return;
  }

  const loadPromise = (async () => {
    const shareScope = ensureFederationShareScope();

    const tryInit = async (attemptImportNonce?: string) => {
      // 1) Prefer ESM remote entry import (Vite MF uses ESM remoteEntry.js)
      const { container: imported, importErr } = await importRemoteContainer(
        config.url,
        attemptImportNonce,
      );

      // 2) Fallback: some builds attach the container to window[scope]
      const container =
        imported ?? ((window as any)[config.scope] as RemoteContainer | undefined);

      if (!container || !container.init || !container.get) {
        throw new Error(
          `Remote ${remoteName} failed to initialize.${formatImportErr(importErr)}`,
        );
      }

      // Ensure __tla is awaited before calling container.init
      await awaitViteTla(container);

      // Init remote with share scope (idempotent)
      await ensureRemoteContainerInitialized(remoteName, container);

      return container;
    };

    try {
      const container = await tryInit(importNonce);
      remoteCache.set(remoteName, container);
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Dev-only: Vite + @module-federation/vite can throw "Please call init first"
      // during initial dep optimization / reload. A short retry with a fresh cache-bust
      // is usually enough and avoids forcing the user to manually refresh.
      if (
        process.env.NODE_ENV !== 'production' &&
        msg.includes('Please call init first')
      ) {
        console.warn(
          `[MF] ${remoteName} init race detected; retrying once...`,
          err,
        );
        // Force a fresh module evaluation on retry
        const retryNonce = Date.now().toString(36);
        await new Promise((r) => setTimeout(r, 250));
        const container = await tryInit(retryNonce);
        remoteCache.set(remoteName, container);
        return;
      }
      // Implement exponential backoff for retry logic
      const maxRetries = 3;
      const baseDelay = 1000; // 1 second
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
        console.warn(
          `[MF] Attempt ${attempt + 1} of ${maxRetries}: Retrying to load remote ${remoteName} in ${delay}ms...`,
          err,
        );
        await new Promise((r) => setTimeout(r, delay));
        try {
          const container = await tryInit(Date.now().toString(36));
          remoteCache.set(remoteName, container);
          return;
        } catch (retryErr) {
          if (attempt === maxRetries - 1) {
            console.error(
              `[MF] Failed to load remote ${remoteName} after ${maxRetries} attempts.`,
              retryErr,
            );
            throw retryErr;
          }
        }
      }
      throw err;
    }
  })();

  loading.set(remoteName, loadPromise);
  try {
    await loadPromise;
  } finally {
    loading.delete(remoteName);
  }
}

/**
 * Load a component from a remote module
 */
export async function loadRemoteComponent<T = any>(
  remoteName: string
): Promise<T> {
  const config = remoteConfigs[remoteName];
  if (!config) {
    throw new Error(`Unknown remote: ${remoteName}`);
  }

  const loadOnce = async (): Promise<T> => {
    // Ensure remote is initialized
    if (!remoteCache.has(remoteName)) {
      await initRemote(remoteName);
    }

    const container = remoteCache.get(remoteName) as RemoteContainer | undefined;
    if (!container || !container.get) {
      throw new Error(`Remote ${remoteName} not available`);
    }

    // Defensive: ensure the remote runtime is initialized (dev/HMR safe)
    await ensureRemoteContainerInitialized(remoteName, container);

    // Ensure __tla is awaited before calling container.get
    await awaitViteTla(container);

    // Get the module factory
    const factory = await container.get(config.module);
    const module = factory();

    return (module.default || module) as T;
  };

  try {
    return await loadOnce();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Dev-only: sometimes the remote's module evaluation hits MF runtime before init,
    // especially during Vite dependency optimization/reload. Retry once with a forced
    // re-import of the remoteEntry to avoid requiring a manual refresh.
    if (
      process.env.NODE_ENV !== 'production' &&
      msg.includes('Please call init first')
    ) {
      console.warn(
        `[MF] ${remoteName} load race detected; retrying with backoff...`,
        err,
      );

      // Vite MF may reload optimized deps shortly after startup; allow a few retries.
      // We force a fresh remoteEntry evaluation each time to pick up the newest deps graph.
      const attempts = 5;
      for (let i = 0; i < attempts; i++) {
        remoteCache.delete(remoteName);
        loading.delete(remoteName);

        const delay = 200 + i * 250;
        await new Promise((r) => setTimeout(r, delay));

        try {
          await initRemote(remoteName, Date.now().toString(36));
          return await loadOnce();
        } catch (retryErr) {
          const retryMsg =
            retryErr instanceof Error ? retryErr.message : String(retryErr);
          if (!retryMsg.includes('Please call init first') || i === attempts - 1) {
            throw retryErr;
          }
          console.warn(
            `[MF] ${remoteName} still not ready (attempt ${i + 1}/${attempts}); retrying...`,
            retryErr,
          );
        }
      }
    }
    throw err;
  }
}

/**
 * Preload a remote (useful for prefetching)
 */
export function preloadRemote(remoteName: string): void {
  if (typeof window === 'undefined') return;
  
  const config = remoteConfigs[remoteName];
  if (!config || remoteCache.has(remoteName)) return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = config.url;
  link.as = 'script';
  document.head.appendChild(link);
  
  console.log(`[MF] Prefetching remote ${remoteName} from ${config.url}`);
}
