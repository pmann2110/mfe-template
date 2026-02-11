import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
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

      <Card className="shadow-xl border-0 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                User Directory
              </CardTitle>
              <CardDescription className="text-base mt-1">
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
