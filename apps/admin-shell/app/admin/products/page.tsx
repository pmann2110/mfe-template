import { redirect } from 'next/navigation';
import { auth, toCoreSession } from '@repo/auth-next';
import { canWithPermissions } from '@repo/rbac';
import { ProductsRemote } from '../../../components/remotes/ProductsRemote';

export default async function ProductsPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Server-side permission check
  if (!canWithPermissions('product:read', session.user.permissions || [])) {
    redirect('/admin/unauthorized');
  }

  // Convert next-auth session to core session for remote
  const coreSession = toCoreSession(session);

  return <ProductsRemote session={coreSession} />;
}
