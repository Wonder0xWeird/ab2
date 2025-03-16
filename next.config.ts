import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Exclude the contracts directory during TypeScript checks for the Next.js app
    ignoreBuildErrors: false,
  },
  // Exclude contracts directory from being processed by webpack
  webpack: (config, { isServer }) => {
    // Add a rule to ignore files in the contracts directory
    config.module.rules.push({
      test: /contracts\//,
      use: 'ignore-loader',
    });

    return config;
  }
};

export default nextConfig;
