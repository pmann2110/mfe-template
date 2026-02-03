import { createStore, type StoreApi } from 'zustand/vanilla';
import type { Session, AuthStatus } from './types';
import type { AuthClient } from './auth-client';
import { MockAuthClient } from './auth-client';

export interface ShellState {
  session: Session | null;
  status: AuthStatus;
  authClient: AuthClient;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  rehydrate: () => Promise<void>;
  can: (permission: string) => boolean;
}

export function createShellStore(authClient: AuthClient = new MockAuthClient()): ReturnType<typeof createStore<ShellState>> {
  return createStore<ShellState>((set, get) => ({
    session: null,
    status: 'idle',
    authClient,

    login: async (email: string, password: string) => {
      set({ status: 'loading' });
      try {
        const session = await authClient.login(email, password);
        set({ session, status: 'authenticated' });
      } catch (error) {
        set({ status: 'unauthenticated' });
        throw error;
      }
    },

    logout: async () => {
      await authClient.logout();
      set({ session: null, status: 'unauthenticated' });
    },

    rehydrate: async () => {
      set({ status: 'loading' });
      try {
        const session = await authClient.getSession();
        if (session) {
          set({ session, status: 'authenticated' });
        } else {
          set({ status: 'unauthenticated' });
        }
      } catch {
        set({ status: 'unauthenticated' });
      }
    },

    can: (permission: string) => {
      const { session } = get();
      if (!session) return false;
      // Admin has all permissions
      if (session.user.roles.includes('admin')) return true;
      // Check if user has the specific permission as a role
      return session.user.roles.includes(permission);
    },
  }));
}

export type ShellStore = StoreApi<ShellState>;
