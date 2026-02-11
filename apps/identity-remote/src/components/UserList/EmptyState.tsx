import { Button } from '@repo/ui';

interface EmptyStateProps {
  canWrite: boolean;
  onCreate: () => void;
}

export function EmptyState({ canWrite, onCreate }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-6 shadow-inner">
        <svg className="h-12 w-12 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
      <h3 className="text-2xl font-semibold mb-2">No users yet</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        {canWrite 
          ? 'Get started by adding your first user to the system.' 
          : 'Users will appear here when they are added to the system.'}
      </p>
      {canWrite && (
        <Button onClick={onCreate} size="lg" className="gap-2 shadow-md">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add First User
        </Button>
      )}
    </div>
  );
}
