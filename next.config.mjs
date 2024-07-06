/** @type {import('next').NextConfig} */
const nextConfig =
  process.env.IS_ELECTRON === 'true' || process.env.IS_CAPACITOR === 'true'
    ? {
        output: 'export',
        images: {
          unoptimized: true,
        },
      }
    : {
        images: {
          unoptimized: true,
        },
      };

export default nextConfig;
