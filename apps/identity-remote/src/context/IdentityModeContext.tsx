'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

export type IdentityMode = 'platform' | 'tenant';

const IdentityModeContext = createContext<IdentityMode | null>(null);

export function IdentityModeProvider({
  mode,
  children,
}: {
  mode: IdentityMode | null;
  children: ReactNode;
}) {
  const value = useMemo(() => mode, [mode]);
  return (
    <IdentityModeContext.Provider value={value}>
      {children}
    </IdentityModeContext.Provider>
  );
}

export function useIdentityMode(): IdentityMode | null {
  return useContext(IdentityModeContext);
}

export function useIsPlatformMode(): boolean {
  return useIdentityMode() === 'platform';
}
