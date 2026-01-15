const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname, '../..'),
  
  // Runtime Module Federation loading (Turbopack-compatible)
  // We use runtime loading instead of webpack ModuleFederationPlugin
  // to maintain compatibility with Turbopack and Next.js 15 + React 19
  
  async headers() {
    return [
      {
        // Allow CORS for remote modules in development
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  
  webpack(config, { isServer }) {
    // No webpack ModuleFederationPlugin needed - we use runtime loading
    // This ensures compatibility with Turbopack
    return config;
  },
};

module.exports = nextConfig;
