import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "arch.crane-tawny.ts.net",
    "arch.crane-tawny.ts.net:3000",
  ],
  reactCompiler: true,
};

export default nextConfig;
