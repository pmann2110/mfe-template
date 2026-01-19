import { Button } from '@repo/ui';

interface UserListHeaderProps {
  canWrite: boolean;
  onCreate: () => void;
}

export function UserListHeader({ canWrite, onCreate }: UserListHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
          Users
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage user accounts and permissions
        </p>
      </div>
      {canWrite && (
        <Button 
          onClick={onCreate}
          className="gap-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </Button>
      )}
    </div>
  );
}
