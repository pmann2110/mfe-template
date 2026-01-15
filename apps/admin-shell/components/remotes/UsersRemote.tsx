'use client';

import { ModuleFederationRemote } from './ModuleFederationRemote';
import type { Session as CoreSession } from '@repo/auth-core';

interface UsersRemoteProps {
  session: CoreSession | null;
}

export function UsersRemote({ session }: UsersRemoteProps) {
  return (
    <div className="w-full">
      <ModuleFederationRemote
        remoteName="users"
        session={session}
        fallback={
          <div className="flex h-64 items-center justify-center">
            <div className="text-muted-foreground">Loading users remote...</div>
          </div>
        }
      />
    </div>
  );
}
