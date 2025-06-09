import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5044",
        pathname: "/api/products/**",
      },
      {
        protocol: "https",
        hostname: "i.natgeofe.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
