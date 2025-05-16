/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['react-plotly.js', 'plotly.js'],
  webpack: (config) => {
    // Add polyfills for node modules used by Plotly.js
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      buffer: false
    };
    return config;
  },
};

module.exports = nextConfig; 