const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // PWA Configuration
  ...withPWA({
    dest: 'public',
    cacheStartUrl: false,
    dynamicStartUrl: false,
    fallbacks: {
      image: '/static/images/fallback.png',
      document: '/offline.html'
    }
  })
};

module.exports = nextConfig;
