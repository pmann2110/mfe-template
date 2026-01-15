import { useSyncExternalStore } from 'react';
import type { ShellStore } from './shell-types';
import { getShellStore } from './shell-store';

export function useShellStore<T>(selector: (state: ShellStore) => T): T {
  const store = getShellStore();

  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState()) // No server-side fallback since we don't SSR the store
  );
}

// Convenience hooks for common selectors
export function useSession() {
  return useShellStore((state) => state.auth.session);
}

export function useNotifications() {
  return useShellStore((state) => state.ui.notifications);
}

export function useUnreadNotificationsCount() {
  return useShellStore((state) =>
    state.ui.notifications.filter((n) => !n.read).length
  );
}

// Actions hook - returns stable action references
export function useShellActions() {
  const store = getShellStore();
  const state = store.getState();
  
  return {
    setSession: state.setSession,
    setTenantId: state.setTenantId,
    addNotification: state.addNotification,
    clearNotifications: state.clearNotifications,
    markNotificationRead: state.markNotificationRead,
    removeNotification: state.removeNotification,
    // Remote actions
    setRemoteLoading: state.setRemoteLoading,
    setRemoteLoaded: state.setRemoteLoaded,
    setRemoteError: state.setRemoteError,
  };
}