/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Improve development experience and reduce console errors
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Reduce stack frame errors by optimizing webpack config
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Add optimization for better error handling
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig