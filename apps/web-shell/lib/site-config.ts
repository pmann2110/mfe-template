/**
 * Site-wide config for web-shell (branding, footer).
 * Override via NEXT_PUBLIC_APP_NAME and optional env for production.
 */
export const APP_NAME =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_NAME) ||
  'Company';

export const FOOTER = {
  brand: {
    title: APP_NAME,
    description: 'Empowering businesses with innovative solutions.',
  },
  columns: [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#' },
        { label: 'Pricing', href: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#' },
        { label: 'Contact', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', href: '#' },
        { label: 'Terms', href: '#' },
      ],
    },
  ],
  copyright: `© ${new Date().getFullYear()} ${APP_NAME}, Inc. All rights reserved.`,
} as const;
