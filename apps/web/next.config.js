/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'green-cottage.moryjinabovictorbrillant.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'private-us-east-1.manuscdn.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Racine du monorepo pour que le file tracing inclue node_modules (styled-jsx, etc.)
    outputFileTracingRoot: path.join(__dirname, '..', '..'),
  },
  // Inclure explicitement styled-jsx (requis par Next) dans le bundle serverless
  outputFileTracingIncludes: {
    '/**': ['node_modules/styled-jsx/**', '../../node_modules/styled-jsx/**'],
  },
};

module.exports = nextConfig;
