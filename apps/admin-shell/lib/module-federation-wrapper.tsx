'use client';

import { useEffect, useState } from 'react';

/**
 * Wrapper component to handle Module Federation remotes safely
 * This prevents React hook errors during SSR and client-side hydration
 */
export function ModuleFederationWrapper({
  children
}: {
  children: React.ReactNode
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Return null during SSR to prevent hook errors
    return null;
  }

  return <>{children}</>;
}

/**
 * Lazy load a remote component with proper error handling
 */
export function useRemoteComponent<T = any>(
  remoteName: string,
  componentName: string
): T | null {
  const [component, setComponent] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        // Check if the remote is available
        if (typeof window !== 'undefined' && (window as any)[remoteName]) {
          const remote = (window as any)[remoteName];
          if (remote && typeof remote.get === 'function') {
            const module = await remote.get(componentName);
            const Component = await module();
            setComponent(Component);
          } else {
            setError(`Remote ${remoteName} does not have get method`);
          }
        } else {
          setError(`Remote ${remoteName} not available`);
        }
      } catch (err) {
        console.error(`Failed to load remote component ${componentName} from ${remoteName}:`, err);
        setError(`Failed to load ${componentName}`);
      }
    };

    loadComponent();
  }, [remoteName, componentName]);

  if (error) {
    console.warn(error);
    return null;
  }

  return component;
}