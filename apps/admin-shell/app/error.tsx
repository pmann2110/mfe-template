'use client';

import { useEffect } from 'react';
import { Button } from '@repo/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-xl font-semibold text-destructive">Something went wrong</h2>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <Button variant="outline" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
