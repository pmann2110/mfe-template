'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';
import { ModuleFederationRemote } from './ModuleFederationRemote';
import type { Session as CoreSession } from '@repo/auth-core';
import type { RoutingProps } from '@repo/api-contracts';

interface IdentityRemoteProps {
  session: CoreSession | null;
}

/** Loads identity remote with basePath /account/org (tenant mode: current user's org only). */
export function IdentityRemote({ session }: IdentityRemoteProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const lastNavigatedPath = useRef<string | null>(null);

  const basePath = '/account/org';
  const pathWithoutBase = pathname.replace(basePath, '');
  const subPath =
    pathWithoutBase === ''
      ? '/'
      : pathWithoutBase.startsWith('/')
        ? pathWithoutBase
        : '/' + pathWithoutBase;
  const search = searchParams.toString();

  const handleNavigate = useCallback(
    (to: string) => {
      const normalizedTo = to.startsWith('/') ? to : '/' + to;
      const newPath = basePath + normalizedTo;
      const normalizeForCompare = (p: string) =>
        p === basePath ? basePath : p.replace(/\/$/, '');
      const normalizedNewPath = normalizeForCompare(newPath);
      const normalizedCurrentPath = normalizeForCompare(pathname);
      if (
        normalizedNewPath !== normalizedCurrentPath &&
        normalizedNewPath !== lastNavigatedPath.current
      ) {
        lastNavigatedPath.current = normalizedNewPath;
        router.push(newPath);
      }
    },
    [pathname, router]
  );

  const routingProps: RoutingProps = {
    mode: 'hosted',
    basePath,
    pathname: subPath,
    search,
    onNavigate: handleNavigate,
  };

  return (
    <div className="w-full">
      <ModuleFederationRemote
        remoteName="identity"
        session={session}
        routingProps={routingProps}
        fallback={
          <div className="flex h-64 items-center justify-center">
            <div className="text-muted-foreground">Loading identity remote...</div>
          </div>
        }
      />
    </div>
  );
}
