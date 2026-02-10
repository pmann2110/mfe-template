import { useEffect, useState } from 'react';
import './globals.css';
import {
  BrowserRouter,
  MemoryRouter,
  Routes,
  Route,
} from 'react-router-dom';
import type { User, CreateUserRequest, UpdateUserRequest } from '@repo/api-contracts';
import { userApi } from './data/user-api';
import type { Session as CoreSession } from '@repo/auth-core';
import { getShellStore } from '@repo/stores';
import { useUsersUIStore } from './state/users-ui-store';
import type { RoutingProps } from '@repo/api-contracts';
import { useStandaloneAuth, RouterSync } from '@repo/remote-utils';
import { UserDetails } from './components/UserDetails/UserDetails';
import { UserList } from './components/UserList/UserList';
import { UserListSkeleton } from './components/UserList/UserListSkeleton';
import { UserFormDialog } from './components/UserFormDialog/UserFormDialog';

interface UsersAppProps {
  session: CoreSession | null;
  routingProps?: RoutingProps;
}

export default function UsersApp({ session: propSession, routingProps }: UsersAppProps) {
  // Detect standalone mode: when routingProps is undefined, we're running standalone
  const isStandalone = routingProps === undefined;
  
  // Try to get standalone session (will be null if not in provider)
  const standaloneSession = useStandaloneAuth();
  
  // Use standalone session if available, otherwise use prop session
  // In standalone mode, standaloneSession will be available
  // In hosted mode, propSession will be provided by shell
  const session = standaloneSession ?? propSession;

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
  const isFormValid = Boolean(formData.name.trim() && formData.email.trim() && formData.role.trim());

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userApi.list();
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
      await userApi.delete(id);
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
        await userApi.update(editingUser.id, formData as UpdateUserRequest);
        getShellStore().getState().addNotification({
          type: 'success',
          title: 'User Updated',
          message: `${formData.name}'s profile has been updated successfully.`,
        });
      } else {
        await userApi.create(formData);
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

  // Determine router based on mode
  const RouterComponent = routingProps?.mode === 'hosted' ? MemoryRouter : BrowserRouter;
  const initialEntries = routingProps?.mode === 'hosted' ? [routingProps.pathname + (routingProps.search ? `?${routingProps.search}` : '')] : undefined;

  // Create router key for MemoryRouter to force re-mount when pathname changes
  const routerKey = routingProps?.mode === 'hosted' 
    ? `${routingProps.pathname}${routingProps.search ? `?${routingProps.search}` : ''}`
    : undefined;

  // Show not authenticated message if session is missing (hosted mode without auth)
  if (!session) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Not authenticated</div>
      </div>
    );
  }

  if (loading) {
    return <UserListSkeleton />;
  }

  return (
    <RouterComponent 
      key={routerKey}
      initialEntries={initialEntries}
    >
      <RouterSync routingProps={routingProps} />
      <Routes>
        <Route path="/:id" element={
          <UserDetails
            users={users}
            canWrite={canWrite}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        } />
        <Route path="/" element={
          <>
            <UserList
              users={users}
              canWrite={canWrite}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreate={handleCreate}
            />
            <UserFormDialog
              open={dialogOpen}
              onOpenChange={(open) => {
                if (open) {
                  openDialog();
                } else {
                  closeDialog();
                }
              }}
              editingUser={editingUser}
              formData={formData}
              isSubmitting={isSubmitting}
              isFormValid={isFormValid}
              onFormDataChange={setFormData}
              onSubmit={handleSubmit}
            />
          </>
        } />
      </Routes>
    </RouterComponent>
  );
}
