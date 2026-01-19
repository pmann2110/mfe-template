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
export function RouterSync({ routingProps }: RouterSyncProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isInitialMount = useRef(true);
  const lastNotifiedPath = useRef<string | null>(null);

  // Sync remote router when shell pathname changes (shell navigation/back/forward)
  useEffect(() => {
    if (routingProps?.mode === 'hosted') {
      const expectedPath = routingProps.pathname + (routingProps.search ? `?${routingProps.search}` : '');
      const currentPath = location.pathname + (location.search ? `?${location.search}` : '');
      
      if (currentPath !== expectedPath) {
        // Update lastNotifiedPath to prevent notification loop
        lastNotifiedPath.current = expectedPath;
        navigate(expectedPath, { replace: true });
      }
    }
  }, [routingProps?.pathname, routingProps?.search, navigate, location.pathname, location.search]);

  // Notify shell when remote navigates (remote -> shell)
  // Only notify if path actually changed and it's not due to sync
  useEffect(() => {
    if (routingProps?.mode === 'hosted' && routingProps.onNavigate) {
      const currentPath = location.pathname + (location.search ? `?${location.search}` : '');
      const expectedPath = routingProps.pathname + (routingProps.search ? `?${routingProps.search}` : '');
      
      // Skip initial mount
      if (isInitialMount.current) {
        isInitialMount.current = false;
        lastNotifiedPath.current = currentPath;
        return;
      }
      
      // Only notify if:
      // 1. Path actually changed
      // 2. It's not the same as what we just notified
      // 3. It's not the same as what shell expects (to avoid sync loops)
      if (
        currentPath !== lastNotifiedPath.current &&
        currentPath !== expectedPath
      ) {
        lastNotifiedPath.current = currentPath;
        routingProps.onNavigate(currentPath);
      }
    }
  }, [location.pathname, location.search, routingProps?.mode, routingProps?.onNavigate, routingProps?.pathname, routingProps?.search]);

  return null;
}
