import { Card, CardContent, CardHeader } from '@repo/ui';

export function UserListSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-10 w-40 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-lg" />
          <div className="h-6 w-64 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-lg" />
        </div>
        <div className="h-10 w-28 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-lg" />
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="h-7 w-28 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-lg mb-2" />
          <div className="h-5 w-36 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-lg" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="h-5 w-32 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded" />
                <div className="h-5 w-48 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded" />
                <div className="h-5 w-20 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded" />
                <div className="h-5 w-24 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded ml-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
