import * as React from 'react';
import { cn } from '../../lib/utils';

export interface AppHeaderProps extends React.HTMLAttributes<HTMLElement> {
  /** Content for the left side (e.g. breadcrumbs, title). */
  left?: React.ReactNode;
  /** Content for the right side (e.g. theme toggle, notifications, user menu). */
  right?: React.ReactNode;
}

const AppHeader = React.forwardRef<HTMLElement, AppHeaderProps>(
  ({ left, right, className, children, ...props }, ref) => {
    const content =
      children ??
      (left != null || right != null ? (
        <>
          <div className="flex flex-1 items-center gap-4">{left}</div>
          <div className="flex items-center gap-2">{right}</div>
        </>
      ) : null);
    return (
      <header
        ref={ref as React.RefObject<HTMLDivElement>}
        className={cn(
          'flex h-14 shrink-0 min-h-[44px] items-center gap-3 border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80',
          (left != null || right != null) && !children
            ? 'justify-between'
            : 'justify-end',
          className,
        )}
        {...props}
      >
        {content}
      </header>
    );
  },
);
AppHeader.displayName = 'AppHeader';

export { AppHeader };
