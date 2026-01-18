import { useEffect, useState } from 'react';
import './globals.css';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from '@repo/ui';
import type { User, CreateUserRequest, UpdateUserRequest } from '@repo/api-contracts';
import { mockUserApi } from './data/mock-users';
import type { Session as CoreSession } from '@repo/auth-core';
import { getShellStore } from '@repo/stores';
import { useUsersUIStore } from './state/users-ui-store';

interface UsersAppProps {
  session: CoreSession | null;
}

export default function UsersApp({ session }: UsersAppProps) {
  // Use Zustand store for UI state
  const {
    users,
    loading,
    dialogOpen,
    editingUser,
    formData,
    setUsers,
    setLoading,
    openDialog,
    closeDialog,
    setEditingUser,
    setFormData,
    resetForm,
  } = useUsersUIStore();

  // Local state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Permission check based on session
  const canWrite = session?.user?.permissions?.includes('user:write') || false;

  // Form validation
  const isFormValid = formData.name.trim() && formData.email.trim() && formData.role.trim();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await mockUserApi.list();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    resetForm();
    openDialog();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      role: user.role,
    });
    openDialog();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const userToDelete = users.find(u => u.id === id);
      await mockUserApi.delete(id);
      getShellStore().getState().addNotification({
        type: 'warning',
        title: 'User Deleted',
        message: `${userToDelete?.name || 'User'} has been removed from the system.`,
      });
      await loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;
    
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await mockUserApi.update(editingUser.id, formData as UpdateUserRequest);
        getShellStore().getState().addNotification({
          type: 'success',
          title: 'User Updated',
          message: `${formData.name}'s profile has been updated successfully.`,
        });
      } else {
        await mockUserApi.create(formData);
        getShellStore().getState().addNotification({
          type: 'success',
          title: 'User Created',
          message: `${formData.name} has been added to the system.`,
        });
      }
      closeDialog();
      await loadUsers();
    } catch (error) {
      console.error('Failed to save user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Not authenticated</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-10 w-40 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-lg" />
            <div className="h-6 w-64 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-lg" />
          </div>
          <div className="h-10 w-28 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-lg" />
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="h-7 w-28 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-lg mb-2" />
            <div className="h-5 w-36 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-lg" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="h-5 w-32 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded" />
                  <div className="h-5 w-48 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded" />
                  <div className="h-5 w-20 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded" />
                  <div className="h-5 w-24 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded ml-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
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
            onClick={() => {
              handleCreate();
            }}
            className="gap-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </Button>
        )}
      </div>

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
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-6 shadow-inner">
                <svg className="h-12 w-12 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-2">No users yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                {canWrite 
                  ? 'Get started by adding your first user to the system.' 
                  : 'Users will appear here when they are added to the system.'}
              </p>
              {canWrite && (
                <Button onClick={handleCreate} size="lg" className="gap-2 shadow-md">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add First User
                </Button>
              )}
            </div>
          ) : (
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
                    <TableRow 
                      key={user.id} 
                      className="hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/20 transition-all duration-200 group border-b"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-semibold text-foreground py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 font-bold text-primary shadow-sm">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          {user.name}
                        </div>
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
                                onClick={() => handleEdit(user)}
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
                                onClick={() => handleDelete(user.id)}
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
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          return open ? openDialog() : closeDialog();
        }}
      >
        <DialogContent className="shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingUser ? 'Edit User' : 'Create New User'}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Update the user information below.'
                : 'Fill in the details to create a new user account.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                Full Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter full name"
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="user@example.com"
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-semibold">
                Role *
              </Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                placeholder="admin, manager, viewer"
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground">
                Common roles: admin, manager, viewer
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={closeDialog}
              className="hover:bg-accent"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !isFormValid}
              className="gap-2 shadow-md"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {editingUser ? 'Update User' : 'Create User'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
