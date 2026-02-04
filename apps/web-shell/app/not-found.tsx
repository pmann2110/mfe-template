import Link from 'next/link';
import { Button } from '@repo/ui';

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="text-muted-foreground">This page could not be found.</p>
      <Button asChild variant="outline">
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
