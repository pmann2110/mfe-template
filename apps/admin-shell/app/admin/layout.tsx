import { redirect } from 'next/navigation';
import { auth } from '@repo/auth-next';
import { AdminLayoutClient } from './layout-client';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <AdminLayoutClient session={session}>{children}</AdminLayoutClient>;
}
