import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui';
import type { User } from '@repo/api-contracts';
import { UserTableRow } from './UserTableRow';
import { EmptyState } from './EmptyState';

interface UserTableProps {
  users: User[];
  canWrite: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export function UserTable({ users, canWrite, onEdit, onDelete, onCreate }: UserTableProps) {
  if (users.length === 0) {
    return <EmptyState canWrite={canWrite} onCreate={onCreate} />;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b bg-muted/40">
            <TableHead className="font-bold text-foreground/90">Name</TableHead>
            <TableHead className="font-bold text-foreground/90">Email</TableHead>
            <TableHead className="font-bold text-foreground/90">Role</TableHead>
            <TableHead className="font-bold text-foreground/90 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <UserTableRow
              key={user.id}
              user={user}
              index={index}
              canWrite={canWrite}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
