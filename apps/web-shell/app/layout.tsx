import type { Metadata } from 'next';
import { ThemeScript } from '@repo/ui';
import './globals.css';
import { WebLayoutClient } from './layout-client';
import { auth } from '@repo/auth-next';
import { APP_NAME } from '../lib/site-config';

export const metadata: Metadata = {
  title: `${APP_NAME} Website`,
  description: 'Your Product, Your Vision, Our Platform',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeScript />
        <WebLayoutClient session={session}>{children}</WebLayoutClient>
      </body>
    </html>
  );
}
