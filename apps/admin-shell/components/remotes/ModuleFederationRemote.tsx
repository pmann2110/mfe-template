'use client';

import { useEffect, useState, Suspense } from 'react';
import { Card, CardContent, CardHeader } from '@repo/ui';
import { loadRemoteComponent } from '../../lib/module-federation-loader';
import type { Session as CoreSession } from '@repo/auth-core';

interface ModuleFederationRemoteProps {
  remoteName: 'users' | 'products';
  session: CoreSession | null;
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

/**
 * Component that loads a remote module via Module Federation at runtime
 */
export function ModuleFederationRemote({
  remoteName,
  session,
  fallback = <RemoteSkeleton />,
}: ModuleFederationRemoteProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadComponent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const RemoteComponent = await loadRemoteComponent(remoteName);
        
        if (mounted) {
          setComponent(() => RemoteComponent);
          setIsLoading(false);
        }
      } catch (err) {
        console.error(`Failed to load remote ${remoteName}:`, err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load remote');
          setIsLoading(false);
        }
        // Implement retry logic with exponential backoff
        const maxRetries = 3;
        const baseDelay = 1000; // 1 second
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
          console.warn(
            `[MF] Attempt ${attempt + 1} of ${maxRetries}: Retrying to load remote ${remoteName} in ${delay}ms...`,
            err,
          );
          await new Promise((r) => setTimeout(r, delay));
          try {
            const RemoteComponent = await loadRemoteComponent(remoteName);
            if (mounted) {
              setComponent(() => RemoteComponent);
              setIsLoading(false);
              setError(null);
              break;
            }
          } catch (retryErr) {
            if (attempt === maxRetries - 1) {
              console.error(
                `[MF] Failed to load remote ${remoteName} after ${maxRetries} attempts.`,
                retryErr,
              );
            }
          }
        }
      }
    };

    loadComponent();

    return () => {
      mounted = false;
    };
  }, [remoteName]);

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-destructive">
          <p className="font-semibold">Failed to load {remoteName} remote</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
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
      <Component session={session} />
    </Suspense>
  );
}
