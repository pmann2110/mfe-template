import { createStore } from 'zustand/vanilla';
import type { StoreApi } from 'zustand/vanilla';
import type { ShellAppState, ShellStore, Notification } from './shell-types';

declare global {
  interface Window {
    __SHELL_STORE__?: StoreApi<ShellStore>;
  }
}

// Global store will be attached to window/globalThis at runtime

function generateNotificationId(): string {
  return `notification-${String(Date.now())}-${Math.random().toString(36).substring(2, 11)}`;
}

/** Initial state for SSR/getServerSnapshot so hydration matches (server never mutates store). */
export const INITIAL_SHELL_APP_STATE: ShellAppState = {
  auth: { session: null },
  tenant: {
    tenantId: null,
    currentOrgPermissions: null,
    tenantMetadata: null,
    availableTenants: [],
  },
  ui: { notifications: [] },
  remotes: {},
};

function createShellStore(initialState?: Partial<ShellAppState>): StoreApi<ShellStore> {
  return createStore<ShellStore>((set, _get) => ({
    // Initial state
    auth: {
      session: null,
      ...initialState?.auth,
    },
    tenant: {
      tenantId: null,
      currentOrgPermissions: null,
      tenantMetadata: null,
      availableTenants: [],
      ...initialState?.tenant,
    },
    ui: {
      notifications: [],
      ...initialState?.ui,
    },
    // Track remote module loading status (keyed by remote name)
    remotes: initialState?.remotes ?? {},

    // Auth actions
    setSession: (session) => {
      set((state) => ({
        auth: {
          ...state.auth,
          session,
        },
      }));
    },

    // Tenant actions
    setTenantId: (tenantId) => {
      set((state) => ({
        tenant: {
          ...state.tenant,
          tenantId,
        },
      }));
    },

    setCurrentOrgPermissions: (permissions) => {
      set((state) => ({
        tenant: {
          ...state.tenant,
          currentOrgPermissions: permissions,
        },
      }));
    },

    setTenantMetadata: (metadata) => {
      set((state) => ({
        tenant: {
          ...state.tenant,
          tenantMetadata: metadata,
        },
      }));
    },

    setAvailableTenants: (tenants) => {
      set((state) => ({
        tenant: {
          ...state.tenant,
          availableTenants: tenants,
        },
      }));
    },

    // UI actions
    addNotification: (notification) => {
      const fullNotification: Notification = {
        id: generateNotificationId(),
        timestamp: Date.now(),
        ...notification,
      };

      set((state) => ({
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, fullNotification],
        },
      }));
    },

    clearNotifications: () => {
      set((state) => ({
        ui: {
          ...state.ui,
          notifications: [],
        },
      }));
    },

    markNotificationRead: (notificationId) => {
      set((state) => ({
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          ),
        },
      }));
    },

    removeNotification: (notificationId) => {
      set((state) => ({
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(
            (notification) => notification.id !== notificationId
          ),
        },
      }));
    },

    // Remote actions (each update produces a full { loaded, loading, error } for the remote)
    setRemoteLoading: (remoteName, loading) => {
      set((state) => {
        const prev = state.remotes?.[remoteName];
        return {
          remotes: {
            ...state.remotes,
            [remoteName]: {
              loaded: prev?.loaded ?? false,
              loading,
              error: prev?.error ?? null,
            },
          },
        };
      });
    },

    setRemoteLoaded: (remoteName, loaded) => {
      set((state) => {
        const prev = state.remotes?.[remoteName];
        return {
          remotes: {
            ...state.remotes,
            [remoteName]: {
              loaded,
              loading: prev?.loading ?? false,
              error: prev?.error ?? null,
            },
          },
        };
      });
    },

    setRemoteError: (remoteName, error) => {
      set((state) => {
        const prev = state.remotes?.[remoteName];
        return {
          remotes: {
            ...state.remotes,
            [remoteName]: {
              loaded: prev?.loaded ?? false,
              loading: prev?.loading ?? false,
              error,
            },
          },
        };
      });
    },
  }));
}

interface ShellStoreGlobal {
  __SHELL_STORE__?: StoreApi<ShellStore>;
}

function getGlobalStore(): StoreApi<ShellStore> | undefined {
  if (typeof window !== 'undefined' && window.__SHELL_STORE__) return window.__SHELL_STORE__;
  return (globalThis as ShellStoreGlobal).__SHELL_STORE__;
}

function setGlobalStore(store: StoreApi<ShellStore>): void {
  (globalThis as ShellStoreGlobal).__SHELL_STORE__ = store;
  if (typeof window !== 'undefined') window.__SHELL_STORE__ = store;
}

export function initShellStore(initialState?: Partial<ShellAppState>): StoreApi<ShellStore> {
  const existingStore = getGlobalStore();

  if (existingStore) {
    if (initialState) {
      existingStore.setState((state: ShellStore) => ({
        ...state,
        ...initialState,
      }));
    }
    return existingStore;
  }

  const store = createShellStore(initialState);
  setGlobalStore(store);
  return store;
}

export function getShellStore(): StoreApi<ShellStore> {
  const store = getGlobalStore();

  if (!store) {
    // Auto-initialize the store if it doesn't exist
    return initShellStore();
  }

  return store;
}