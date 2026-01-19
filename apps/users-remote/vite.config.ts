import { defineConfig, type Plugin } from 'vite';
import { federation } from '@module-federation/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve';
  // Check if running in standalone mode (for development/testing)
  // When STANDALONE_MODE=true, disable federation to allow pure standalone execution
  // When false or undefined, enable federation for remote consumption
  const isStandaloneMode = process.env.STANDALONE_MODE === 'true';
  
  // Always use root path - simpler and works for both standalone and remote
  const base = '/';
  
  const plugins = [
    tailwindcss(),
    react(),
  ];
  
  // Only enable federation plugin when NOT in standalone mode
  // In standalone mode, we want pure Vite execution without federation wrapping
  // In remote mode, federation exposes the app for shell consumption
  if (!isStandaloneMode) {
    plugins.push(
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
            strictVersion: !isDev, // Relax in dev for easier development
            shareScope: 'default',
          },
          'react-dom': {
            singleton: true,
            requiredVersion: '^19.1.0',
            strictVersion: !isDev, // Relax in dev for easier development
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
      })
    );
  }
  
  return {
  base,
  plugins,
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
  };
});
