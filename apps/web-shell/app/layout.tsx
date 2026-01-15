import type { Metadata } from 'next';
import './globals.css';
import { WebLayoutClient } from './layout-client';
import { auth } from '@repo/auth-next';

export const metadata: Metadata = {
  title: 'Company Website',
  description: 'Your Product, Your Vision, Our Platform',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <WebLayoutClient session={session}>{children}</WebLayoutClient>
      </body>
    </html>
  );
}
