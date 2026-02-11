import { Button, Input } from '@repo/ui';

interface UserListHeaderProps {
  canWrite: boolean;
  onCreate: () => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  selectedCount?: number;
  onBulkDelete?: () => void;
}

export function UserListHeader({
  canWrite,
  onCreate,
  search = '',
  onSearchChange,
  selectedCount = 0,
  onBulkDelete,
}: UserListHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
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
      <div className="flex flex-wrap items-center gap-4">
        {onSearchChange && (
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-sm"
            aria-label="Search users"
          />
        )}
        {canWrite && selectedCount > 0 && onBulkDelete && (
          <Button variant="destructive" size="sm" onClick={onBulkDelete}>
            Delete selected ({selectedCount})
          </Button>
        )}
      </div>
    </div>
  );
}
