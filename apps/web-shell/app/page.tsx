import { auth } from '@repo/auth-next';
import { HomeContent } from './home-content';

export default async function HomePage() {
  const session = await auth();

  return <HomeContent session={session} />;
}
