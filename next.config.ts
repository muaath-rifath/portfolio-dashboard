import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const config = withPWA({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  ...config
};

export default nextConfig;
