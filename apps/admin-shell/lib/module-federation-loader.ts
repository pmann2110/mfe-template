/**
 * Runtime Module Federation Loader for Turbopack compatibility
 *
 * This loader dynamically loads remote modules at runtime without requiring
 * webpack's ModuleFederationPlugin, making it compatible with Turbopack.
 *
 * CONTRACT (Vite MF runtime ordering):
 * 1. Share scope and __FEDERATION__ / __webpack_share_scopes__ must be set before remote init.
 * 2. container.init(shareScope, []) must be awaited.
 * 3. One microtask delay before container.get(module).
 * 4. container.get(module) returns a factory; run it to get the component.
 *
 * Dev-only: health check interval and retry/reload logic live in startDevRuntimeHealthCheck
 * and retry helpers so production paths stay minimal.
 */

import type { RemoteConfig } from '@repo/api-contracts';

// Dynamic remote configurations loaded from external source
let dynamicRemoteConfigs: Record<string, RemoteConfig> = {};

// Promise that resolves when remote config has been loaded (client-side).
// Consumers must await this before calling getRemoteConfigs() to avoid race.
let configReadyPromise: Promise<void> | null = null;

/** In development allow localhost; in production use NEXT_PUBLIC_ALLOWED_REMOTE_ORIGINS (comma-separated). */
function isOriginAllowed(origin: string): boolean {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const o = new URL(origin);
      return o.hostname === 'localhost' || o.hostname === '127.0.0.1';
    } catch {
      return false;
    }
  }
  const allowed =
    (typeof process.env.NEXT_PUBLIC_ALLOWED_REMOTE_ORIGINS === 'string'
      ? process.env.NEXT_PUBLIC_ALLOWED_REMOTE_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
      : []) as string[];
  return allowed.includes(origin);
}

// Function to load dynamic configurations
async function loadDynamicRemoteConfigs(): Promise<void> {
  try {
    const response = await fetch('/config/remote-configs.json');
    if (response.ok) {
      const loadedConfigs = await response.json();
      const env = process.env.NODE_ENV || 'development';
      const envConfigs: Record<string, RemoteConfig> = {};

      for (const [remoteName, remoteConfig] of Object.entries(loadedConfigs)) {
        const configForEnv = (remoteConfig as Record<string, RemoteConfig>)[env];
        if (configForEnv) {
          try {
            const origin = new URL(configForEnv.url).origin;
            if (!isOriginAllowed(origin)) {
              if (env === 'production') {
                console.error(`[MF] Remote ${remoteName} origin ${origin} is not in NEXT_PUBLIC_ALLOWED_REMOTE_ORIGINS. Skipping.`);
              } else {
                console.warn(`[MF] Remote ${remoteName} origin ${origin} is not allowed (dev allows localhost only). Skipping.`);
              }
              continue;
            }
          } catch (urlErr) {
            console.warn(`[MF] Invalid remote URL for ${remoteName}:`, configForEnv.url, urlErr);
            continue;
          }
          envConfigs[remoteName] = configForEnv;
        }
      }

      dynamicRemoteConfigs = envConfigs;
    }
  } catch (error) {
    console.warn('[MF] Failed to load dynamic remote configs:', error);
  }
}

// Merge default and dynamic configurations (call only after await getConfigReady())
function getRemoteConfigs(): Record<string, RemoteConfig> {
  return { ...dynamicRemoteConfigs };
}

/**
 * Returns a promise that resolves when remote config is loaded.
 * Call this before initRemote/loadRemoteComponent/preloadRemote so config is available.
 */
export function getConfigReady(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }
  if (!configReadyPromise) {
    configReadyPromise = loadDynamicRemoteConfigs();
  }
  return configReadyPromise;
}

// Load dynamic configs when module is imported (client-side only)
if (typeof window !== 'undefined') {
  configReadyPromise = loadDynamicRemoteConfigs();
}

// Cache for loaded remotes
const remoteCache = new Map<string, any>();
// Track loading to prevent duplicates
const loading = new Map<string, Promise<void>>();
// Track loaded CSS to prevent duplicates
const loadedCss = new Set<string>();
// Track remote container initialization per *container instance* (not per name).
// In Vite dev, the remoteEntry module can be re-evaluated (new container object),
// so name-based flags can incorrectly skip init and cause "Please call init first".
const containerInitPromises = new WeakMap<RemoteContainer, Promise<void>>();

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
  _initialized?: boolean;
  _initializing?: boolean;
  [key: string]: any; // Allow additional properties
};

