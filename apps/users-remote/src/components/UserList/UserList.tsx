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
}

export function UserList({ users, canWrite, onEdit, onDelete, onCreate }: UserListProps) {
  return (
    <>
      <UserListHeader canWrite={canWrite} onCreate={onCreate} />

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
                {users.length} user{users.length !== 1 ? 's' : ''} registered
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <UserTable
            users={users}
            canWrite={canWrite}
            onEdit={onEdit}
            onDelete={onDelete}
            onCreate={onCreate}
          />
        </CardContent>
      </Card>
    </>
  );
}
