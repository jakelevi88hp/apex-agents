/* eslint-disable @typescript-eslint/no-require-imports */
const { withSentryConfig } = require('@sentry/nextjs');

// Security headers. The CSP is Report-Only for now: browsers log violations
// but nothing is blocked. Origins below come from what the live site loads:
// Google tag (Ads + GA4) and its DoubleClick beacons, Vercel Analytics and the
// preview toolbar, Sentry ingest, and Stripe.js (used only if checkout ever
// moves on-site). Switch to Content-Security-Policy once reports are clean.
const cspReportOnly = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.google.com https://va.vercel-scripts.com https://vercel.live https://js.stripe.com",
  "style-src 'self' 'unsafe-inline' https://vercel.live",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://vercel.live https://assets.vercel.com",
  "connect-src 'self' https://www.google.com https://www.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://ad.doubleclick.net https://googleads.g.doubleclick.net https://www.googleadservices.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://vitals.vercel-insights.com https://vercel.live wss://ws-us3.pusher.com https://api.stripe.com",
  "frame-src 'self' https://vercel.live https://js.stripe.com https://hooks.stripe.com https://td.doubleclick.net https://www.googletagmanager.com",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy-Report-Only', value: cspReportOnly },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Microphone stays allowed for our own origin: voice input uses it.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=(), browsing-topics=()' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone output for Vercel
  output: 'standalone',
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Send the production *.vercel.app alias to the canonical domain so Google
  // indexes one host. Exact host match only: preview URLs
  // (apex-agents-git-*.vercel.app, per-deployment URLs) keep working.
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'apex-agents.vercel.app' }],
        destination: 'https://apex-ai-agent.com/:path*',
        permanent: true,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        'fs/promises': false,
      };
      
      config.externals = config.externals || [];
      config.externals.push('ws', 'child_process');
    }
    return config;
  },
};

// Suppress Sentry warnings
if (!process.env.SENTRY_SUPPRESS_GLOBAL_ERROR_HANDLER_FILE_WARNING) {
  process.env.SENTRY_SUPPRESS_GLOBAL_ERROR_HANDLER_FILE_WARNING = '1';
}

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // Suppresses source map uploading logs during build
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
};

// Make sure adding Sentry options is the last code to run before exporting
module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);

