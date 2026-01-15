'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import type { Session } from 'next-auth';

interface AccountContentProps {
  session: Session;
}

export function AccountContent({ session }: AccountContentProps) {
  return (
    <div className="container py-20">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
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
