'use client';

import { useEffect } from 'react';
import { initShellStore } from '@repo/stores';
import type { Session as CoreSession } from '@repo/auth-core';
import { IdentityRemote } from '../../../../components/remotes/IdentityRemote';

interface IdentityRemoteWrapperProps {
  session: CoreSession | null;
}

/** Inits shell store with session so identity-remote can read auth and set tenant context. */
export function IdentityRemoteWrapper({ session }: IdentityRemoteWrapperProps) {
  useEffect(() => {
    if (session) {
      initShellStore({
        auth: { session },
      });
    }
  }, [session]);

  return <IdentityRemote session={session} />;
}
