import { Link } from 'react-router-dom';
import { Button, TableCell, TableRow, Badge } from '@repo/ui';
import type { User } from '@repo/api-contracts';

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
          to={`/${user.id}`}
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
        <Badge
          variant="default"
          className={`capitalize shadow-sm font-medium ${
            user.role === 'admin' 
              ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-800' 
              : user.role === 'manager'
              ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800'
              : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
          }`}
        >
          <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${
            user.role === 'admin' ? 'bg-purple-500' : user.role === 'manager' ? 'bg-blue-500' : 'bg-gray-400'
          }`} />
          {user.role}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {canWrite && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(user)}
                className="hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(user.id)}
                className="hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
