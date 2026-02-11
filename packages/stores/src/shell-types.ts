import type { Session } from '@repo/auth-core';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  timestamp: number;
  read?: boolean;
}

/** Minimal tenant/org metadata for shell context (avoids coupling to api-contracts). */
export interface TenantMetadata {
  id: string;
  name: string;
  slug?: string;
}

/** Same shape as TenantMetadata; used for listing user's accessible orgs. */
export type AvailableTenant = TenantMetadata;

export interface ShellAppState {
  auth: {
    session: Session | null;
  };
  tenant: {
    tenantId: string | null;
    currentOrgPermissions: string[] | null;
    tenantMetadata: TenantMetadata | null;
    availableTenants: AvailableTenant[];
  };
  ui: {
    notifications: Notification[];
  };
  remotes?: Record<string, { loaded: boolean; loading: boolean; error: string | null }>;
}

export interface ShellAppActions {
  // Auth actions
  setSession: (session: Session | null) => void;

  // Tenant actions
  setTenantId: (tenantId: string | null) => void;
  setCurrentOrgPermissions: (permissions: string[] | null) => void;
  setTenantMetadata: (metadata: TenantMetadata | null) => void;
  setAvailableTenants: (tenants: AvailableTenant[]) => void;

  // UI actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  clearNotifications: () => void;
  markNotificationRead: (notificationId: string) => void;
  removeNotification: (notificationId: string) => void;

  // Remote actions
  setRemoteLoading: (remoteName: string, loading: boolean) => void;
  setRemoteLoaded: (remoteName: string, loaded: boolean) => void;
  setRemoteError: (remoteName: string, error: string | null) => void;
}

export type ShellStore = ShellAppState & ShellAppActions;