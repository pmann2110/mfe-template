import Link from 'next/link';
import { Button, NotFoundView } from '@repo/ui';

export default function NotFound() {
  return (
    <NotFoundView
      actionAsChild={
        <Button asChild variant="outline">
          <Link href="/admin">Go home</Link>
        </Button>
      }
    />
  );
}
