import { defineConfig, type Plugin } from 'vite';
import { federation } from '@module-federation/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/_users',
  plugins: [
    tailwindcss(),
    react(),
    federation({
      name: 'users',
      manifest: true,
      filename: 'remoteEntry.js',
      exposes: {
        './app': './src/App.tsx',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^19.1.0',
          strictVersion: true,
          shareScope: 'default',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^19.1.0',
          strictVersion: true,
          shareScope: 'default',
        },
        '@repo/ui': {
          singleton: true,
          requiredVersion: '^1.0.0',
          shareScope: 'default',
        },
        '@repo/stores': {
          singleton: true,
          requiredVersion: '^1.0.0',
          shareScope: 'default',
        },
      },
    }) as Plugin[],
  ],
  server: {
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  },
  build: {
    target: 'chrome89',
    cssCodeSplit: false,
    rollupOptions: {
      input: './src/main.tsx',
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name].css';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
