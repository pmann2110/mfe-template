'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@repo/ui';
import { Building2 } from 'lucide-react';
import type { Session } from 'next-auth';

interface AccountContentProps {
  session: Session;
}

export function AccountContent({ session }: AccountContentProps) {
  return (
    <div className="container py-20">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Account</h1>
        <Button variant="outline" asChild>
          <Link href="/account/org" className="gap-2">
            <Building2 className="h-4 w-4" />
            Manage organization
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your account</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">{session.user.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Name</p>
            <p className="text-sm text-muted-foreground">{session.user.name}</p>
          </div>
          {session.user.permissions && session.user.permissions.length > 0 && (
            <div>
              <p className="text-sm font-medium">Permissions</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {session.user.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
