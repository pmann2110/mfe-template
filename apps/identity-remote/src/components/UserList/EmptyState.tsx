import { Button } from '@repo/ui';
import { Users, UserPlus } from 'lucide-react';

interface EmptyStateProps {
  canWrite: boolean;
  onCreate: () => void;
}

export function EmptyState({ canWrite, onCreate }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
        <Users className="h-12 w-12 text-primary/60" />
      </div>
      <h3 className="mb-2 text-2xl font-semibold">No users yet</h3>
      <p className="mb-6 max-w-md text-center text-muted-foreground">
        {canWrite
          ? 'Get started by adding your first user to the system.'
          : 'Users will appear here when they are added to the system.'}
      </p>
      {canWrite && (
        <Button onClick={onCreate} size="lg" className="gap-2">
          <UserPlus className="h-5 w-5" />
          Add First User
        </Button>
      )}
    </div>
  );
}
