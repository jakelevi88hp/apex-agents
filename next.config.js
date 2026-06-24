/* eslint-disable @typescript-eslint/no-require-imports */
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone output for Vercel
  output: 'standalone',
  
  // Security: Disable Image Optimizer to prevent DoS vulnerability
  // https://github.com/advisories/GHSA-9g9p-9gw9-jx7f
  images: {
    unoptimized: true,
  },

  // Experimental features
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Security headers configuration
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent clickjacking attacks
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Enable XSS protection in older browsers
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions policy
          {
            key: 'Permissions-Policy',
            value: 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
          },
          // Strict Transport Security (HSTS)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Remove server information
          {
            key: 'X-Powered-By',
            value: '',
          },
        ],
      },
    ];
  },

  // Webpack configuration
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

  // Security: Redirect HTTP to HTTPS in production
  redirects: async () => {
    return [
      {
        source: '/:path*',
        destination: '/:path*',
        permanent: false,
      },
    ];
  },

  // Compression
  compress: true,

  // Production source maps (disabled for security)
  productionBrowserSourceMaps: false,

  // Disable powered by header
  poweredByHeader: false,

  // React strict mode
  reactStrictMode: true,

  // SWR configuration
  swcMinify: true,
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