// Cache for shared modules
let cachedReactNs: any | null = null;
let cachedReactDomNs: any | null = null;
let cachedUiNs: any | null = null;
let cachedStoresNs: any | null = null;

// Workspace packages are currently versioned in-repo; keep this in sync with the
// workspace package.json versions to satisfy federation requiredVersion checks.
const REPO_SHARED_VERSION = '1.0.0';

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

  // In dev/HMR, globals can exist but be stale (e.g., after dev server restart).
  // Only skip init if the runtime wiring is actually healthy.
  const healthy =
    !!w.__federation_shared__?.default &&
    !!w.__webpack_share_scopes__?.default &&
    !!w.__FEDERATION__?.shared;

  if (w.__federation_runtime_init__ && healthy) return;

  // If we got here, we need to (re)initialize and repair globals.
  w.__federation_runtime_init__ = false;

  // Initialize federation shared scope with pre-loaded modules
  ensureFederationShareScope();

  // Initialize webpack share scopes (fallback for webpack-based remotes)
  if (!w.__webpack_share_scopes__) {
    w.__webpack_share_scopes__ = {};
  }
  // IMPORTANT: always point webpack's default share scope at our federation scope
  // to avoid "present but stale" objects after HMR reconnects.
  w.__webpack_share_scopes__.default = w.__federation_shared__.default;

  // Some federation runtimes check for __FEDERATION__ global
  if (!w.__FEDERATION__) {
    w.__FEDERATION__ = {
      shared: w.__federation_shared__,
      runtime: true,
    };
  }
  // Ensure shared scope reference is current
  w.__FEDERATION__.shared = w.__federation_shared__;

  // Mark as initialized
  w.__federation_runtime_init__ = true;
}

/** Dev-only: check federation runtime health and re-init if stale (e.g. after dev server restart). */
function startDevRuntimeHealthCheck(): void {
  if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') return;
  const checkInterval = setInterval(() => {
    const w = window as any;
    const healthy =
      !!w.__federation_shared__?.default &&
      !!w.__webpack_share_scopes__?.default &&
      !!w.__FEDERATION__?.shared;

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
      initFederationRuntime();
    }
  }, 5000);
  window.addEventListener('beforeunload', () => clearInterval(checkInterval));
}

// Initialize federation runtime immediately when this module is imported (client-side only)
if (typeof window !== 'undefined') {
  initFederationRuntime();
  startDevRuntimeHealthCheck();
}

export { initFederationRuntime };

function ensureFederationShareScope() {
  const w = window as any;

  // Initialize federation shared scope
  w.__federation_shared__ = w.__federation_shared__ || {};
  w.__federation_shared__.default = w.__federation_shared__.default || {};

  // Initialize webpack share scopes for compatibility
  w.__webpack_share_scopes__ = w.__webpack_share_scopes__ || {};
  // IMPORTANT: overwrite reference so it can’t stay stale after HMR
  w.__webpack_share_scopes__.default = w.__federation_shared__.default;

  // Ensure federation global exists and points at our share scope
  w.__FEDERATION__ = w.__FEDERATION__ || {};
  w.__FEDERATION__.shared = w.__federation_shared__;

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

  // Set up @repo/ui sharing (singleton across host/remotes)
  if (!w.__federation_shared__.default['@repo/ui']) {
    w.__federation_shared__.default['@repo/ui'] = {
      [REPO_SHARED_VERSION]: {
        get: async () => {
          if (!cachedUiNs) {
            cachedUiNs = await import('@repo/ui');
          }
          return () => cachedUiNs;
        },
        loaded: false,
        shareScope: 'default',
      },
    };
  }

  // Set up @repo/stores sharing (singleton across host/remotes)
  if (!w.__federation_shared__.default['@repo/stores']) {
    w.__federation_shared__.default['@repo/stores'] = {
      [REPO_SHARED_VERSION]: {
        get: async () => {
          if (!cachedStoresNs) {
            cachedStoresNs = await import('@repo/stores');
          }
          return () => cachedStoresNs;
        },
        loaded: false,
        shareScope: 'default',
      },
    };
  }

  return w.__federation_shared__.default;
}

