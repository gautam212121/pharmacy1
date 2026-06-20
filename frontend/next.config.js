/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "pharmacy1-bn08.onrender.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "healthcare-czr7.onrender.com",
        pathname: "/uploads/**",
      },
    ],
  },
};

module.exports = nextConfig;