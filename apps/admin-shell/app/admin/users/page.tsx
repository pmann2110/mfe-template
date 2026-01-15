import { redirect } from 'next/navigation';
import { auth, toCoreSession } from '@repo/auth-next';
import { canWithPermissions } from '@repo/rbac';
import { UsersRemote } from '../../../components/remotes/UsersRemote';

export default async function UsersPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Server-side permission check
  if (!canWithPermissions('user:read', session.user.permissions || [])) {
    redirect('/admin/unauthorized');
  }

  // Convert next-auth session to core session for remote
  const coreSession = toCoreSession(session);

  return <UsersRemote session={coreSession} />;
}
