import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Compress responses
  compress: true,
};

export default withNextIntl(nextConfig);
