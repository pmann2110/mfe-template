import { createStore } from 'zustand/vanilla';
import type { StoreApi } from 'zustand/vanilla';
import type { ShellAppState, ShellAppActions, ShellStore, Notification } from './shell-types';

const STORE_KEY = '__SHELL_STORE__';

// Global store will be attached to window/globalThis at runtime

function generateNotificationId(): string {
  return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function createShellStore(initialState?: Partial<ShellAppState>): StoreApi<ShellStore> {
  return createStore<ShellStore>((set, get) => ({
    // Initial state
    auth: {
      session: null,
      ...initialState?.auth,
    },
    tenant: {
      tenantId: null,
      ...initialState?.tenant,
    },
    ui: {
      notifications: [],
      ...initialState?.ui,
    },
    // Add a new state for tracking remote module loading status
    remotes: {
      users: { loaded: false, loading: false, error: null },
      ...initialState?.remotes,
    },

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

    // Remote actions
    setRemoteLoading: (remoteName, loading) => {
      set((state) => ({
        remotes: {
          ...state.remotes,
          [remoteName]: {
            ...state.remotes?.[remoteName],
            loading,
          },
        },
      }));
    },

    setRemoteLoaded: (remoteName, loaded) => {
      set((state) => ({
        remotes: {
          ...state.remotes,
          [remoteName]: {
            ...state.remotes?.[remoteName],
            loaded,
          },
        },
      }));
    },

    setRemoteError: (remoteName, error) => {
      set((state) => ({
        remotes: {
          ...state.remotes,
          [remoteName]: {
            ...state.remotes?.[remoteName],
            error,
          },
        },
      }));
    },
  }));
}

export function initShellStore(initialState?: Partial<ShellAppState>): StoreApi<ShellStore> {
  // Check if store already exists on globalThis/window
  const existingStore = (globalThis as any).__SHELL_STORE__ || (typeof window !== 'undefined' ? (window as any).__SHELL_STORE__ : undefined);

  if (existingStore) {
    // If store exists, just update initial state if provided
    if (initialState) {
      existingStore.setState((state: ShellStore) => ({
        ...state,
        ...initialState,
      }));
    }
    return existingStore;
  }

  // Create new store
  const store = createShellStore(initialState);

  // Attach to global scope for singleton access
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).__SHELL_STORE__ = store;
  }
  if (typeof window !== 'undefined') {
    (window as any).__SHELL_STORE__ = store;
  }

  return store;
}

export function getShellStore(): StoreApi<ShellStore> {
  const store = (globalThis as any).__SHELL_STORE__ || (typeof window !== 'undefined' ? (window as any).__SHELL_STORE__ : undefined);

  if (!store) {
    // Auto-initialize the store if it doesn't exist
    return initShellStore();
  }

  return store;
}