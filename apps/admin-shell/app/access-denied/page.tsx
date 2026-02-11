import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import Link from 'next/link';
import { Button } from '@repo/ui';

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            Admin is for platform users only. Your account is not in the platform
            organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Use your organization&apos;s app to manage users and settings for
            your org.
          </p>
          <Button asChild>
            <Link href="/api/auth/signout">Sign out</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
