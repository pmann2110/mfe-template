import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { RoutingProps } from '@repo/api-contracts';

interface RouterSyncProps {
  routingProps?: RoutingProps;
}

/**
 * Component that synchronizes React Router navigation with the shell's router
 * Used in hosted mode to maintain bidirectional navigation sync between
 * the remote app's internal router and the shell's browser URL
 */
export function RouterSync({ routingProps }: RouterSyncProps): null {
  const location = useLocation();
  const navigate = useNavigate();
  const isInitialMount = useRef(true);
  const lastNotifiedPath = useRef<string | null>(null);

  // Sync remote router when shell pathname changes (shell navigation/back/forward)
  useEffect(() => {
    if (routingProps?.mode === 'hosted') {
      const expectedPath =
        routingProps.pathname + (routingProps.search ? `?${routingProps.search}` : '');
      const currentPath = location.pathname + (location.search ? `?${location.search}` : '');

      if (currentPath !== expectedPath) {
        lastNotifiedPath.current = expectedPath;
        void navigate(expectedPath, { replace: true });
      }
    }
  }, [routingProps?.pathname, routingProps?.search, navigate, location.pathname, location.search]);

  // Notify shell when remote navigates (remote -> shell)
  useEffect(() => {
    if (routingProps?.mode !== 'hosted') return;

    const onNavigate = routingProps.onNavigate;
    const currentPath = location.pathname + (location.search ? `?${location.search}` : '');
    const expectedPath =
      routingProps.pathname + (routingProps.search ? `?${routingProps.search}` : '');

    if (isInitialMount.current) {
      isInitialMount.current = false;
      lastNotifiedPath.current = currentPath;
      return;
    }

    if (
      currentPath !== lastNotifiedPath.current &&
      currentPath !== expectedPath
    ) {
      lastNotifiedPath.current = currentPath;
      onNavigate(currentPath);
    }
  }, [
    location.pathname,
    location.search,
    routingProps?.mode,
    routingProps?.onNavigate,
    routingProps?.pathname,
    routingProps?.search,
  ]);

  return null;
}
