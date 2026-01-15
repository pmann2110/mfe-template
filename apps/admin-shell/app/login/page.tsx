import { redirect } from 'next/navigation';
import { auth } from '@repo/auth-next';
import { LoginForm } from './login-form';

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect('/admin');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <LoginForm />
    </div>
  );
}
