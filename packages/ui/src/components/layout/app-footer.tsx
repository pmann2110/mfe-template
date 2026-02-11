import * as React from 'react';
import { cn } from '../../lib/utils';

export interface AppFooterLink {
  label: string;
  href: string;
}

export interface AppFooterColumn {
  title: string;
  links: AppFooterLink[];
}

export interface AppFooterProps extends React.HTMLAttributes<HTMLElement> {
  /** Optional brand/description block (e.g. company name + tagline). */
  brand?: { title: string; description?: string };
  /** Link columns (e.g. Product, Company, Legal). */
  columns?: AppFooterColumn[];
  /** Copyright line (e.g. "© 2025 Company, Inc. All rights reserved."). */
  copyright?: string;
}

function AppFooterComponent(
  { brand, columns = [], copyright, className, ...props }: AppFooterProps,
  ref: React.Ref<HTMLElement>,
) {
  return (
    <footer
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn('border-t border-border bg-muted/40', className)}
      {...props}
    >
      <div className="container px-4 py-12 md:px-6 md:py-16">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {brand && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">{brand.title}</h3>
              {brand.description && (
                <p className="text-sm text-muted-foreground">{brand.description}</p>
              )}
            </div>
          )}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-sm font-semibold">{col.title}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {col.links.map((link, index) => (
                  <li key={`${col.title}-${link.label}-${index}`}>
                    <a
                      href={link.href}
                      className={
                        link.href === '#'
                          ? 'cursor-default opacity-70 hover:opacity-80'
                          : 'hover:text-foreground transition-colors'
                      }
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {copyright && (
          <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            {copyright}
          </div>
        )}
      </div>
    </footer>
  );
}

const AppFooter = React.forwardRef(AppFooterComponent);
AppFooter.displayName = 'AppFooter';

export { AppFooter };
