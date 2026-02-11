// Types
export type {
  ShellAppState,
  ShellAppActions,
  ShellStore,
  Notification,
  TenantMetadata,
  AvailableTenant,
} from './shell-types';

// Store functions
export { initShellStore, getShellStore } from './shell-store';

// React hooks
export {
  useShellStore,
  useSession,
  useNotifications,
  useUnreadNotificationsCount,
  useShellActions,
} from './use-shell-store';

// Tenant context (optional wrapper; useTenantContext works with or without provider)
export {
  TenantProvider,
  useTenantContext,
} from './tenant-context';
export type { TenantContextValue } from './tenant-context';