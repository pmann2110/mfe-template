import { createContext, useContext, type ReactNode } from 'react';
import type { Session as CoreSession } from '@repo/auth-core';

interface StandaloneAuthContextValue {
  session: CoreSession;
}

const StandaloneAuthContext = createContext<StandaloneAuthContextValue | null>(null);

interface StandaloneAuthProviderProps {
  children: ReactNode;
  /**
   * Function that creates a mock session for standalone development
   * Each remote app should provide its own mock session with appropriate permissions
   */
  createMockSession: () => CoreSession;
}

/**
 * Provider for standalone mode authentication
 * Provides a mock session for local development when running the remote app independently
 * 
 * @example
 * ```tsx
 * const createMockSession = () => ({
 *   user: {
 *     id: 'standalone-user',
 *     email: 'dev@localhost',
 *     name: 'Development User',
 *     roles: ['admin'],
 *     permissions: ['user:read', 'user:write'],
 *   },
 *   expiresAt: Date.now() + 86400000,
 * });
 * 
 * <StandaloneAuthProvider createMockSession={createMockSession}>
 *   <App />
 * </StandaloneAuthProvider>
 * ```
 */
export function StandaloneAuthProvider({ children, createMockSession }: StandaloneAuthProviderProps) {
  const session = createMockSession();

  return (
    <StandaloneAuthContext.Provider value={{ session }}>
      {children}
    </StandaloneAuthContext.Provider>
  );
}

/**
 * Hook to access standalone auth session
 * Returns null if used outside StandaloneAuthProvider (hosted mode)
 */
export function useStandaloneAuth(): CoreSession | null {
  const context = useContext(StandaloneAuthContext);
  return context?.session ?? null;
}
