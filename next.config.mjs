/** @type {import('next').NextConfig} */
const nextConfig =
  process.env.IS_ELECTRON === 'true'
    ? {
        output: 'export',
        images: {
          unoptimized: true,
        },
      }
    : {
        images: {
          remotePatterns: [
            {
              protocol: 'https',
              hostname: '*.googleusercontent.com',
              port: '',
              pathname: '/a/**',
            },
          ],
        },
      };

export default nextConfig;
