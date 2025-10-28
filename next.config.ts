import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {}, // Silence Turbopack warning when using webpack config
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude Node.js-specific packages from client bundle
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
      
      // Exclude specific packages that should only run on server
      config.externals = config.externals || [];
      config.externals.push('ws', 'child_process');
    }
    return config;
  },
};

export default nextConfig;
