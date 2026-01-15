import { redirect } from 'next/navigation';
import { auth } from '@repo/auth-next';
import { AccountContent } from './account-content';

export default async function AccountPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <AccountContent session={session} />;
}
