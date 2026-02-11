'use client';

import React, { createContext, useCallback, useContext, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import type { TenantMetadata } from './shell-types';
import { getShellStore, INITIAL_SHELL_APP_STATE } from './shell-store';

export interface TenantContextValue {
  /** Currently selected tenant/org id */
  tenantId: string | null;
  /** Current user's permissions in the selected org */
  currentOrgPermissions: string[] | null;
  /** Metadata for the current tenant */
  tenantMetadata: TenantMetadata | null;
  /** List of orgs the user can access */
  availableTenants: TenantMetadata[];
  /** Switch to a tenant and optionally set permissions and metadata */
  switchTenant: (
    tenantId: string | null,
    options?: {
      permissions?: string[] | null;
      metadata?: TenantMetadata | null;
    }
  ) => void;
  /** Set the list of orgs the user can access (e.g. after fetching from API) */
  setAvailableTenants: (tenants: TenantMetadata[]) => void;
}

const TenantContext = createContext<TenantContextValue | null>(null);

function getTenantSnapshot() {
  return getShellStore().getState().tenant;
}

function getTenantServerSnapshot() {
  return INITIAL_SHELL_APP_STATE.tenant;
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const store = getShellStore();
  const tenant = useSyncExternalStore(
    store.subscribe,
    getTenantSnapshot,
    getTenantServerSnapshot
  );

  const switchTenant = useCallback(
    (
      newTenantId: string | null,
      options?: {
        permissions?: string[] | null;
        metadata?: TenantMetadata | null;
      }
    ) => {
      store.setState((state) => ({
        tenant: {
          ...state.tenant,
          tenantId: newTenantId,
          currentOrgPermissions: options?.permissions ?? state.tenant.currentOrgPermissions,
          tenantMetadata: options?.metadata ?? state.tenant.tenantMetadata,
        },
      }));
    },
    [store]
  );

  const setAvailableTenantsList = useCallback(
    (tenants: TenantMetadata[]) => {
      store.getState().setAvailableTenants(tenants);
    },
    [store]
  );

  const value: TenantContextValue = {
    tenantId: tenant.tenantId,
    currentOrgPermissions: tenant.currentOrgPermissions,
    tenantMetadata: tenant.tenantMetadata,
    availableTenants: tenant.availableTenants,
    switchTenant,
    setAvailableTenants: setAvailableTenantsList,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  ) as React.ReactElement;
}

export function useTenantContext(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    // Fallback: read/write directly from shell store so it works without provider
    const store = getShellStore();
    const state = store.getState();
    return {
      tenantId: state.tenant.tenantId,
      currentOrgPermissions: state.tenant.currentOrgPermissions,
      tenantMetadata: state.tenant.tenantMetadata,
      availableTenants: state.tenant.availableTenants,
      switchTenant: (newTenantId, options) => {
        state.setTenantId(newTenantId);
        if (options?.permissions != null) state.setCurrentOrgPermissions(options.permissions);
        if (options?.metadata != null) state.setTenantMetadata(options.metadata);
      },
      setAvailableTenants: state.setAvailableTenants,
    };
  }
  return ctx;
}
