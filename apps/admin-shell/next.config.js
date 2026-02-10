const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname, '../..'),

  // Runtime Module Federation loading (Turbopack-compatible)
  // We use runtime loading instead of webpack ModuleFederationPlugin
  // to maintain compatibility with Turbopack and Next.js 15 + React 19

  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';

    // CORS: use * only in non-production; in production middleware sets origin from allowlist
    const corsOrigin =
      !isProduction
        ? '*'
        : (process.env.NEXT_PUBLIC_ALLOWED_REMOTE_ORIGINS || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)[0] || '';

    const baseHeaders = [
      {
        key: 'Access-Control-Allow-Methods',
        value: 'GET, POST, PUT, DELETE, OPTIONS',
      },
      {
        key: 'Access-Control-Allow-Headers',
        value: 'Content-Type, Authorization',
      },
    ];

    // Only set Access-Control-Allow-Origin in config when we have a single value (dev * or prod first origin)
    const corsHeaders =
      corsOrigin === '*'
        ? [{ key: 'Access-Control-Allow-Origin', value: '*' }]
        : corsOrigin
          ? [{ key: 'Access-Control-Allow-Origin', value: corsOrigin }]
          : [];

    // CSP: restrict script/style/connect sources; include allowed remote origins in production.
    // In development, Next.js (HMR, React Refresh) and Module Federation need 'unsafe-inline' and 'unsafe-eval'.
    const allowedOrigins =
      isProduction && process.env.NEXT_PUBLIC_ALLOWED_REMOTE_ORIGINS
        ? process.env.NEXT_PUBLIC_ALLOWED_REMOTE_ORIGINS.split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
    const connectSrc =
      allowedOrigins.length > 0
        ? ["'self'", ...allowedOrigins.map((o) => (o.startsWith('http') ? o : `https://${o}`))]
        : ["'self'", 'http://localhost:*', 'http://127.0.0.1:*', 'ws://localhost:*', 'ws://127.0.0.1:*'];
    const scriptSrc =
      isProduction
        ? ["'self'", ...connectSrc]
        : ["'self'", ...connectSrc, "'unsafe-inline'", "'unsafe-eval'"];
    const styleSrc = ["'self'", "'unsafe-inline'"];

    const cspHeader = [
      `default-src 'self'`,
      `script-src ${scriptSrc.join(' ')}`,
      `style-src ${styleSrc.join(' ')}`,
      `connect-src ${connectSrc.join(' ')}`,
      `frame-ancestors 'self'`,
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          ...corsHeaders,
          ...baseHeaders,
          { key: 'Content-Security-Policy', value: cspHeader },
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
