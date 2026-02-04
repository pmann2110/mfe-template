import { useSyncExternalStore } from 'react';
import type { Session } from '@repo/auth-core';
import type { ShellStore, Notification } from './shell-types';
import { getShellStore, INITIAL_SHELL_APP_STATE } from './shell-store';

/** Stable initial snapshot for SSR so hydration matches (server never mutates store). */
function getServerSnapshot<T>(selector: (state: ShellStore) => T): T {
  return selector(INITIAL_SHELL_APP_STATE as unknown as ShellStore);
}

export function useShellStore<T>(selector: (state: ShellStore) => T): T {
  const store = getShellStore();

  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => getServerSnapshot(selector)
  );
}

export function useSession(): Session | null {
  return useShellStore((state) => state.auth.session);
}

export function useNotifications(): Notification[] {
  return useShellStore((state) => state.ui.notifications);
}

export function useUnreadNotificationsCount(): number {
  return useShellStore((state) =>
    state.ui.notifications.filter((n) => !n.read).length
  );
}

export function useShellActions(): Pick<
  ShellStore,
  | 'setSession'
  | 'setTenantId'
  | 'addNotification'
  | 'clearNotifications'
  | 'markNotificationRead'
  | 'removeNotification'
  | 'setRemoteLoading'
  | 'setRemoteLoaded'
  | 'setRemoteError'
> {
  const store = getShellStore();
  const state = store.getState();

  return {
    setSession: state.setSession,
    setTenantId: state.setTenantId,
    addNotification: state.addNotification,
    clearNotifications: state.clearNotifications,
    markNotificationRead: state.markNotificationRead,
    removeNotification: state.removeNotification,
    setRemoteLoading: state.setRemoteLoading,
    setRemoteLoaded: state.setRemoteLoaded,
    setRemoteError: state.setRemoteError,
  };
}