// Helper to verify federation runtime is ready for loadShare
function verifyFederationRuntimeReady(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as any;
  
  // Check multiple possible runtime state indicators
  const basicReady = !!(
    w.__federation_runtime_init__ &&
    w.__federation_shared__?.default &&
    (w.__webpack_share_scopes__?.default || w.__FEDERATION__?.shared)
  );
  
  // Additional health checks for development/HMR scenarios
  if (basicReady && process.env.NODE_ENV === 'development') {
    // Check if React is properly shared (common issue after server restart)
    const hasReact = !!w.__federation_shared__?.default?.react;
    // Check if the share scope is properly linked
    const shareScopeLinked = w.__webpack_share_scopes__?.default === w.__federation_shared__?.default;
    return basicReady && hasReact && shareScopeLinked;
  }
  
  return basicReady;
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

  // Enhanced container tracking for development/HMR scenarios
  // Check if this container instance has been initialized before
  const existing = containerInitPromises.get(container);
  if (existing) {
    await existing;
    // Verify runtime is still ready after awaiting existing init
    if (!verifyFederationRuntimeReady()) {
      console.warn(`[MF] Runtime not ready after existing init for ${remoteName}, re-initializing`);
      initFederationRuntime();
      ensureFederationShareScope();
    }
    // Give the runtime a moment to propagate init state after completion
    await new Promise((r) => setTimeout(r, 0));
    return;
  }

  // Special handling for server restart scenario in development
  if (process.env.NODE_ENV === 'development') {
    // Check if we have a cached container for this remote name
    const cachedContainer = remoteCache.get(remoteName);
    // If we have a cached container but it's a different instance, we need to clean up
    if (cachedContainer && cachedContainer !== container) {
      console.warn(`[MF] Detected container instance change for ${remoteName} (server restart?), forcing browser reload for clean state`);
      // Force a hard reload to ensure completely clean state
      // This is the most reliable way to handle server restarts in development
      window.location.reload();
      return; // This line will never be reached, but keeps TypeScript happy
    }
  }

  const initPromise = (async () => {
    try {
      // Ensure federation runtime is fully initialized before calling container.init
      const w = window as any;
      if (!w.__federation_runtime_init__ || !w.__federation_shared__?.default) {
        initFederationRuntime();
        ensureFederationShareScope();
      }

      // The federation runtime from @module-federation/vite may check for a global
      // federation instance. Ensure it exists and is initialized.
      if (!w.__FEDERATION__) {
        w.__FEDERATION__ = {};
      }
      if (!w.__FEDERATION__.shared) {
        w.__FEDERATION__.shared = w.__federation_shared__;
      }

      // Call init and await it fully
      // Note: The second parameter to init() is the initScope, which should be an array
      // of scope names. An empty array means use the default scope.

      // TypeScript check: we already verified container.init exists at function start
      if (!container.init) {
        throw new Error(`Remote ${remoteName} container.init is undefined`);
      }
      
      // The federation runtime might expect the share scope to be passed in a specific way.
      // Try calling init with the share scope directly, and also ensure the runtime recognizes it.
      const initResult = container.init(shareScope, []);
      if (initResult instanceof Promise) {
        await initResult;
      }
      
      // After init, the container should be recognized by the runtime.
      // Some runtimes check if the container has been initialized by looking at
      // the share scope or the container's internal state.
      // Ensure the share scope is the same reference the runtime expects.
      // Reuse the existing 'w' variable from the outer scope
      if (w.__federation_shared__?.default) {
        // Make sure the share scope we passed matches what the runtime expects
        // The runtime might be checking if shareScope === w.__federation_shared__.default
        if (shareScope !== w.__federation_shared__.default) {
          console.warn(`[MF] Share scope reference mismatch for ${remoteName}, attempting to sync...`);
          // Try to ensure they're the same object
          Object.setPrototypeOf(shareScope, Object.getPrototypeOf(w.__federation_shared__.default));
        }
      }
      
      if (w.__federation_shared__?.default && shareScope !== w.__federation_shared__.default) {
        console.warn(`[MF] Share scope reference mismatch for ${remoteName}, syncing...`);
        Object.assign(w.__federation_shared__.default, shareScope);
      }

      // Single microtask wait before container.get() (minimal ordering step 3).
      await new Promise((r) => setTimeout(r, 0));
    } catch (initError) {
      const msg = initError instanceof Error ? initError.message : String(initError);

      // Webpack containers can throw if init is called more than once; in dev we
      // may defensively call init again when the container object is stable.
      if (
        msg.toLowerCase().includes('already initialized') ||
        msg.toLowerCase().includes('container already initialized')
      ) {
        return;
      }

      console.error(`[MF] Failed to initialize remote ${remoteName}:`, initError);
      throw initError;
    }
  })();

  // Direct handling for "Please call init first" error in development
  if (process.env.NODE_ENV === 'development') {
    try {
      // Try to call container.get() to see if we get the specific error
      if (container.get) {
        await container.get('./app'); // Use a default module path
      }
    } catch (getError) {
      const getErrMsg = getError instanceof Error ? getError.message : String(getError);
      
      // If we get the specific "Please call init first" error, force a reload
      if (getErrMsg.includes('Please call init first')) {
        console.warn(`[MF] Detected corrupted federation runtime state for ${remoteName}, forcing browser reload`);
        // Force a hard reload to ensure completely clean state
        window.location.reload();
        return; // This line will never be reached, but keeps TypeScript happy
      }
      
      // If it's a different error, re-throw it
      throw getError;
    }
  }

  containerInitPromises.set(container, initPromise);
  await initPromise;
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
    console.warn(`[MF] Remote entry from ${url} did not expose init/get`);
    return { importErr: new Error('Remote entry did not expose init/get') };
  } catch (importErr) {
    console.error(`[MF] Failed to import remote container from ${url}:`, importErr);
    
    // Provide more helpful error messages for common failures
    let enhancedError = importErr;
    if (importErr instanceof Error) {
      const errMsg = importErr.message.toLowerCase();
      if (errMsg.includes('failed to fetch') || 
          errMsg.includes('networkerror') ||
          errMsg.includes('load failed') ||
          errMsg.includes('connection refused') ||
          errMsg.includes('could not connect')) {
        enhancedError = new Error(
          `Cannot connect to remote server at ${url}. ` +
          `Make sure the remote dev server is running and accessible. ` +
          `Original error: ${importErr.message}`
        );
      } else if (errMsg.includes('404') || errMsg.includes('not found')) {
        enhancedError = new Error(
          `Remote entry not found at ${url}. ` +
          `Check that the remote is built and the URL is correct. ` +
          `Original error: ${importErr.message}`
        );
      }
    }
    
    return { importErr: enhancedError };
  }
}

