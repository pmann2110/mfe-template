import Link from 'next/link';
import { AccessDeniedView, Button } from '@repo/ui';

export default function AccessDeniedPage() {
  return (
    <AccessDeniedView
      description="Admin is for platform users only. Your account is not in the platform organization."
      body={
        <p>
          Use your organization&apos;s app to manage users and settings for your
          org.
        </p>
      }
      actionAsChild={
        <Button asChild>
          <Link href="/api/auth/signout">Sign out</Link>
        </Button>
      }
    />
  );
}
