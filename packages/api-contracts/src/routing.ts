/**
 * Shared routing contract between shell and remote modules.
 * Ensures type safety when passing routing from the Next.js shell to React remotes.
 */

/**
 * Hosted mode: remote is embedded in shell; shell controls URL and provides onNavigate.
 * This is the shape passed when the remote runs inside a shell.
 */
export interface RoutingProps {
  mode: 'hosted';
  basePath: string;
  pathname: string;
  search: string;
  onNavigate: (to: string) => void;
}

/**
 * Standalone mode: remote runs alone (e.g. dev without shell).
 * When routingProps is undefined, the remote is in standalone mode.
 */
export interface RoutingPropsStandalone {
  mode: 'standalone';
}

/**
 * Props passed from shell to a federated remote app.
 * Remotes expose a single default export (React component) that accepts these props.
 * When routingProps is undefined, the remote is in standalone mode.
 * TSession is the session type (e.g. Session from auth-core). Default unknown for contract-only usage.
 */
export interface RemoteAppProps<TSession = unknown> {
  session: TSession | null;
  /** Omitted in standalone mode; provided in hosted mode. */
  routingProps?: RoutingProps;
}