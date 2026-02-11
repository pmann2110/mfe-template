import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import { Users } from 'lucide-react';
import type { User } from '@repo/api-contracts';
import { UserListHeader } from './UserListHeader';
import { UserTable } from './UserTable';

interface UserListProps {
  users: User[];
  canWrite: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onBulkDelete?: (ids: string[]) => void;
  /** When set, role column shows org role from membership. */
  organizationId?: string | null;
}

export function UserList({
  users,
  canWrite,
  onEdit,
  onDelete,
  onCreate,
  onBulkDelete,
  organizationId,
}: UserListProps) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.trim().toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  const handleBulkDelete = () => {
    if (selectedIds.length === 0 || !onBulkDelete) return;
    onBulkDelete(selectedIds);
    setSelectedIds([]);
  };

  return (
    <>
      <UserListHeader
        canWrite={canWrite}
        onCreate={onCreate}
        search={search}
        onSearchChange={setSearch}
        selectedCount={selectedIds.length}
        onBulkDelete={selectedIds.length > 0 ? handleBulkDelete : undefined}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users className="h-6 w-6 text-primary" />
                User Directory
              </CardTitle>
              <CardDescription className="mt-1 text-base">
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} registered
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <UserTable
            users={filteredUsers}
            canWrite={canWrite}
            onEdit={onEdit}
            onDelete={onDelete}
            onCreate={onCreate}
            organizationId={organizationId}
            selectedIds={selectedIds}
            onSelectionChange={canWrite ? setSelectedIds : undefined}
          />
        </CardContent>
      </Card>
    </>
  );
}
