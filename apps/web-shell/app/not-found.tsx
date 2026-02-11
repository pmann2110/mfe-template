import Link from 'next/link';
import { Button, NotFoundView } from '@repo/ui';

export default function NotFound() {
  return (
    <NotFoundView
      actionAsChild={
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      }
    />
  );
}
