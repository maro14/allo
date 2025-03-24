import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  reactStrictMode: true,
  env: {
    CUSTOM_API_ENDPOINT: process.env.CUSTOM_API_ENDPOINT, // Example of using environment variables
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, // Example of handling Node.js modules in the browser
      };
    }
    return config;
  },
};

export default nextConfig;
