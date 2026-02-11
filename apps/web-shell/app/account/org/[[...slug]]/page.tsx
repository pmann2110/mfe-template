import { redirect } from 'next/navigation';
import { auth, toCoreSession } from '@repo/auth-next';
import { IdentityRemoteWrapper } from './IdentityRemoteWrapper';

export default async function AccountOrgPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  await params;
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const coreSession = toCoreSession(session);

  return <IdentityRemoteWrapper session={coreSession} />;
}
