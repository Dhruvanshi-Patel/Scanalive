/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=(self "*"), microphone=(self "*"), display-capture=(self "*")'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
