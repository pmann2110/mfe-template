'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Button,
  ThemeToggle,
  AppHeader,
  AppFooter,
  Sheet,
  SheetContent,
} from '@repo/ui';
import { LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import type { Session } from 'next-auth';
import { APP_NAME, FOOTER } from '../lib/site-config';

interface WebLayoutClientProps {
  children: React.ReactNode;
  session: Session | null;
}

const navLinkClass =
  'text-sm font-medium text-muted-foreground hover:text-foreground transition-all rounded-md px-3 py-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center lg:min-h-0 lg:min-w-0 lg:inline hover:bg-accent/50';

export function WebLayoutClient({
  children,
  session,
}: WebLayoutClientProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const navContent = (
    <>
      <Link
        href="/"
        className={`${navLinkClass} ${isActive('/') ? 'text-foreground font-semibold bg-accent' : ''}`}
        onClick={() => setMobileNavOpen(false)}
      >
        Home
      </Link>
      {session ? (
        <>
          <Link
            href="/account"
            className={`${navLinkClass} ${isActive('/account') && !pathname.startsWith('/account/org') ? 'text-foreground font-semibold bg-accent' : ''}`}
            onClick={() => setMobileNavOpen(false)}
          >
            Account
          </Link>
          <Link
            href="/account/org"
            className={`${navLinkClass} ${pathname.startsWith('/account/org') ? 'text-foreground font-semibold bg-accent' : ''}`}
            onClick={() => setMobileNavOpen(false)}
          >
            My organization
          </Link>
          <div className="hidden lg:flex items-center gap-2 rounded-md bg-muted/50 px-3 py-1.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {session.user.email?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <span className="text-sm text-foreground truncate max-w-[140px]">
              {session.user.email}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="min-h-[44px] gap-1.5 lg:min-h-0"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </>
      ) : (
        <Button variant="default" size="sm" asChild className="min-h-[44px] lg:min-h-0">
          <Link href="/login" onClick={() => setMobileNavOpen(false)}>
            Login
          </Link>
        </Button>
      )}
    </>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[2147483647] focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <AppHeader
        className="border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        left={
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md transition-colors hover:text-primary"
          >
            {APP_NAME}
          </Link>
        }
          right={
            <>
              <div className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="min-h-[44px] min-w-[44px]"
                  onClick={() => setMobileNavOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
              <ThemeToggle />
              <nav
                className="hidden lg:flex items-center gap-1"
                aria-label="Main navigation"
              >
                {navContent}
              </nav>
            </>
          }
        />

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="right" className="flex w-full max-w-sm flex-col gap-0 p-0">
          <div className="flex h-14 items-center border-b border-border/60 px-4">
            <span className="font-semibold tracking-tight">{APP_NAME}</span>
          </div>
          <nav className="flex flex-col gap-1 p-4" aria-label="Mobile navigation">
            <Link
              href="/"
              className={`flex min-h-[48px] items-center rounded-lg px-4 text-base font-medium transition-colors ${isActive('/') ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent'}`}
              onClick={() => setMobileNavOpen(false)}
            >
              Home
            </Link>
            {session ? (
              <>
                <Link
                  href="/account"
                  className={`flex min-h-[48px] items-center rounded-lg px-4 text-base font-medium transition-colors ${isActive('/account') && !pathname.startsWith('/account/org') ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent'}`}
                  onClick={() => setMobileNavOpen(false)}
                >
                  Account
                </Link>
                <Link
                  href="/account/org"
                  className={`flex min-h-[48px] items-center rounded-lg px-4 text-base font-medium transition-colors ${pathname.startsWith('/account/org') ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent'}`}
                  onClick={() => setMobileNavOpen(false)}
                >
                  My organization
                </Link>
                <div className="my-2 border-t border-border/60" />
                <div className="flex min-h-[48px] items-center gap-3 rounded-lg px-4 text-sm text-muted-foreground">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {session.user.email?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  <span className="truncate">{session.user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 rounded-lg min-h-[48px] text-base"
                  onClick={() => { setMobileNavOpen(false); handleLogout(); }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" asChild className="w-full justify-center min-h-[48px] rounded-lg">
                <Link href="/login" onClick={() => setMobileNavOpen(false)}>
                  Login
                </Link>
              </Button>
            )}
          </nav>
        </SheetContent>
      </Sheet>

      <main id="main-content" className="flex-1 px-4 py-6 md:px-6 md:py-8">
        {children}
      </main>

      <AppFooter
        brand={FOOTER.brand}
        columns={FOOTER.columns}
        copyright={FOOTER.copyright}
      />
    </div>
  );
}
