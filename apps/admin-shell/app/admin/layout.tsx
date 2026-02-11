import { redirect } from 'next/navigation';
import { auth } from '@repo/auth-next';
import { AdminLayoutClient } from './layout-client';
import { isUserInSystemOrg } from '../../lib/mock-data/platform-access';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (!isUserInSystemOrg(session.user?.id)) {
    redirect('/access-denied');
  }

  return <AdminLayoutClient session={session}>{children}</AdminLayoutClient>;
}
