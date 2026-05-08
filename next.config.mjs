/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "moneysplit.in",
          },
        ],
        destination: "https://www.moneysplit.in/:path*",
        permanent: true,
      },
      {
        source: "/blog/:path*",
        destination: "/articles",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
