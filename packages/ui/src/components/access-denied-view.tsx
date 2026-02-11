import * as React from 'react';
import { ShieldX } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { cn } from '../lib/utils';

export interface AccessDeniedViewProps {
  /** Card title. */
  title?: string;
  /** Card description. */
  description?: string;
  /** Optional extra body text. */
  body?: React.ReactNode;
  /** CTA label (e.g. "Sign out"). */
  actionLabel?: string;
  /** CTA href (e.g. "/api/auth/signout"). */
  actionHref?: string;
  /** Or CTA click handler. */
  onAction?: () => void;
  /** Optional class for the wrapper. */
  className?: string;
  /** Render action as child (e.g. Next.js Link). */
  actionAsChild?: React.ReactNode;
}

export function AccessDeniedView({
  title = 'Access Denied',
  description = "You don't have permission to view this page.",
  body,
  actionLabel = 'Sign out',
  actionHref,
  onAction,
  className,
  actionAsChild,
}: AccessDeniedViewProps): React.ReactElement {
  const action =
    actionAsChild ??
    (actionHref != null ? (
      <Button asChild>
        <a href={actionHref}>{actionLabel}</a>
      </Button>
    ) : onAction != null ? (
      <Button onClick={onAction}>{actionLabel}</Button>
    ) : null);

  return (
    <div
      className={cn(
        'flex min-h-[60vh] items-center justify-center p-4',
        className,
      )}
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldX className="h-6 w-6 text-destructive" aria-hidden />
            <CardTitle>{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {body != null && (
            <div className="text-sm text-muted-foreground">{body}</div>
          )}
          {action}
        </CardContent>
      </Card>
    </div>
  );
}
