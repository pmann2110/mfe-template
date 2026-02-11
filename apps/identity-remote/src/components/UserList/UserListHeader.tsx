import { Button, Input } from '@repo/ui';
import { UserPlus } from 'lucide-react';

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
          <h1 className="text-3xl font-bold tracking-tight">
            Users
          </h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        {canWrite && (
          <Button onClick={onCreate} className="gap-2">
            <UserPlus className="h-4 w-4" />
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
