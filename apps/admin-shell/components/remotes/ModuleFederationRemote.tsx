'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { Card, CardContent, CardHeader, Button } from '@repo/ui';
import { loadRemoteComponent } from '../../lib/module-federation-loader';
import { getShellStore } from '@repo/stores';
import type { Session as CoreSession } from '@repo/auth-core';

import type { RoutingProps } from '@repo/api-contracts';

interface ModuleFederationRemoteProps {
  remoteName: string;
  session: CoreSession | null;
  routingProps?: RoutingProps;
  fallback?: React.ReactNode;
}

// Skeleton loading component for remotes
function RemoteSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-24 bg-muted animate-pulse rounded" />
      </div>

      <Card>
        <CardHeader>
          <div className="h-6 w-24 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table header skeleton */}
            <div className="flex gap-4">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            </div>
            {/* Table rows skeleton */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getErrorMessage(remoteName: string, err: unknown): string {
  if (err instanceof Error) {
    if (
      err.message.includes('Failed to fetch') ||
      err.message.includes('NetworkError') ||
      err.message.includes('Failed to connect')
    ) {
      return `Cannot connect to ${remoteName} remote server. Make sure the remote dev server is running.`;
    }
    if (err.message.includes('Unknown remote')) {
      return `Remote configuration not found for ${remoteName}. Check remote-configs.json.`;
    }
    return err.message;
  }
  return 'Failed to load remote';
}

/**
 * Component that loads a remote module via Module Federation at runtime.
 * Retries are centralized in the loader; this component calls loadRemoteComponent once
 * and shows a Retry button on error.
 */
export function ModuleFederationRemote({
  remoteName,
  session,
  routingProps,
  fallback = <RemoteSkeleton />,
}: ModuleFederationRemoteProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadComponent = useCallback(async () => {
    const store = getShellStore();
    store.getState().setRemoteLoading(remoteName, true);
    store.getState().setRemoteError(remoteName, null);
    setError(null);
    setIsLoading(true);

    try {
      const RemoteComponent = await loadRemoteComponent(remoteName);
      setComponent(() => RemoteComponent);
      setIsLoading(false);
      store.getState().setRemoteLoaded(remoteName, true);
      store.getState().setRemoteLoading(remoteName, false);
    } catch (err) {
      console.error(`Failed to load remote ${remoteName}:`, err);
      const errorMessage = getErrorMessage(remoteName, err);
      setError(errorMessage);
      setIsLoading(false);
      store.getState().setRemoteError(remoteName, errorMessage);
      store.getState().setRemoteLoading(remoteName, false);
    }
  }, [remoteName]);

  useEffect(() => {
    loadComponent();
  }, [loadComponent]);

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <div className="text-destructive text-center">
          <p className="font-semibold">Failed to load {remoteName} remote</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <Button variant="outline" onClick={loadComponent}>
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading || !Component) {
    return <>{fallback}</>;
  }

  if (!session) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Not authenticated</div>
      </div>
    );
  }

  return (
    <Suspense fallback={fallback}>
      <Component session={session} routingProps={routingProps} />
    </Suspense>
  );
}
