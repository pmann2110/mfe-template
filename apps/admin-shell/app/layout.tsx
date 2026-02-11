import type { Metadata } from 'next';
import { ThemeScript } from '@repo/ui';
import './globals.css';

export const metadata: Metadata = {
  title: 'Admin Portal',
  description: 'Admin portal for managing users',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}
