import { useEffect, useState } from 'react';
import './globals.css';
import {
  BrowserRouter,
  MemoryRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import type { User, UpdateUserRequest } from '@repo/api-contracts';
import { userApi } from './data/user-api';
import { roleApi } from './data/role-api';
import { setUserRoleInOrganization } from './data/membership-api';
import type { Session as CoreSession } from '@repo/auth-core';
import { getShellStore, useShellStore } from '@repo/stores';
import { useUsersUIStore } from './state/users-ui-store';
import type { RoutingProps } from '@repo/api-contracts';
import { StandaloneAuthProvider, useStandaloneAuth, RouterSync } from '@repo/remote-utils';
import { createMockSession } from './providers/createMockSession';
import { UserDetails } from './components/UserDetails/UserDetails';
import { UserList } from './components/UserList/UserList';
import { UserListSkeleton } from './components/UserList/UserListSkeleton';
import { UserFormDialog } from './components/UserFormDialog/UserFormDialog';
import { RoleManagementView } from './components/RoleManagement/RoleManagementView';
import { OrgOverview } from './components/OrganizationManagement/OrgOverview';
import { OrgList } from './components/OrganizationManagement/OrgList';
import { OrgSettings } from './components/OrganizationManagement/OrgSettings';
import { IdentityLayout } from './components/IdentityLayout';
import { IdentityModeProvider } from './context/IdentityModeContext';
import {
  getOrgsForUser,
  getOrgAsTenantMetadata,
  getCurrentUserPermissions,
  getRoleInOrg,
  MOCK_ORGANIZATIONS,
  isUserInSystemOrg,
} from './data/mock-identity';

const PLATFORM_ADMIN_ORG_PERMISSIONS = [
  'user:read',
  'user:write',
  'role:read',
  'role:write',
  'org-settings:read',
  'org-settings:write',
];

interface UsersAppProps {
  session: CoreSession | null;
  routingProps?: RoutingProps;
}

/**
 * Hosted mode: session comes from host; never call useStandaloneAuth (no provider in tree).
 * Standalone mode: wrap in StandaloneAuthProvider and use useStandaloneAuth so one React + valid context.
 */
export default function UsersApp(props: UsersAppProps) {
  if (props.routingProps !== undefined) {
    return <UsersAppInner session={props.session} routingProps={props.routingProps} />;
  }
  return (
    <StandaloneAuthProvider createMockSession={createMockSession}>
      <UsersAppStandalone />
    </StandaloneAuthProvider>
  );
}

function UsersAppStandalone() {
  const session = useStandaloneAuth();
  return <UsersAppInner session={session} routingProps={undefined} />;
}

function UsersAppInner({
  session,
  routingProps,
}: {
  session: CoreSession | null;
  routingProps: RoutingProps | undefined;
}) {

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
  // Org roles for the current tenant (for user form role select)
  const [orgRoles, setOrgRoles] = useState<Awaited<ReturnType<typeof roleApi.list>>>([]);

  const tenantId = useShellStore((s) => s.tenant.tenantId);
  const setAvailableTenants = useShellStore((s) => s.setAvailableTenants);
  const setTenantId = useShellStore((s) => s.setTenantId);
  const setTenantMetadata = useShellStore((s) => s.setTenantMetadata);
  const setCurrentOrgPermissions = useShellStore((s) => s.setCurrentOrgPermissions);

  // Platform vs tenant mode: set availableTenants and default tenant from basePath
  useEffect(() => {
    if (!session?.user?.id || !routingProps?.basePath) return;
    const basePath = routingProps.basePath;

    if (basePath.startsWith('/account')) {
      // Tenant mode: only user's orgs, default to first
      const orgs = getOrgsForUser(session.user.id).map(getOrgAsTenantMetadata);
      setAvailableTenants(orgs);
      if (orgs.length > 0 && !tenantId) {
        const first = orgs[0]!;
        setTenantId(first.id);
        setTenantMetadata(first);
        setCurrentOrgPermissions(
          getCurrentUserPermissions(session.user.id, first.id)
        );
      }
    } else if (basePath.startsWith('/admin')) {
      // Platform mode: all orgs, default to first or last-selected (sessionStorage) so Users/Roles have an org selected
      const orgs = MOCK_ORGANIZATIONS.map(getOrgAsTenantMetadata);
      setAvailableTenants(orgs);
      if (orgs.length > 0 && !tenantId) {
        const stored =
          typeof sessionStorage !== 'undefined'
            ? sessionStorage.getItem('identity-selected-org')
            : null;
        const defaultOrg =
          stored && orgs.some((o) => o.id === stored)
            ? orgs.find((o) => o.id === stored)!
            : orgs[0]!;
        setTenantId(defaultOrg.id);
        setTenantMetadata(defaultOrg);
        setCurrentOrgPermissions(
          isUserInSystemOrg(session.user.id)
            ? PLATFORM_ADMIN_ORG_PERMISSIONS
            : getCurrentUserPermissions(session.user.id, defaultOrg.id)
        );
      }
    }
  }, [
    session?.user?.id,
    routingProps?.basePath,
    setAvailableTenants,
    tenantId,
    setTenantId,
    setTenantMetadata,
    setCurrentOrgPermissions,
  ]);

  // Permission check based on session
  const canWrite = session?.user?.permissions?.includes('user:write') || false;

  // Form validation: name and email required; when org-scoped, role (roleId) required
  const isFormValid =
    Boolean(formData.name.trim() && formData.email.trim()) &&
    (tenantId && orgRoles.length > 0 ? Boolean(formData.role.trim()) : Boolean(formData.role.trim()));

  useEffect(() => {
    loadUsers();
  }, [tenantId]);

  useEffect(() => {
    if (!tenantId) {
      setOrgRoles([]);
      return;
    }
    roleApi.list(tenantId).then(setOrgRoles).catch(() => setOrgRoles([]));
  }, [tenantId]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userApi.list(tenantId ?? undefined);
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
    if (tenantId && orgRoles.length > 0) {
      setFormData({ email: '', name: '', role: '' });
    }
    openDialog();
  };

  const handleEdit = async (user: User) => {
    setEditingUser(user);
    // Ensure we have org roles for the current tenant (e.g. after switching org)
    let rolesForOrg = orgRoles;
    if (tenantId && rolesForOrg.length === 0) {
      rolesForOrg = await roleApi.list(tenantId);
      setOrgRoles(rolesForOrg);
    }
    const roleInOrg = tenantId ? getRoleInOrg(user.id, tenantId) : null;
    const roleId = roleInOrg?.roleId ?? '';
    const validRoleId =
      roleId && rolesForOrg.some((r) => r.id === roleId) ? roleId : '';
    setFormData({
      email: user.email,
      name: user.name,
      role: validRoleId,
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

  const handleBulkDelete = async (ids: string[]) => {
    if (ids.length === 0 || !confirm(`Delete ${ids.length} user(s)?`)) return;
    try {
      for (const id of ids) {
        await userApi.delete(id);
      }
      getShellStore().getState().addNotification({
        type: 'warning',
        title: 'Users Deleted',
        message: `${ids.length} user(s) have been removed.`,
      });
      await loadUsers();
    } catch (error) {
      console.error('Failed to delete users:', error);
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      if (editingUser) {
        await userApi.update(editingUser.id, formData as UpdateUserRequest);
        if (tenantId && formData.role.trim()) {
          await setUserRoleInOrganization(editingUser.id, tenantId, formData.role.trim());
        }
        getShellStore().getState().addNotification({
          type: 'success',
          title: 'User Updated',
          message: `${formData.name}'s profile has been updated successfully.`,
        });
      } else {
        const newUser = await userApi.create(formData);
        if (tenantId && formData.role.trim()) {
          await setUserRoleInOrganization(newUser.id, tenantId, formData.role.trim());
        }
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

  // Derive identity mode from basePath for OrgSwitcher/OrgList permission override
  const identityMode =
    routingProps?.basePath != null
      ? routingProps.basePath.startsWith('/admin')
        ? ('platform' as const)
        : ('tenant' as const)
      : null;

  // Show not authenticated message if session is missing (hosted mode without auth)
  if (!session) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Not authenticated</div>
      </div>
    );
  }

  return (
    <IdentityModeProvider mode={identityMode}>
    <RouterComponent
      key={routerKey}
      initialEntries={initialEntries}
    >
      <RouterSync routingProps={routingProps} />
      <Routes>
        <Route path="/" element={<Navigate to="/orgs" replace />} />
        <Route element={<IdentityLayout />}>
          <Route path="/orgs" element={<OrgList />} />
          <Route path="/roles" element={<RoleManagementView />} />
          <Route path="/users" element={
            loading ? (
              <UserListSkeleton />
            ) : (
              <>
                <UserList
                  users={users}
                  canWrite={canWrite}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onCreate={handleCreate}
                  onBulkDelete={handleBulkDelete}
                  organizationId={tenantId}
                />
                <UserFormDialog
                  open={dialogOpen}
                  onOpenChange={(open) => {
                    if (open) openDialog();
                    else closeDialog();
                  }}
                  editingUser={editingUser}
                  formData={formData}
                  isSubmitting={isSubmitting}
                  isFormValid={isFormValid}
                  onFormDataChange={setFormData}
                  onSubmit={handleSubmit}
                  orgRoles={orgRoles}
                  organizationId={tenantId}
                />
              </>
            )
          } />
          <Route path="/users/:id" element={
            loading ? (
              <UserListSkeleton />
            ) : (
              <UserDetails
                users={users}
                canWrite={canWrite}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )
          } />
          <Route path="/orgs/overview" element={<OrgOverview />} />
          <Route path="/orgs/settings" element={<OrgSettings />} />
        </Route>
      </Routes>
    </RouterComponent>
    </IdentityModeProvider>
  );
}
