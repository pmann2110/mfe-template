/**
 * Shared routing contract between shell and remote modules
 * This ensures type safety and consistency when passing routing information
 * from the Next.js shell to the React remotes
 */
export interface RoutingProps {
  mode: 'hosted';
  basePath: string;
  pathname: string;
  search: string;
  onNavigate: (to: string) => void;
}