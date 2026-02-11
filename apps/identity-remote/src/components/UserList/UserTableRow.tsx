import { Link } from 'react-router-dom';
import { Button, TableCell, TableRow, Badge } from '@repo/ui';
import { Pencil, Trash2 } from 'lucide-react';
import type { User } from '@repo/api-contracts';
import { getRoleBadgeClassName } from '../../lib/role-badge';

interface UserTableRowProps {
  user: User;
  index: number;
  canWrite: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

export function UserTableRow({ user, index, canWrite, onEdit, onDelete }: UserTableRowProps) {
  return (
    <TableRow 
      className="hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/20 transition-all duration-200 group border-b"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <TableCell className="font-semibold text-foreground py-4">
        <Link 
          to={`/users/${user.id}`}
          className="flex items-center gap-3 hover:text-primary transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 font-bold text-primary shadow-sm">
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <span className="hover:underline">{user.name}</span>
        </Link>
      </TableCell>
      <TableCell className="text-muted-foreground">{user.email}</TableCell>
      <TableCell>
        <Badge variant="secondary" className={getRoleBadgeClassName(user.role ?? '')}>
          {user.role ?? '—'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {canWrite && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(user)}
                className="gap-1 hover:bg-primary/10 hover:text-primary"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(user.id)}
                className="gap-1 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
