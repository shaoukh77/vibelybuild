/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  poweredByHeader: false,
  compress: true,

  // Increase timeout for build-time data generation
  staticPageGenerationTimeout: 120,
};

export default nextConfig;
