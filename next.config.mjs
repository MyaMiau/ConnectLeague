/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fuvrzaytvcpsqmvvfcaw.supabase.co",
      },
    ],
  },
};

export default nextConfig;
