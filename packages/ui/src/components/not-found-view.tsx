import * as React from 'react';
import { FileQuestion } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

export interface NotFoundViewProps {
  /** Optional title override. */
  title?: string;
  /** Optional description override. */
  description?: string;
  /** CTA label (e.g. "Go home"). */
  actionLabel?: string;
  /** CTA href or click handler. If string, renders as link; if function, as button. */
  onAction?: () => void;
  actionHref?: string;
  /** Optional class for the container. */
  className?: string;
  /** Render the action as a child (e.g. Next.js Link). */
  actionAsChild?: React.ReactNode;
}

export function NotFoundView({
  title = '404',
  description = 'This page could not be found.',
  actionLabel = 'Go home',
  onAction,
  actionHref,
  className,
  actionAsChild,
}: NotFoundViewProps): React.ReactElement {
  const action =
    actionAsChild ?? (actionHref != null ? (
      <Button variant="outline" asChild>
        <a href={actionHref}>{actionLabel}</a>
      </Button>
    ) : onAction != null ? (
      <Button variant="outline" onClick={onAction}>
        {actionLabel}
      </Button>
    ) : null);

  return (
    <div
      className={cn(
        'flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center',
        className,
      )}
    >
      <FileQuestion
        className="h-16 w-16 text-muted-foreground"
        aria-hidden
      />
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="max-w-md text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
