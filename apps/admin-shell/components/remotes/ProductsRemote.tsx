'use client';

import { ModuleFederationRemote } from './ModuleFederationRemote';
import type { Session as CoreSession } from '@repo/auth-core';

interface ProductsRemoteProps {
  session: CoreSession | null;
}

export function ProductsRemote({ session }: ProductsRemoteProps) {
  return (
    <div className="w-full">
      <ModuleFederationRemote
        remoteName="products"
        session={session}
        fallback={
          <div className="flex h-64 items-center justify-center">
            <div className="text-muted-foreground">Loading products remote...</div>
          </div>
        }
      />
    </div>
  );
}
