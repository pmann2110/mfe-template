'use client';

import { useEffect } from 'react';
import { ErrorState } from '@repo/ui';

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
    <ErrorState
      title="Something went wrong"
      message={error.message || 'An unexpected error occurred.'}
      onRetry={reset}
      className="min-h-[50vh]"
    />
  );
}
