import { redirect } from 'next/navigation';
import { auth, toCoreSession } from '@repo/auth-next';
import { canWithPermissions } from '@repo/rbac';
import { IdentityRemote } from '../../../../components/remotes/IdentityRemote';

export default async function AccountsCatchAllPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const session = await auth();

  // Default /admin/accounts to Organizations so sidebar and content stay in sync
  if (!slug || slug.length === 0) {
    redirect('/admin/accounts/orgs');
  }

  if (!session) {
    redirect('/login');
  }

  if (!canWithPermissions('user:read', session.user.permissions || [])) {
    redirect('/admin/unauthorized');
  }

  const coreSession = toCoreSession(session);

  return <IdentityRemote session={coreSession} />;
}
