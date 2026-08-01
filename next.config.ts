import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.justwatch.com", pathname: "/**" },
      { protocol: "https", hostname: "image.tmdb.org", pathname: "/**" },
      { protocol: "https", hostname: "*.amazonaws.com", pathname: "/**" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "@vidstack/react"],
  },
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
