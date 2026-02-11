'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@repo/ui';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import type { Session } from 'next-auth';

interface WebLayoutClientProps {
  children: React.ReactNode;
  session: Session | null;
}

export function WebLayoutClient({
  children,
  session,
}: WebLayoutClientProps) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">Company</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Home
            </Link>
            {session ? (
              <>
                <Link
                  href="/account"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Account
                </Link>
                <Link
                  href="/account/org"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  My organization
                </Link>
                <span className="text-sm text-muted-foreground">
                  {session.user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-muted/40">
        <div className="container px-4 py-12 md:px-6 md:py-16">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Company</h3>
              <p className="text-sm text-muted-foreground">
                Empowering businesses with innovative solutions.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-foreground">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-foreground">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Company, Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