/**
 * Initialize a remote module using Module Federation runtime
 */
async function initRemote(remoteName: string, importNonce?: string): Promise<void> {
  await getConfigReady();
  const config = getRemoteConfigs()[remoteName];
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
        const baseError = `Remote ${remoteName} failed to initialize.${formatImportErr(importErr)}`;
        // Enhance error message if it's a connection issue
        if (importErr instanceof Error) {
          const errMsg = importErr.message.toLowerCase();
          if (errMsg.includes('cannot connect') || 
              errMsg.includes('connection refused') ||
              errMsg.includes('failed to fetch')) {
            throw new Error(
              `${baseError}\n` +
              `\nTroubleshooting:\n` +
              `1. Ensure the ${remoteName} remote dev server is running\n` +
              `2. Check that the URL in remote-configs.json is correct\n` +
              `3. Verify CORS settings if accessing from a different origin`
            );
          }
        }
        throw new Error(baseError);
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
      // Implement enhanced exponential backoff for retry logic
      const maxRetries = 5;
      const baseDelay = 2000; // Start with 2 seconds
      const maxDelay = 8000; // Cap at 8 seconds
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        // Calculate delay with jitter to avoid synchronization issues
        const delay = Math.min(
          baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
          maxDelay
        );
        
        console.warn(
          `[MF] Attempt ${attempt + 1} of ${maxRetries}: Retrying to load remote ${remoteName} in ${delay}ms...`,
          err,
        );
        
        await new Promise((r) => setTimeout(r, delay));
        
        try {
          // Clear any cached state before retry
          remoteCache.delete(remoteName);
          loading.delete(remoteName);
          
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

  // Ensure federation runtime is healthy before attempting to load remotes
  // This is critical for dev/HMR scenarios where the runtime can become stale
  const w = window as any;
  const healthy =
    !!w.__federation_shared__?.default &&
    !!w.__webpack_share_scopes__?.default &&
    !!w.__FEDERATION__?.shared;

  if (!w.__federation_runtime_init__ || !healthy) {
    initFederationRuntime();
  }

  await getConfigReady();
  const config = getRemoteConfigs()[remoteName];
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

    // Verify this is the same container instance we initialized
    // (in case of HMR or re-evaluation, we might have a new container)
    const hasInitPromise = containerInitPromises.has(container);

    // Defensive: ensure the remote runtime is initialized (dev/HMR safe)
    // This is critical - if the container is a new instance, we need to init it
    await ensureRemoteContainerInitialized(remoteName, container);

    // Ensure __tla is awaited before calling container.get
    await awaitViteTla(container);

    // One microtask so runtime is ready before container.get() (minimal ordering step 3).
    await new Promise((r) => setTimeout(r, 0));

    // Get the module factory - this returns the factory function but doesn't execute it yet
    // NOTE: This call might trigger federation runtime checks, so init must be complete
    // If it fails with "Please call init first", the container might need to be re-initialized
    // with a fresh share scope reference
    let factory: (() => any) | undefined;
    try {
      factory = await container.get(config.module);
    } catch (getError) {
      const getErrMsg = getError instanceof Error ? getError.message : String(getError);
      if (getErrMsg.includes('Please call init first')) {
        console.warn(`[MF] container.get() failed for ${remoteName}, re-initializing container...`);
        // Clear the init promise to force a fresh init
        containerInitPromises.delete(container);
        // Re-initialize with fresh share scope
        await ensureRemoteContainerInitialized(remoteName, container);
        await new Promise((r) => setTimeout(r, 0));
        factory = await container.get(config.module);
      } else {
        throw getError;
      }
    }
    
    // Now execute the factory, which will evaluate the module code
    // and trigger top-level imports of shared modules
    let moduleExports: any;
    try {
      moduleExports = factory();
    } catch (e) {
      const evalMsg = e instanceof Error ? e.message : String(e);
      // The remote's module evaluation can still hit loadShare before the runtime
      // recognizes init (common after dev server restart + HMR reconnect).
      if (
        process.env.NODE_ENV !== 'production' &&
        evalMsg.includes('Please call init first')
      ) {
        console.warn(
          `[MF] factory() evaluation failed for ${remoteName}; resetting runtime and retrying once...`,
          e,
        );

        // Clear container init state so we can re-init cleanly
        containerInitPromises.delete(container);
        remoteCache.delete(remoteName);
        loading.delete(remoteName);

        // Reset federation globals to force a clean re-wire
        const w = window as any;
        try {
          delete w.__federation_runtime_init__;
          delete w.__webpack_share_scopes__;
          delete w.__FEDERATION__;
          delete w.__federation_shared__;
        } catch {
          // ignore
        }

        initFederationRuntime();

        // Force a fresh remoteEntry evaluation and re-init
        await initRemote(remoteName, Date.now().toString(36));
        const fresh = remoteCache.get(remoteName) as RemoteContainer | undefined;
        if (!fresh?.get || !fresh?.init) {
          throw e;
        }
        await ensureRemoteContainerInitialized(remoteName, fresh);

        const freshFactory = await fresh.get(config.module);
        moduleExports = freshFactory();
      } else {
        throw e;
      }
    }

    return (moduleExports.default || moduleExports) as T;
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
      const attempts = 3;
      const baseDelay = 1000; // Start with 1 second
      const maxDelay = 10000; // Cap at 10 seconds
      
      for (let i = 0; i < attempts; i++) {
        // Clear all cached state before retry
        remoteCache.delete(remoteName);
        loading.delete(remoteName);
        
        // Exponential backoff with jitter
        const delay = Math.min(
          baseDelay * Math.pow(2, i) + Math.random() * 500,
          maxDelay
        );
        
        console.warn(
          `[MF] ${remoteName} load retry attempt ${i + 1}/${attempts} with ${delay}ms delay...`,
        );
        
        await new Promise((r) => setTimeout(r, delay));

        try {
          await initRemote(remoteName, Date.now().toString(36));
          return await loadOnce();
        } catch (retryErr) {
          const retryMsg =
            retryErr instanceof Error ? retryErr.message : String(retryErr);
          
          if (i === attempts - 1) {
            console.error(
              `[MF] ${remoteName} failed after ${attempts} attempts: `,
              retryErr,
            );
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

export interface PreloadRemoteOptions {
  /** When true, initialize the remote in the background so first navigation only pays for get + factory. Default false (prefetch only). */
  init?: boolean;
}

/**
 * Preload a remote (prefetch script, or optionally init in background).
 * Call getConfigReady() first if you need to block until config is loaded.
 */
export function preloadRemote(remoteName: string, options?: PreloadRemoteOptions): void {
  if (typeof window === 'undefined') return;
  if (remoteCache.has(remoteName)) return;

  const doPreload = async () => {
    await getConfigReady();
    const config = getRemoteConfigs()[remoteName];
    if (!config) return;

    if (options?.init) {
      initRemote(remoteName).catch(() => {
        // Ignore; first navigation will retry
      });
      return;
    }

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = config.url;
    link.as = 'script';
    document.head.appendChild(link);
  };

  doPreload();
}