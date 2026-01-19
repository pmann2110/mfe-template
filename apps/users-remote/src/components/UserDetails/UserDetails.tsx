import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Label, Badge } from '@repo/ui';
import type { User } from '@repo/api-contracts';

interface UserDetailsProps {
  users: User[];
  canWrite: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

export function UserDetails({ users, canWrite, onEdit, onDelete }: UserDetailsProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = users.find(u => u.id === id);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="text-destructive mb-4">
          <h2 className="text-2xl font-semibold">User not found</h2>
          <p className="text-muted-foreground mt-2">The user you're looking for doesn't exist.</p>
        </div>
        <Button onClick={() => navigate('/')} variant="outline">
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Users
        </Button>
      </div>

      <Card className="shadow-xl border-0 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 font-bold text-2xl text-primary shadow-lg">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <CardTitle className="text-3xl">{user.name}</CardTitle>
              <CardDescription className="text-base mt-1">{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground">User ID</Label>
              <p className="text-lg font-mono">{user.id}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground">Role</Label>
              <div>
                <Badge
                  variant="default"
                  className={`capitalize shadow-sm font-medium text-base px-3 py-1 ${
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
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground">Created At</Label>
              <p className="text-lg">{new Date(user.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground">Last Updated</Label>
              <p className="text-lg">{new Date(user.updatedAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
          </div>
          {canWrite && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={() => onEdit(user)}
                className="gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit User
              </Button>
              <Button
                variant="destructive"
                onClick={() => onDelete(user.id)}
                className="gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete User
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
