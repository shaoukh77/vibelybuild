/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  poweredByHeader: false,
  compress: true,

  // Increase timeout for build-time data generation
  staticPageGenerationTimeout: 120,

  // Headers for iframe embedding and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // Allow iframes from same origin (localhost)
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' http://localhost:* https://localhost:*",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
