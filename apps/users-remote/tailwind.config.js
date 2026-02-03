import baseConfig from '@repo/tailwind-config';

/** @type {import('tailwindcss').Config} */
const config = {
  ...baseConfig,
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
};

export default config;
