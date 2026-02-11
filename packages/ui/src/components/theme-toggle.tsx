'use client';

import * as React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from './ui/dropdown-menu';
import { cn } from '../lib/utils';

const THEME_STORAGE_KEY = 'theme';
export type Theme = 'light' | 'dark' | 'system';

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function ThemeToggle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Button>) {
  const [theme, setThemeState] = React.useState<Theme>('system');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setThemeState(getStoredTheme());
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    applyTheme(theme);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme, mounted]);

  React.useEffect(() => {
    if (!mounted || theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, mounted]);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn('min-h-[44px] min-w-[44px]', className)}
        aria-label="Toggle theme"
        {...props}
      >
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('min-h-[44px] min-w-[44px]', className)}
          aria-label="Toggle theme"
          {...props}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => setThemeState(value as Theme)}
        >
          <DropdownMenuRadioItem value="light" className="min-h-[44px]">
            <Sun className="mr-2 h-4 w-4" />
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" className="min-h-[44px]">
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system" className="min-h-[44px]">
            <Monitor className="mr-2 h-4 w-4" />
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Inline script to run before React hydrates to prevent theme flash. Add to root layout. */
export function ThemeScript() {
  const script = `(function(){var t=localStorage.getItem('theme');var d=document.documentElement;if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches))d.classList.add('dark');else d.classList.remove('dark');})();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
