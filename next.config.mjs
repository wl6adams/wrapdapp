/** @type {import("next").NextConfig} */
const nextConfig = {
  output: 'standalone',

  reactStrictMode: false,

  env: {
    BASE_URL: process.env.BASE_URL,
  },

  webpack(config) {
    //alias
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/*': './src/*',
    };

    //svg
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  async rewrites() {
    return [
      {
        source: '/ipfs/:path*',
        destination: '/api/proxy?path=:path*',
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/:all*(svg|png|jpg|jpeg|woff2|ttf|eot|svg)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
