import * as React from 'react';
import { cn } from '../../lib/utils';

export interface AppSidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** Logo/brand area (e.g. icon + app name). */
  logo?: React.ReactNode;
  /** Main nav content (links, etc.). */
  children: React.ReactNode;
}

const AppSidebar = React.forwardRef<HTMLElement, AppSidebarProps>(
  ({ logo, children, className, ...props }, ref) => {
    return (
      <aside
        ref={ref as React.RefObject<HTMLDivElement>}
        className={cn(
          'flex w-56 flex-col border-r border-border/60 bg-card',
          className,
        )}
        {...props}
      >
        {logo != null && (
          <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border/60 px-4">
            {logo}
          </div>
        )}
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2" aria-label="Main navigation">
          {children}
        </nav>
      </aside>
    );
  },
);
AppSidebar.displayName = 'AppSidebar';

export { AppSidebar };
