import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
        hostname: "healthcare-czr7.onrender.com",
        pathname: "/uploads/**",
      },
    ],
  },
  webpack: (config) => {
    // Ensure proper CSS handling for node_modules
    return config;
  },
};

export default nextConfig;
