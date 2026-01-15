import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import Link from 'next/link';
import { Button } from '@repo/ui';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You don&apos;t have permission to access this resource.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Please contact your administrator if you believe this is an error.
          </p>
          <Button asChild>
            <Link href="/admin">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
