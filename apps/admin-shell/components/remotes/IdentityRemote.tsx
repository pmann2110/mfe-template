'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';
import { ModuleFederationRemote } from './ModuleFederationRemote';
import type { Session as CoreSession } from '@repo/auth-core';
import type { RoutingProps } from '@repo/api-contracts';

interface IdentityRemoteProps {
  session: CoreSession | null;
}

export function IdentityRemote({ session }: IdentityRemoteProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const lastNavigatedPath = useRef<string | null>(null);

  // Derive routing props for hosted mode (platform: all orgs, system users)
  const basePath = '/admin/accounts';
  // Normalize pathname: remove basePath and ensure it starts with /
  const pathWithoutBase = pathname.replace(basePath, '');
  const subPath = pathWithoutBase === '' ? '/' : pathWithoutBase.startsWith('/') ? pathWithoutBase : '/' + pathWithoutBase;
  const search = searchParams.toString();

  const handleNavigate = useCallback((to: string) => {
    // Normalize the 'to' path
    const normalizedTo = to.startsWith('/') ? to : '/' + to;
    const newPath = basePath + normalizedTo;

    // Normalize paths for comparison (remove trailing slashes except for root)
    const normalizeForCompare = (p: string) => p === basePath ? basePath : p.replace(/\/$/, '');
    const normalizedNewPath = normalizeForCompare(newPath);
    const normalizedCurrentPath = normalizeForCompare(pathname);

    // Prevent navigation loops:
    // 1. Don't navigate if it's the same path
    // 2. Don't navigate if we just navigated to this path
    if (
      normalizedNewPath !== normalizedCurrentPath &&
      normalizedNewPath !== lastNavigatedPath.current
    ) {
      lastNavigatedPath.current = normalizedNewPath;
      router.push(newPath);
    }
  }, [pathname, router]);

  const routingProps = {
    mode: 'hosted' as const,
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
